import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertProjectSchema, insertSiteConfigSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    const { password } = req.body;
    
    // Simple password check - in production use proper auth
    if (password === "admin123") {
      res.json({ success: true, message: "Authentication successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  // Site configuration routes
  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getSiteConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Error fetching configuration" });
    }
  });

  app.put("/api/config", async (req, res) => {
    try {
      const updates = req.body;
      const updatedConfig = await storage.updateSiteConfig(updates);
      res.json(updatedConfig);
    } catch (error) {
      res.status(500).json({ message: "Error updating configuration" });
    }
  });

  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Error fetching client" });
    }
  });

  app.get("/api/clients/username/:username", async (req, res) => {
    try {
      const client = await storage.getClientByUsername(req.params.username);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Error fetching client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const updates = req.body;
      const client = await storage.updateClient(req.params.id, updates);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Error updating client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting client" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });

  app.get("/api/projects/client/:clientId", async (req, res) => {
    try {
      const projects = await storage.getProjectsByClientId(req.params.clientId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Error fetching client projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Error fetching project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating project" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const updates = req.body;
      const project = await storage.updateProject(req.params.id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Error updating project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting project" });
    }
  });

  // Price calculation endpoint
  app.post("/api/calculate-price", async (req, res) => {
    try {
      const { duration, speed, quantity } = req.body;
      const config = await storage.getSiteConfig();
      
      if (!config) {
        return res.status(404).json({ message: "Configuration not found" });
      }

      const pricing = config.pricing as any;
      const basePrice = pricing.durations[duration];
      const speedMultiplier = pricing.speeds[speed].multiplier;
      const quantityMultiplier = pricing.quantities[quantity].multiplier;

      if (!basePrice) {
        return res.status(400).json({ message: "Invalid duration" });
      }

      const totalMXN = Math.round(basePrice.mxn * speedMultiplier * quantityMultiplier);
      const totalUSD = Math.round(basePrice.usd * speedMultiplier * quantityMultiplier);

      res.json({
        basePriceMXN: basePrice.mxn,
        basePriceUSD: basePrice.usd,
        speedMultiplier,
        quantityMultiplier,
        totalMXN,
        totalUSD
      });
    } catch (error) {
      res.status(500).json({ message: "Error calculating price" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

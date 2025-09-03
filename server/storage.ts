import { type Client, type InsertClient, type SiteConfig, type InsertSiteConfig, type Project, type InsertProject, type PricingConfig, type SampleVideo, type SiteContent } from "@shared/schema";
import { clients, projects, siteConfig } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByUsername(username: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Project methods
  getProjects(): Promise<Project[]>;
  getProjectsByClientId(clientId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Site config methods
  getSiteConfig(): Promise<SiteConfig | undefined>;
  createSiteConfig(config: InsertSiteConfig): Promise<SiteConfig>;
  updateSiteConfig(updates: Partial<SiteConfig>): Promise<SiteConfig | undefined>;

  // User methods (keep existing for compatibility)
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(user: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize default config if it doesn't exist
    this.initializeConfig();
  }

  private async initializeConfig() {
    const config = await this.getSiteConfig();
    if (!config) {
      await this.createSiteConfig({
        whatsappNumber: "+52 55 1234 5678",
        businessName: "VideoVenta",
        pricing: this.getDefaultPricing(),
        sampleVideos: this.getDefaultSampleVideos(),
        siteContent: this.getDefaultSiteContent(),
      });
    }
  }

  private getDefaultPricing(): PricingConfig {
    return {
      narratedVideos: {
        durations: {
          "5-10": { mxn: 1600, usd: 89, label: "5-10 minutos" },
          "10-20": { mxn: 2600, usd: 144, label: "10-20 minutos" },
          "20-30": { mxn: 3500, usd: 194, label: "20-30 minutos" }
        },
        speeds: {
          normal: { multiplier: 1.0, label: "Normal (2-5 días)" },
          fast: { multiplier: 1.2, label: "Rápido (2-3 días)" },
          express: { multiplier: 1.5, label: "Express (1-2 días)" }
        },
        quantities: {
          15: { multiplier: 1.0, label: "15 videos" },
          30: { multiplier: 1.8, label: "30 videos" },
          60: { multiplier: 3.2, label: "60 videos" },
          120: { multiplier: 5.8, label: "120 videos" }
        },
        videoFeatures: [
          "HD Horizontal (1920x1080)",
          "1 Edición profesional incluida",
          "Prompt personalizado",
          "Calidad de imagen profesional",
          "Estilo de imágenes 2.5D",
          "Variedad de temas: Guerra, Peleas, Ángeles, Fantasía, Futurista, Histórico"
        ],
        videoOptions: {}
      },
      singingPackages: {
        basic: { mxn: 1600, usd: 89, videos: 15, label: "Básico" },
        standard: { mxn: 3000, usd: 167, videos: 30, label: "Estándar" },
        premium: { mxn: 5500, usd: 306, videos: 60, label: "Premium" },
        business: { mxn: 9900, usd: 550, videos: 120, label: "Empresarial" }
      }
    };
  }

  private getDefaultSampleVideos(): SampleVideo[] {
    return [
      {
        id: "1",
        title: "Video Corporativo",
        description: "Presentaciones empresariales profesionales",
        thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-4.0.3&w=300&h=200&fit=crop",
        videoUrl: ""
      },
      {
        id: "2",
        title: "Video Promocional",
        description: "Campañas publicitarias impactantes",
        thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&w=300&h=200&fit=crop",
        videoUrl: ""
      },
      {
        id: "3",
        title: "Video Explicativo",
        description: "Tutoriales y contenido educativo",
        thumbnail: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&w=300&h=200&fit=crop",
        videoUrl: ""
      }
    ];
  }

  private getDefaultSiteContent(): SiteContent {
    return {
      heroTitle: "Producción de Videos Profesionales",
      heroDescription: "Creamos contenido audiovisual de alta calidad que impulsa tu marca. Desde videos corporativos hasta campañas promocionales completas.",
      contactEmail: "info@videoventa.com",
      companyDescription: "Creamos contenido audiovisual profesional que impulsa tu marca y conecta con tu audiencia.",
      logoUrl: "",
      calculatorTitle: "Calculadora de Precios",
      calculatorDescription: "Obtén una cotización instantánea personalizada para tu proyecto",
      backgroundImageUrl: "",
      customCSS: ""
    };
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    const result = await db.select().from(clients);
    return result;
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByUsername(username: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.username, username));
    return client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    const [updated] = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return true;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    const result = await db.select().from(projects);
    return result;
  }

  async getProjectsByClientId(clientId: string): Promise<Project[]> {
    const result = await db.select().from(projects).where(eq(projects.clientId, clientId));
    return result;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Site config methods
  async getSiteConfig(): Promise<SiteConfig | undefined> {
    const [config] = await db.select().from(siteConfig);
    return config;
  }

  async createSiteConfig(insertConfig: InsertSiteConfig): Promise<SiteConfig> {
    const [config] = await db.insert(siteConfig).values(insertConfig).returning();
    return config;
  }

  async updateSiteConfig(updates: Partial<SiteConfig>): Promise<SiteConfig | undefined> {
    const configs = await db.select().from(siteConfig);
    if (configs.length === 0) {
      // Create if doesn't exist
      return this.createSiteConfig({
        ...this.getDefaultSiteContent(),
        whatsappNumber: updates.whatsappNumber || "+52 55 1234 5678",
        businessName: updates.businessName || "VideoVenta",
        pricing: updates.pricing || this.getDefaultPricing(),
        sampleVideos: updates.sampleVideos || this.getDefaultSampleVideos(),
        siteContent: updates.siteContent || this.getDefaultSiteContent(),
        ...updates
      } as InsertSiteConfig);
    }
    
    const [updated] = await db
      .update(siteConfig)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(siteConfig.id, configs[0].id))
      .returning();
    return updated;
  }

  // User methods (keep for compatibility)
  async getUser(id: string): Promise<any> {
    // For now, return null as we don't have users table
    return null;
  }

  async getUserByUsername(username: string): Promise<any> {
    // For now, return null as we don't have users table
    return null;
  }

  async createUser(user: any): Promise<any> {
    // For now, return the user as-is
    return user;
  }
}

export const storage = new DatabaseStorage();
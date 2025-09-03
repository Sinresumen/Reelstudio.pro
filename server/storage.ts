import { type Client, type InsertClient, type SiteConfig, type InsertSiteConfig, type Project, type InsertProject, type PricingConfig, type SampleVideo, type SiteContent } from "@shared/schema";
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

export class MemStorage implements IStorage {
  private clients: Map<string, Client>;
  private projects: Map<string, Project>;
  private siteConfig: SiteConfig | undefined;
  private users: Map<string, any>;

  constructor() {
    this.clients = new Map();
    this.projects = new Map();
    this.users = new Map();
    
    // Initialize with default configuration
    this.siteConfig = {
      id: randomUUID(),
      whatsappNumber: "+52 55 1234 5678",
      businessName: "VideoVenta",
      pricing: this.getDefaultPricing(),
      sampleVideos: this.getDefaultSampleVideos(),
      siteContent: this.getDefaultSiteContent(),
      updatedAt: new Date(),
    };
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
          extreme: { multiplier: 1.5, label: "Extremo (1-2 días)" }
        },
        quantities: {
          15: { multiplier: 1.0, label: "15 videos" },
          30: { multiplier: 1.8, label: "30 videos" },
          60: { multiplier: 3.2, label: "60 videos" },
          120: { multiplier: 5.8, label: "120 videos" }
        },
        videoOptions: {
          quality: {
            id: "quality",
            name: "Calidad de Video",
            description: "Resolución y formato del video",
            options: {
              "hd-horizontal": { label: "HD Horizontal (1920x1080)", priceModifier: 1.0, available: true },
              "hd-vertical": { label: "HD Vertical (1080x1920)", priceModifier: 1.1, available: true },
              "4k-horizontal": { label: "4K Horizontal (3840x2160)", priceModifier: 1.5, available: true },
              "4k-vertical": { label: "4K Vertical (2160x3840)", priceModifier: 1.6, available: true }
            }
          },
          style: {
            id: "style",
            name: "Estilo de Imágenes",
            description: "Estilo visual del video",
            options: {
              "2d": { label: "2D Tradicional", priceModifier: 1.0, available: true },
              "2.5d": { label: "2.5D Dinámico", priceModifier: 1.2, available: true },
              "3d": { label: "3D Realista", priceModifier: 1.4, available: true },
              "anime": { label: "Estilo Anime", priceModifier: 1.1, available: true }
            }
          },
          storyTheme: {
            id: "storyTheme",
            name: "Tema de Historia",
            description: "Temática y ambiente del video",
            options: {
              "guerra": { label: "Guerra y Batallas", priceModifier: 1.0, available: true },
              "peleas": { label: "Peleas y Combate", priceModifier: 1.0, available: true },
              "angeles": { label: "Ángeles y Celestial", priceModifier: 1.1, available: true },
              "fantasia": { label: "Fantasía Medieval", priceModifier: 1.1, available: true },
              "futurista": { label: "Ciencia Ficción", priceModifier: 1.2, available: true },
              "historico": { label: "Histórico", priceModifier: 1.0, available: true }
            }
          },
          editingLevel: {
            id: "editingLevel",
            name: "Nivel de Edición",
            description: "Complejidad de la edición",
            options: {
              "basica": { label: "1 Edición Básica", priceModifier: 1.0, available: true },
              "avanzada": { label: "2 Ediciones Avanzadas", priceModifier: 1.3, available: true },
              "profesional": { label: "3 Ediciones Profesionales", priceModifier: 1.6, available: true }
            }
          },
          customPrompt: {
            id: "customPrompt",
            name: "Prompt Personalizado",
            description: "Personalización del contenido",
            options: {
              "incluido": { label: "Prompt Personalizado Incluido", priceModifier: 1.1, available: true },
              "no-incluido": { label: "Sin Personalización", priceModifier: 1.0, available: true }
            }
          }
        }
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
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByUsername(username: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(
      (client) => client.username === username
    );
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = {
      ...insertClient,
      id,
      createdAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...updates };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsByClientId(clientId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.clientId === clientId
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Site config methods
  async getSiteConfig(): Promise<SiteConfig | undefined> {
    return this.siteConfig;
  }

  async createSiteConfig(config: InsertSiteConfig): Promise<SiteConfig> {
    const id = randomUUID();
    this.siteConfig = {
      ...config,
      id,
      updatedAt: new Date(),
    };
    return this.siteConfig;
  }

  async updateSiteConfig(updates: Partial<SiteConfig>): Promise<SiteConfig | undefined> {
    if (!this.siteConfig) return undefined;
    
    this.siteConfig = {
      ...this.siteConfig,
      ...updates,
      updatedAt: new Date(),
    };
    return this.siteConfig;
  }

  // User methods (keep for compatibility)
  async getUser(id: string): Promise<any> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: any): Promise<any> {
    const id = randomUUID();
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
}

export const storage = new MemStorage();

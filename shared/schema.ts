import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  username: text("username").notNull().unique(),
  projects: jsonb("projects").default(sql`'[]'`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const siteConfig = pgTable("site_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  whatsappNumber: text("whatsapp_number").notNull(),
  businessName: text("business_name").notNull(),
  pricing: jsonb("pricing").notNull(),
  sampleVideos: jsonb("sample_videos").default(sql`'[]'`),
  siteContent: jsonb("site_content").default(sql`'{}'`),
  messagingConfig: jsonb("messaging_config").default(sql`'{}'`),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  duration: text("duration"),
  quantity: integer("quantity"),
  status: text("status").default("pending"),
  downloadLinks: jsonb("download_links").default(sql`'[]'`),
  deliveryDate: timestamp("delivery_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertSiteConfigSchema = createInsertSchema(siteConfig).omit({
  id: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type SiteConfig = typeof siteConfig.$inferSelect;
export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Pricing structure type
export type PricingConfig = {
  narratedVideos: {
    durations: {
      [key: string]: { mxn: number; usd: number; label: string };
    };
    speeds: {
      [key: string]: { multiplier: number; label: string };
    };
    quantities: {
      [key: string]: { multiplier: number; label: string };
    };
    videoOptions: {
      [key: string]: VideoOption;
    };
  };
  singingPackages: {
    [key: string]: { mxn: number; usd: number; videos: number; label: string };
  };
};

// Video configuration options
export type VideoOption = {
  id: string;
  name: string;
  description: string;
  options: {
    [key: string]: {
      label: string;
      priceModifier: number; // multiplier for price
      available: boolean;
    };
  };
};

// Video quality and style options
export type VideoOptionsConfig = {
  quality: VideoOption;
  style: VideoOption;
  storyTheme: VideoOption;
  editingLevel: VideoOption;
  customPrompt: VideoOption;
};

// Sample video type
export type SampleVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
};

// Site content type
export type SiteContent = {
  heroTitle: string;
  heroDescription: string;
  contactEmail: string;
  companyDescription: string;
  logoUrl?: string;
  calculatorTitle?: string;
  calculatorDescription?: string;
  backgroundImageUrl?: string;
  customCSS?: string;
};

// Messaging configuration type
export type MessagingConfig = {
  whatsappApiEnabled?: boolean;
  whatsappApiToken?: string;
  whatsappBusinessId?: string;
  messengerEnabled?: boolean;
  messengerPageId?: string;
  messengerAccessToken?: string;
};

// Download link type
export type DownloadLink = {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'document' | 'image';
  size?: string;
};

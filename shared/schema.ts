import { pgTable, text, serial, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  targetUrl: text("target_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull(),
  discordType: text("discord_type").notNull().default('id'), // 'id' or 'username'
  linkCode: text("link_code"),
  stage: integer("stage").default(1),
  fingerprint: text("fingerprint"),
  ip: text("ip").notNull(),
  country: text("country"),
  city: text("city"),
  region: text("region"),
  isp: text("isp"),
  isProxy: boolean("is_proxy").default(false),
  isMobile: boolean("is_mobile").default(false),
  deviceType: text("device_type"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
  meta: jsonb("meta"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

// === SCHEMAS ===
export const insertVisitSchema = createInsertSchema(visits).omit({ 
  id: true, 
  timestamp: true 
});

export const insertSettingSchema = createInsertSchema(settings).omit({ 
  id: true 
});

export const insertLinkSchema = createInsertSchema(links).omit({ id: true, createdAt: true });

// === TYPES ===
export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Link = typeof links.$inferSelect;
export type InsertLink = z.infer<typeof insertLinkSchema>;

// === API TYPES ===
export type VisitResponse = Visit;
export type SettingResponse = Setting;

export const webhookConfigSchema = z.object({
  url: z.string().url().optional().or(z.literal("")),
  enabled: z.boolean().default(true),
});

export type WebhookConfig = z.infer<typeof webhookConfigSchema>;

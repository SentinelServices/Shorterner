import { db } from "./db";
import { visits, settings, links, type Visit, type InsertVisit, type Setting, type InsertSetting, type Link, type InsertLink } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createVisit(visit: InsertVisit): Promise<Visit>;
  getVisits(): Promise<Visit[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  updateSetting(setting: InsertSetting): Promise<Setting>;
  createLink(link: InsertLink): Promise<Link>;
  getLinkByCode(code: string): Promise<Link | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createLink(link: InsertLink): Promise<Link> {
    const [newLink] = await db.insert(links).values(link).returning();
    return newLink;
  }

  async getLinkByCode(code: string): Promise<Link | undefined> {
    const [link] = await db.select().from(links).where(eq(links.code, code));
    return link;
  }
  async createVisit(visit: InsertVisit): Promise<Visit> {
    const [newVisit] = await db.insert(visits).values(visit).returning();
    return newVisit;
  }

  async getVisits(): Promise<Visit[]> {
    return await db.select().from(visits).orderBy(desc(visits.timestamp));
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async updateSetting(insertSetting: InsertSetting): Promise<Setting> {
    // Upsert logic
    const existing = await this.getSetting(insertSetting.key);
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value: insertSetting.value })
        .where(eq(settings.key, insertSetting.key))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(insertSetting).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();

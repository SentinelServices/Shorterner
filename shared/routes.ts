import { z } from 'zod';
import { insertVisitSchema, insertSettingSchema, visits, settings, webhookConfigSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  links: {
    get: {
      method: 'GET' as const,
      path: '/api/links/:code',
      responses: {
        200: z.object({ targetUrl: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/links',
      input: z.object({ targetUrl: z.string().url() }),
      responses: {
        201: z.object({ code: z.string() }),
      },
    },
  },
  visits: {
    create: {
      method: 'POST' as const,
      path: '/api/visits',
      input: insertVisitSchema,
      responses: {
        201: z.custom<typeof visits.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/visits',
      responses: {
        200: z.array(z.custom<typeof visits.$inferSelect>()),
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings/:key',
      responses: {
        200: z.object({ value: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings',
      input: insertSettingSchema,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  analyze: {
    get: {
      method: 'GET' as const,
      path: '/api/analyze', // Helper to get server-seen IP info
      responses: {
        200: z.object({
          ip: z.string(),
          userAgent: z.string(),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

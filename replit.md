# replit.md

## Overview

This is a **Connection Security Analyzer** application with a cyberpunk aesthetic. It allows users to scan their network connection, gather IP geolocation data, detect proxies/VPNs, and log visit history. The system supports Discord webhook integrations for notifications and stores scan results in a PostgreSQL database.

The application follows a full-stack TypeScript architecture with a React frontend and Express backend, using Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui components
- **Animations**: Framer Motion for UI transitions
- **Design System**: Cyberpunk theme with custom fonts (Orbitron for headers, Share Tech Mono for data display)
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript with ES modules
- **API Pattern**: REST endpoints defined in `shared/routes.ts` with Zod validation schemas
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions

### Data Storage
- **Database**: PostgreSQL (required via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` using Drizzle table definitions
- **Tables**:
  - `visits`: Stores scan results (IP, geolocation, device info, proxy detection)
  - `settings`: Key-value store for application configuration (webhook URLs, etc.)

### API Structure
- `GET /api/analyze` - Returns client IP and user agent as seen by server
- `GET /api/visits` - List all recorded visits
- `POST /api/visits` - Create a new visit record
- `GET /api/settings/:key` - Retrieve a setting by key
- `POST /api/settings` - Upsert a setting

### Key Design Decisions

1. **Shared Types Pattern**: Database schemas and API route definitions are shared between frontend and backend via the `shared/` directory, ensuring type safety across the stack.

2. **Zod Validation**: All API inputs are validated using Zod schemas derived from Drizzle table definitions via `drizzle-zod`.

3. **Client-Side IP Detection**: The frontend calls external IP APIs (ipapi.co, ipwho.is) with fallback to the backend's `/api/analyze` endpoint for IP detection.

4. **Component Library**: Uses shadcn/ui components (Radix UI primitives) with extensive customization for the cyberpunk theme.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations stored in `./migrations` directory

### External APIs (Client-Side)
- `https://ipapi.co/json/` - Primary IP geolocation API
- `https://ipwho.is/` - Fallback IP geolocation API
- `https://api.ipify.org` - Tertiary fallback for IP detection

### Third-Party Integrations
- **Discord Webhooks**: Configurable webhook URL stored in settings table for scan notifications

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod` - Database ORM and validation
- `@tanstack/react-query` - Server state management
- `framer-motion` - Animation library
- `date-fns` - Date formatting
- `lucide-react` - Icon library
- Radix UI primitives - Accessible UI components
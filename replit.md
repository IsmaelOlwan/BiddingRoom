# Bidding Room

## Overview

Bidding Room is a private asset sales platform that allows sellers to create time-limited bidding rooms for their assets. Buyers can place bids privately without seeing other bidders' identities, and sellers receive payments through Stripe integration. The platform offers three pricing tiers (Basic, Standard, Pro) with different room limits and features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **Animations**: Framer Motion for landing page animations
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API at `/api/*` routes
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: Static file serving from built assets

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with `drizzle-kit push` for schema sync
- **Tables**: 
  - `bidding_rooms`: Stores room metadata, seller info, payment status
  - `bids`: Stores individual bids linked to rooms

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` folder accessible to both frontend and backend via path aliases
- **Validation**: Zod schemas with drizzle-zod for type-safe validation
- **API Client**: Custom fetch wrapper in `queryClient.ts` with error handling

## External Dependencies

### Stripe Integration
- Payment processing via Stripe Checkout Sessions
- Products/prices stored in Stripe and synced via connectors
- Webhook handling for payment confirmation
- Credentials fetched dynamically from Replit Connectors API

### Database
- PostgreSQL connection via `DATABASE_URL` environment variable
- Connection pooling with `pg` package
- Schema managed through Drizzle ORM

### Fonts
- Google Fonts: Space Grotesk (display), Inter (body)
- Loaded via external stylesheet in HTML

### Replit-Specific
- Vite plugins for development banner and cartographer
- Meta images plugin for OpenGraph tags with Replit domains
- Runtime error overlay for debugging
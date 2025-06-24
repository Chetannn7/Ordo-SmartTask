# Ordo - Task Management Application

## Overview

Ordo is a task management application built with React, Express, and PostgreSQL that implements a 3-tier priority system. The application features user authentication through Replit's OpenID Connect system and provides a clean, modern interface for managing tasks with priorities: Priority (urgent & important), Delegate (assign to others), and Non-essential (nice to have).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: Passport.js with OpenID Connect (Replit Auth)
- **Session Management**: express-session with PostgreSQL session store
- **Development**: tsx for TypeScript execution in development

### Database Architecture
- **Database**: PostgreSQL (using Neon serverless in production)
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Location**: `shared/schema.ts` for type sharing between client and server
- **Tables**: users, tasks, sessions (for authentication)

## Key Components

### Authentication System
- **Provider**: Replit OpenID Connect integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation/update on login
- **Route Protection**: Middleware-based authentication checks

### Task Management
- **Priority System**: Three-tier priority classification (priority, delegate, nonessential)
- **CRUD Operations**: Full create, read, update, delete functionality
- **User Isolation**: Tasks are scoped to authenticated users
- **Real-time Updates**: Optimistic updates with TanStack Query

### UI Components
- **Design System**: shadcn/ui with "new-york" style variant
- **Theme**: Neutral color scheme with CSS custom properties
- **Responsive**: Mobile-first responsive design
- **Accessibility**: ARIA-compliant components from Radix UI

## Data Flow

1. **Authentication Flow**:
   - User clicks "Get Started" → redirected to `/api/login`
   - Replit OIDC handles authentication
   - User data stored/updated in PostgreSQL
   - Session established with secure cookies

2. **Task Management Flow**:
   - Client requests authenticated via session cookies
   - API routes validate authentication middleware
   - Database operations through Drizzle ORM
   - Real-time UI updates via TanStack Query cache invalidation

3. **Client-Server Communication**:
   - RESTful API endpoints under `/api/`
   - JSON request/response format
   - Error handling with proper HTTP status codes
   - Client-side error boundaries for graceful failures

## External Dependencies

### Authentication
- **Replit OIDC**: Primary authentication provider
- **Required Environment Variables**: `REPLIT_DOMAINS`, `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL provider
- **Required Environment Variables**: `DATABASE_URL`
- **Connection**: WebSocket-based connection pooling

### Development Tools
- **Replit Integration**: Cartographer plugin for development environment
- **Runtime Error Overlay**: Development error handling

## Deployment Strategy

### Build Process
1. **Client Build**: Vite bundles React application to `dist/public`
2. **Server Build**: esbuild bundles Express server to `dist/index.js`
3. **Static Assets**: Client build output served by Express in production

### Environment Configuration
- **Development**: tsx runs TypeScript directly, Vite dev server with HMR
- **Production**: Compiled JavaScript with optimized static asset serving
- **Database Migrations**: Drizzle Kit for schema management

### Replit Deployment
- **Target**: Autoscale deployment
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Port**: Application runs on port 5000

## Changelog

```
Changelog:
- June 24, 2025. Initial setup complete with landing page, authentication, and task management
- June 24, 2025. Landing page design refined with white background, orange wave patterns, and improved typography
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Design preferences: Clean white backgrounds with orange UI accents, minimal descriptions on landing page, prominent call-to-action buttons, cool loading animations with logo, visible Create Task button, orange-white theme throughout app interface.
```
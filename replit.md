# VideoVenta System

## Overview

VideoVenta System is a comprehensive web platform for video production services that combines a public-facing landing page with client management capabilities. The system features a dynamic pricing calculator, an administrative panel for managing clients and projects, and personalized delivery pages for client content access. Built with a modern full-stack architecture, it provides real-time pricing calculations, WhatsApp integration for customer communication, and a complete client lifecycle management system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **API Design**: RESTful endpoints with JSON responses
- **Development**: Custom Vite integration for hot module replacement in development

### Data Storage Solutions
- **Primary Database**: PostgreSQL configured via Drizzle ORM
- **Schema Management**: Drizzle migrations with push-based deployment
- **Connection**: Neon Database serverless PostgreSQL driver
- **Fallback Storage**: In-memory storage implementation for development/testing
- **Session Store**: PostgreSQL-backed sessions using connect-pg-simple

### Authentication and Authorization
- **Admin Authentication**: Simple password-based authentication (configurable for production upgrade)
- **Session Management**: Express sessions with PostgreSQL persistence
- **Client Access**: Username-based client page access without authentication
- **API Security**: Basic session validation for admin endpoints

### Component Architecture
- **Design System**: Fire-themed aesthetic with orange/red color palette
- **Layout Structure**: 
  - Landing page with hero section, sample videos, and pricing calculator
  - Admin panel with dashboard, client management, and configuration
  - Client delivery pages with project status and download links
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **State Context**: React Context for global configuration management

### Database Schema
- **Clients Table**: User information, projects, and contact details
- **Projects Table**: Project metadata, status tracking, and file management
- **Site Config Table**: Business settings, pricing configuration, and WhatsApp integration
- **Type Safety**: Drizzle-zod integration for runtime validation

### API Architecture
- **Admin Routes**: Authentication, client CRUD, project management
- **Configuration Routes**: Site settings and pricing management
- **Public Routes**: Price calculation and client data retrieval
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm** and **drizzle-kit**: Type-safe database operations and migrations
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **express**: Node.js web framework for API server
- **react** and **react-dom**: Core React framework

### UI and Styling Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **clsx**: Conditional className utility
- **lucide-react**: Modern icon library

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@vitejs/plugin-react**: React integration for Vite
- **esbuild**: Fast JavaScript bundler for production builds

### Form and Validation
- **react-hook-form**: Performant forms with easy validation
- **@hookform/resolvers**: Integration with validation libraries
- **zod**: TypeScript-first schema validation (via drizzle-zod)

### Session and Storage
- **connect-pg-simple**: PostgreSQL session store for Express
- **express-session**: Session middleware for Express

### Utility Libraries
- **date-fns**: Modern date utility library
- **wouter**: Lightweight routing for React
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel component library
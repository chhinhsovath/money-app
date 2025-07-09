# Sovath's Favorite Tech Stack

## Core Framework & Runtime
- **Next.js 15.3.3** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Node.js** - JavaScript runtime
- **ESM Modules** - Modern JavaScript module system

## Database & ORM
- **PostgreSQL** - Primary database (Digital Ocean PostgreSQL for production)
- **Drizzle ORM 0.44.2** - TypeScript ORM
- **pg 8.16.0** - PostgreSQL client for Node.js
- **Raw SQL queries** - Direct database operations

## Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Shadcn/ui** - Component library built on Radix UI
- **Radix UI** - Unstyled, accessible UI components
- **Flowbite 3.1.2** - Tailwind CSS components
- **tailwindcss-animate 1.0.7** - Animation utilities
- **class-variance-authority 0.7.1** - Component variants
- **clsx 2.1.1** - Utility for constructing className strings
- **tailwind-merge 2.5.5** - Merge Tailwind CSS classes

## State Management & Forms
- **React Hook Form 7.54.1** - Form management
- **Formik 2.4.6** - Form library
- **Zod 3.24.1** - Schema validation
- **Yup 1.6.1** - Object schema validation
- **@hookform/resolvers 3.9.1** - Validation resolvers

## Authentication & Security
- **NextAuth 4.24.11** - Authentication for Next.js
- **bcrypt 6.0.0 / bcryptjs 3.0.2** - Password hashing
- **Firebase 11.9.1** - Authentication and real-time features
- **firebase-admin 13.4.0** - Firebase Admin SDK
- **Cookie-based sessions** - Session management

## UI Components & Libraries
- **Lucide React 0.454.0** - Icon library
- **@hello-pangea/dnd 18.0.1** - Drag and drop
- **Framer Motion 12.18.1** - Animation library
- **ApexCharts 4.7.0 / react-apexcharts 1.7.0** - Charts
- **Recharts** - Chart library
- **react-day-picker 9.2.3** - Date picker
- **date-fns** - Date utility library
- **Sonner 1.7.1** - Toast notifications
- **cmdk 1.0.4** - Command menu
- **vaul 0.9.6** - Drawer component
- **embla-carousel-react 8.5.1** - Carousel component
- **react-resizable-panels 2.1.7** - Resizable panels
- **input-otp 1.4.1** - OTP input component

## Rich Text & Content
- **@tiptap/react 2.14.0** - Rich text editor
- **@tiptap/starter-kit 2.14.0** - TipTap starter extensions
- **@tiptap/extension-font-family 2.24.1** - Font family extension
- **@tiptap/extension-placeholder 2.14.0** - Placeholder extension

## Data Processing
- **xlsx 0.18.5** - Excel file handling
- **archiver 7.0.1** - File compression
- **qrcode 1.5.4** - QR code generation
- **sharp 0.34.2** - Image processing

## AI & Language Models
- **@anthropic-ai/sdk 0.54.0** - Anthropic Claude SDK
- **@modelcontextprotocol/sdk 1.13.1** - Model Context Protocol

## Development Tools
- **ESLint 9.29.0** - Linting
- **eslint-config-next 15.3.4** - Next.js ESLint config
- **PostCSS** - CSS processing
- **Autoprefixer 10.4.20** - CSS vendor prefixes
- **dotenv 16.5.0** - Environment variables

## Font & Typography
- **Hanuman font** - Primary font for English/Khmer support

## Deployment & Infrastructure
- **PM2** (ecosystem.config.js) - Process manager for production
- **Docker** support (Dockerfile)
- **Nginx** configuration
- **Vercel** deployment support
- **Digital Ocean** - PostgreSQL hosting
- **Standalone output** - Optimized production builds

## PWA & Offline
- **Service Worker** (sw.js) - Offline functionality
- **Web Manifest** - PWA configuration
- **Push notifications** support

## Internationalization
- **Multi-language support** - Khmer (km) and English (en)
- **Custom i18n implementation** - Context-based translations

## Monitoring & Analytics
- **Health monitoring system** - Custom health checks
- **Audit logging** - Complete audit trail system

## Testing
- **Test scripts** in `/scripts` directory
- **Manual testing utilities**

## Build Tools
- **Webpack** (via Next.js) - Module bundler with custom configuration
- **SWC** (via Next.js) - JavaScript/TypeScript compiler

## Additional Features
- **next-themes 0.4.4** - Theme management
- **react-firebase-hooks 5.1.1** - Firebase React hooks
- **Hierarchical permission system** - Custom RBAC implementation
- **Menu ordering system** - Drag-and-drop menu customization
- **Training management system** - Comprehensive training features
- **Questionnaire builder** - Dynamic form creation
- **Geographic cascade selectors** - Location-based dropdowns

## Summary
This tech stack represents a modern, full-featured web application with enterprise-grade features including:
- Modern React with Next.js 15 App Router
- Type-safe development with TypeScript
- Scalable PostgreSQL database with Drizzle ORM
- Beautiful UI with Tailwind CSS and Shadcn/ui
- Comprehensive authentication and authorization
- Multi-language support
- PWA capabilities
- Real-time features with Firebase
- AI integration with Claude SDK
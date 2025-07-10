# Vercel Deployment Guide

This project has been refactored to deploy on Vercel as a single application, just like V0 projects.

## Setup Instructions

### 1. Database Setup
First, you need to set up a PostgreSQL database. You can use:
- **Vercel Postgres** (recommended for Vercel deployments)
- **Supabase** 
- **Neon**
- Any PostgreSQL provider with a connection string

### 2. Environment Variables
Set these environment variables in Vercel:
- `POSTGRES_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A secure random string for JWT signing

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or use the Vercel dashboard to import your GitHub repository.

## What Changed

1. **Removed Express Server**: Converted all Express routes to Vercel Functions in `/api` directory
2. **Database Connection**: Uses `@vercel/postgres` for serverless-friendly connections
3. **API Routes**: Frontend now calls `/api/*` instead of `localhost:3000`
4. **Authentication**: Cookie-based auth works with Vercel Functions

## Local Development

For local development with Vercel Functions:
```bash
npm install
vercel dev
```

This will start both the Vite dev server and Vercel Functions locally.

## File Structure
```
/
├── api/              # Vercel Functions (backend)
│   ├── auth/
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── logout.js
│   │   └── me.js
│   └── invoices/
│       └── index.js
├── lib/              # Shared utilities
│   ├── db.js         # Database connection
│   └── auth.js       # Auth middleware
├── src/              # React frontend
└── vercel.json       # Vercel configuration
```

## Notes
- All API routes are now serverless functions
- Database connections are pooled automatically by Vercel
- Authentication uses HTTP-only cookies
- No need to manage separate frontend/backend deployments
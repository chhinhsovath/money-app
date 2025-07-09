# MoneyApp - Financial Management Application

A comprehensive financial management web application built with React, Vite, and PostgreSQL.

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

## Setup Instructions

### 1. Database Setup

First, create the database and apply the schema:

```bash
# Create database
createdb moneyapp

# Apply schema
PGPASSWORD=12345 psql -h localhost -U postgres -d moneyapp -f database/schema.sql

# Load sample data (optional)
PGPASSWORD=12345 psql -h localhost -U postgres -d moneyapp -f database/seed.sql

# Load demo data with contacts, accounts, and invoices (recommended)
PGPASSWORD=12345 psql -h localhost -U postgres -d moneyapp -f database/seed-demo.sql
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the backend server
npm run dev
```

The backend will run on http://localhost:3000

### 3. Frontend Setup

In a new terminal:

```bash
# From the project root
npm install

# Start the development server
npm run dev
```

The frontend will run on http://localhost:5173

## Default Credentials

- Email: admin@demo.com
- Password: demo123

## Project Structure

```
amom/
├── src/               # Frontend React application
│   ├── components/    # React components
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── contexts/     # React contexts
│   └── lib/          # Utilities
├── server/           # Backend Express server
│   ├── routes/       # API routes
│   ├── middleware/   # Express middleware
│   └── db.js         # Database connection
├── database/         # Database schema and seeds
└── PRD/             # Product documentation
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Features Implemented

- ✅ JWT Authentication
- ✅ User registration and login
- ✅ Basic dashboard
- ✅ Responsive navigation
- ✅ Protected routes
- ✅ Database schema for accounting

## Next Steps

- Implement invoice management
- Add contact management
- Build financial reports
- Create chart of accounts interface
- Add expense tracking
- Implement bank reconciliation
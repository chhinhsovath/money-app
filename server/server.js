import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import organizationRoutes from './routes/organizations.js'
import accountRoutes from './routes/accounts.js'
import contactRoutes from './routes/contacts.js'
import invoiceRoutes from './routes/invoices.js'
import billRoutes from './routes/bills.js'
import bankAccountRoutes from './routes/bankAccounts.js'
import bankTransactionRoutes from './routes/bankTransactions.js'
import reportRoutes from './routes/reports.js'
import expenseRoutes from './routes/expenses.js'
import taxRoutes from './routes/tax.js'
import databaseRoutes from './routes/database.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Allow localhost on any port
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true)
    }
    
    // For production, you would add your domain here
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/bills', billRoutes)
app.use('/api/bank-accounts', bankAccountRoutes)
app.use('/api/bank-transactions', bankTransactionRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/tax', taxRoutes)
app.use('/api/database', databaseRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`)
})
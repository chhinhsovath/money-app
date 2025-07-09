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
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

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

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
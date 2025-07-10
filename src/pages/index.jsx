import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Layout from './Layout'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import Dashboard from './Dashboard'
import InvoiceList from './invoices/InvoiceList'
import InvoiceForm from './invoices/InvoiceForm'
import InvoiceView from './invoices/InvoiceView'
import ContactList from './contacts/ContactList'
import ContactForm from './contacts/ContactForm'
import ContactView from './contacts/ContactView'
import BillList from './bills/BillList'
import BillForm from './bills/BillForm'
import BillView from './bills/BillView'
import BankAccountList from './bank/BankAccountList'
import BankAccountForm from './bank/BankAccountForm'
import BankAccountView from './bank/BankAccountView'
import BankTransactionForm from './bank/BankTransactionForm'
import ReportsList from './reports/ReportsList'
import ProfitLossReport from './reports/ProfitLossReport'
import BalanceSheetReport from './reports/BalanceSheetReport'
import CashFlowReport from './reports/CashFlowReport'
import AgedReceivablesReport from './reports/AgedReceivablesReport'
import AgedPayablesReport from './reports/AgedPayablesReport'
import CustomReportBuilder from './reports/CustomReportBuilder'
import Analytics from './Analytics'
import ExpenseList from './expenses/ExpenseList'
import ExpenseForm from './expenses/ExpenseForm'
import ExpenseView from './expenses/ExpenseView'
import VendorList from './vendors/VendorList'
import VendorForm from './vendors/VendorForm'
import VendorView from './vendors/VendorView'
import TransactionList from './transactions/TransactionList'
import TransactionForm from './transactions/TransactionForm'
import TransactionView from './transactions/TransactionView'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/new" element={<InvoiceForm />} />
        <Route path="invoices/:id" element={<InvoiceView />} />
        <Route path="invoices/:id/edit" element={<InvoiceForm />} />
        
        <Route path="bills" element={<BillList />} />
        <Route path="bills/new" element={<BillForm />} />
        <Route path="bills/:id" element={<BillView />} />
        <Route path="bills/:id/edit" element={<BillForm />} />
        
        <Route path="expenses" element={<ExpenseList />} />
        <Route path="expenses/new" element={<ExpenseForm />} />
        <Route path="expenses/:id" element={<ExpenseView />} />
        <Route path="expenses/:id/edit" element={<ExpenseForm />} />
        
        <Route path="contacts" element={<ContactList />} />
        <Route path="contacts/new" element={<ContactForm />} />
        <Route path="contacts/:id" element={<ContactView />} />
        <Route path="contacts/:id/edit" element={<ContactForm />} />
        
        <Route path="vendors" element={<VendorList />} />
        <Route path="vendors/new" element={<VendorForm />} />
        <Route path="vendors/:id" element={<VendorView />} />
        <Route path="vendors/:id/edit" element={<VendorForm />} />
        
        <Route path="transactions" element={<TransactionList />} />
        <Route path="transactions/:id" element={<TransactionView />} />
        <Route path="transactions/:id/edit" element={<TransactionForm />} />
        
        <Route path="items" element={<div className="p-6">Products & Services Page</div>} />
        
        <Route path="bank-accounts" element={<BankAccountList />} />
        <Route path="bank-accounts/new" element={<BankAccountForm />} />
        <Route path="bank-accounts/:id" element={<BankAccountView />} />
        <Route path="bank-accounts/:id/edit" element={<BankAccountForm />} />
        <Route path="bank-transactions/new" element={<BankTransactionForm />} />
        
        <Route path="reports" element={<ReportsList />} />
        <Route path="reports/profit-loss" element={<ProfitLossReport />} />
        <Route path="reports/balance-sheet" element={<BalanceSheetReport />} />
        <Route path="reports/cash-flow" element={<CashFlowReport />} />
        <Route path="reports/aged-receivables" element={<AgedReceivablesReport />} />
        <Route path="reports/aged-payables" element={<AgedPayablesReport />} />
        <Route path="reports/custom" element={<CustomReportBuilder />} />
        
        <Route path="accounts" element={<div className="p-6">Chart of Accounts Page</div>} />
      </Route>
    </Routes>
  )
}
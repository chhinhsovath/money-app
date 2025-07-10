# Complete User Journey Map

## 1. Authentication Journeys

### 1.1 Registration Flow
- User visits `/register`
- Fills form: email, password, firstName, lastName, organizationName
- Submits → POST `/api/auth/register`
- Success → Redirect to `/login`
- Failure → Show error message

### 1.2 Login Flow
- User visits `/login`
- Fills form: email, password
- Submits → POST `/api/auth/login`
- Success → Store JWT → Redirect to `/dashboard`
- Failure → Show error message

### 1.3 Logout Flow
- User clicks logout
- POST `/api/auth/logout`
- Clear JWT → Redirect to `/login`

### 1.4 Session Management
- Every API call includes JWT
- 401 response → Redirect to `/login`
- Token refresh (if implemented)

## 2. Dashboard Journey
- User lands on `/dashboard`
- View stats cards (Revenue, Invoices, Expenses, Profit)
- View charts (Revenue vs Expenses, Cash Flow)
- View recent invoices list
- Quick stats sidebar
- Can navigate to other sections

## 3. Invoice Management Journeys

### 3.1 List Invoices
- Navigate to `/invoices`
- GET `/api/invoices` → Display table
- Search/filter invoices
- Sort by columns
- Pagination

### 3.2 Create Invoice
- Click "New Invoice" → `/invoices/new`
- Fill form:
  - Select customer (GET `/api/contacts`)
  - Add line items
  - Set dates, terms
  - Calculate totals
- Submit → POST `/api/invoices`
- Success → Redirect to `/invoices/{id}`

### 3.3 View Invoice
- Click invoice → `/invoices/{id}`
- GET `/api/invoices/{id}`
- View details
- Print/PDF export
- Email to customer

### 3.4 Edit Invoice
- Click edit → `/invoices/{id}/edit`
- GET `/api/invoices/{id}`
- Modify fields
- Submit → PUT `/api/invoices/{id}`
- Success → Redirect to view

### 3.5 Delete Invoice
- Click delete → Confirmation dialog
- Confirm → DELETE `/api/invoices/{id}`
- Success → Remove from list

## 4. Bill Management Journeys

### 4.1 List Bills
- Navigate to `/bills`
- GET `/api/bills` → Display table
- Filter by status (paid, unpaid, overdue)
- Sort and paginate

### 4.2 Create Bill
- Click "New Bill" → `/bills/new`
- Fill form:
  - Select vendor
  - Add line items
  - Set due date
- Submit → POST `/api/bills`

### 4.3 View Bill
- Click bill → `/bills/{id}`
- GET `/api/bills/{id}`
- View details
- Mark as paid
- Attach documents

### 4.4 Edit Bill
- Click edit → `/bills/{id}/edit`
- Modify fields
- Submit → PUT `/api/bills/{id}`

### 4.5 Delete Bill
- Delete → Confirmation
- DELETE `/api/bills/{id}`

## 5. Contact Management Journeys

### 5.1 List Contacts
- Navigate to `/contacts`
- GET `/api/contacts`
- Filter by type (customer/vendor)
- Search by name/email

### 5.2 Create Contact
- Click "New Contact" → `/contacts/new`
- Fill form:
  - Name, email, phone
  - Address
  - Type (customer/vendor)
- Submit → POST `/api/contacts`

### 5.3 View Contact
- Click contact → `/contacts/{id}`
- GET `/api/contacts/{id}`
- View details
- View related transactions

### 5.4 Edit Contact
- Edit → `/contacts/{id}/edit`
- PUT `/api/contacts/{id}`

### 5.5 Delete Contact
- Delete → Confirmation
- DELETE `/api/contacts/{id}`

## 6. Bank Account Journeys

### 6.1 List Bank Accounts
- Navigate to `/bank-accounts`
- GET `/api/bank-accounts`
- View account balances

### 6.2 Create Bank Account
- New Account → `/bank-accounts/new`
- Fill: name, number, type, balance
- POST `/api/bank-accounts`

### 6.3 View Transactions
- Click account → `/bank-accounts/{id}`
- GET `/api/bank-accounts/{id}`
- GET `/api/bank-transactions?account_id={id}`
- List transactions
- Reconcile

### 6.4 Add Transaction
- New Transaction → `/bank-transactions/new`
- Fill: date, amount, description
- POST `/api/bank-transactions`

## 7. Expense Management Journeys

### 7.1 List Expenses
- Navigate to `/expenses`
- GET `/api/expenses`
- Filter by category, date

### 7.2 Create Expense
- New Expense → `/expenses/new`
- Fill: amount, category, date, receipt
- POST `/api/expenses`

### 7.3 Edit/Delete Expense
- Standard CRUD operations

## 8. Reporting Journeys

### 8.1 View Reports List
- Navigate to `/reports`
- See available reports

### 8.2 Generate Report
- Select report type
- Set parameters (date range, etc.)
- GET `/api/reports/{type}`
- View results
- Export to PDF/Excel

### Report Types:
- Profit & Loss
- Balance Sheet
- Cash Flow
- Aged Receivables
- Aged Payables
- Custom Reports

## 9. Settings & Profile

### 9.1 User Profile
- View/edit user details
- Change password
- Update preferences

### 9.2 Organization Settings
- Update company info
- Tax settings
- Invoice templates

## 10. Error Scenarios

### 10.1 Network Errors
- Show error toast
- Retry mechanism
- Offline mode indication

### 10.2 Validation Errors
- Field-level errors
- Form submission errors
- Business rule violations

### 10.3 Authorization Errors
- 403 → Show access denied
- 401 → Redirect to login

## 11. Search & Navigation

### 11.1 Global Search
- Search across entities
- Quick navigation
- Recent items

### 11.2 Breadcrumb Navigation
- Show current location
- Quick parent navigation

## API Endpoints Summary

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

### Invoices
- GET /api/invoices
- POST /api/invoices
- GET /api/invoices/:id
- PUT /api/invoices/:id
- DELETE /api/invoices/:id

### Bills
- GET /api/bills
- POST /api/bills
- GET /api/bills/:id
- PUT /api/bills/:id
- DELETE /api/bills/:id

### Contacts
- GET /api/contacts
- POST /api/contacts
- GET /api/contacts/:id
- PUT /api/contacts/:id
- DELETE /api/contacts/:id

### Bank Accounts
- GET /api/bank-accounts
- POST /api/bank-accounts
- GET /api/bank-accounts/:id
- PUT /api/bank-accounts/:id
- DELETE /api/bank-accounts/:id

### Bank Transactions
- GET /api/bank-transactions
- POST /api/bank-transactions
- GET /api/bank-transactions/:id
- PUT /api/bank-transactions/:id
- DELETE /api/bank-transactions/:id

### Reports
- GET /api/reports/profit-loss
- GET /api/reports/balance-sheet
- GET /api/reports/cash-flow
- GET /api/reports/aged-receivables
- GET /api/reports/aged-payables
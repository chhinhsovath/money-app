-- Seed Data for MoneyApp
-- Initial setup for accounting system

-- Insert default organization
INSERT INTO organizations (id, name, legal_name, currency_code, timezone) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Demo Company',
    'Demo Company Ltd',
    'USD',
    'America/New_York'
);

-- Insert default admin user
INSERT INTO users (id, organization_id, first_name, last_name, email, password_hash, role)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Admin',
    'User',
    'admin@demo.com',
    '$2b$10$DummyPasswordHashForDemo',
    'admin'
);

-- Insert default tax rates
INSERT INTO tax_rates (id, organization_id, name, rate, type) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Sales Tax', 8.25, 'sales'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'GST', 10.00, 'both'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'No Tax', 0.00, 'both');

-- Insert Chart of Accounts (Standard US GAAP structure)
INSERT INTO accounts (id, organization_id, code, name, type, balance) VALUES
-- Assets
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', '1000', 'Assets', 'asset', 0),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', '1100', 'Current Assets', 'asset', 0),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', '1110', 'Cash and Cash Equivalents', 'asset', 10000),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', '1120', 'Accounts Receivable', 'asset', 5000),
('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440000', '1130', 'Inventory', 'asset', 8000),
('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440000', '1140', 'Prepaid Expenses', 'asset', 2000),
('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440000', '1200', 'Fixed Assets', 'asset', 0),
('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440000', '1210', 'Equipment', 'asset', 15000),
('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440000', '1220', 'Accumulated Depreciation', 'asset', -3000),

-- Liabilities
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', '2000', 'Liabilities', 'liability', 0),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', '2100', 'Current Liabilities', 'liability', 0),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', '2110', 'Accounts Payable', 'liability', 3000),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440000', '2120', 'Sales Tax Payable', 'liability', 500),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440000', '2130', 'Accrued Expenses', 'liability', 1200),
('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440000', '2200', 'Long-term Liabilities', 'liability', 0),
('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440000', '2210', 'Long-term Debt', 'liability', 10000),

-- Equity
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440000', '3000', 'Equity', 'equity', 0),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440000', '3100', 'Owner''s Equity', 'equity', 20000),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440000', '3200', 'Retained Earnings', 'equity', 8000),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440000', '3300', 'Current Year Earnings', 'equity', 0),

-- Revenue
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440000', '4000', 'Revenue', 'revenue', 0),
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440000', '4100', 'Sales Revenue', 'revenue', 25000),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440000', '4200', 'Service Revenue', 'revenue', 8000),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440000', '4300', 'Interest Income', 'revenue', 100),

-- Expenses
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440000', '5000', 'Expenses', 'expense', 0),
('550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440000', '5100', 'Cost of Goods Sold', 'expense', 15000),
('550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440000', '5200', 'Operating Expenses', 'expense', 0),
('550e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440000', '5210', 'Salaries and Wages', 'expense', 8000),
('550e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440000', '5220', 'Rent Expense', 'expense', 2400),
('550e8400-e29b-41d4-a716-446655440065', '550e8400-e29b-41d4-a716-446655440000', '5230', 'Utilities Expense', 'expense', 600),
('550e8400-e29b-41d4-a716-446655440066', '550e8400-e29b-41d4-a716-446655440000', '5240', 'Marketing Expense', 'expense', 1500),
('550e8400-e29b-41d4-a716-446655440067', '550e8400-e29b-41d4-a716-446655440000', '5250', 'Office Supplies', 'expense', 300),
('550e8400-e29b-41d4-a716-446655440068', '550e8400-e29b-41d4-a716-446655440000', '5260', 'Insurance Expense', 'expense', 1200),
('550e8400-e29b-41d4-a716-446655440069', '550e8400-e29b-41d4-a716-446655440000', '5270', 'Depreciation Expense', 'expense', 1500);

-- Update parent account relationships
UPDATE accounts SET parent_account_id = '550e8400-e29b-41d4-a716-446655440020' WHERE code IN ('1100', '1200');
UPDATE accounts SET parent_account_id = '550e8400-e29b-41d4-a716-446655440021' WHERE code IN ('1110', '1120', '1130', '1140');
UPDATE accounts SET parent_account_id = '550e8400-e29b-41d4-a716-446655440026' WHERE code IN ('1210', '1220');
UPDATE accounts SET parent_account_id = '550e8400-e29b-41d4-a716-446655440030' WHERE code IN ('2100', '2200');
UPDATE accounts SET parent_account_id = '550e8400-e29b-41d4-a716-446655440031' WHERE code IN ('2110', '2120', '2130');
UPDATE accounts SET parent_account_id = '550e8400-e29b-41d4-a716-446655440035' WHERE code IN ('2210');
UPDATE accounts SET parent_account_id = '550e8400-e29b-41d4-a716-446655440040' WHERE code IN ('3100', '3200', '3300');
UPDATE accounts SET parent_account_id = '550e8400-e29b-41d4-a716-446655440050' WHERE code IN ('4100', '4200', '4300');
UPDATE accounts SET parent_account_id = '550e8400-e29b-41d4-a716-446655440060' WHERE code IN ('5100', '5200');
UPDATE accounts SET parent_account_id = '550e8400-e29b-41d4-a716-446655440062' WHERE code IN ('5210', '5220', '5230', '5240', '5250', '5260', '5270');

-- Mark main bank account
UPDATE accounts SET is_bank_account = TRUE WHERE code = '1110';

-- Insert sample contacts
INSERT INTO contacts (id, organization_id, type, name, email, phone, payment_terms) VALUES
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'ABC Corporation', 'billing@abccorp.com', '555-0123', 30),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'XYZ Industries', 'accounts@xyzind.com', '555-0124', 15),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440000', 'supplier', 'Office Supplies Inc', 'orders@officesupplies.com', '555-0125', 30),
('550e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440000', 'supplier', 'Tech Solutions Ltd', 'billing@techsolutions.com', '555-0126', 14);

-- Insert sample items
INSERT INTO items (id, organization_id, item_code, name, description, type, unit_price, cost_price, quantity_on_hand, sales_account_id, purchase_account_id, tax_rate_id) VALUES
('550e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440000', 'PROD001', 'Professional Service', 'Consulting Services', 'service', 150.00, 0.00, 0, '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440000', 'PROD002', 'Software License', 'Annual Software License', 'product', 1200.00, 600.00, 10, '550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440000', 'PROD003', 'Training Workshop', 'Professional Training', 'service', 500.00, 0.00, 0, '550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440010');

-- Insert sample invoice
INSERT INTO invoices (id, organization_id, invoice_number, contact_id, contact_name, issue_date, due_date, status, subtotal, tax_amount, total) VALUES
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440000', 'INV-2025-001', '550e8400-e29b-41d4-a716-446655440070', 'ABC Corporation', '2025-01-01', '2025-01-31', 'sent', 1800.00, 148.50, 1948.50);

-- Insert sample invoice line items
INSERT INTO invoice_line_items (id, invoice_id, account_id, description, quantity, unit_price, line_total, tax_rate_id, tax_amount) VALUES
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440052', 'Professional Service', 8.00, 150.00, 1200.00, '550e8400-e29b-41d4-a716-446655440010', 99.00),
('550e8400-e29b-41d4-a716-446655440092', '550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440052', 'Training Workshop', 1.00, 500.00, 500.00, '550e8400-e29b-41d4-a716-446655440010', 41.25),
('550e8400-e29b-41d4-a716-446655440093', '550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440051', 'Software License', 1.00, 100.00, 100.00, '550e8400-e29b-41d4-a716-446655440010', 8.25);

-- Insert sample bill
INSERT INTO bills (id, organization_id, bill_number, contact_id, contact_name, issue_date, due_date, status, subtotal, tax_amount, total) VALUES
('550e8400-e29b-41d4-a716-446655440095', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2025-001', '550e8400-e29b-41d4-a716-446655440072', 'Office Supplies Inc', '2025-01-05', '2025-02-04', 'approved', 350.00, 28.88, 378.88);

-- Insert sample bill line items
INSERT INTO bill_line_items (id, bill_id, account_id, description, quantity, unit_price, line_total, tax_rate_id, tax_amount) VALUES
('550e8400-e29b-41d4-a716-446655440096', '550e8400-e29b-41d4-a716-446655440095', '550e8400-e29b-41d4-a716-446655440067', 'Office Supplies', 1.00, 350.00, 350.00, '550e8400-e29b-41d4-a716-446655440010', 28.88);

-- Insert sample journal entry
INSERT INTO journal_entries (id, organization_id, entry_number, date, description, total_amount, status, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440000', 'JE-2025-001', '2025-01-01', 'Opening Balance Entry', 37000.00, 'posted', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample journal entry lines
INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit_amount, credit_amount, description) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440022', 10000.00, 0.00, 'Opening Cash Balance'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440023', 5000.00, 0.00, 'Opening Accounts Receivable'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440024', 8000.00, 0.00, 'Opening Inventory'),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440027', 15000.00, 0.00, 'Opening Equipment'),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440032', 0.00, 3000.00, 'Opening Accounts Payable'),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440036', 0.00, 10000.00, 'Opening Long-term Debt'),
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440041', 0.00, 20000.00, 'Opening Owner Equity'),
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440042', 0.00, 5000.00, 'Opening Retained Earnings');
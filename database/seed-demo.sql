-- Demo seed data for MoneyApp
-- This creates sample data for the demo organization

-- Insert demo contacts (customers and suppliers)
INSERT INTO contacts (organization_id, name, type, email, phone, address, tax_number, contact_person, notes) VALUES
(1, 'Acme Corporation', 'customer', 'billing@acme.corp', '+1 (555) 123-4567', '123 Business St\nNew York, NY 10001', 'US123456789', 'John Smith', 'Major client - Net 30 terms'),
(1, 'TechStart Inc', 'customer', 'accounts@techstart.com', '+1 (555) 234-5678', '456 Innovation Blvd\nSan Francisco, CA 94105', 'US987654321', 'Sarah Johnson', 'Startup client - Pay on receipt'),
(1, 'Global Supplies Ltd', 'supplier', 'orders@globalsupplies.com', '+1 (555) 345-6789', '789 Commerce Way\nChicago, IL 60601', 'US456789123', 'Mike Wilson', 'Office supplies vendor'),
(1, 'CloudTech Services', 'supplier', 'billing@cloudtech.io', '+1 (555) 456-7890', '321 Server Farm Rd\nSeattle, WA 98101', 'US789123456', 'Emily Chen', 'Cloud hosting provider'),
(1, 'Freelance Design Co', 'both', 'hello@freelancedesign.co', '+1 (555) 567-8901', '555 Creative Lane\nAustin, TX 78701', 'US321654987', 'Alex Rivera', 'Design partner - both client and vendor');

-- Insert revenue accounts
INSERT INTO accounts (organization_id, code, name, type, is_active, description) VALUES
(1, '4000', 'Sales Revenue', 'revenue', true, 'Revenue from product sales'),
(1, '4100', 'Service Revenue', 'revenue', true, 'Revenue from services'),
(1, '4200', 'Consulting Revenue', 'revenue', true, 'Revenue from consulting');

-- Insert expense accounts
INSERT INTO accounts (organization_id, code, name, type, is_active, description) VALUES
(1, '5000', 'Cost of Goods Sold', 'expense', true, 'Direct costs of products sold'),
(1, '5100', 'Office Rent', 'expense', true, 'Monthly office rent'),
(1, '5200', 'Utilities', 'expense', true, 'Electricity, water, internet'),
(1, '5300', 'Office Supplies', 'expense', true, 'General office supplies'),
(1, '5400', 'Professional Services', 'expense', true, 'Legal, accounting, consulting'),
(1, '5500', 'Marketing & Advertising', 'expense', true, 'Marketing and advertising expenses'),
(1, '5600', 'Travel & Entertainment', 'expense', true, 'Business travel and client entertainment');

-- Insert asset accounts
INSERT INTO accounts (organization_id, code, name, type, is_active, description) VALUES
(1, '1000', 'Cash', 'asset', true, 'Cash in hand'),
(1, '1100', 'Checking Account', 'asset', true, 'Business checking account'),
(1, '1200', 'Savings Account', 'asset', true, 'Business savings account'),
(1, '1300', 'Accounts Receivable', 'asset', true, 'Money owed by customers'),
(1, '1400', 'Inventory', 'asset', true, 'Products in stock'),
(1, '1500', 'Prepaid Expenses', 'asset', true, 'Expenses paid in advance');

-- Insert liability accounts
INSERT INTO accounts (organization_id, code, name, type, is_active, description) VALUES
(1, '2000', 'Accounts Payable', 'liability', true, 'Money owed to suppliers'),
(1, '2100', 'Credit Card Payable', 'liability', true, 'Credit card balances'),
(1, '2200', 'Sales Tax Payable', 'liability', true, 'Sales tax collected'),
(1, '2300', 'Payroll Liabilities', 'liability', true, 'Payroll taxes and deductions');

-- Insert equity accounts
INSERT INTO accounts (organization_id, code, name, type, is_active, description) VALUES
(1, '3000', 'Owner''s Equity', 'equity', true, 'Owner''s investment in business'),
(1, '3100', 'Retained Earnings', 'equity', true, 'Accumulated profits'),
(1, '3200', 'Owner''s Draw', 'equity', true, 'Owner withdrawals');

-- Insert tax rates
INSERT INTO tax_rates (organization_id, name, rate, is_active) VALUES
(1, 'Standard Rate (10%)', 0.10, true),
(1, 'Reduced Rate (5%)', 0.05, true),
(1, 'Zero Rate', 0.00, true);

-- Insert sample products/services
INSERT INTO items (organization_id, name, code, type, sales_price, purchase_price, sales_account_id, purchase_account_id, description) VALUES
(1, 'Web Development', 'WEB-001', 'service', 150.00, null, (SELECT id FROM accounts WHERE organization_id = 1 AND code = '4100'), null, 'Hourly web development services'),
(1, 'Consulting', 'CONS-001', 'service', 200.00, null, (SELECT id FROM accounts WHERE organization_id = 1 AND code = '4200'), null, 'Business consulting services'),
(1, 'Office Chair', 'PROD-001', 'product', 250.00, 150.00, (SELECT id FROM accounts WHERE organization_id = 1 AND code = '4000'), (SELECT id FROM accounts WHERE organization_id = 1 AND code = '5000'), 'Ergonomic office chair'),
(1, 'Standing Desk', 'PROD-002', 'product', 500.00, 300.00, (SELECT id FROM accounts WHERE organization_id = 1 AND code = '4000'), (SELECT id FROM accounts WHERE organization_id = 1 AND code = '5000'), 'Adjustable standing desk');

-- Create a few sample invoices
INSERT INTO invoices (organization_id, contact_id, invoice_number, invoice_date, due_date, status, created_by) VALUES
(1, (SELECT id FROM contacts WHERE name = 'Acme Corporation' AND organization_id = 1), 'INV-0001', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'sent', 1),
(1, (SELECT id FROM contacts WHERE name = 'TechStart Inc' AND organization_id = 1), 'INV-0002', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'paid', 1),
(1, (SELECT id FROM contacts WHERE name = 'Freelance Design Co' AND organization_id = 1), 'INV-0003', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'draft', 1);

-- Add line items to the invoices
INSERT INTO invoice_line_items (invoice_id, account_id, description, quantity, unit_price, tax_rate_id, tax_amount, line_order) VALUES
-- Invoice 1 - Acme Corporation
((SELECT id FROM invoices WHERE invoice_number = 'INV-0001'), (SELECT id FROM accounts WHERE code = '4100' AND organization_id = 1), 'Web Development - 10 hours', 10, 150.00, (SELECT id FROM tax_rates WHERE name = 'Standard Rate (10%)' AND organization_id = 1), 150.00, 1),
((SELECT id FROM invoices WHERE invoice_number = 'INV-0001'), (SELECT id FROM accounts WHERE code = '4200' AND organization_id = 1), 'Consulting Services - 5 hours', 5, 200.00, (SELECT id FROM tax_rates WHERE name = 'Standard Rate (10%)' AND organization_id = 1), 100.00, 2),
-- Invoice 2 - TechStart Inc
((SELECT id FROM invoices WHERE invoice_number = 'INV-0002'), (SELECT id FROM accounts WHERE code = '4100' AND organization_id = 1), 'Website Redesign', 1, 3500.00, (SELECT id FROM tax_rates WHERE name = 'Standard Rate (10%)' AND organization_id = 1), 350.00, 1),
-- Invoice 3 - Freelance Design Co
((SELECT id FROM invoices WHERE invoice_number = 'INV-0003'), (SELECT id FROM accounts WHERE code = '4200' AND organization_id = 1), 'Monthly Retainer', 1, 2000.00, (SELECT id FROM tax_rates WHERE name = 'Zero Rate' AND organization_id = 1), 0.00, 1);

-- Create sample bills
INSERT INTO bills (organization_id, contact_id, bill_number, bill_date, due_date, status, created_by) VALUES
(1, (SELECT id FROM contacts WHERE name = 'Global Supplies Ltd' AND organization_id = 1), 'BILL-0001', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '5 days', 'overdue', 1),
(1, (SELECT id FROM contacts WHERE name = 'CloudTech Services' AND organization_id = 1), 'BILL-0002', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 'approved', 1);

-- Add line items to bills
INSERT INTO bill_line_items (bill_id, account_id, description, quantity, unit_price, tax_rate_id, tax_amount, line_order) VALUES
-- Bill 1 - Global Supplies
((SELECT id FROM bills WHERE bill_number = 'BILL-0001'), (SELECT id FROM accounts WHERE code = '5300' AND organization_id = 1), 'Office Supplies - Monthly', 1, 450.00, (SELECT id FROM tax_rates WHERE name = 'Standard Rate (10%)' AND organization_id = 1), 45.00, 1),
-- Bill 2 - CloudTech Services
((SELECT id FROM bills WHERE bill_number = 'BILL-0002'), (SELECT id FROM accounts WHERE code = '5200' AND organization_id = 1), 'Cloud Hosting - Monthly', 1, 1200.00, (SELECT id FROM tax_rates WHERE name = 'Zero Rate' AND organization_id = 1), 0.00, 1);

-- Add bank transactions
INSERT INTO bank_transactions (organization_id, bank_account_id, date, amount, type, description, reference, payee, is_reconciled, contact_id) VALUES
-- Opening balance
(1, (SELECT id FROM accounts WHERE code = '1100' AND organization_id = 1), CURRENT_DATE - INTERVAL '30 days', 25000.00, 'credit', 'Opening Balance', NULL, NULL, true, NULL),
-- Invoice payments received
(1, (SELECT id FROM accounts WHERE code = '1100' AND organization_id = 1), CURRENT_DATE - INTERVAL '5 days', 3850.00, 'credit', 'Payment for INV-0002', 'DEP-001', 'TechStart Inc', true, (SELECT id FROM contacts WHERE name = 'TechStart Inc' AND organization_id = 1)),
-- Bill payments
(1, (SELECT id FROM accounts WHERE code = '1100' AND organization_id = 1), CURRENT_DATE - INTERVAL '10 days', 495.00, 'debit', 'Payment for BILL-0001', 'CHK-1001', 'Global Supplies Ltd', true, (SELECT id FROM contacts WHERE name = 'Global Supplies Ltd' AND organization_id = 1)),
-- Other transactions
(1, (SELECT id FROM accounts WHERE code = '1100' AND organization_id = 1), CURRENT_DATE - INTERVAL '15 days', 2500.00, 'debit', 'Office Rent - January', 'CHK-1002', 'Property Management Co', true, NULL),
(1, (SELECT id FROM accounts WHERE code = '1100' AND organization_id = 1), CURRENT_DATE - INTERVAL '7 days', 150.00, 'debit', 'Internet Bill', 'ACH-001', 'ISP Services', false, NULL),
(1, (SELECT id FROM accounts WHERE code = '1100' AND organization_id = 1), CURRENT_DATE - INTERVAL '2 days', 1200.00, 'credit', 'Consulting Income', 'DEP-002', 'ABC Consulting Client', false, NULL),
(1, (SELECT id FROM accounts WHERE code = '1100' AND organization_id = 1), CURRENT_DATE - INTERVAL '1 day', 75.50, 'debit', 'Office Supplies', 'DBT-001', 'Office Depot', false, NULL);
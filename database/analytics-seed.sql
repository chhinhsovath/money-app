-- Analytics Seed Data for MoneyApp
-- This file contains comprehensive business data for analytics
-- Run after schema.sql and seed.sql

-- Insert Customers (mix of active and inactive)
INSERT INTO contacts (id, organization_id, type, name, email, phone, contact_person, address, city, state, postal_code, country, payment_terms, credit_limit) VALUES
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'Acme Corporation', 'billing@acme.com', '555-0100', 'John Smith', '123 Business Ave', 'New York', 'NY', '10001', 'USA', 30, 50000),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'Tech Solutions Inc', 'accounts@techsolutions.com', '555-0101', 'Sarah Johnson', '456 Tech Park', 'San Francisco', 'CA', '94105', 'USA', 45, 75000),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'Global Enterprises', 'finance@globalent.com', '555-0102', 'Michael Chen', '789 Commerce St', 'Chicago', 'IL', '60601', 'USA', 30, 100000),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'Innovative Systems', 'ap@innovsys.com', '555-0103', 'Emily Davis', '321 Innovation Blvd', 'Austin', 'TX', '78701', 'USA', 60, 60000),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'Prime Logistics', 'billing@primelogistics.com', '555-0104', 'Robert Wilson', '654 Shipping Way', 'Seattle', 'WA', '98101', 'USA', 30, 40000),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'Digital Marketing Co', 'accounts@digimkt.com', '555-0105', 'Lisa Anderson', '987 Marketing Plaza', 'Boston', 'MA', '02101', 'USA', 15, 25000),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'Consulting Partners', 'finance@consultpart.com', '555-0106', 'David Thompson', '147 Advisory Lane', 'Denver', 'CO', '80201', 'USA', 45, 80000),
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440000', 'customer', 'Retail Solutions', 'ap@retailsol.com', '555-0107', 'Maria Garcia', '258 Retail Row', 'Miami', 'FL', '33101', 'USA', 30, 35000);

-- Insert Suppliers
INSERT INTO contacts (id, organization_id, type, name, email, phone, contact_person, address, city, state, postal_code, country, payment_terms) VALUES
('550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440000', 'supplier', 'Office Supplies Plus', 'orders@officesupplus.com', '555-0200', 'Tom Brown', '100 Supply Street', 'Atlanta', 'GA', '30301', 'USA', 30),
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440000', 'supplier', 'Cloud Services Provider', 'billing@cloudpro.com', '555-0201', 'Jennifer Lee', '200 Cloud Way', 'San Jose', 'CA', '95101', 'USA', 30),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440000', 'supplier', 'Professional Insurance', 'accounts@proinsure.com', '555-0202', 'Mark Davis', '300 Insurance Blvd', 'Hartford', 'CT', '06101', 'USA', 15),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440000', 'supplier', 'Utilities Company', 'billing@utilco.com', '555-0203', 'Susan White', '400 Power St', 'Phoenix', 'AZ', '85001', 'USA', 10);

-- Insert Bank Accounts
INSERT INTO bank_accounts (id, organization_id, account_name, account_number, bank_name, account_type, currency, balance) VALUES
('550e8400-e29b-41d4-a716-446655440300', '550e8400-e29b-41d4-a716-446655440000', 'Business Checking', '****1234', 'First National Bank', 'checking', 'USD', 45000),
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440000', 'Business Savings', '****5678', 'First National Bank', 'savings', 'USD', 125000),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440000', 'Petty Cash', 'CASH', 'Cash on Hand', 'cash', 'USD', 500);

-- Function to generate dates within the last 90 days
CREATE OR REPLACE FUNCTION random_date_last_90_days() RETURNS date AS $$
BEGIN
    RETURN CURRENT_DATE - (random() * 90)::int;
END;
$$ LANGUAGE plpgsql;

-- Generate Invoices (varying dates over last 90 days)
INSERT INTO invoices (id, organization_id, invoice_number, contact_id, contact_name, issue_date, due_date, status, subtotal, tax_amount, total, paid_amount, notes, terms) VALUES
-- Paid invoices
('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-001', '550e8400-e29b-41d4-a716-446655440100', 'Acme Corporation', CURRENT_DATE - 85, CURRENT_DATE - 55, 'paid', 15000, 1237.50, 16237.50, 16237.50, 'Website development project', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-002', '550e8400-e29b-41d4-a716-446655440101', 'Tech Solutions Inc', CURRENT_DATE - 78, CURRENT_DATE - 48, 'paid', 8500, 701.25, 9201.25, 9201.25, 'Monthly consulting services', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-003', '550e8400-e29b-41d4-a716-446655440102', 'Global Enterprises', CURRENT_DATE - 70, CURRENT_DATE - 40, 'paid', 25000, 2062.50, 27062.50, 27062.50, 'ERP implementation phase 1', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-004', '550e8400-e29b-41d4-a716-446655440103', 'Innovative Systems', CURRENT_DATE - 65, CURRENT_DATE - 35, 'paid', 12000, 990.00, 12990.00, 12990.00, 'Software licensing', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-005', '550e8400-e29b-41d4-a716-446655440104', 'Prime Logistics', CURRENT_DATE - 60, CURRENT_DATE - 30, 'paid', 6800, 561.00, 7361.00, 7361.00, 'Logistics software setup', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-006', '550e8400-e29b-41d4-a716-446655440105', 'Digital Marketing Co', CURRENT_DATE - 55, CURRENT_DATE - 25, 'paid', 4500, 371.25, 4871.25, 4871.25, 'Marketing campaign management', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440406', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-007', '550e8400-e29b-41d4-a716-446655440100', 'Acme Corporation', CURRENT_DATE - 50, CURRENT_DATE - 20, 'paid', 18000, 1485.00, 19485.00, 19485.00, 'Mobile app development', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440407', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-008', '550e8400-e29b-41d4-a716-446655440106', 'Consulting Partners', CURRENT_DATE - 45, CURRENT_DATE - 15, 'paid', 22000, 1815.00, 23815.00, 23815.00, 'Business strategy consulting', 'Net 30'),
-- Recent paid invoices
('550e8400-e29b-41d4-a716-446655440408', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-009', '550e8400-e29b-41d4-a716-446655440107', 'Retail Solutions', CURRENT_DATE - 40, CURRENT_DATE - 10, 'paid', 9500, 783.75, 10283.75, 10283.75, 'POS system integration', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440409', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-010', '550e8400-e29b-41d4-a716-446655440101', 'Tech Solutions Inc', CURRENT_DATE - 35, CURRENT_DATE - 5, 'paid', 7200, 594.00, 7794.00, 7794.00, 'Cloud migration services', 'Net 30'),
-- Outstanding invoices
('550e8400-e29b-41d4-a716-446655440410', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-011', '550e8400-e29b-41d4-a716-446655440102', 'Global Enterprises', CURRENT_DATE - 30, CURRENT_DATE, 'sent', 32000, 2640.00, 34640.00, 0, 'ERP implementation phase 2', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440411', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-012', '550e8400-e29b-41d4-a716-446655440103', 'Innovative Systems', CURRENT_DATE - 25, CURRENT_DATE + 5, 'sent', 15000, 1237.50, 16237.50, 0, 'Annual support contract', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440412', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-013', '550e8400-e29b-41d4-a716-446655440100', 'Acme Corporation', CURRENT_DATE - 20, CURRENT_DATE + 10, 'sent', 24000, 1980.00, 25980.00, 0, 'API development project', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440413', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-014', '550e8400-e29b-41d4-a716-446655440104', 'Prime Logistics', CURRENT_DATE - 15, CURRENT_DATE + 15, 'sent', 8900, 734.25, 9634.25, 0, 'Custom reporting module', 'Net 30'),
-- Recent invoices
('550e8400-e29b-41d4-a716-446655440414', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-015', '550e8400-e29b-41d4-a716-446655440105', 'Digital Marketing Co', CURRENT_DATE - 10, CURRENT_DATE + 20, 'sent', 5500, 453.75, 5953.75, 0, 'SEO optimization package', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440415', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-016', '550e8400-e29b-41d4-a716-446655440106', 'Consulting Partners', CURRENT_DATE - 5, CURRENT_DATE + 25, 'draft', 28000, 2310.00, 30310.00, 0, 'Digital transformation consulting', 'Net 30'),
('550e8400-e29b-41d4-a716-446655440416', '550e8400-e29b-41d4-a716-446655440000', 'INV-2024-017', '550e8400-e29b-41d4-a716-446655440107', 'Retail Solutions', CURRENT_DATE - 2, CURRENT_DATE + 28, 'draft', 11000, 907.50, 11907.50, 0, 'Inventory management system', 'Net 30');

-- Insert Invoice Line Items
INSERT INTO invoice_line_items (id, invoice_id, account_id, description, quantity, unit_price, line_total, tax_rate_id, tax_amount) VALUES
-- INV-2024-001 items
('550e8400-e29b-41d4-a716-446655440500', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440042', 'Frontend Development', 80, 125, 10000, '550e8400-e29b-41d4-a716-446655440010', 825),
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440042', 'Backend Development', 40, 125, 5000, '550e8400-e29b-41d4-a716-446655440010', 412.50),
-- INV-2024-002 items
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440043', 'Monthly Consulting Retainer', 1, 8500, 8500, '550e8400-e29b-41d4-a716-446655440010', 701.25),
-- Add more line items as needed...
;

-- Generate Bills (expenses over last 90 days)
INSERT INTO bills (id, organization_id, bill_number, contact_id, contact_name, issue_date, due_date, status, subtotal, tax_amount, total, paid_amount, notes, reference) VALUES
-- Paid bills
('550e8400-e29b-41d4-a716-446655440600', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2024-001', '550e8400-e29b-41d4-a716-446655440200', 'Office Supplies Plus', CURRENT_DATE - 80, CURRENT_DATE - 50, 'paid', 1200, 99.00, 1299.00, 1299.00, 'Monthly office supplies', 'PO-001'),
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2024-002', '550e8400-e29b-41d4-a716-446655440201', 'Cloud Services Provider', CURRENT_DATE - 75, CURRENT_DATE - 45, 'paid', 2500, 0, 2500.00, 2500.00, 'Cloud hosting - January', 'CLOUD-JAN'),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2024-003', '550e8400-e29b-41d4-a716-446655440202', 'Professional Insurance', CURRENT_DATE - 70, CURRENT_DATE - 55, 'paid', 3000, 0, 3000.00, 3000.00, 'Q1 Insurance premium', 'INS-Q1'),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2024-004', '550e8400-e29b-41d4-a716-446655440203', 'Utilities Company', CURRENT_DATE - 65, CURRENT_DATE - 50, 'paid', 850, 0, 850.00, 850.00, 'January utilities', 'UTIL-JAN'),
-- More recent bills
('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2024-005', '550e8400-e29b-41d4-a716-446655440200', 'Office Supplies Plus', CURRENT_DATE - 50, CURRENT_DATE - 20, 'paid', 1450, 119.63, 1569.63, 1569.63, 'Printer and supplies', 'PO-002'),
('550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2024-006', '550e8400-e29b-41d4-a716-446655440201', 'Cloud Services Provider', CURRENT_DATE - 45, CURRENT_DATE - 15, 'paid', 2500, 0, 2500.00, 2500.00, 'Cloud hosting - February', 'CLOUD-FEB'),
('550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2024-007', '550e8400-e29b-41d4-a716-446655440203', 'Utilities Company', CURRENT_DATE - 35, CURRENT_DATE - 20, 'paid', 920, 0, 920.00, 920.00, 'February utilities', 'UTIL-FEB'),
-- Outstanding bills
('550e8400-e29b-41d4-a716-446655440607', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2024-008', '550e8400-e29b-41d4-a716-446655440200', 'Office Supplies Plus', CURRENT_DATE - 20, CURRENT_DATE + 10, 'approved', 890, 73.43, 963.43, 0, 'Monthly office supplies', 'PO-003'),
('550e8400-e29b-41d4-a716-446655440608', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2024-009', '550e8400-e29b-41d4-a716-446655440201', 'Cloud Services Provider', CURRENT_DATE - 15, CURRENT_DATE + 15, 'approved', 2500, 0, 2500.00, 0, 'Cloud hosting - March', 'CLOUD-MAR'),
('550e8400-e29b-41d4-a716-446655440609', '550e8400-e29b-41d4-a716-446655440000', 'BILL-2024-010', '550e8400-e29b-41d4-a716-446655440203', 'Utilities Company', CURRENT_DATE - 5, CURRENT_DATE + 10, 'draft', 875, 0, 875.00, 0, 'March utilities', 'UTIL-MAR');

-- Insert Bank Transactions
INSERT INTO bank_transactions (id, bank_account_id, transaction_date, description, reference, amount, transaction_type, status, created_at) VALUES
-- Income transactions (from paid invoices)
('550e8400-e29b-41d4-a716-446655440700', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 55, 'Payment from Acme Corporation', 'INV-2024-001', 16237.50, 'deposit', 'reconciled', CURRENT_DATE - 55),
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 48, 'Payment from Tech Solutions Inc', 'INV-2024-002', 9201.25, 'deposit', 'reconciled', CURRENT_DATE - 48),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 40, 'Payment from Global Enterprises', 'INV-2024-003', 27062.50, 'deposit', 'reconciled', CURRENT_DATE - 40),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 35, 'Payment from Innovative Systems', 'INV-2024-004', 12990.00, 'deposit', 'reconciled', CURRENT_DATE - 35),
('550e8400-e29b-41d4-a716-446655440704', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 30, 'Payment from Prime Logistics', 'INV-2024-005', 7361.00, 'deposit', 'reconciled', CURRENT_DATE - 30),
('550e8400-e29b-41d4-a716-446655440705', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 25, 'Payment from Digital Marketing Co', 'INV-2024-006', 4871.25, 'deposit', 'reconciled', CURRENT_DATE - 25),
('550e8400-e29b-41d4-a716-446655440706', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 20, 'Payment from Acme Corporation', 'INV-2024-007', 19485.00, 'deposit', 'reconciled', CURRENT_DATE - 20),
('550e8400-e29b-41d4-a716-446655440707', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 15, 'Payment from Consulting Partners', 'INV-2024-008', 23815.00, 'deposit', 'reconciled', CURRENT_DATE - 15),
('550e8400-e29b-41d4-a716-446655440708', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 10, 'Payment from Retail Solutions', 'INV-2024-009', 10283.75, 'deposit', 'reconciled', CURRENT_DATE - 10),
('550e8400-e29b-41d4-a716-446655440709', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 5, 'Payment from Tech Solutions Inc', 'INV-2024-010', 7794.00, 'deposit', 'reconciled', CURRENT_DATE - 5),
-- Expense transactions (from paid bills)
('550e8400-e29b-41d4-a716-446655440710', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 50, 'Office Supplies Plus', 'BILL-2024-001', -1299.00, 'withdrawal', 'reconciled', CURRENT_DATE - 50),
('550e8400-e29b-41d4-a716-446655440711', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 45, 'Cloud Services Provider', 'BILL-2024-002', -2500.00, 'withdrawal', 'reconciled', CURRENT_DATE - 45),
('550e8400-e29b-41d4-a716-446655440712', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 55, 'Professional Insurance', 'BILL-2024-003', -3000.00, 'withdrawal', 'reconciled', CURRENT_DATE - 55),
('550e8400-e29b-41d4-a716-446655440713', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 50, 'Utilities Company', 'BILL-2024-004', -850.00, 'withdrawal', 'reconciled', CURRENT_DATE - 50),
('550e8400-e29b-41d4-a716-446655440714', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 20, 'Office Supplies Plus', 'BILL-2024-005', -1569.63, 'withdrawal', 'reconciled', CURRENT_DATE - 20),
('550e8400-e29b-41d4-a716-446655440715', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 15, 'Cloud Services Provider', 'BILL-2024-006', -2500.00, 'withdrawal', 'reconciled', CURRENT_DATE - 15),
('550e8400-e29b-41d4-a716-446655440716', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 20, 'Utilities Company', 'BILL-2024-007', -920.00, 'withdrawal', 'reconciled', CURRENT_DATE - 20),
-- Other transactions
('550e8400-e29b-41d4-a716-446655440717', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 60, 'Payroll', 'PR-2024-01', -25000.00, 'withdrawal', 'reconciled', CURRENT_DATE - 60),
('550e8400-e29b-41d4-a716-446655440718', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 30, 'Payroll', 'PR-2024-02', -25000.00, 'withdrawal', 'reconciled', CURRENT_DATE - 30),
('550e8400-e29b-41d4-a716-446655440719', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 40, 'Office Rent', 'RENT-FEB', -5000.00, 'withdrawal', 'reconciled', CURRENT_DATE - 40),
('550e8400-e29b-41d4-a716-446655440720', '550e8400-e29b-41d4-a716-446655440300', CURRENT_DATE - 10, 'Office Rent', 'RENT-MAR', -5000.00, 'withdrawal', 'reconciled', CURRENT_DATE - 10);

-- Generate Journal Entries for all transactions
-- Revenue entries for paid invoices
INSERT INTO journal_entries (id, organization_id, entry_number, date, reference, description, total_amount, status) VALUES
('550e8400-e29b-41d4-a716-446655440800', '550e8400-e29b-41d4-a716-446655440000', 'JE-2024-001', CURRENT_DATE - 55, 'INV-2024-001', 'Revenue from Acme Corporation', 16237.50, 'posted'),
('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440000', 'JE-2024-002', CURRENT_DATE - 48, 'INV-2024-002', 'Revenue from Tech Solutions Inc', 9201.25, 'posted'),
('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440000', 'JE-2024-003', CURRENT_DATE - 40, 'INV-2024-003', 'Revenue from Global Enterprises', 27062.50, 'posted'),
('550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440000', 'JE-2024-004', CURRENT_DATE - 35, 'INV-2024-004', 'Revenue from Innovative Systems', 12990.00, 'posted'),
('550e8400-e29b-41d4-a716-446655440804', '550e8400-e29b-41d4-a716-446655440000', 'JE-2024-005', CURRENT_DATE - 30, 'INV-2024-005', 'Revenue from Prime Logistics', 7361.00, 'posted');

-- Journal Entry Lines for revenue
INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit_amount, credit_amount, description) VALUES
-- JE-2024-001
('550e8400-e29b-41d4-a716-446655440900', '550e8400-e29b-41d4-a716-446655440800', '550e8400-e29b-41d4-a716-446655440022', 16237.50, 0, 'Cash receipt'),
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440800', '550e8400-e29b-41d4-a716-446655440042', 0, 15000.00, 'Service revenue'),
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440800', '550e8400-e29b-41d4-a716-446655440033', 0, 1237.50, 'Sales tax collected');

-- Drop the temporary function
DROP FUNCTION IF EXISTS random_date_last_90_days();

-- Update account balances based on transactions
UPDATE accounts SET balance = (
    SELECT COALESCE(SUM(debit_amount - credit_amount), 0)
    FROM journal_entry_lines
    WHERE account_id = accounts.id
) + COALESCE(balance, 0);

-- Create summary statistics
-- This will help with analytics queries
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    -- Revenue metrics
    (SELECT COUNT(*) FROM invoices WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000') as total_invoices,
    (SELECT COUNT(*) FROM invoices WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND status = 'paid') as paid_invoices,
    (SELECT COUNT(*) FROM invoices WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND status IN ('sent', 'overdue')) as outstanding_invoices,
    (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND status = 'paid') as total_revenue,
    (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND status IN ('sent', 'overdue')) as outstanding_revenue,
    -- Expense metrics
    (SELECT COUNT(*) FROM bills WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000') as total_bills,
    (SELECT COUNT(*) FROM bills WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND status = 'paid') as paid_bills,
    (SELECT COALESCE(SUM(total), 0) FROM bills WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND status = 'paid') as total_expenses,
    -- Customer metrics
    (SELECT COUNT(*) FROM contacts WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND type = 'customer') as total_customers,
    (SELECT COUNT(DISTINCT contact_id) FROM invoices WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND issue_date >= CURRENT_DATE - 30) as active_customers_30d,
    -- Average values
    (SELECT AVG(total) FROM invoices WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND status = 'paid') as avg_invoice_value,
    (SELECT AVG(total) FROM bills WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000' AND status = 'paid') as avg_bill_value;
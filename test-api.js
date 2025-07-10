#!/usr/bin/env node
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';
let authToken = '';
let testUserId = '';
let testOrgId = '';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make API calls
async function apiCall(method, endpoint, body = null, includeAuth = true) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(includeAuth && authToken ? { 'Cookie': `token=${authToken}` } : {})
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Test wrapper
async function test(name, fn) {
  console.log(`\n🧪 Testing: ${name}`);
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASSED' });
    console.log(`✅ ${name} - PASSED`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
    console.log(`❌ ${name} - FAILED: ${error.message}`);
  }
}

// Auth Tests
async function testAuth() {
  console.log('\n=== AUTHENTICATION TESTS ===');
  
  // Register
  await test('Register new user', async () => {
    const result = await apiCall('POST', '/auth/register', {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      organizationName: 'Test Org'
    }, false);
    
    if (result.status !== 201) throw new Error(`Expected 201, got ${result.status}`);
  });

  // Login
  await test('Login', async () => {
    const result = await apiCall('POST', '/auth/login', {
      email: 'admin@demo.com',
      password: 'demo123'
    }, false);
    
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
    
    // Extract token from Set-Cookie header
    const cookies = result.headers.get('set-cookie');
    if (cookies) {
      const tokenMatch = cookies.match(/token=([^;]+)/);
      if (tokenMatch) {
        authToken = tokenMatch[1];
      }
    }
    
    testUserId = result.data.user?.id;
    testOrgId = result.data.user?.organizationId;
  });

  // Get current user
  await test('Get current user', async () => {
    const result = await apiCall('GET', '/auth/me');
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
    if (!result.data.user) throw new Error('No user data returned');
  });
}

// Contact Tests
async function testContacts() {
  console.log('\n=== CONTACT TESTS ===');
  let contactId;

  // Create
  await test('Create contact', async () => {
    const result = await apiCall('POST', '/contacts', {
      name: 'Test Customer',
      email: 'customer@test.com',
      phone: '123-456-7890',
      type: 'customer',
      address: '123 Test St'
    });
    
    if (result.status !== 201) throw new Error(`Expected 201, got ${result.status}`);
    contactId = result.data.id;
  });

  // List
  await test('List contacts', async () => {
    const result = await apiCall('GET', '/contacts');
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
    if (!Array.isArray(result.data)) throw new Error('Expected array of contacts');
  });

  // Get by ID
  await test('Get contact by ID', async () => {
    const result = await apiCall('GET', `/contacts/${contactId}`);
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Update
  await test('Update contact', async () => {
    const result = await apiCall('PUT', `/contacts/${contactId}`, {
      name: 'Updated Customer',
      email: 'updated@test.com'
    });
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Delete
  await test('Delete contact', async () => {
    const result = await apiCall('DELETE', `/contacts/${contactId}`);
    if (result.status !== 204) throw new Error(`Expected 204, got ${result.status}`);
  });
}

// Invoice Tests
async function testInvoices() {
  console.log('\n=== INVOICE TESTS ===');
  let invoiceId;
  let customerId;

  // First create a customer
  const customerResult = await apiCall('POST', '/contacts', {
    name: 'Invoice Test Customer',
    email: 'invoice@test.com',
    type: 'customer'
  });
  customerId = customerResult.data.id;

  // Create Invoice
  await test('Create invoice', async () => {
    const result = await apiCall('POST', '/invoices', {
      contact_id: customerId,
      invoice_number: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      status: 'draft',
      subtotal: 1000,
      tax_amount: 100,
      total: 1100,
      line_items: [
        {
          description: 'Test Service',
          quantity: 1,
          unit_price: 1000,
          total: 1000
        }
      ]
    });
    
    if (result.status !== 201) throw new Error(`Expected 201, got ${result.status}`);
    invoiceId = result.data.id;
  });

  // List
  await test('List invoices', async () => {
    const result = await apiCall('GET', '/invoices');
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Get by ID
  await test('Get invoice by ID', async () => {
    const result = await apiCall('GET', `/invoices/${invoiceId}`);
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Update
  await test('Update invoice', async () => {
    const result = await apiCall('PUT', `/invoices/${invoiceId}`, {
      status: 'sent'
    });
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Delete
  await test('Delete invoice', async () => {
    const result = await apiCall('DELETE', `/invoices/${invoiceId}`);
    if (result.status !== 204) throw new Error(`Expected 204, got ${result.status}`);
  });

  // Cleanup
  await apiCall('DELETE', `/contacts/${customerId}`);
}

// Bill Tests
async function testBills() {
  console.log('\n=== BILL TESTS ===');
  let billId;
  let vendorId;

  // First create a vendor
  const vendorResult = await apiCall('POST', '/contacts', {
    name: 'Bill Test Vendor',
    email: 'vendor@test.com',
    type: 'vendor'
  });
  vendorId = vendorResult.data.id;

  // Create Bill
  await test('Create bill', async () => {
    const result = await apiCall('POST', '/bills', {
      contact_id: vendorId,
      bill_number: `BILL-${Date.now()}`,
      date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      status: 'unpaid',
      subtotal: 500,
      tax_amount: 50,
      total: 550,
      line_items: [
        {
          description: 'Test Purchase',
          quantity: 1,
          unit_price: 500,
          total: 500
        }
      ]
    });
    
    if (result.status !== 201) throw new Error(`Expected 201, got ${result.status}`);
    billId = result.data.id;
  });

  // List
  await test('List bills', async () => {
    const result = await apiCall('GET', '/bills');
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Get by ID
  await test('Get bill by ID', async () => {
    const result = await apiCall('GET', `/bills/${billId}`);
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Update
  await test('Update bill', async () => {
    const result = await apiCall('PUT', `/bills/${billId}`, {
      status: 'paid'
    });
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Delete
  await test('Delete bill', async () => {
    const result = await apiCall('DELETE', `/bills/${billId}`);
    if (result.status !== 204) throw new Error(`Expected 204, got ${result.status}`);
  });

  // Cleanup
  await apiCall('DELETE', `/contacts/${vendorId}`);
}

// Bank Account Tests
async function testBankAccounts() {
  console.log('\n=== BANK ACCOUNT TESTS ===');
  let accountId;

  // Create
  await test('Create bank account', async () => {
    const result = await apiCall('POST', '/bank-accounts', {
      name: 'Test Bank Account',
      account_number: '1234567890',
      account_type: 'checking',
      balance: 10000,
      currency: 'USD'
    });
    
    if (result.status !== 201) throw new Error(`Expected 201, got ${result.status}`);
    accountId = result.data.id;
  });

  // List
  await test('List bank accounts', async () => {
    const result = await apiCall('GET', '/bank-accounts');
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Get by ID
  await test('Get bank account by ID', async () => {
    const result = await apiCall('GET', `/bank-accounts/${accountId}`);
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Update
  await test('Update bank account', async () => {
    const result = await apiCall('PUT', `/bank-accounts/${accountId}`, {
      name: 'Updated Bank Account'
    });
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  // Create transaction
  let transactionId;
  await test('Create bank transaction', async () => {
    const result = await apiCall('POST', '/bank-transactions', {
      bank_account_id: accountId,
      date: new Date().toISOString(),
      description: 'Test Transaction',
      amount: -100,
      type: 'withdrawal'
    });
    
    if (result.status !== 201) throw new Error(`Expected 201, got ${result.status}`);
    transactionId = result.data.id;
  });

  // Delete transaction
  await test('Delete bank transaction', async () => {
    const result = await apiCall('DELETE', `/bank-transactions/${transactionId}`);
    if (result.status !== 204) throw new Error(`Expected 204, got ${result.status}`);
  });

  // Delete account
  await test('Delete bank account', async () => {
    const result = await apiCall('DELETE', `/bank-accounts/${accountId}`);
    if (result.status !== 204) throw new Error(`Expected 204, got ${result.status}`);
  });
}

// Report Tests
async function testReports() {
  console.log('\n=== REPORT TESTS ===');

  await test('Get profit & loss report', async () => {
    const result = await apiCall('GET', '/reports/profit-loss?start_date=2025-01-01&end_date=2025-12-31');
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  await test('Get balance sheet report', async () => {
    const result = await apiCall('GET', '/reports/balance-sheet?date=2025-07-10');
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });

  await test('Get cash flow report', async () => {
    const result = await apiCall('GET', '/reports/cash-flow?start_date=2025-01-01&end_date=2025-12-31');
    if (result.status !== 200) throw new Error(`Expected 200, got ${result.status}`);
  });
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('Make sure both servers are running:');
  console.log('- Frontend: http://localhost:5175');
  console.log('- Backend: http://localhost:3000');
  
  try {
    await testAuth();
    await testContacts();
    await testInvoices();
    await testBills();
    await testBankAccounts();
    await testReports();
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\nFailed Tests:');
    results.tests.filter(t => t.status === 'FAILED').forEach(t => {
      console.log(`- ${t.name}: ${t.error}`);
    });
  }
}

// Run the tests
runTests();
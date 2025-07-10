#!/usr/bin/env node

/**
 * API Endpoint Testing Script
 * Tests all CRUD operations for each module
 */

const BASE_URL = 'http://localhost:3002/api';
let authToken = '';

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  environment: 'development',
  baseUrl: BASE_URL,
  modules: []
};

// Store cookies
let cookies = '';

// Helper function for API requests
async function apiRequest(method, endpoint, data = null, includeAuth = true) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include'
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  if (includeAuth && cookies) {
    options.headers['Cookie'] = cookies;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    // Extract and store cookies
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      cookies = setCookieHeader;
    }
    
    const contentType = response.headers.get('content-type');
    const responseData = contentType && contentType.includes('application/json') 
      ? await response.json() 
      : await response.text();

    return {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      success: response.ok,
      headers: response.headers
    };
  } catch (error) {
    return {
      status: 0,
      statusText: error.message,
      data: null,
      success: false,
      error: error.message
    };
  }
}

// Test Authentication Module
async function testAuthModule() {
  console.log('\n🔐 Testing Authentication Module...');
  const module = {
    name: 'Authentication',
    endpoints: []
  };

  // Test Registration
  const registerTest = {
    endpoint: '/auth/register',
    method: 'POST',
    description: 'User Registration',
    tests: []
  };

  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User',
    organizationName: 'Test Organization'
  };

  const registerResult = await apiRequest('POST', '/auth/register', testUser, false);
  registerTest.tests.push({
    name: 'Valid registration',
    expected: 200,
    actual: registerResult.status,
    passed: registerResult.status === 200,
    response: registerResult.data
  });

  // Test duplicate registration
  const duplicateResult = await apiRequest('POST', '/auth/register', testUser, false);
  registerTest.tests.push({
    name: 'Duplicate email rejection',
    expected: 400,
    actual: duplicateResult.status,
    passed: duplicateResult.status === 400
  });

  module.endpoints.push(registerTest);

  // Test Login
  const loginTest = {
    endpoint: '/auth/login',
    method: 'POST',
    description: 'User Login',
    tests: []
  };

  const loginResult = await apiRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  }, false);

  loginTest.tests.push({
    name: 'Valid login',
    expected: 200,
    actual: loginResult.status,
    passed: loginResult.status === 200
  });

  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
  }

  // Test invalid login
  const invalidLoginResult = await apiRequest('POST', '/auth/login', {
    email: testUser.email,
    password: 'WrongPassword'
  }, false);

  loginTest.tests.push({
    name: 'Invalid credentials rejection',
    expected: 401,
    actual: invalidLoginResult.status,
    passed: invalidLoginResult.status === 401
  });

  module.endpoints.push(loginTest);

  // Test Get Current User
  const meTest = {
    endpoint: '/auth/me',
    method: 'GET',
    description: 'Get Current User',
    tests: []
  };

  const meResult = await apiRequest('GET', '/auth/me');
  meTest.tests.push({
    name: 'Get authenticated user',
    expected: 200,
    actual: meResult.status,
    passed: meResult.status === 200
  });

  module.endpoints.push(meTest);

  // Test Logout
  const logoutTest = {
    endpoint: '/auth/logout',
    method: 'POST',
    description: 'User Logout',
    tests: []
  };

  const logoutResult = await apiRequest('POST', '/auth/logout');
  logoutTest.tests.push({
    name: 'Successful logout',
    expected: 200,
    actual: logoutResult.status,
    passed: logoutResult.status === 200
  });

  module.endpoints.push(logoutTest);

  testResults.modules.push(module);
  return module;
}

// Test Contacts Module
async function testContactsModule() {
  console.log('\n👥 Testing Contacts Module...');
  const module = {
    name: 'Contacts',
    endpoints: []
  };

  // Re-login for auth token
  const loginResult = await apiRequest('POST', '/auth/login', {
    email: 'admin@demo.com',
    password: 'demo123'
  }, false);
  
  if (!loginResult.success) {
    console.log('⚠️  Could not login with demo credentials, using test user instead');
    await apiRequest('POST', '/auth/login', {
      email: `test_${Date.now()}@example.com`,
      password: 'TestPass123!'
    }, false);
  }

  // Test Create Contact
  const createTest = {
    endpoint: '/contacts',
    method: 'POST',
    description: 'Create Contact',
    tests: []
  };

  const newContact = {
    name: 'Test Customer',
    email: 'customer@test.com',
    phone: '+1234567890',
    type: 'customer',
    taxNumber: 'TAX123456',
    address: {
      line1: '123 Test St',
      city: 'Test City',
      state: 'TC',
      postalCode: '12345',
      country: 'US'
    }
  };

  const createResult = await apiRequest('POST', '/contacts', newContact);
  createTest.tests.push({
    name: 'Create new contact',
    expected: 201,
    actual: createResult.status,
    passed: createResult.status === 201
  });

  const contactId = createResult.data?.id;
  module.endpoints.push(createTest);

  // Test Get All Contacts
  const getAllTest = {
    endpoint: '/contacts',
    method: 'GET',
    description: 'Get All Contacts',
    tests: []
  };

  const getAllResult = await apiRequest('GET', '/contacts');
  getAllTest.tests.push({
    name: 'Retrieve all contacts',
    expected: 200,
    actual: getAllResult.status,
    passed: getAllResult.status === 200 && Array.isArray(getAllResult.data)
  });

  module.endpoints.push(getAllTest);

  // Test Get Single Contact
  if (contactId) {
    const getOneTest = {
      endpoint: `/contacts/${contactId}`,
      method: 'GET',
      description: 'Get Single Contact',
      tests: []
    };

    const getOneResult = await apiRequest('GET', `/contacts/${contactId}`);
    getOneTest.tests.push({
      name: 'Retrieve specific contact',
      expected: 200,
      actual: getOneResult.status,
      passed: getOneResult.status === 200
    });

    module.endpoints.push(getOneTest);

    // Test Update Contact
    const updateTest = {
      endpoint: `/contacts/${contactId}`,
      method: 'PUT',
      description: 'Update Contact',
      tests: []
    };

    const updateData = {
      ...newContact,
      name: 'Updated Customer Name'
    };

    const updateResult = await apiRequest('PUT', `/contacts/${contactId}`, updateData);
    updateTest.tests.push({
      name: 'Update contact details',
      expected: 200,
      actual: updateResult.status,
      passed: updateResult.status === 200
    });

    module.endpoints.push(updateTest);

    // Test Delete Contact
    const deleteTest = {
      endpoint: `/contacts/${contactId}`,
      method: 'DELETE',
      description: 'Delete Contact',
      tests: []
    };

    const deleteResult = await apiRequest('DELETE', `/contacts/${contactId}`);
    deleteTest.tests.push({
      name: 'Delete contact',
      expected: 200,
      actual: deleteResult.status,
      passed: deleteResult.status === 200 || deleteResult.status === 204
    });

    module.endpoints.push(deleteTest);
  }

  testResults.modules.push(module);
  return module;
}

// Test Invoices Module
async function testInvoicesModule() {
  console.log('\n📄 Testing Invoices Module...');
  const module = {
    name: 'Invoices',
    endpoints: []
  };

  // Test Create Invoice
  const createTest = {
    endpoint: '/invoices',
    method: 'POST',
    description: 'Create Invoice',
    tests: []
  };

  const newInvoice = {
    contactId: 1, // Assuming test contact exists
    invoiceNumber: `INV-${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      {
        description: 'Consulting Service',
        quantity: 10,
        unitPrice: 100,
        taxRate: 10
      }
    ],
    notes: 'Test invoice'
  };

  const createResult = await apiRequest('POST', '/invoices', newInvoice);
  createTest.tests.push({
    name: 'Create new invoice',
    expected: 201,
    actual: createResult.status,
    passed: createResult.status === 201
  });

  module.endpoints.push(createTest);

  // Test Get All Invoices
  const getAllTest = {
    endpoint: '/invoices',
    method: 'GET',
    description: 'Get All Invoices',
    tests: []
  };

  const getAllResult = await apiRequest('GET', '/invoices');
  getAllTest.tests.push({
    name: 'Retrieve all invoices',
    expected: 200,
    actual: getAllResult.status,
    passed: getAllResult.status === 200
  });

  module.endpoints.push(getAllTest);

  testResults.modules.push(module);
  return module;
}

// Generate Summary Report
function generateSummaryReport() {
  console.log('\n📊 Test Summary Report\n');
  console.log('='.repeat(60));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  testResults.modules.forEach(module => {
    console.log(`\n${module.name} Module:`);
    console.log('-'.repeat(40));
    
    module.endpoints.forEach(endpoint => {
      const passed = endpoint.tests.filter(t => t.passed).length;
      const total = endpoint.tests.length;
      totalTests += total;
      passedTests += passed;
      failedTests += (total - passed);
      
      const status = passed === total ? '✅' : '❌';
      console.log(`${status} ${endpoint.method} ${endpoint.endpoint}: ${passed}/${total} tests passed`);
      
      endpoint.tests.forEach(test => {
        if (!test.passed) {
          console.log(`   ❌ ${test.name}: Expected ${test.expected}, got ${test.actual}`);
        }
      });
    });
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`Failed: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`);
  console.log('='.repeat(60));

  return testResults;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Endpoint Tests...');
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  
  try {
    await testAuthModule();
    await testContactsModule();
    await testInvoicesModule();
    
    const report = generateSummaryReport();
    
    // Save detailed results
    const fs = require('fs').promises;
    await fs.writeFile(
      'tests/api-test-results.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n✅ Test results saved to tests/api-test-results.json');
    
  } catch (error) {
    console.error('\n❌ Test runner error:', error);
  }
}

// Check if running directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, apiRequest };
#!/usr/bin/env node

/**
 * Puppeteer UI Testing Script
 * Captures evidence during automated interaction tests
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3002';
const EVIDENCE_DIR = 'tests/evidence';
const LOGS_DIR = 'tests/logs';

// Test scenarios
const testScenarios = [];

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(EVIDENCE_DIR, { recursive: true });
  await fs.mkdir(LOGS_DIR, { recursive: true });
}

// Helper to take screenshot with timestamp
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `${timestamp}_${name}.png`;
  const filepath = path.join(EVIDENCE_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

// Helper to save console logs
async function saveConsoleLogs(logs, name) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `${timestamp}_${name}.log`;
  const filepath = path.join(LOGS_DIR, filename);
  await fs.writeFile(filepath, logs.join('\n'));
  return filepath;
}

// Test Login Flow
async function testLoginFlow(browser) {
  console.log('\n🔐 Testing Login Flow...');
  const scenario = {
    name: 'User Login',
    scenarios: []
  };

  const page = await browser.newPage();
  const consoleLogs = [];

  // Capture console logs
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    // Navigate to login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, 'login-page-initial');

    // Test empty form submission
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    const emptyFormScreenshot = await takeScreenshot(page, 'login-empty-validation');
    scenario.scenarios.push({
      name: 'Empty form validation',
      status: 'tested',
      screenshot: emptyFormScreenshot,
      logs: await saveConsoleLogs(consoleLogs, 'login-empty-validation')
    });

    // Test invalid credentials
    await page.type('input[name="email"]', 'invalid@test.com');
    await page.type('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const invalidCredsScreenshot = await takeScreenshot(page, 'login-invalid-credentials');
    scenario.scenarios.push({
      name: 'Invalid credentials',
      status: 'tested',
      screenshot: invalidCredsScreenshot,
      logs: await saveConsoleLogs(consoleLogs, 'login-invalid-credentials')
    });

    // Test valid login
    await page.evaluate(() => {
      document.querySelector('input[name="email"]').value = '';
      document.querySelector('input[name="password"]').value = '';
    });
    
    await page.type('input[name="email"]', 'admin@demo.com');
    await page.type('input[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
      const successScreenshot = await takeScreenshot(page, 'login-success-dashboard');
      scenario.scenarios.push({
        name: 'Successful login',
        status: 'success',
        screenshot: successScreenshot,
        logs: await saveConsoleLogs(consoleLogs, 'login-success')
      });
    } catch (error) {
      const errorScreenshot = await takeScreenshot(page, 'login-error');
      scenario.scenarios.push({
        name: 'Login attempt failed',
        status: 'error',
        screenshot: errorScreenshot,
        logs: await saveConsoleLogs(consoleLogs, 'login-error'),
        error: error.message
      });
    }

  } catch (error) {
    scenario.error = error.message;
    await takeScreenshot(page, 'login-test-error');
  } finally {
    await page.close();
  }

  testScenarios.push(scenario);
  return scenario;
}

// Test Invoice Creation Flow
async function testInvoiceCreation(browser) {
  console.log('\n📄 Testing Invoice Creation...');
  const scenario = {
    name: 'Invoice Creation',
    scenarios: []
  };

  const page = await browser.newPage();
  const consoleLogs = [];

  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    // Login first
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.type('input[name="email"]', 'admin@demo.com');
    await page.type('input[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Navigate to invoices
    await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, 'invoices-list');

    // Click new invoice button
    const newInvoiceBtn = await page.$('button:has-text("New Invoice"), a:has-text("New Invoice")');
    if (newInvoiceBtn) {
      await newInvoiceBtn.click();
      await page.waitForTimeout(2000);
      
      const formScreenshot = await takeScreenshot(page, 'invoice-form-empty');
      scenario.scenarios.push({
        name: 'Invoice form loaded',
        status: 'success',
        screenshot: formScreenshot
      });

      // Try to submit empty form
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
        
        const validationScreenshot = await takeScreenshot(page, 'invoice-validation-errors');
        scenario.scenarios.push({
          name: 'Form validation check',
          status: 'tested',
          screenshot: validationScreenshot,
          logs: await saveConsoleLogs(consoleLogs, 'invoice-validation')
        });
      }
    } else {
      scenario.scenarios.push({
        name: 'New invoice button not found',
        status: 'error',
        screenshot: await takeScreenshot(page, 'invoice-button-missing')
      });
    }

  } catch (error) {
    scenario.error = error.message;
    await takeScreenshot(page, 'invoice-test-error');
  } finally {
    await page.close();
  }

  testScenarios.push(scenario);
  return scenario;
}

// Test Responsive Design
async function testResponsiveDesign(browser) {
  console.log('\n📱 Testing Responsive Design...');
  const scenario = {
    name: 'Responsive Design',
    scenarios: []
  };

  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: viewport.width, height: viewport.height });

    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
      const screenshot = await takeScreenshot(page, `responsive-${viewport.name}`);
      
      scenario.scenarios.push({
        name: `${viewport.name} view (${viewport.width}x${viewport.height})`,
        status: 'success',
        screenshot: screenshot
      });
    } catch (error) {
      scenario.scenarios.push({
        name: `${viewport.name} view`,
        status: 'error',
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  testScenarios.push(scenario);
  return scenario;
}

// Generate test report
async function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    scenarios: testScenarios,
    summary: {
      total: 0,
      success: 0,
      error: 0,
      tested: 0
    }
  };

  // Calculate summary
  testScenarios.forEach(scenario => {
    scenario.scenarios.forEach(test => {
      report.summary.total++;
      if (test.status === 'success') report.summary.success++;
      else if (test.status === 'error') report.summary.error++;
      else if (test.status === 'tested') report.summary.tested++;
    });
  });

  // Save report
  await fs.writeFile(
    'tests/puppeteer-report.json',
    JSON.stringify(report, null, 2)
  );

  // Print summary
  console.log('\n📊 Puppeteer Test Summary');
  console.log('=' .repeat(60));
  console.log(`Total scenarios: ${report.summary.total}`);
  console.log(`✅ Success: ${report.summary.success}`);
  console.log(`🧪 Tested: ${report.summary.tested}`);
  console.log(`❌ Errors: ${report.summary.error}`);
  console.log('=' .repeat(60));
  console.log('\n📁 Evidence saved to:', EVIDENCE_DIR);
  console.log('📝 Logs saved to:', LOGS_DIR);
  console.log('📄 Report saved to: tests/puppeteer-report.json');

  return report;
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Puppeteer UI Tests...');
  console.log(`Testing: ${BASE_URL}`);
  console.log(`Time: ${new Date().toLocaleString()}`);

  await ensureDirectories();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    await testLoginFlow(browser);
    await testInvoiceCreation(browser);
    await testResponsiveDesign(browser);
    
    await generateReport();
  } catch (error) {
    console.error('❌ Test runner error:', error);
  } finally {
    await browser.close();
  }
}

// Check if running directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
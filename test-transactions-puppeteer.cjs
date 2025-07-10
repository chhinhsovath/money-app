const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function testTransactions() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const evidenceDir = './evidence/transactions';
  
  // Create evidence directory
  try {
    await fs.mkdir(evidenceDir, { recursive: true });
  } catch (error) {
    console.log('Evidence directory already exists');
  }

  const results = {
    scenario: "Transactions Page Testing",
    status: "success",
    evidence: [],
    logs: []
  };

  try {
    console.log('Starting Transactions page testing...');

    // Enable console logging
    page.on('console', msg => {
      results.logs.push(`${new Date().toISOString()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
      results.logs.push(`Page Error: ${error.message}`);
      results.status = "error";
    });

    // Navigate to application
    console.log('Navigating to application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Take screenshot of login page
    await page.screenshot({ path: `${evidenceDir}/01-login-page.png`, fullPage: true });
    results.evidence.push('01-login-page.png');

    // Login
    console.log('Logging in...');
    await page.type('input[type="email"]', 'admin@demo.com');
    await page.type('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });
    await page.screenshot({ path: `${evidenceDir}/02-dashboard.png`, fullPage: true });
    results.evidence.push('02-dashboard.png');

    // Navigate to transactions
    console.log('Navigating to transactions...');
    await page.click('a[href="/transactions"]');
    await page.waitForSelector('h1:has-text("Transactions")', { timeout: 10000 });
    
    // Take screenshot of transactions list
    await page.screenshot({ path: `${evidenceDir}/03-transactions-list.png`, fullPage: true });
    results.evidence.push('03-transactions-list.png');

    // Test search functionality
    console.log('Testing search functionality...');
    await page.fill('input[placeholder*="Search transactions"]', 'Payment');
    await page.waitForTimeout(1000); // Wait for filtering
    await page.screenshot({ path: `${evidenceDir}/04-transactions-search.png`, fullPage: true });
    results.evidence.push('04-transactions-search.png');

    // Clear search
    await page.fill('input[placeholder*="Search transactions"]', '');
    await page.waitForTimeout(1000);

    // Test filters
    console.log('Testing filters...');
    await page.click('button:has-text("All Status")');
    await page.click('text=Reconciled');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${evidenceDir}/05-transactions-filter.png`, fullPage: true });
    results.evidence.push('05-transactions-filter.png');

    // Test clicking on a transaction (if any exist)
    const transactionLinks = await page.$$('a[href*="/transactions/"]');
    if (transactionLinks.length > 0) {
      console.log('Testing transaction view...');
      await transactionLinks[0].click();
      await page.waitForSelector('h1:has-text("Transaction Details")', { timeout: 5000 });
      await page.screenshot({ path: `${evidenceDir}/06-transaction-view.png`, fullPage: true });
      results.evidence.push('06-transaction-view.png');
      
      // Go back to list
      await page.click('button:has-text("Back to Transactions")');
      await page.waitForSelector('h1:has-text("Transactions")', { timeout: 5000 });
    }

    // Test new transaction button
    console.log('Testing new transaction navigation...');
    await page.click('a:has-text("New Transaction")');
    await page.waitForSelector('h1:has-text("New Bank Transaction")', { timeout: 5000 });
    await page.screenshot({ path: `${evidenceDir}/07-new-transaction-form.png`, fullPage: true });
    results.evidence.push('07-new-transaction-form.png');

    // Test form validation
    console.log('Testing form validation...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000); // Wait for validation errors
    await page.screenshot({ path: `${evidenceDir}/08-form-validation.png`, fullPage: true });
    results.evidence.push('08-form-validation.png');

    // Go back to transactions
    await page.click('button:has-text("Cancel")');
    await page.waitForSelector('h1:has-text("Transactions")', { timeout: 5000 });

    console.log('✅ All tests completed successfully');
    results.status = "success";

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    results.status = "error";
    results.logs.push(`Test Error: ${error.message}`);
    
    // Take error screenshot
    await page.screenshot({ path: `${evidenceDir}/error-screenshot.png`, fullPage: true });
    results.evidence.push('error-screenshot.png');
  }

  // Save logs
  await fs.writeFile(`${evidenceDir}/test-logs.json`, JSON.stringify(results, null, 2));
  
  await browser.close();
  return results;
}

// Run the test
testTransactions().then(results => {
  console.log('\n=== TRANSACTION TESTING RESULTS ===');
  console.log(`Status: ${results.status}`);
  console.log(`Evidence files: ${results.evidence.length}`);
  console.log(`Log entries: ${results.logs.length}`);
  console.log('\nEvidence saved to: ./evidence/transactions/');
  
  if (results.status === "error") {
    process.exit(1);
  }
}).catch(error => {
  console.error('Failed to run tests:', error);
  process.exit(1);
});
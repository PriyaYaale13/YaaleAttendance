const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:5174');
    
    // Fill login
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@atm.com'); // assuming admin@atm.com
    await page.type('input[type="password"]', 'admin123'); // assuming admin123
    await page.click('button[type="submit"]');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (err) {
    console.log("Navigation error:", err);
  }
  
  await browser.close();
})();

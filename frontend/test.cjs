const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000); // wait for render
  
  const content = await page.content();
  if (content.includes('firo-top-navbar')) {
    console.log('SUCCESS: App rendered');
  } else {
    console.log('FAIL: App did not render');
  }
  
  await browser.close();
})();

import puppeteer from 'puppeteer';
import assert from 'assert';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. Navigate to the /swipe page
    await page.goto('http://localhost:3000/swipe', { waitUntil: 'networkidle0' });

    // 2. Assert redirection to the /login page
    assert.strictEqual(page.url(), 'http://localhost:3000/login', 'Should be redirected to the login page');
    console.log('Successfully redirected to /login');

    // 3. Fill and submit the login form
    await page.type('input[name="email"]', 'nicovalerian2@gmail.com');
    await page.type('input[name="password"]', 'nico123');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]'),
    ]);
    console.log('Logged in successfully');

    // 4. Navigate back to the /swipe page
    await page.goto('http://localhost:3000/swipe', { waitUntil: 'networkidle0' });

    // 5. Assert that the page content does not contain the authentication error
    const pageContent = await page.content();
    const isErrorPresent = pageContent.includes('User not authenticated');
    assert.strictEqual(isErrorPresent, false, 'Should not see "User not authenticated" error after login');
    console.log('Successfully loaded /swipe page content after login.');

    console.log('Authentication verification test passed!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();
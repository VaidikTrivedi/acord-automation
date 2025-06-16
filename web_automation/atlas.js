import {chromium} from 'playwright';

export async function runAtlasAutomation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the Atlas website
    await page.goto('https://www.atlas.com');

    // Perform actions on the Atlas website
    // Example: Click a button, fill a form, etc.
    // await page.click('#some-button');
    // await page.fill('#some-input', 'example text');

    // Wait for some time to observe the actions
    await page.waitForTimeout(5000);
  } catch (error) {
    console.error('Error during automation:', error);
  } finally {
    await browser.close();
  }
}
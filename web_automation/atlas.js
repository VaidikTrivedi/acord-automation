import { chromium } from 'playwright';
import { BaseClass } from './baseClass.js';

export class Atlas extends BaseClass {
  constructor(url, username, password) {
    super(url, username, password)
  }

  async login(page) {
    await page.goto(this.url);

    await page.waitForLoadState('networkidle');

    const selectors = {
      usernameField: 'input[type="text"]:first-of-type',
      passwordField: 'input[type="password"]',
      loginButton: 'button:has-text("Login")',
    };

    await page.fill(selectors.usernameField, this.username);
    await page.fill(selectors.passwordField, this.password);
    await page.click(selectors.loginButton);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    return page;
  }

  async newSubmissionForm(page) {
    // Click on "New Submission" button
    await page.click('button:has-text("New Submission")');

    await page.waitForTimeout(3000);

    console.log('Form appeared, starting to fill it out...');

    // Use more flexible selectors
    const dialog = page.locator('[class="modal-dialog "]');

    // Fill form fields within the dialog
    // await dialog.locator('input[type="checkbox"]').first().check();
    await dialog.locator('input[type="text"]').first().fill('Sample Company Inc.');

    // Handle date fields
    const dateFields = dialog.locator('input[type="text"]');
    await dateFields.nth(1).fill('01/01/2025'); // Effective Date
    await dateFields.nth(2).fill('01/01/2026'); // Expiration Date
    // await dateFields.nth(3).fill('12/31/2024'); // Needed By Date

    // Check product checkboxes
    const checkBoxes = dialog.locator('[name="productShortNames"]');
    await checkBoxes.nth(2).click();

    console.log('Form filling completed!');

    // Keep browser open for manual verification
    await page.waitForTimeout(5000);

    return page;
  }


  async runAutomation() {
    const browser = await chromium.launch({ headless: false });
    let page = await browser.newPage();
    try {
      page = await this.login(page);
      page = await this.newSubmissionForm(page);
    } catch (error) {
      await page.screenshot({ path: 'error.png', fullPage: true });
      console.log('Screenshot saved as form_filled.png');
      console.error(error);
    } finally {
      await browser?.close();
    }
  }
}
import { chromium } from 'playwright';
import { BaseClass } from './baseClass.js';
import { convertNumberToDate } from "./helper.js";

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

  async newSubmissionForm(page, csvData) {
    // Click on "New Submission" button
    await page.click('button:has-text("New Submission")');

    await page.waitForTimeout(3000);

    console.log('Form appeared, starting to fill it out...');

    // Use more flexible selectors
    const dialog = page.locator('[class="modal-dialog "]');

    // Fill form fields within the dialog
    // await dialog.locator('input[type="checkbox"]').first().check();
    await dialog.locator('input[type="text"]').first().fill(csvData["BusinessName"]);

    // Handle date fields
    const dateFields = dialog.locator('input[type="text"]');
    await dateFields.nth(1).fill(convertNumberToDate(csvData["CurrentTermEffectiveDate"])); // Effective Date
    await dateFields.nth(2).fill(convertNumberToDate(csvData["CurrentTermExpirationDate"])); // Expiration Date
    // await dateFields.nth(3).fill('12/31/2024'); // Needed By Date

    // Check product checkboxes
    const checkBoxes = dialog.locator('[name="productShortNames"]');
    await checkBoxes.nth(2).click();

    console.log('Form filling completed!');

    // await dialog.locator('span:has-text("Create Application")').click()

    // Keep browser open for manual verification
    await page.waitForTimeout(5000);

    return page;
  }

  async fillForm(page, csvData) {
    
    // Wait for the form to load
    await page.waitForLoadState('networkidle');
    
    // Fill Insured Mailing Address
    await page.fill('[ref="s3e238"]', '123 Main Street'); // Street 1
    await page.fill('[ref="s3e248"]', 'Suite 100'); // Street 2
    await page.fill('[ref="s3e259"]', '12345'); // Zip Code
    await page.fill('[ref="s3e272"]', 'New York'); // City
    await page.fill('[ref="s3e280"]', 'New York County'); // County
    
    // State dropdown
    await page.click('[ref="s3e293"]'); // State dropdown
    // You'll need to select appropriate state option here
    
    // Phone numbers and email
    await page.fill('[ref="s3e305"]', '555-123-4567'); // Office Phone
    await page.fill('[ref="s3e319"]', '555-987-6543'); // Mobile Phone
    await page.fill('[ref="s3e327"]', 'test@example.com'); // Email
    
    // Insured Information
    await page.fill('[ref="s3e354"]', '10'); // Years in Business
    
    // SIC Code dropdown
    await page.click('[ref="s3e372"]'); // SIC Code dropdown
    
    // NAICS Code dropdown
    await page.click('[ref="s3e390"]'); // NAICS Code dropdown
    
    // Legal Entity dropdown
    await page.click('[ref="s3e413"]'); // Legal Entity dropdown
    
    // FEIN and Bureau ID
    await page.fill('[ref="s3e428"]', '12-3456789'); // FEIN
    await page.fill('[ref="s3e440"]', 'BUR123456'); // Bureau ID
    await page.fill('[ref="s3e454"]', 'https://example.com'); // Website
    
    // Nature of Business description
    await page.fill('[ref="s3e499"]', 'General business operations including consulting and services');
    
    // DBA
    await page.fill('[ref="s3e517"]', 'Example DBA Name');
    
    // Additional Named Insured fields
    await page.fill('[ref="s3e571"]', 'Additional Insured Name'); // Additional Named Insured
    await page.fill('[ref="s3e575"]', '98-7654321'); // Additional FEIN
    
    // Contact Information - Inspection
    await page.fill('[ref="s3e657"]', 'John Doe'); // Name
    await page.fill('[ref="s3e665"]', '555-111-2222'); // Phone
    await page.fill('[ref="s3e673"]', '123'); // Ext
    await page.fill('[ref="s3e681"]', '555-333-4444'); // Mobile
    await page.fill('[ref="s3e689"]', 'john@example.com'); // Email
    
    // Contact Information - Accounting
    await page.fill('[ref="s3e711"]', 'Jane Smith'); // Name
    await page.fill('[ref="s3e719"]', '555-555-6666'); // Phone
    await page.fill('[ref="s3e727"]', '456'); // Ext
    await page.fill('[ref="s3e735"]', '555-777-8888'); // Mobile
    await page.fill('[ref="s3e743"]', 'jane@example.com'); // Email
    
    // Contact Information - Claims
    await page.fill('[ref="s3e765"]', 'Bob Johnson'); // Name
    await page.fill('[ref="s3e773"]', '555-999-0000'); // Phone
    await page.fill('[ref="s3e781"]', '789'); // Ext
    await page.fill('[ref="s3e789"]', '555-111-3333'); // Mobile
    await page.fill('[ref="s3e797"]', 'bob@example.com'); // Email
    
    // Nature of Business checkboxes (select as needed)
    await page.check('[ref="s3e855"]'); // Office
    await page.check('[ref="s3e861"]'); // Service
    
    // Description of Operations
    await page.fill('[ref="s3e891"]', 'Other business operations description');
    
    // Remarks
    await page.fill('[ref="s3e908"]', 'Additional remarks and process instructions');
    
    console.log('Form filled successfully');
    
    return page;
  }
  
  async clickSubmitButton(page) {
    try {
      // Wait for the Submit Application button to be enabled
      await page.waitForFunction(() => {
        const button = document.querySelector('[ref="s3e172"]');
        return button && !button.disabled;
      }, { timeout: 30000 });
      
      // Click the Submit Application button
      await page.click('[ref="s3e172"]');
      console.log('Submit Application button clicked');
      
    } catch (error) {
      console.log('Submit button may still be disabled. Error:', error.message);
      // Alternative: try clicking anyway
      await page.click('[ref="s3e172"]');
    }
  }  


  async runAutomation(csvData) {
    const browser = await chromium.launch({ headless: false });
    let page = await browser.newPage();
    try {
      page = await this.login(page);
      page = await this.newSubmissionForm(page, csvData);
      page = await this.fillForm(page, csvData);
      // await this.clickSubmitButton(page);
    } catch (error) {
      await page.screenshot({ path: 'error.png', fullPage: true });
      console.log('Screenshot saved as form_filled.png');
      console.error(error);
    } finally {
      await browser?.close();
    }
  }
}
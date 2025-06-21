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

        await dialog.locator('span:has-text("Create Application")').click()

        // Keep browser open for manual verification
        await page.waitForTimeout(5000);

        return page;
    }

    async fillGenerationInfo(page, csvData) {

        // Wait for the form to load
        // await page.waitForLoadState('networkidle');

        // Fill Insured Mailing Address
        await page.fill('[class="formFieldComponent-street1"]', csvData["Location1Address"]); // Street 1
        // await page.fill('[ref="s3e248"]', 'Suite 100'); // Street 2
        await page.fill('[class="formFieldComponent-postalCode"]', '12345'); // Zip Code TODO: fetch it from Location1Address
        await page.fill('[class="formFieldComponent-city"]', 'New York'); // City
        // await page.fill('[ref="s3e280"]', 'New York County'); // County

        // State dropdown TODO: Fix this: document.querySelector('[class="buttonLabel ng-binding"]').innerText = "California"
        // const dropdownSelector = '[class="formFieldComponent-street1"]'; 
        // await page.selectOption(dropdownSelector, { label: 'California' });

        // Phone numbers and email
        // await page.fill('[ref="s3e305"]', '555-123-4567'); // Office Phone
        await page.fill('[class="formFieldComponent-mobilePhone"]', csvData["PhoneNumber"]); // Mobile Phone
        await page.fill('[class="formFieldComponent-emailAddress"]', csvData["EmailAddress"]); // Email

        // Insured Information
        await page.fill('[class="formFieldComponent-yearsInBusiness ui-number-without-commas-formatter"]', csvData["YearsInIndustry"]); // Years in Business

        // SIC Code dropdown
        const selector = '[class="select2-chosen ng-binding"]';
        const newText = '738387';

        // Wait for the element to be present and then evaluate the function
        await page.locator(selector).first().evaluate((element, text) => {
            element.innerText = text;
        }, newText);

        await page.waitForTimeout(1000);

        // FEIN and Bureau ID
        await page.fill('[class="formFieldComponent-fein"]', csvData["FEINumber"]); // FEIN

        // Nature of Business description
        await page.fill('[class="formFieldComponent-descriptionOfOperations"]', csvData["Location1BusinessDescription"]);

        return page;
    }

    async fillLocationClassCodeInfo(page, csvData) {
        await page.locator('[class="btn-link navigationLabel 1-1"]').click();
        await page.waitForTimeout(2000);

        // click on Set first location to Insured's mailing address checkbox
        await page.locator('[class="formFieldComponent-sameAsInsuredMailingAddress"]').click();
        await page.waitForTimeout(1000);

        // fill class code dropdown
        await page.locator('[class="select2-choice ui-select-match select2-default"]').click();
        const selector = '[type="search"]';
        const newValue = "5482 - Painting/Wallpaper Install–high wage";

        // Locate the eighth element (index 7) with type="search" and fill it
        await page.locator(selector).nth(7).fill(newValue);
        await page.waitForTimeout(1000);
        await page.locator(selector).nth(7).dispatchEvent('type', { bubbles: true })

        await page.waitForTimeout(1000);
        await page.keyboard.press('Enter');

        // Fill number of employees
        await page.fill('[class="formFieldComponent-numberOfFullTimeEmployees ui-number-without-commas-formatter"]', csvData["Location1Wc1NumberOfFullTimeEmployees"]);
        await page.fill('[class="formFieldComponent-numberOfPartTimeEmployees ui-number-without-commas-formatter"]', csvData["Location1Wc1NumberOfPartTimeEmployees"]);
        await page.fill('[class="formFieldComponent-estimatedAnnualRemuneration ui-currency-formatter ui-display-dollar"]', csvData["Location1Wc1NumberOfSeasonalEmployees"]);

        return page;
    }

    async fillPolicyInfo(page, csvData) {
        await page.locator('[class="btn-link navigationLabel 1-2"]').click();
        await page.waitForTimeout(1000);

        // Employee's liabillity
        const selector = '[class="match"]';
        const newText = '10000/10000/10000';

        // Wait for the element to be present and then evaluate the function
        await page.locator(selector).nth(1).evaluate((element, text) => {
            element.innerText = text;
        }, newText);

        await page.waitForTimeout(1000);
        return page;
    }

    async fillAcordQuesions(page, csvData) {
        await page.locator('[class="btn-link navigationLabel 1-3"]').click();
        await page.waitForTimeout(1000);

        // CLick on checkbox
        await page.locator('[class="formFieldComponent-setAllYesNoToNo"]').click();

        // click on safety program
        await page.locator('[name="56770 yesno_writtenSafetyProgram  yes"]').click();
        await page.waitForTimeout(500);
        await page.fill('[class="formFieldComponent-yesnoWrittenSafetyProgram"]', "All PPR required by OSHA");

        await page.locator('[name="expPremiumLessThan25KWC:Application:ACORD Questions"]').click();

    }

    async clickSubmitButton(page) {
        try {
            // Wait for the Submit Application button to be enabled
            await page.waitForFunction(() => {
                const button = document.querySelector('[class="buttonOverlay ng-scope"]');
                return button && !button.disabled;
            }, { timeout: 30000 });

            // Click the Submit Application button
            await page.click('[class="buttonOverlay ng-scope"]');
            console.log('Submit Application button clicked');

        } catch (error) {
            console.log('Submit button may still be disabled. Error:', error.message);
            throw error;
        }
    }


    async runAutomation(csvData) {
        const browser = await chromium.launch({ headless: false });
        let page = await browser.newPage({
            viewport: { width: 1280, height: 720 }
        });
        try {
            page = await this.login(page);
            page = await this.newSubmissionForm(page, csvData);
            page = await this.fillGenerationInfo(page, csvData);
            page = await this.fillLocationClassCodeInfo(page, csvData);
            page = await this.fillPolicyInfo(page, csvData);
            page = await this.fillAcordQuesions(page, csvData);
            await this.clickSubmitButton(page);

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
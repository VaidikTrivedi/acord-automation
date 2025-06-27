import { chromium } from 'playwright';
import { BaseClass } from './baseClass.js';
import { convertNumberToDate } from "./helper.js";

// TODO: Checkbox accord questions based on data

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

    await dialog.locator('span:has-text("Create Application")').click()

    // Keep browser open for manual verification
    await page.waitForTimeout(5000);
    console.log('New Form filling started...');

    return page;
  }

  async fillGenerationInfo(page, csvData) {
    console.log("Filling General Info...")
    // Fill Insured Mailing Address
    await page.fill('[class="formFieldComponent-street1"]', csvData["Location1Address"]); // Street 1
    // await page.fill('[ref="s3e248"]', 'Suite 100'); // Street 2
    await page.fill('[class="formFieldComponent-postalCode"]', csvData["zipCode"]); // Zip Code TODO: fetch it from Location1Address
    await page.fill('[class="formFieldComponent-city"]', csvData["city"]); // City
    await page.fill('[class="formFieldComponent-mobilePhone"]', csvData["PhoneNumber"]); // Mobile Phone
    await page.fill('[class="formFieldComponent-emailAddress"]', csvData["EmailAddress"]); // Email

    // Insured Information
    await page.fill('[class="formFieldComponent-yearsInBusiness ui-number-without-commas-formatter"]', csvData["YearsInIndustry"]); // Years in Business

    // SIC Code dropdown
    const selector = '[class="select2-chosen ng-binding"]';
    const newText = '738387';

    await page.locator(selector).first().evaluate((element, text) => {
      element.innerText = text;
    }, newText);

    await page.waitForTimeout(1000);

    await page.fill('[class="formFieldComponent-fein"]', csvData["FEINumber"]); // FEIN

    // Nature of Business description
    await page.fill('[class="formFieldComponent-descriptionOfOperations"]', csvData["Location1BusinessDescription"]);

    await page.locator('[class="buttonLabel ng-binding"]').nth(1).click();
    await page.waitForTimeout(1000);
    await page.fill('[class="optionListSearchInput ng-pristine ng-untouched ng-valid ng-empty"]', "LLP");
    await page.waitForTimeout(1000);
    await page.keyboard.press("Enter");

    return page;
  }

  async fillLocationClassCodeInfo(page, csvData) {
    console.log("Filling Location Class Code Info...");
    await page.locator('[class="btn-link navigationLabel 1-1"]').click();
    await page.waitForTimeout(2000);

    // click on Set first location to Insured's mailing address checkbox
    await page.locator('[class="formFieldComponent-sameAsInsuredMailingAddress"]').click();
    await page.waitForTimeout(1000);

    // fill class code dropdown
    await page.locator('[class="select2-choice ui-select-match select2-default"]').click();
    const selector = '[type="search"]';
    // const newValue = "5446";
    const newValue = csvData["Location1Wc1Code"];

    // Locate the eighth element (index 7) with type="search" and fill it
    await page.locator(selector).nth(7).fill(newValue);
    await page.waitForTimeout(2500);
    await page.keyboard.press('Enter');

    // Fill number of employees
    await page.fill('[class="formFieldComponent-numberOfFullTimeEmployees ui-number-without-commas-formatter"]', csvData["Location1Wc1NumberOfFullTimeEmployees"]);
    await page.fill('[class="formFieldComponent-numberOfPartTimeEmployees ui-number-without-commas-formatter"]', csvData["Location1Wc1NumberOfPartTimeEmployees"]);
    await page.fill('[class="formFieldComponent-estimatedAnnualRemuneration ui-currency-formatter ui-display-dollar"]', csvData["Location1Wc1NumberOfSeasonalEmployees"]);

    if (csvData["Location2Wc1Code"] != "") {
      await page.waitForTimeout(1500);
      await page.locator('[class="btn btn-xs addNewButton ng-scope"]').nth(1).click();
      await page.waitForTimeout(1000);
      await page.locator('[class="formFieldComponent-locationNumberClassCode ui-number-without-commas-formatter"]').nth(1).fill("2");
      await page.locator('[class="select2-choice ui-select-match select2-default"]').nth(0).click();
      await page.locator('[type="search"]').nth(9).fill("CA");
      await page.waitForTimeout(2500);
      await page.keyboard.press("Enter");
      await page.locator('[class="select2-choice ui-select-match select2-default""]').nth(0).click();
      await page.locator('[type="search"]').nth(9).fill(csvData["Location2Wc1Code"]);
      await page.waitForTimeout(2500);
      await page.keyboard.press("Enter");
      await page.locator('[class="formFieldComponent-numberOfFullTimeEmployees ui-number-without-commas-formatter"]').nth(1).fill(csvData["Location2Wc1NumberOfFullTimeEmployees"]);
      await page.locator('[class="formFieldComponent-numberOfPartTimeEmployees ui-number-without-commas-formatter"]').nth(1).fill(csvData["Location2Wc1NumberOfPartTimeEmployees"]);
      await page.locator('[class="formFieldComponent-estimatedAnnualRemuneration ui-currency-formatter ui-display-dollar"]').nth(1).fill(csvData["Location2Wc1NumberOfSeasonalEmployees"]);
    }

    if (csvData["Location3Wc1Code"] != "") {
      await page.waitForTimeout(1500);
      await page.locator('[class="btn btn-xs addNewButton ng-scope"]').nth(1).click();
      await page.waitForTimeout(1000);
      await page.locator('[class="formFieldComponent-locationNumberClassCode ui-number-without-commas-formatter"]').nth(2).fill("3");
      await page.locator('[class="select2-choice ui-select-match select2-default"]').nth(0).click();
      await page.locator('[type="search"]').nth(11).fill("CA");
      await page.waitForTimeout(2500);
      await page.keyboard.press("Enter");
      await page.locator('[class="select2-choice ui-select-match select2-default"]').nth(0).click();
      await page.locator('[type="search"]').nth(11).fill(csvData["Location3Wc1Code"]);
      await page.waitForTimeout(2500);
      await page.keyboard.press("Enter");
      await page.locator('[class="formFieldComponent-numberOfFullTimeEmployees ui-number-without-commas-formatter"]').nth(1).fill(csvData["Location3Wc1NumberOfFullTimeEmployees"]);
      await page.locator('[class="formFieldComponent-numberOfPartTimeEmployees ui-number-without-commas-formatter"]').nth(1).fill(csvData["Location3Wc1NumberOfPartTimeEmployees"]);
      await page.locator('[class="formFieldComponent-estimatedAnnualRemuneration ui-currency-formatter ui-display-dollar"]').nth(1).fill(csvData["Location3Wc1NumberOfSeasonalEmployees"]);
    }

    if (csvData["Location4Wc1Code"] != "") {
      await page.waitForTimeout(1500);
      await page.locator('[class="btn btn-xs addNewButton ng-scope"]').nth(1).click();
      await page.waitForTimeout(1000);
      await page.locator('[class="formFieldComponent-locationNumberClassCode ui-number-without-commas-formatter"]').nth(3).fill("4");
      await page.locator('[class="select2-choice ui-select-match select2-default"]').nth(0).click();
      await page.locator('[type="search"]').nth(13).fill("CA");
      await page.waitForTimeout(2500);
      await page.keyboard.press("Enter");
      await page.locator('[class="select2-choice ui-select-match select2-default"]').nth(0).click();
      await page.locator('[type="search"]').nth(13).fill(csvData["Location4Wc1Code"]);
      await page.waitForTimeout(2500);
      await page.keyboard.press("Enter");
      await page.locator('[class="formFieldComponent-numberOfFullTimeEmployees ui-number-without-commas-formatter"]').nth(1).fill(csvData["Location4Wc1NumberOfFullTimeEmployees"]);
      await page.locator('[class="formFieldComponent-numberOfPartTimeEmployees ui-number-without-commas-formatter"]').nth(1).fill(csvData["Location4Wc1NumberOfPartTimeEmployees"]);
      await page.locator('[class="formFieldComponent-estimatedAnnualRemuneration ui-currency-formatter ui-display-dollar"]').nth(1).fill(csvData["Location4Wc1NumberOfSeasonalEmployees"]);
    }

    if (csvData["Location5Wc1Code"] != "") {
      await page.waitForTimeout(1500);
      await page.locator('[class="btn btn-xs addNewButton ng-scope"]').nth(1).click();
      await page.waitForTimeout(1000);
      await page.locator('[class="formFieldComponent-locationNumberClassCode ui-number-without-commas-formatter"]').nth(4).fill("5");
      await page.locator('[class="select2-choice ui-select-match select2-default"]').nth(0).click();
      await page.locator('[type="search"]').nth(15).fill("CA");
      await page.waitForTimeout(2500);
      await page.keyboard.press("Enter");
      await page.locator('[class="select2-choice ui-select-match select2-default"]').nth(0).click();
      await page.locator('[type="search"]').nth(15).fill(csvData["Location5Wc1Code"]);
      await page.waitForTimeout(2500);
      await page.keyboard.press("Enter");
      await page.locator('[class="formFieldComponent-numberOfFullTimeEmployees ui-number-without-commas-formatter"]').nth(1).fill(csvData["Location5Wc1NumberOfFullTimeEmployees"]);
      await page.locator('[class="formFieldComponent-numberOfPartTimeEmployees ui-number-without-commas-formatter"]').nth(1).fill(csvData["Location5Wc1NumberOfPartTimeEmployees"]);
      await page.locator('[class="formFieldComponent-estimatedAnnualRemuneration ui-currency-formatter ui-display-dollar"]').nth(1).fill(csvData["Location5Wc1NumberOfSeasonalEmployees"]);
    }

    return page;
  }

  async fillPolicyInfo(page, csvData) {
    console.log("Filling Policy Info...");
    await page.locator('[class="btn-link navigationLabel 1-2"]').click();
    await page.waitForTimeout(1000);

    await page.locator('[class="match"]').nth(1).click();
    await page.fill('[class="optionListSearchInput ng-pristine ng-untouched ng-valid ng-empty"]', "10000");
    await page.waitForTimeout(2000);
    await page.keyboard.press("Enter");

    return page;
  }

  async fillAcordQuesions(page, csvData) {
    console.log("Filling Acord Quesions...");
    await page.locator('[class="btn-link navigationLabel 1-3"]').click();
    await page.waitForTimeout(1000);

    // CLick on checkbox
    await page.locator('[class="formFieldComponent-setAllYesNoToNo"]').click();
    await page.waitForTimeout(2000);

    // click on safety program
    await page.locator('[name="56770 yesno_writtenSafetyProgram  yes"]').click();
    await page.waitForTimeout(2000);
    await page.fill('[class="formFieldComponent-yesnoWrittenSafetyProgram"]', "All PPR required by OSHA");

    await page.locator('[name="expPremiumLessThan25KWC:Application:ACORD Questions"]').nth(1).click();

    return page;
  }

  async clickSubmitButton(page, csvData) {
    try {
      // Wait for the Submit Application button to be enabled
      await page.waitForFunction(() => {
        const button = document.querySelector('[class="btn actionButtonsBorderWidth submitApplication enabled btn-success"]');
        return button && !button.disabled;
      }, { timeout: 30000 });

      // Click the Submit Application button
      await page.click('[class="btn actionButtonsBorderWidth submitApplication enabled btn-success"]');
      console.log('Application Submitted');
      await page.waitForTimeout(30000);
      await page.screenshot({
        path: `SUCCESS_${csvData["BusinessName"]}.png`,
        fullPage: true
      });
      const policyNumber = await page.locator('[class="formFieldComponent-submissionNumber"]').first().inputValue();
      const quote = await page.locator('[class="buttonLabel ng-binding"]').nth(2).textContent();
      const sourceType = await page.locator('[class="buttonLabel ng-binding"]').nth(1).textContent();
      const createdBy = await page.locator('[class="formFieldComponent-createdBy"]').first().inputValue();
      const lastModified = await page.locator('[class="calendarInput ng-pristine ng-untouched ng-valid ng-isolate-scope ng-not-empty"]').nth(4).inputValue();
      const policyQuoteInfo = {
        policyNumber: policyNumber,
        quote: quote,
        sourceType: sourceType,
        createdBy: createdBy,
        lastModified: lastModified
      };
      return policyQuoteInfo;
    } catch (error) {
      console.log('Submit button may still be disabled. Error:', error.message);
      throw error;
    }
  }

  async runAutomation(csvData) {
    const browser = await chromium.launch({
      headless: false,
      // devtools: true
    });
    let page = await browser.newPage({
      // viewport: { 
      //     width: 1920, 
      //     height: 1080 
      // }
    });
    try {
      page = await this.login(page);
      page = await this.newSubmissionForm(page, csvData);
      page = await this.fillGenerationInfo(page, csvData);
      page = await this.fillLocationClassCodeInfo(page, csvData);
      page = await this.fillPolicyInfo(page, csvData);
      page = await this.fillAcordQuesions(page, csvData);
      const policyQuoteInfo = await this.clickSubmitButton(page, csvData);
      return policyQuoteInfo;
    } catch (error) {
      await page.screenshot({ path: 'error.png', fullPage: true });
      console.log('Screenshot saved as form_filled.png');
      console.error(error);
    } finally {
      await browser?.close();
    }
  }

  async clickAllYesRadioButtons(page) {
    try {
      // Wait for the page to be fully loaded
      await page.waitForLoadState('networkidle');

      // Array of all "Yes" radio button selectors found on the page
      const yesRadioSelectors = [
        // Question 1: Does applicant own, operate or lease aircraft/watercraft?
        'input[type="radio"][value="Yes"]',

        // Alternative selectors for more specific targeting
        'input[type="radio"] + label:has-text("Yes")',
        'input[type="radio"][aria-label*="Yes"]',

        // XPath selectors for better precision
        '//input[@type="radio" and following-sibling::text()[contains(., "Yes")]]',
        '//input[@type="radio" and @value="Yes"]'
      ];

      // Get all radio buttons that have "Yes" as their value or associated text
      const yesRadioButtons = await page.locator('input[type="radio"]').all();

      console.log(`Found ${yesRadioButtons.length} total radio buttons on the page`);

      let clickedCount = 0;

      // Iterate through all radio buttons and click those associated with "Yes"
      for (const radio of yesRadioButtons) {
        try {
          // Check if this radio button is associated with "Yes"
          const value = await radio.getAttribute('value');
          const nextText = await radio.locator('+ *').textContent().catch(() => '');
          const parentText = await radio.locator('..').textContent().catch(() => '');

          // Check various ways the "Yes" option might be identified
          const isYesOption =
            value === 'Yes' ||
            value === 'yes' ||
            nextText.trim() === 'Yes' ||
            parentText.includes('Yes') ||
            await radio.getAttribute('aria-label') === 'Yes';

          if (isYesOption) {
            // Ensure the radio button is visible and enabled
            await radio.waitFor({ state: 'visible' });

            if (await radio.isEnabled()) {
              await radio.click();
              clickedCount++;
              console.log(`Clicked "Yes" radio button #${clickedCount}`);

              // Small delay to ensure the click is processed
              await page.waitForTimeout(100);
            } else {
              console.log('Found disabled "Yes" radio button, skipping');
            }
          }
        } catch (error) {
          console.log(`Error processing radio button: ${error.message}`);
        }
      }

      console.log(`Successfully clicked ${clickedCount} "Yes" radio buttons`);
      return clickedCount;

    } catch (error) {
      console.error('Error clicking Yes radio buttons:', error);
      throw error;
    }
  }

    getAcordQuesionsKey() {
        return {
            "OwnOperateLeaseAircraftWatercraft": '[class="formFieldComponent-yesnoAircraftWatercraft yes"]',
            "ExplainAirWaterCraftUse": '[class="formFieldComponent-yesnoAircraftWatercraft"]',
            "InvolveWorkWithHazardousProjectsMaterials": '[class="formFieldComponent-yesnoHazardousMaterial yes ng-not-empty"]',
            "HazardousMaterialsExplanation": '[class="formFieldComponent-yesnoHazardousMaterial"]',
            "WorkAboveGroundOrUnderground": '[class="formFieldComponent-yesnoUnderground yes ng-not-empty error ng-touched"]',
            "WorkAboveGroundOrUndergroundDetails": '[class="formFieldComponent-yesnoUnderground"]',
            "EngagedInOtherBusiness": '[class="formFieldComponent-yesnoAnyOtherTypeOfBusiness yes ng-not-empty"]',
            "EngagedInOtherBusinessDetails": '[class="formFieldComponent-yesnoAnyOtherTypeOfBusiness"]',
            "SubcontractAnyWork": '[class="formFieldComponent-yesnoSubcontractors yes ng-not-empty"]',
            "SubcontractedWorkDetails": '[class="formFieldComponent-yesnoSubcontractors"]',
            "UninsuredSubcontractorsUsed": '[class="formFieldComponent-yesnoWithoutCertificates yes ng-not-empty error ng-touched"]',
            "WorkSubletWithoutInsuranceDetails": '[class="formFieldComponent-yesnoWithoutCertificates"]',
            "ProvideGroupTransportOfMoreThan5Employees": '[class="formFieldComponent-yesnoGroupTransportation yes ng-not-empty error ng-touched"]',
            "EmployeeTransportDetails": '[class="formFieldComponent-yesnoGroupTransportation"]',
            "SeasonalEmployees": '[class="formFieldComponent-yesnoSeasonalEmployees yes ng-not-empty ng-touched"]',
            "SeasonalEmployeesDetails": '[class="formFieldComponent-yesnoSeasonalEmployees"]',
            "VolunteerLabor": '[class="formFieldComponent-yesnoVolunteerLabor yes ng-not-empty"]',
            "VolunteerLaborDetails": '[class="formFieldComponent-yesnoVolunteerLabor"]',
            "PhysicalsRequired": '[class="formFieldComponent-yesnoPhysicalsRequired yes ng-not-empty"]',
            "PhysicalsRequiredDetails": '[class="formFieldComponent-yesnoPhysicalsRequired"]',
            "OtherInsuranceWithInsurer": '[class="formFieldComponent-yesnoOtherInsurance yes ng-not-empty"]',
            "OtherInsuranceWithInsurerDetails": '[class="formFieldComponent-yesnoOtherInsurance"]',
            "ProvideEmployeeHealthPlans": '[class="formFieldComponent-yesnoEmployeeHealthPlans yes ng-not-empty"]',
            "EmployeeHealthPlanDetails": '[class="formFieldComponent-yesnoEmployeeHealthPlans"]',
            "LeaseEmployeesFromOtherEmployers": '[class="formFieldComponent-yesnoLeaseEmployees yes ng-not-empty"]',
            "EmployeeLeasingDetails": '[class="formFieldComponent-yesnoLeaseEmployees"]',
            "RemoteEmployeesWorkingAtHome": '[class="formFieldComponent-yesnoWorkAtHome yes ng-not-empty"]',
            "RemoteWorkDetails": '[class="formFieldComponent-yesnoWorkAtHome"]',
            "TaxLiensOrBankruptcy": '[class="formFieldComponent-yesnoTaxLiens yes ng-not-empty"]',
            "TaxLiensOrBankruptcyDetails": '[class="formFieldComponent-yesnoTaxLiens"]',
            "PriorUnpaidWCPremium": '[class="formFieldComponent-yesnoUndisputedWorkersCompensation yes ng-not-empty"]',
            "UnpaidWCPremiumDetails": '[class="formFieldComponent-yesnoUndisputedWorkersCompensation"]',
        }   
    }
}
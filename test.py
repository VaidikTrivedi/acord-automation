import csv
from pypdf import PdfReader, PdfWriter
import fitz  # PyMuPDF

def fill_pdf_fields(input_pdf_path, output_pdf_path, data_dict):

    temp_pdf_path = "temp_overlay.pdf"
    fill_overlay_text(input_pdf_path, temp_pdf_path, data_dict)

    reader = PdfReader(temp_pdf_path)
    writer = PdfWriter()

    # Get the form fields
    writer.append(reader)
    for page in writer.pages:
        writer.update_page_form_field_values(page, data_dict)
    # writer.update_page_form_field_values(
    #     writer.pages[0],  # usually the first page
    #     data_dict
    # )

    print("Filling fields with data:")

    writer.add_js("this.getField('Applicant Name').defaultValue = this.getField('Applicant Name').value;")
    writer.add_metadata(reader.metadata)

    with open(output_pdf_path, "wb") as out_file:
        writer.write(out_file)

    print(f"Saved: {output_pdf_path}")

def fill_from_csv(csv_path, input_pdf_template):
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        data_dict = {}
        for row in reader:
            if len(row) >= 2:
                key = row[0].strip()
                value = row[1].strip()
                if key:  # skip empty keys
                    data_dict[key] = value
        output_file = "acord130_filled_1.pdf"
        fill_pdf_fields(input_pdf_template, output_file, data_dict)

def csv_to_dict(csv_path):
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        data_dict = {}
        for row in reader:
            if len(row) >= 2:
                key = row[0].strip()
                value = row[1].strip()
                if key:  # skip empty keys
                    data_dict[key] = value
    return data_dict

def fill_overlay_text(input_pdf, output_pdf, data_dict):
    color = (0, 0, 1) 
    doc = fitz.open(input_pdf)
    page = doc[0]
    page.insert_text((112, 58), data_dict["Phone"], color=color) 
    # page.insert_text((23, 214), "X", color=color) 
    page.insert_text((212, 226), "X", color=color)
    page.insert_text((293, 154), data_dict["SIC"], color=color)  
    doc.save(output_pdf)

def create_final_dict(csv_dict):
    final_dict = {
        "Current_Date": csv_dict["PolicyStartDate"],
        "Phone": csv_dict["PhoneNumber"],
        "PI_Paper": csv_dict["BusinessName"],
        "Applicant": csv_dict["ApplicantFirstName"] + " " + csv_dict["ApplicantLastName"],
        "CP_Address": csv_dict["Location1Address"],
        "CP_City": csv_dict["Location2Address"],
        "CP_State": csv_dict["Location3Address"],
        "CP_PostalCode": csv_dict["Location4Address"],
        "CP_YrsInBus": csv_dict["YearsInIndustry"],
        "NCCI": "", #TODO: Not in CSV
        "OtherNumber": "", #TODO: Not in CSV
        "Eff_Date": csv_dict["PolicyStartDate"],
        "Exp_Date": str(int(csv_dict["PolicyStartDate"]) + 1),
        "QC_Fein": csv_dict["FEINumber"],
        "Location_2": csv_dict["Location2Address"],
        "Location_3": csv_dict["Location3Address"],
        "Text1": "CA",
        "CC_FTE_1": csv_dict["Location1Wc1NumberOfFullTimeEmployees"],
        "CC_Payroll_1": csv_dict["Location1Wc1NumberOfFullTimeEmployees"],
        "SIC": csv_dict["Location1ClassOfBusiness"],
        "CC_State_1": "dummy location", # TODO: Not in CSV, using dummy value
        "CC_State_2": "dummy location", # TODO: Not in CSV, using dummy value
        "CC_State_3": "dummy location", # TODO: Not in CSV, using dummy value
        "CC_State_4": "dummy location", # TODO: Not in CSV, using dummy value
        "CC_Loc_1": csv_dict["Location1Address"],
        "CC_Loc_2": csv_dict["Location2Address"],
        "CC_Loc_3": csv_dict["Location3Address"],
        "CC_Loc_4": csv_dict["Location4Address"],
        "CC_1": csv_dict["Location1Wc1NumberOfFullTimeEmployees"],
        "CC_2": csv_dict["Location2Wc1NumberOfFullTimeEmployees"],
        "CC_3": csv_dict["Location3Wc1NumberOfFullTimeEmployees"],
        "CC_4": csv_dict["Location4Wc1NumberOfFullTimeEmployees"],
        "CC_Desc_Code_1": csv_dict["Location1ClassOfBusiness"],
        "CC_Desc_Code_2": csv_dict["Location2ClassOfBusiness"],
        "CC_Desc_Code_3": csv_dict["Location3ClassOfBusiness"],
        "CC_Desc_Code_4": csv_dict["Location4ClassOfBusiness"],
        "CC_Desc_1" : csv_dict["Location1ClassOfBusiness"], # TODO: Check if this is correct
        "CC_Desc_2" : csv_dict["Location2ClassOfBusiness"],
        "CC_Desc_3" : csv_dict["Location3ClassOfBusiness"],
        "CC_Desc_4" : csv_dict["Location4ClassOfBusiness"],
        "CC_FTE_1" : "dummy data", #TODO: Not in CSV, using dummy value
        "CC_FTE_2" : "dummy data", #TODO: Not in CSV, using dummy value
        "CC_FTE_3" : "dummy data", #TODO: Not in CSV, using dummy value
        "CC_FTE_4" : "dummy data", #TODO: Not in CSV, using dummy value
        "CC_PTE_1": "dummy data", #TODO: Not in CSV, using dummy value
        "CC_PTE_2": "dummy data", #TODO: Not in CSV, using dummy value
        "CC_PTE_3": "dummy data", #TODO: Not in CSV, using dummy value
        "CC_PTE_4": "dummy data", #TODO: Not in CSV, using dummy value
        "CC_Payroll_1": csv_dict["Owner1Payroll"],
        "CC_Payroll_2": csv_dict["Owner2Payroll"],
        "CC_Payroll_3": csv_dict["Owner3Payroll"],
        "CC_Payroll_4": csv_dict["Owner4Payroll"],
#rate field is missing
        "CC_Prem_1" : csv_dict["CurrentTermPremium"],
        "CC_Prem_2" : csv_dict["Prior1TermPremium"],
        "CC_Prem_3" : csv_dict["Prior2TermPremium"],
        "CC_Prem_4" : csv_dict["Prior3TermPremium"],




        
        # "Individual": csv_dict["BusinessOwnershipStructure"],
        # "Partnership": csv_dict["BusinessOwnershipStructure"],
        # "Corporation": csv_dict["BusinessOwnershipStructure"],
        # 'SUBCHAPTER "S" CORP': csv_dict["BusinessOwnershipStructure"],
        # "LLC": csv_dict["BusinessOwnershipStructure"],
        # "Other": csv_dict["BusinessOwnershipStructure"],
        # "Describe Other": csv_dict["BusinessOwnershipStructure"],
        # "Quote": True, #TODO: Always checked
        # "Agency Bill": True, # TODO: Always checked
        # "Proposed Effective Date": csv_dict["PolicyStartDate"],
        # "Proposed Expiration Date": "", #TODO: Add one year to PolicyStartDate
        # "Workers Compensation - States": "CA",  
    }
    return final_dict





if __name__ == "__main__":
    # fill_from_csv("acord130_data_2.csv", "acord130_blank.pdf")
    data_dict = csv_to_dict("acord130_data_2.csv")
    final_dict = create_final_dict(data_dict)
    fill_pdf_fields("WC Acord 130 2022.pdf", "acord130_filled_final.pdf", final_dict)
    # fill_pdf_fields("acord130_blank.pdf", "acord130_filled_final_2.pdf", final_dict)
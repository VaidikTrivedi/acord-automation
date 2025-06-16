import csv
from pypdf import PdfReader, PdfWriter
import fitz  # PyMuPDF

def get_state(address):
    if address is None or address == "":
        return ""
    return address.split(",")[-1].strip().split(' ')[-2]

def format_full_name(first_name, last_name):
    if not first_name or not last_name:
        return ""
    return f"{first_name.strip()} {last_name.strip()}".strip()

def format_date(date_str):
    if not date_str or len(date_str) < 7:
        return "dd/mm/yyyy"
    try:
        reversed_date = date_str[::-1]
        year = reversed_date[:4][::-1]
        month = reversed_date[4:6][::-1]
        day = reversed_date[6:][::-1]
        return f"{day}/{month}/{year}"
    except Exception as e:
        print(f"Error formatting date: {e}")
        return "dd/mm/yyyy"

def fill_pdf_fields(input_pdf_path, output_pdf_path, final_dict, csv_dict):

    temp_pdf_path = "temp_overlay.pdf"
    fill_overlay_text(input_pdf_path, temp_pdf_path, final_dict, csv_dict)

    reader = PdfReader(temp_pdf_path)
    writer = PdfWriter()

    # Get the form fields
    writer.append(reader)
    for page in writer.pages:
        writer.update_page_form_field_values(page, final_dict)

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

def fill_overlay_text(input_pdf, output_pdf, data_dict, csv_dict):
    color = (0, 0, 1) 
    doc = fitz.open(input_pdf)
    page = doc[0]
    page.insert_text((112, 58), data_dict["Phone"], color=color) 
    page.insert_text((212, 226), "X", color=color)
    page.insert_text((293, 154), data_dict["SIC"], color=color)  

    page = doc[1]
    page.insert_text((21, 75), "1", color=color)
    page.insert_text((33, 75), format_full_name(csv_dict["Owner1FirstName"], csv_dict["Owner1LastName"]), color=color)
    page.insert_text((21, 100), "2", color=color)
    page.insert_text((33, 100), format_full_name(csv_dict["Owner2FirstName"], csv_dict["Owner2LastName"]), color=color)
    page.insert_text((21, 125), "3", color=color)
    page.insert_text((33, 125), format_full_name(csv_dict["Owner3FirstName"], csv_dict["Owner3LastName"]), color=color)
    page.insert_text((21, 150), "4", color=color)
    page.insert_text((33, 150), format_full_name(csv_dict["Owner4FirstName"], csv_dict["Owner4LastName"]), color=color)
    page.insert_text((21, 175), "5", color=color)
    page.insert_text((33, 173), format_full_name(csv_dict["Owner5FirstName"], csv_dict["Owner5LastName"]), color=color)
    page.insert_text((170, 75), format_date(csv_dict["Prior1TermEffectiveDate"]), color=color)
    page.insert_text((170, 100), format_date(csv_dict["Prior2TermEffectiveDate"]), color=color)
    page.insert_text((170, 125), format_date(csv_dict["Prior3TermEffectiveDate"]), color=color)
    # page.insert_text((170, 147), format_date(csv_dict["Prior4TermEffectiveDate"]), color=color)
    # page.insert_text((170, 173), format_date(csv_dict["Prior5TermEffectiveDate"]), color=color)

    page.insert_text((235, 75), csv_dict["BusinessOwnershipStructure"], color=color)
    page.insert_text((235, 100), csv_dict["BusinessOwnershipStructure"], color=color)
    page.insert_text((235, 125), csv_dict["BusinessOwnershipStructure"], color=color)
    page.insert_text((235, 147), csv_dict["BusinessOwnershipStructure"], color=color)
    page.insert_text((235, 173), csv_dict["BusinessOwnershipStructure"], color=color)
    page.insert_text((292, 75), csv_dict["Owner1Ownership"], color=color)
    page.insert_text((292, 100), csv_dict["Owner2Ownership"], color=color)
    page.insert_text((292, 125), csv_dict["Owner3Ownership"], color=color)
    page.insert_text((292, 147), csv_dict["Owner4Ownership"], color=color)
    page.insert_text((292, 173), csv_dict["Owner5Ownership"], color=color)
    page.insert_text((442, 75), csv_dict["Owner1WantToInclude"], color=color, fontsize=6)
    page.insert_text((442, 100), csv_dict["Owner2WantToInclude"], color=color, fontsize=6)
    page.insert_text((442, 125), csv_dict["Owner3WantToInclude"], color=color, fontsize=6)
    page.insert_text((442, 147), csv_dict["Owner4WantToInclude"], color=color, fontsize=6)
    page.insert_text((442, 173), csv_dict["Owner5WantToInclude"], color=color, fontsize=6)
    page.insert_text((80, 227), csv_dict["CurrentTermCarrier"], color=color) 
    page.insert_text((80, 250), csv_dict["Prior1TermCarrier"], color=color) 
    page.insert_text((80, 274), csv_dict["BusinessName"], color=color)
    page.insert_text((80, 299), csv_dict["Prior2TermCarrier"], color=color)
    page.insert_text((80, 322), csv_dict["Prior3TermCarrier"], color=color)
    page.insert_text((80, 239), csv_dict["CurrentTermPolicyNumber"], color=color) 
    page.insert_text((80, 263), csv_dict["CurrentTermPolicyNumber"], color=color)
    page.insert_text((80, 287), csv_dict["CurrentTermPolicyNumber"], color=color)
    page.insert_text((80, 312), csv_dict["PhoneNumber"], color=color)
    page.insert_text((80, 335), csv_dict["PhoneNumber"], color=color)
    page.insert_text((405, 232), csv_dict["CurrentTermClaimCount"], color=color) 
    page.insert_text((405, 256), csv_dict["Prior1TermClaimCount"], color=color) 
    page.insert_text((405, 280), csv_dict["Prior2TermClaimCount"], color=color)
    page.insert_text((405, 304), csv_dict["Prior3TermClaimCount"], color=color)
    # page.insert_text((405, 327), csv_dict["Prior4TermClaimCount"], color=color) # NO Prior4TermClaimCount in CSV
    page.insert_text((27, 370), csv_dict["Location1BusinessDescription"], color=color) 
    page.insert_text((380, 565), data_dict["InspectionContactPhone"], color=color)
    page.insert_text((380, 575), data_dict ["InspectionContactFirstName"] + " " + data_dict["InspectionContactLastName"], color=color)
    
    doc.save(output_pdf)

def create_final_dict(csv_dict):
    final_dict = {
        "Current_Date": format_date(csv_dict["PolicyStartDate"]),
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
        "Eff_Date": format_date(csv_dict["PolicyStartDate"]),
        "Exp_Date": format_date(str(int(csv_dict["PolicyStartDate"]) + 1)),
        "QC_Fein": csv_dict["FEINumber"],
        "Location_2": csv_dict["Location2Address"],
        "Location_3": csv_dict["Location3Address"],
        "Text1": "CA",
        "CC_FTE_1": csv_dict["Location1Wc1NumberOfFullTimeEmployees"],
        "CC_Payroll_1": csv_dict["Location1Wc1NumberOfFullTimeEmployees"],
        "SIC": csv_dict["Location1ClassOfBusiness"],
        "CC_State_1": get_state(csv_dict["Location1Address"]),
        "CC_State_2": get_state(csv_dict["Location2Address"]),
        "CC_State_3": get_state(csv_dict["Location3Address"]),
        "CC_State_4": get_state(csv_dict["Location4Address"]),
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
        "CC_Desc_1" : csv_dict["Location1ClassOfBusiness"],
        "CC_Desc_2" : csv_dict["Location2ClassOfBusiness"],
        "CC_Desc_3" : csv_dict["Location3ClassOfBusiness"],
        "CC_Desc_4" : csv_dict["Location4ClassOfBusiness"],
        "CC_FTE_1" : "", #TODO: Not in CSV
        "CC_FTE_2" : "", #TODO: Not in CSV
        "CC_FTE_3" : "", #TODO: Not in CSV
        "CC_FTE_4" : "", #TODO: Not in CSV
        "CC_PTE_1": "", #TODO: Not in CSV
        "CC_PTE_2": "", #TODO: Not in CSV
        "CC_PTE_3": "", #TODO: Not in CSV
        "CC_PTE_4": "", #TODO: Not in CSV
        "CC_Payroll_1": csv_dict["Owner1Payroll"],
        "CC_Payroll_2": csv_dict["Owner2Payroll"],
        "CC_Payroll_3": csv_dict["Owner3Payroll"],
        "CC_Payroll_4": csv_dict["Owner4Payroll"],
        "CC_Prem_1" : csv_dict["CurrentTermPremium"],
        "CC_Prem_2" : csv_dict["Prior1TermPremium"],
        "CC_Prem_3" : csv_dict["Prior2TermPremium"],
        "CC_Prem_4" : csv_dict["Prior3TermPremium"],
        "InspectionContactPhone": csv_dict["InspectionContactPhone"],
        "InspectionContactFirstName": csv_dict["InspectionContactFirstName"],
        "InspectionContactLastName": csv_dict["InspectionContactLastName"],
    }
    return final_dict

if __name__ == "__main__":
    data_dict = csv_to_dict("acord130_data_2.csv")
    final_dict = create_final_dict(data_dict)
    fill_pdf_fields("WC Acord 130 2022.pdf", "acord130_filled_final.pdf", final_dict, data_dict)
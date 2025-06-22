import fs from "fs/promises";
import path from "path";
import config from "./config.json" with { type: "json" };
import { Atlas } from "./atlas.js";

async function main() {
    const csvFilePath = path.resolve("./web_automation/acord130_data.csv"); // adjust path as needed
    const csvData = await readCSVtoJSON(csvFilePath);
    // console.log(csvData);
    const website = "atlas";
    switch (website) {
        case "atlas":
            const url = config.atlas.url;
            const username = config.atlas.username;
            const password = config.atlas.password;
            try {
                const worker = new Atlas(url, username, password);
                await worker.runAutomation(csvData);
            } catch (error) {
                console.error('Error in main function:', error);
            }
            break;
        default:
            console.error("Wrong Choice")
    }
}

async function readCSVtoJSON(filePath) {
    const data = await fs.readFile(filePath, "utf-8");
    const lines = data.split("\n").filter(line => line.trim() !== "");
    const csvDict = {};
    for (const line of lines) {
        let [header, value] = line.split(",").map(v => v.trim());
        if (header) {
            if (header === "Location1Address") {
                const splited = line.split(',');
                value = splited[1].replaceAll('"', '').trim();
                csvDict["city"] = splited[2].trim();
                csvDict["state"] = splited[3].trim().split(" ")[0];
                csvDict["zipCode"] = splited[3].trim().split(" ")[1].replaceAll('"', '');
            }
            csvDict[header] = value !== undefined && value !== "" ? value : "";
        }
    }
    return csvDict;
}


await main();
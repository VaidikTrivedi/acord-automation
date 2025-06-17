import config from "./config.json" with { type: "json" };
import { Atlas } from "./atlas.js";

async function main() {
  const website = "atlas";
  switch (website) {
    case "atlas":
      const url = config.atlas.url;
      const username = config.atlas.username;
      const password = config.atlas.password;
      try {
        const worker = new Atlas(url, username, password);
        await worker.runAutomation();
      } catch (error) {
        console.error('Error in main function:', error);
      }
      break;
    default:
      console.error("Wrong Choice")
  }
}

await main();
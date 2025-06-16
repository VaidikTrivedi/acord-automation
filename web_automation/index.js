import { runAtlasAutomation } from "./atlas.js";

async function main() {
  try {
    await runAtlasAutomation();
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

await main();
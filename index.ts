import { chromium } from "playwright";
import { login } from "./utils/userUtils";

(async () => {
  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await login(page);
  const label = await page
    .getByLabel("Side bar")
    .getByText("Full Stack Developer ")
    .textContent();
  console.log(label);

  await browser.close();
  console.log("Browser closed.");
})();

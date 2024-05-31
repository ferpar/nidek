import { chromium } from "playwright";
import { login } from "./utils/userUtils";

(async () => {

  //retrieve auth state
  const authPath = ".auth/user.json";
  const authState = await Bun.file(authPath).json();

  // start browser with previous auth state
  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: false });
  const newContext = await browser.newContext({ storageState: authState });
  const page = await newContext.newPage();

  // go to linkedin
  await page.goto("https://www.linkedin.com/");

  // check if logged in, via url
  const url = page.url();
  if (!url.endsWith("/feed/")) {
    console.log("Not logged in. Logging in...");
    await login(page);
  } else {
    console.log("Already logged in.");
  }

  // retrieve data from the page
  const label = await page
    .getByLabel("Side bar")
    .getByText("Full Stack Developer ")
    .textContent();
  console.log(label);

  await browser.close();
  console.log("Browser closed.");
})();

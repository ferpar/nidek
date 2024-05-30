import { chromium } from "playwright";
const username = String(Bun.env.USR);
const password = String(Bun.env.PSS);

(async () => {
  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.linkedin.com/");
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Email or Phone").fill(username);
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const label = page.getByLabel("Side bar").getByText("Full Stack Developer ");
  console.log(label);

  // await browser.close()
  console.log("Browser closed.");
})();

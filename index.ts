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

  // navigate to jobs page
  await page.getByRole("link", { name: "Jobs", exact: true }).click();
  console.log("clicked on jobs");

  // perform job search
  const searchField = await page.getByRole("combobox", {
    name: "Search by title, skill, or",
  });
  await searchField.click();
  await searchField.fill("react");
  const locationField = await page.getByRole("combobox", {
    name: "City, state, or zip code",
  });
  await locationField.fill("european union");
  await searchField.click();
  await searchField.press("Enter");
  console.log("filled in search");

  // apply remote filter
  let searchFiltersBar = page.locator(".search-filters-bar")
  const remoteDropdown = searchFiltersBar.getByLabel("Remote filter.")
  await remoteDropdown.click();
  const remoteMenu = page.getByRole('group', { name: 'Filter results by: Remote' });
  const remoteCheckbox = remoteMenu.getByText("Remote", {exact: true} )
  await remoteCheckbox.click()
  await page.waitForTimeout(500);
  await remoteMenu.getByRole('button', { name: 'Apply current filter to show' }).click();

  // apply date posted filter
  searchFiltersBar = page.locator(".search-filters-bar")
  const datePostedDropdown = searchFiltersBar.getByLabel("Date posted filter.")
  datePostedDropdown.click();
  const datePostedMenu = page.getByRole('group', { name: 'Filter results by: Date posted' });
  const past24HoursRadioBtn = datePostedMenu.getByText("Past 24 hours", {exact: true} )
  await past24HoursRadioBtn.click();
  await page.waitForTimeout(200);
  await datePostedMenu.getByRole('button', { name: 'Apply current filter to show' }).click();
  
  // get job description
  let jobDescription = page.locator('.jobs-description__container')
  console.log("Job description: ", await jobDescription.textContent());

  // go to page 2
  await page.getByLabel('Page 2').click();
  await page.waitForTimeout(200);

  // get job description
  jobDescription = page.locator('.jobs-description__container')
  console.log("Job description: ", await jobDescription.textContent());

  // await browser.close();
  // console.log("Browser closed.");
  console.log("Done.")
})();

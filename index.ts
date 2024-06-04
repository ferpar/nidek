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
  let searchFiltersBar = page.locator(".search-filters-bar");
  const remoteDropdown = searchFiltersBar.getByLabel("Remote filter.");
  await remoteDropdown.click();
  const remoteMenu = page.getByRole("group", {
    name: "Filter results by: Remote",
  });
  const remoteInputContainer = remoteMenu.locator(".search-reusables__collection-values-item", { hasText: "Remote" })
  console.log("remote input item: ", await remoteInputContainer.innerHTML())
  const remoteInput = remoteInputContainer.locator("input");
  console.log("remote input is checked: ", await remoteInput.isChecked())

  const remoteCheckbox = remoteMenu.getByText("Remote", { exact: true });
  console.log("remote checkbox: ", await remoteCheckbox.innerHTML())
  await remoteCheckbox.click();
  console.log("remote input is checked after click: ", await remoteInput.isChecked())
  await page.waitForTimeout(1000);
  console.log("remote input is checked before push: ", await remoteInput.isChecked())
  const applyButton = remoteMenu.locator("button", { hasText: "Show" });
  await applyButton.focus();
  while(!(await remoteInput.isChecked())) {
    remoteCheckbox.click();
    page.waitForTimeout(1000);
    console.log("reclicked remote checbox, is checked: ", await remoteInput.isChecked())
  }
  await applyButton.click();

  // apply date posted filter
  searchFiltersBar = page.locator(".search-filters-bar");
  const datePostedDropdown = searchFiltersBar.getByLabel("Date posted filter.");
  await datePostedDropdown.click();
  const datePostedMenu = page.getByRole("group", {
    name: "Filter results by: Date posted",
  });
  const past24HoursRadioBtn = datePostedMenu.getByText("Past 24 hours", {
    exact: true,
  });
  await past24HoursRadioBtn.click();
  await page.waitForTimeout(200);
  await datePostedMenu
    .getByRole("button", { name: "Apply current filter to show" })
    .click();

  // get job description
  let jobDescription = page.locator(".jobs-description__container");
  // console.log("Job description: ", await jobDescription.innerHTML());
  let jobListContainer = page.locator(".scaffold-layout__list-container");
  let jobList = jobListContainer.locator(".jobs-search-results__list-item");
  console.log("Job list: ", await jobList.count());
  const allJobs = await jobList.all();
  let prevDescription = "";
  // for await (let job of allJobs) {
  //   job.click();
  //   await page.waitForTimeout(2000);
  //   jobDescription = page.locator(".jobs-description__container");
  //   const firstP = (await jobDescription.innerText()).trim().slice(0,60);
  //   console.log("are descriptions the same?", firstP === prevDescription)
  //   prevDescription = firstP;
  //   console.log(firstP);
  // }

  // go to page 2
  await page.getByLabel("Page 2").click();
  await page.waitForTimeout(200);

  // get job description
  jobDescription = page.locator(".jobs-description__container");
  // console.log("Job description: ", await jobDescription.textContent());
  jobListContainer = page.locator(".scaffold-layout__list-container");
  jobList = jobListContainer.locator(".jobs-search-results__list-item");
  console.log("Job list: ", await jobList.count());

  // await browser.close();
  // console.log("Browser closed.");
  console.log("Done.");
})();

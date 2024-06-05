import { chromium } from "playwright";
import { login } from "./utils/userUtils";
import {
  filterByDatePosted,
  filterByRemote,
  searchJobs,
} from "./utils/searchUtils";

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

  // navigate to jobs page
  await page.getByRole("link", { name: "Jobs", exact: true }).click();
  console.log("clicked on jobs");

  // perform job search
  searchJobs(page, "Full Stack Developer", "european union");
  console.log("filled in search");

  // apply remote filter
  await filterByRemote(page);

  // apply date posted filter
  await filterByDatePosted(page, "Past 24 hours");

  // get job description
  let jobDescription = page.locator(".jobs-description__container");
  // console.log("Job description: ", await jobDescription.innerHTML());
  let jobListContainer = page.locator(".scaffold-layout__list-container");
  let jobList = jobListContainer.locator(".jobs-search-results__list-item");
  console.log("Job list: ", await jobList.count());
  const allJobs = await jobList.all();
  let prevDescription = "";
  const jobIds = await Promise.all(
    allJobs.map((job) => job.getAttribute("data-occludable-job-id"))
  );

  for await (let jobId of jobIds) {
    console.log(jobId);
    const url = page.url();
    // new url replacing currentJobId path param
    const newUrl = url.replace(/(currentJobId=)(\d+)/, `$1${jobId}`);
    page.goto(newUrl);

    await page.waitForTimeout(4000);
    jobDescription = page.locator(".jobs-description__container");
    const firstP = (await jobDescription.innerText())
      .trim()
      .slice(13, 150)
      .trim();
    console.log(firstP);
    console.log("are descriptions the same?", firstP === prevDescription);
    // console.log(firstP)
    prevDescription = firstP;
    await page.waitForTimeout(1000);
  }

  // for await (let job of allJobs) {
  //   await job.click();
  //   await page.waitForTimeout(1000);
  //   jobDescription = page.locator(".jobs-description__container");
  //   const firstP = (await jobDescription.innerText())
  //     .trim()
  //     .slice(13, 150)
  //     .trim();
  //   console.log("are descriptions the same?", firstP === prevDescription);
  //   const url = page.url();
  //   const jobId = url.split("?")[1].split("&")[0];
  //   console.log("jobId: ", jobId);
  //   // console.log(firstP)
  //   prevDescription = firstP;
  //   await page.waitForTimeout(1000);
  // }

  // go to page 2
  // await page.getByLabel("Page 2").click();
  // await page.waitForTimeout(200);

  // get job description
  // jobDescription = page.locator(".jobs-description__container");
  // console.log("Job description: ", await jobDescription.textContent());
  // jobListContainer = page.locator(".scaffold-layout__list-container");
  // jobList = jobListContainer.locator(".jobs-search-results__list-item");
  // console.log("Job list: ", await jobList.count());

  await browser.close();
  console.log("Browser closed.");
  console.log("Done.");
})();

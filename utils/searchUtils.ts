import type { Page } from "@playwright/test";

export async function searchJobs(page: Page, searchQuery: string, location: string) {
  const searchField = await page.getByRole("combobox", {
    name: "Search by title, skill, or",
  });
  await searchField.click();
  await searchField.fill(searchQuery);
  const locationField = await page.getByRole("combobox", {
    name: "City, state, or zip code",
  });
  await locationField.fill(location);
  await searchField.click();
  await searchField.press("Enter");
}

export async function filterByRemote(page: Page) {
  const searchFiltersBar = page.locator(".search-filters-bar");
  const remoteDropdown = searchFiltersBar.getByLabel("Remote filter.");
  await remoteDropdown.click();
  const remoteMenu = page.getByRole("group", {
    name: "Filter results by: Remote",
  });
  const remoteInputContainer = remoteMenu.locator(
    ".search-reusables__collection-values-item",
    { hasText: "Remote" }
  );
  const remoteInput = remoteInputContainer.locator("input");
  const remoteCheckbox = remoteMenu.getByText("Remote", { exact: true });
  await remoteCheckbox.click();
  const applyButton = remoteMenu.locator("button", { hasText: "Show" });
  await applyButton.focus();
  while (!(await remoteInput.isChecked())) {
    remoteCheckbox.click();
    await page.waitForTimeout(1000);
  }
  await applyButton.click();
  // wait for search filters on the bar to reorder, 
  // if we dont wait the next dialog may close as the ui updates
  await page.waitForTimeout(2000);
}

export async function filterByDatePosted(page: Page, filterString: string) {
  const searchFiltersBar = page.locator(".search-filters-bar");
  const datePostedDropdown = searchFiltersBar.getByLabel("Date posted filter.");
  await datePostedDropdown.click();
  const datePostedMenu = page.getByRole("group", {
    name: "Filter results by: Date posted",
  });
  const radioBtn = datePostedMenu.getByText(filterString, { exact: true });
  console.log("radioBtn", await radioBtn.innerHTML());
  await radioBtn.click();
  await page.waitForTimeout(1000);
  const applyButton = datePostedMenu.locator("button", {
    hasText: "Show ",
  });
  await applyButton.click();
}
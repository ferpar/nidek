import type { Page } from "@playwright/test";

export async function login(page: Page) {
    const username = String(Bun.env.USR);
    const password = String(Bun.env.PSS);

    const authFile = ".auth/user.json";
    
    await page.goto("https://www.linkedin.com/");
    await page.getByRole("link", { name: "Sign in", exact: true }).click();
    await page.getByLabel("Email or Phone").fill(username);
    await page.getByLabel("Password").click();
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await page.context().storageState({ path: authFile })
}
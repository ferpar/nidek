import { chromium } from 'playwright';

(async () => {
    console.log("Starting browser...")
    const browser = await chromium.launch();

    console.log("Creating context...")

    await browser.close()
    console.log("Browser closed.")
})()

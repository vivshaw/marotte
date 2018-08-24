import * as puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';

/*
* Fires up a Puppeteer instance to render the page with headless Chromium
*/
export default async function providePuppeteer(): Promise<IPuppeteerInjects> {
  // Launch Puppeteer.
  // This needs to be an instance so we can close it when we're done.
  const browser = await puppeteer.launch();
  console.log(`Started headless Chromium with Puppeteer!`);

  // Create a new Page.
  // This needs to be an instance so we can render pages with it elsewhere
  const page = await browser.newPage();
  console.log(`Puppeteer page ready to render.`);

  return { browser, page };
}

interface IPuppeteerInjects {
  browser: Browser;
  page: Page;
}

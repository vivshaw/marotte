import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';

import { Logger } from '../logger/logger.service';

/*
* Fires up a Puppeteer instance to render the page with headless Chromium
*/
export default async function providePuppeteer(logger: Logger): Promise<Browser> {
  // Launch Puppeteer.
  // This needs to be an instance so we can close it when we're done.
  const browser = await puppeteer.launch();
  logger.setup(`Started headless Chromium with Puppeteer!`);

  return browser;
}

import { inject, injectable } from 'inversify';
import puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';

import { IOptions, TYPES } from '../types';
import colors from '../util/colors.util';

/*
* Fires up a Puppeteer instance to render the page with headless Chromium
*/
export default async function providePuppeteer(): Promise<Browser> {
  // Launch Puppeteer.
  // This needs to be an instance so we can close it when we're done.
  const browser = await puppeteer.launch();
  console.log(colors.SETUP_TAG, `Started headless Chromium with Puppeteer!`);

  return browser;
}

@injectable()
export class BrowserService {
  Ready: Promise<Browser>;
  private _page?: Promise<Page>;

  constructor(@inject(TYPES.Options) private options: IOptions) {
    this.Ready = providePuppeteer();
  }

  private async Page(): Promise<Page> {
    if (!this._page) {
      const browser = await this.Ready;
      this._page = browser.newPage();
      console.log(colors.SETUP_TAG, `Puppeteer page ready to render.`);
    }

    return this._page;
  }

  async fetch(route: string): Promise<string> {
    const page = await this.Page();

    // Request the route
    await page.goto(`${this.options.host}/${route}`);

    // Get the html content after rendering in Chromium
    // Replace the HTML doctype, which outerHTML drops
    return await page.evaluate(
      'new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML',
    );
  }

  async onClose(): Promise<void> {
    this.Ready.then(browser => browser.close());
  }
}

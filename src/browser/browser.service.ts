import { inject, injectable } from 'inversify';
import { Browser, Page } from 'puppeteer';

import { Logger } from '../logger/logger.service';
import { ICloseable, IOptions, IReadiable, Provider, TYPES } from '../types';

@injectable()
export class BrowserService implements ICloseable, IReadiable {
  Ready: Promise<Browser>;
  private _page?: Promise<Page>;

  constructor(
    @inject(TYPES.Options) private options: IOptions,
    @inject(Logger) private logger: Logger,
    @inject(TYPES.BrowserProvider) private browserProvider: Provider<Browser>,
  ) {
    this.Ready = browserProvider();
  }

  private async Page(): Promise<Page> {
    if (!this._page) {
      const browser = await this.Ready;
      this._page = browser.newPage();
      this.logger.setup('Puppeteer page ready to render.');
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

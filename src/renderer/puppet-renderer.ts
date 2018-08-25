import { inject, injectable } from 'inversify';
import { difference, uniq } from 'lodash';
import { join } from 'path';

import { BrowserService } from './../inject/browser.service';
import { HostService } from './../inject/host.service';

import { TYPES } from '../inject';
import IO from '../util/io.util';
import parseForRoutes from '../util/scrape.util';
import { IOptions, TAG } from './index';

@injectable()
export class Renderer {
  constructor(
    @inject(TYPES.Options) private options: IOptions,
    @inject(TYPES.HostService) private host: HostService,
    @inject(TYPES.BrowserService) private browser: BrowserService,
  ) {}

  /*
     * Crawls the site & renders each route to a static HTML file.
     * If provided an array limitToRoutes, it will render only those routes.
     * Otherwise, it crawls the whole page.
     */
  public async run(limitToRoutes?: string[]) {
    await this.host.Ready;

    if (limitToRoutes) {
      // Just render the routes provided in the array
      for (const route of limitToRoutes) {
        await this.fetchAndRender(route);
      }
    } else {
      // No array of routes provided, so let's crawl the whole site!

      // We'll start on the root
      let routesToRender = [''];
      // and we'll keep track of where we've already been.
      let alreadyRendered: string[] = [];

      while (routesToRender.length > 0) {
        const route = routesToRender[0];
        const result = await this.fetchAndRender(route);

        // Remember that we've been here already
        alreadyRendered = [...alreadyRendered, route];

        // Scrape result for links, extract the routes, and add the routes that haven't been
        // rendered yet to routesToRender
        routesToRender = difference(uniq(routesToRender.concat(parseForRoutes(result))), alreadyRendered);
      }
    }
  }

  /*
     * Closes down the Express and Puppeteer instances.
     */
  public cleanup() {
    this.browser.onClose();
    this.host.onClose();
  }

  /*
     * Make Puppeteer visit a single route of our Express-hosted app,
     * then render it to dist/.
     * If dist/ doesn't exist, we'll first create it.
     */
  private async fetchAndRender(route: string): Promise<string> {
    // Request the route
    const result = await this.browser.fetch(route);

    const filePath = join(
      this.options.pathParams.workingDir,
      this.options.pathParams.distSubDir,
      (route || 'index') + '.html',
    );

    await IO.writeAndMkdir(filePath, result);
    console.log(TAG, `Rendered & wrote ${filePath}`);

    // Return the page HTML
    return result;
  }
}

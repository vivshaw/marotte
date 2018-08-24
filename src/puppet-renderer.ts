import { uniq, difference } from 'lodash';
import { Server } from 'http';
import { Browser, Page } from 'puppeteer';
import { join } from 'path';

import parseForRoutes from './util/scrape.util';
import IO from './util/io.util';
import providePuppeteer from './inject/puppeteer.provider';
import provideExpress from './inject/express.provider';

export interface IPuppetRenderer {
    run(): void;
    cleanup(): void;
}

class PuppetRenderer implements IPuppetRenderer {

    constructor(private options: any, private server: Server, private browser: Browser, private page: Page) { }

    /*
     * Crawls the site & renders each route to a static HTML file.
     * If provided an array limitToRoutes, it will render only those routes.
     * Otherwise, it crawls the whole page.
     */
    public async run(limitToRoutes?: string[]) {
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

                routesToRender = difference(
                    uniq(routesToRender.concat(parseForRoutes(result))),
                    alreadyRendered
                );
            }
        }
    }

    /*
     * Closes down the Express and Puppeteer instances.
     */
    public cleanup() {
        this.browser.close();
        this.server.close();
    }

    /*
     * Make Puppeteer visit a single route of our Express-hosted app,
     * then render it to dist/.
     * If dist/ doesn't exist, we'll first create it.
     */
    private async fetchAndRender(route: string): Promise<string> {
        // Request the route
        await this.page.goto(`${this.options.host}/${route}`);

        // Get the html content after rendering in Chromium
        // Replace the HTML doctype, which outerHTML drops
        const result = await this.page.evaluate(
            'new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML'
        );

        const filePath = join(this.options.pathParams.workingDir,
                            this.options.pathParams.distSubDir,
                            (route || 'index') + '.html');

        await IO.writeAndMkdir(result, filePath);
        console.log(`Rendered & wrote ${filePath}`);

        // Return the page HTML
        return result;
    }

}

export async function createPuppetRenderer(port: number): Promise<PuppetRenderer> {

    const options = {
        port: port,
        host: `http://localhost:${port}`,
        pathParams: {
            workingDir: process.cwd(),
            distSubDir: 'dist'
        }
    };

    // Get injectable instances of the renderer's dependencies on Express and Puppeteer
    const server = await provideExpress(options);
    const puppeteer = await providePuppeteer();

    return new PuppetRenderer(options, server, puppeteer.browser, puppeteer.page);
}

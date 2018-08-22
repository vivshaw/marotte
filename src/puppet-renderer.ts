import * as puppeteer from 'puppeteer';
import express from 'express';
import { join, dirname } from 'path';
import { readFile, exists, writeFile, mkdir } from 'mz/fs';
import { uniq, difference } from 'lodash';
import { Server } from 'http';

export interface IPuppetRenderer {
    host: string;
    run(): void;
    cleanup(): void;
}

class PuppetRenderer implements IPuppetRenderer {
    // URL that will point to an Express instance
    public host: string;

    // Options
    private options = {
        port: 4000,
        pathParams: {
            workingDir: '',
            distSubDir: '',
        }
    };

    /*
     * Don't call constructor without initializing after!
     * Usage: const renderer = await new PuppetRenderer(4000).initialize();
     */
    constructor(port: number, private server: Server, private browser: puppeteer.Browser, private page: puppeteer.Page) {
      this.host = `http://localhost:${port}`;

      this.options.pathParams.workingDir = process.cwd();
      this.options.pathParams.workingDir = 'dist';
      this.options.port = port;
    }

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
        await this.page.goto(`${this.host}/${route}`);

        // Get the html content after rendering in Chromium
        // Replace the HTML doctype, which outerHTML drops
        const result = await this.page.evaluate(
            "new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML"
        );

        // Define the file path for the rendered html snapshot
        const file = join(this.options.pathParams.workingDir,
                            this.options.pathParams.distSubDir,
                            (route || 'index') + '.html');
        const dir = dirname(file);

        // If the directory is missing, create it
        if (!(await exists(dir))) {
            await mkdir(dir);
        }

        // Write the rendered html file
        await writeFile(file, result);
        console.log(`Rendered & wrote ${file}`);

        // Return the page HTML
        return result;
    }

}

export async function createPuppetRenderer(): Promise<PuppetRenderer> {

    const port = 4000;

    const options = {
        port: port,
        host: `http://localhost:${port}`,
        pathParams: {
            workingDir: process.cwd(),
            distSubDir: 'dist'
        }
    }

    const server = await initializeExpress(options);

    // Launch Puppeteer.
    // This needs to be an instance so we can close it when we're done.
    const browser = await puppeteer.launch();
    console.log(`Started headless Chromium with Puppeteer!`);

    // Create a new Page.
    // This needs to be an instance so we can render pages with it elsewhere
    const page = await browser.newPage();
    console.log(`Puppeteer page ready to render.`);

    return new PuppetRenderer(options.port, server, browser, page);
}

/*
* Fires up an Express.js server to serve the page while Puppeteer
* is rendering it.
*/
async function initializeExpress(options: any) {
    const index = (await readFile(join(options.pathParams.workingDir,
                                        options.pathParams.distSubDir,
                                        'index.html'))).toString();

    // Serve static files from disk & index.html from memory
    const app = express();
    app.get('*.*', express.static(join(options.pathParams.workingDir,
                                        options.pathParams.distSubDir)));
    app.get('*', (req: express.Request, res: express.Response) => res.send(index));

    // Start the express server
    const server = await (new Promise<Server>((resolve, reject) => {
        const s = app.listen(options.port, (err: string) => err ? reject(err) : resolve(s));
    }));

    console.log(`Express now serving app at ${options.host}!`);

    return server;
}

function parseForRoutes(page: string): string[] {
    const hrefRegex = /href="\/[\/\w\d\-]*"/g;
    const routeRegex = /\/([\/\w\d\-]*)/;

    const hrefMatches = page.match(hrefRegex);

    if (hrefMatches) {
        const pathMatches = hrefMatches.map((href: string) => href.match(routeRegex));

        if (pathMatches) {
            return pathMatches.map((pathMatch: RegExpMatchArray | null) => {
                if (pathMatch) {
                    return pathMatch[1];
                } else {
                    return '';
                }
            });
        }
    }

    return [''];
}

/*
* Fires up a Puppeteer instance to render the page with headless Chromium
*
async function initializePuppeteer(): Promise<{Browser, Page}> {
    // Launch Puppeteer.
    // This needs to be an instance so we can close it when we're done.
    const browser = await puppeteer.launch();
    console.log(`Started headless Chromium with Puppeteer!`);

    // Create a new Page.
    // This needs to be an instance so we can render pages with it elsewhere
    const page = await browser.newPage();
    console.log(`Puppeteer page ready to render.`);

    return { 'browser': browser, 'page': page};
}
*/
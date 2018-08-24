import providePuppeteer from '../inject/puppeteer.provider';
import provideExpress from '../inject/express.provider';

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

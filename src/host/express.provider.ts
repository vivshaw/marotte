import express from 'express';
import { Server } from 'http';
import { join } from 'path';

import { Logger } from '../logger/logger.service';
import { IOptions } from '../types';
import IO from '../util/io.util';

/*
* Fires up an Express.js server to serve the page while Puppeteer
* is rendering it.
*/
export default async function provideExpress(options: IOptions, logger: Logger): Promise<Server> {
  const appRoot = join(options.pathParams.workingDir, options.pathParams.distSubDir);
  const index = await IO.readAsString(join(appRoot, 'index.html'));

  // Serve static files from disk & index.html from memory
  const app = express();
  app.get('*.*', express.static(appRoot));
  app.get('*', (req: express.Request, res: express.Response) => res.send(index));

  // Start the express server
  const server = await new Promise<Server>((resolve, reject) => {
    const s = app.listen(options.port, (err: string) => (err ? reject(err) : resolve(s)));
  });

  logger.setup(`Express now serving app at ${options.host}!`);

  return server;
}

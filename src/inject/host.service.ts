import express from 'express';
import { Server } from 'http';
import { inject, injectable } from 'inversify';
import { join } from 'path';

import { TAG, TYPES } from '.';
import IO from '../util/io.util';
import { IOptions } from './../renderer/index';

/*
* Fires up an Express.js server to serve the page while Puppeteer
* is rendering it.
*/
export default async function provideServer(options: IOptions): Promise<Server> {
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

  console.log(TAG, `Express now serving app at ${options.host}!`);

  return server;
}

@injectable()
export class HostService {
  Ready: Promise<Server>;

  constructor(@inject(TYPES.Options) private options: IOptions) {
    this.Ready = provideServer(options);
  }

  public async onClose() {
    this.Ready.then(server => server.close());
  }
}

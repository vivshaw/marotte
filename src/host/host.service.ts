import { Server } from 'http';
import { inject, injectable } from 'inversify';

import { Provider, TYPES } from '../types';

@injectable()
export class HostService {
  Ready: Promise<Server>;

  constructor(@inject(TYPES.ServerProvider) serverProvider: Provider<Server>) {
    this.Ready = serverProvider();
  }

  public async onClose() {
    this.Ready.then(server => server.close());
  }
}

import { Server } from 'http';
import { inject, injectable } from 'inversify';

import { ICloseable, IReadiable, Provider, TYPES } from '../types';

@injectable()
export class HostService implements ICloseable, IReadiable {
  Ready: Promise<Server>;

  constructor(@inject(TYPES.ServerProvider) serverProvider: Provider<Server>) {
    this.Ready = serverProvider();
  }

  public async onClose() {
    this.Ready.then(server => server.close());
  }
}

import { Container } from 'inversify';

import { BrowserService } from './browser/browser.service';
import { HostService } from './host/host.service';
import { Renderer } from './renderer/renderer';
import { IOptions, TYPES } from './types';

class CloseableContainer extends Container {
  async ready(): Promise<void> {}
  close() {}
}

function context(options: IOptions) {
  const container = new CloseableContainer();

  container.bind<IOptions>(TYPES.Options).toConstantValue(options);
  container
    .bind<HostService>(HostService)
    .toSelf()
    .inSingletonScope();
  container
    .bind<BrowserService>(BrowserService)
    .toSelf()
    .inSingletonScope();
  container
    .bind<Renderer>(Renderer)
    .toSelf()
    .inSingletonScope();

  container.ready = async function() {
    await this.get(HostService).Ready;
  };

  container.close = function() {
    this.get(BrowserService).onClose();
    this.get(HostService).onClose();
  };

  return container;
}

export { context };

import { Container } from 'inversify';

import { TYPES } from './inject';
import { BrowserService } from './inject/browser.service';
import { HostService } from './inject/host.service';
import { IOptions } from './renderer/index';
import { Renderer } from './renderer/puppet-renderer';

function context(options: IOptions) {
  const container = new Container();

  container.bind<IOptions>(TYPES.Options).toConstantValue(options);
  container.bind<HostService>(TYPES.HostService).to(HostService);
  container.bind<BrowserService>(TYPES.BrowserService).to(BrowserService);
  container.bind<Renderer>(TYPES.Renderer).to(Renderer);

  return container;
}

export { context };

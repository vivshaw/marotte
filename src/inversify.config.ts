import { Server } from 'https';
import { Container } from 'inversify';
import { Browser } from 'puppeteer';

import { BrowserService } from './browser/browser.service';
import providePuppeteer from './browser/puppeteer.provider';
import provideExpress from './host/express.provider';
import { HostService } from './host/host.service';
import { Logger } from './logger/logger.service';
import { Renderer } from './renderer/renderer';
import { IOptions, TYPES } from './types';

type TsClass = new (...args: any[]) => any;
type InjectIdentifier = TsClass | symbol;

type Func = (...args: any[]) => any;

export type Provider<T> = (...args: any[]) => Promise<T>;

class CloseableContainer extends Container {
  async ready(): Promise<void> {}
  close() {}

  bindDependencies(func: Func, dependencies: InjectIdentifier[]) {
    const injections = dependencies.map((dependency: InjectIdentifier) => this.get(dependency));
    return func.bind(func, ...injections);
  }
}

function context(options: IOptions) {
  // Create extended container with lifecycle management hooks
  const container = new CloseableContainer();

  // Bind classes & values
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
  container
    .bind<Logger>(Logger)
    .toSelf()
    .inSingletonScope();

  // Bind providers
  const serverProvider = container.bindDependencies(provideExpress, [TYPES.Options, Logger]);
  const browserProvider = container.bindDependencies(providePuppeteer, [Logger]);

  container.bind<Provider<Server>>(TYPES.ServerProvider).toProvider<Server>(() => serverProvider);

  container.bind<Provider<Browser>>(TYPES.BrowserProvider).toProvider<Browser>(() => browserProvider);

  // Implement container lifecycle hooks
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

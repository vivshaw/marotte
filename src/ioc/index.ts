import { Server } from 'https';
import { Browser } from 'puppeteer';

import LifecycleContainer from './lifecycle-container';

import { BrowserService } from '../browser/browser.service';
import providePuppeteer from '../browser/puppeteer.provider';
import provideExpress from '../host/express.provider';
import { HostService } from '../host/host.service';
import { Logger } from '../logger/logger.service';
import { Renderer } from '../renderer/renderer';
import { IOptions, Provider, TYPES } from '../types';

/*
 * Bind classes & values to our container
 */
function bindings(container: LifecycleContainer, options: IOptions) {
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
}

/*
 * Bind providers to container
 */
function providers(container: LifecycleContainer) {
  const serverProvider = container.bindDependencies(provideExpress, [TYPES.Options, Logger]);
  const browserProvider = container.bindDependencies(providePuppeteer, [Logger]);

  container.bind<Provider<Server>>(TYPES.ServerProvider).toProvider<Server>(() => serverProvider);

  container.bind<Provider<Browser>>(TYPES.BrowserProvider).toProvider<Browser>(() => browserProvider);
}

/*
 * Create an application context, passing it the CLI options we get
 */
function context(options: IOptions) {
  // Create extended container with lifecycle management hooks
  const container = new LifecycleContainer();

  // Do bindings
  bindings(container, options);
  providers(container);

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

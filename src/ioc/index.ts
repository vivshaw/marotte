import { Server } from 'https';
import { Browser } from 'puppeteer';

import LifecycleContainer from './lifecycle-container';

import { BrowserService } from '../browser/browser.service';
import providePuppeteer from '../browser/puppeteer.provider';
import provideExpress from '../host/express.provider';
import { HostService } from '../host/host.service';
import { Logger } from '../logger/logger.service';

import { IOptions, Provider, TYPES } from '../types';

/*
 * Create an application context, passing it the CLI options we get
 */
function context(options: IOptions) {
  // Create extended container with lifecycle management hooks
  const container = new LifecycleContainer({
    containerOptions: {
      defaultScope: 'Singleton',
      autoBindInjectable: true,
    },
    preReady: [HostService],
    onClose: [BrowserService, HostService],
  });

  // Do bindings for values and providers.
  // (Bindings for classes are automatic due to autoBindInjectable)
  values(container, options);
  providers(container);

  return container;
}

export { context };

/*
 * Bind static values to our container
 */
function values(container: LifecycleContainer, options: IOptions) {
  container.bind<IOptions>(TYPES.Options).toConstantValue(options);
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

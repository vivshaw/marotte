import { Container } from 'inversify';

import { Func, InjectIdentifier } from '../types';

/*
 * An extended Container that can inject into functions,
 * and that manages components via lifecycle hooks
 */
export default class LifecycleContainer extends Container {
  async ready(): Promise<void> {}
  close() {}

  bindDependencies(func: Func, dependencies: InjectIdentifier[]) {
    const injections = dependencies.map((dependency: InjectIdentifier) => this.get(dependency));
    return func.bind(func, ...injections);
  }
}

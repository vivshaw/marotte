import { Container } from 'inversify';

import { Func, InjectIdentifier } from '../types';

/*
 * An extended Container that can inject into functions,
 * and that manages components via lifecycle hooks
 */
export default class LifecycleContainer extends Container {
  preReady?: InjectIdentifier[];
  onClose?: InjectIdentifier[];

  async ready(): Promise<LifecycleContainer> {
    if (this.preReady) {
      await Promise.all(this.preReady.map(component => this.get(component).Ready));
    }

    return this;
  }

  close() {
    if (this.onClose) {
      for (const component of this.onClose) {
        this.get(component).onClose();
      }
    }
  }

  bindDependencies(func: Func, dependencies: InjectIdentifier[]) {
    const injections = dependencies.map((dependency: InjectIdentifier) => this.get(dependency));
    return func.bind(func, ...injections);
  }
}

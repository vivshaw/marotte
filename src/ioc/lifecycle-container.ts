import { Container } from 'inversify';

import { Func, ICloseable, InjectIdentifier, IReadiable } from '../types';

/*
 * An extended Container that can inject into functions,
 * and that manages components via lifecycle hooks
 */
export default class LifecycleContainer extends Container {
  preReady?: IReadiable[];
  onClose?: ICloseable[];

  async ready(): Promise<LifecycleContainer> {
    if (this.preReady) {
      await Promise.all(this.preReady.map(component => component.Ready));
    }

    return this;
  }

  close() {
    if (this.onClose) {
      for (const component of this.onClose) {
        component.onClose();
      }
    }
  }

  bindDependencies(func: Func, dependencies: InjectIdentifier[]) {
    const injections = dependencies.map((dependency: InjectIdentifier) => this.get(dependency));
    return func.bind(func, ...injections);
  }
}

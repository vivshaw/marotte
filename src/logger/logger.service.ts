import { inject, injectable } from 'inversify';

import { IOptions, TYPES } from '../types';

import chalk from 'chalk';

const COLORS = {
  setup: chalk.blue,
  run: chalk.green,
  complete: chalk.white.bold,
};

@injectable()
export class Logger {
  constructor(@inject(TYPES.Options) private options: IOptions) {}

  setup(msg: string) {
    console.log(this.options.verbose);

    if (this.options.verbose) {
      console.log(COLORS.setup('SETUP: '), msg);
    }
  }

  run(msg: string) {
    if (this.options.verbose) {
      console.log(COLORS.run('-> '), msg);
    }
  }

  complete(msg: string) {
    if (this.options.verbose) {
      console.log(COLORS.complete(msg));
    }
  }
}

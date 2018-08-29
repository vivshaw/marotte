#!/usr/bin/env node

import chalk from 'chalk';
import program from 'commander';
import cosmiconfig from 'cosmiconfig';
import { defaults } from 'lodash';
import 'reflect-metadata';

import { version } from '../package.json';
import { context } from './ioc';
import { Renderer } from './renderer/renderer';
import { IArgsType, IOptions, IOptionsFragment } from './types';

// Set some defaults for our options
const DEFAULT_PORT = 4321;

export const DEFAULT_OPTIONS: IOptions = {
  port: DEFAULT_PORT,
  host: `http://localhost:${DEFAULT_PORT}`,
  pathParams: {
    workingDir: process.cwd(),
    distSubDir: 'dist',
  },
  verbose: true,
};

// Convert our node args to an options object like our components expect
function argsToOptions(args: IArgsType): IOptionsFragment {
  return {
    port: args.port,
    host: `http://localhost:${args.port}`,
    pathParams: {
      workingDir: args.workingdir || process.cwd(),
      distSubDir: args.dist || 'dist',
    },
    verbose: true,
  };
}

/*
 * Initialize the necessary services with Inversify DI,
 * then prerender the app
 */
async function render(args: IArgsType) {
  // Assign options from args, using defaults for what's left
  const argOptions = argsToOptions(args);
  const options: IOptions = defaults(argOptions, DEFAULT_OPTIONS);

  // Open context & wait for async services to be ready
  const ctx = context(options);
  await ctx.ready();

  // Run the prerender loop that crawls the page & spits out HTML snapshots
  const renderer = ctx.get<Renderer>(Renderer);
  await renderer.run();

  // Clean up Puppeteer & Express processes
  ctx.close();
}

/*
 * Initiate marotte with our CLI interface!
 */
const marotte = program.version(version);

marotte
  .command('render')
  .alias('r')
  .description('Statically prerender the application')
  .option('-w, --workingdir [dir]', 'Working directory for project [processs.cwd()]')
  .option('-d, --dist [dir]', 'Distribution subdirectory for project [./dist]')
  .option('-p, --port [port]', 'Port to host Express on [4000]')
  .action((args: IArgsType) => {
    render(args)
      .then(() => console.log(chalk.bold.white('Static prerendering complete!')))
      .catch(err => {
        console.error('Err', err);
        process.exit(1);
      });
  });

marotte.parse(process.argv);

if (marotte.args.length === 0) {
  marotte.help();
}

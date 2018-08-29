#!/usr/bin/env node

import chalk from 'chalk';
import program from 'commander';
import cosmiconfig, { CosmiconfigResult } from 'cosmiconfig';
import { assignWith, isUndefined, partialRight } from 'lodash';
import 'reflect-metadata';

import { context } from './ioc';
import { Renderer } from './renderer/renderer';
import { IArgsType, IOptions, IOptionsFragment } from './types';

// Set some defaults for our options
const DEFAULT_PORT = 4321;

const DEFAULT_OPTIONS: IOptions = {
  port: DEFAULT_PORT,
  host: `http://localhost:${DEFAULT_PORT}`,
  workingDir: process.cwd(),
  distSubDir: 'dist',
  verbose: true,
};

const overwriteIfUndefined = (a: any, b: any) => (isUndefined(b) ? a : b);
const takeDefaults = partialRight(assignWith, overwriteIfUndefined);

// Convert our node args to an options object like our components expect
function argsToOptions(args: IArgsType): IOptionsFragment {
  return {
    port: args.port,
    host: args.port ? `http://localhost:${args.port}` : undefined,
    workingDir: args.workingdir,
    distSubDir: args.dist,
    verbose: args.verbose,
  };
}

async function findConfig(): Promise<any> {
  const explorer = cosmiconfig('marotte');
  const result: CosmiconfigResult = await explorer.search();
  if (result) {
    if (result.isEmpty) {
      console.log('Config file was empty!');
    } else {
      return result.config;
    }
  }
}

/*
 * Initialize the necessary services with Inversify DI,
 * then prerender the app
 */
async function render(args: IArgsType) {
  // Assign options from args, using defaults for what's left.
  // config and args override defaults, args override config.
  const argOptions = argsToOptions(args);
  const configOptions = await findConfig();
  const options: IOptions = takeDefaults({}, DEFAULT_OPTIONS, configOptions, argOptions);

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
const marotte = program.version('0.0.4');

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

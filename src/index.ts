#!/usr/bin/env node

import chalk from 'chalk';
import program from 'commander';
import 'reflect-metadata';

import { version } from '../package.json';
import { context } from './ioc';
import { Renderer } from './renderer/renderer';
import { IArgsType, IOptions } from './types';
/*
 * Initialize the necessary services with Inversify DI,
 * then prerender the app
 */
async function render(args: IArgsType) {
  const DEFAULT_PORT = 4321;

  const options: IOptions = {
    port: args.port || DEFAULT_PORT,
    host: `http://localhost:${args.port || DEFAULT_PORT}`,
    pathParams: {
      workingDir: args.workingdir || process.cwd(),
      distSubDir: args.dist || 'dist',
    },
    verbose: true,
  };

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

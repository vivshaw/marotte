#!/usr/bin/env node

import program from 'commander';

import { createPuppetRenderer } from './renderer/puppet-renderer.provider';
import colors from './util/colors.util';

// Defining some configuration
const PORT = 4000;
const format = colors.COMPLETE;

async function render() {
  // Create & initialize renderer
  const renderer = await createPuppetRenderer(PORT);

  // Run the prerender loop that crawls the page & spits out HTML snapshots
  await renderer.run();

  // Clean up Puppeteer & Express processes
  renderer.cleanup();
}

program
  .command('render')
  .alias('r')
  .description('Statically prerender the application')
  .action(() => {
    render()
      .then(() => console.log(format('Static prerendering complete!')))
      .catch(err => {
        console.error('Err', err);
        process.exit(1);
      });
  });

program.parse(process.argv);

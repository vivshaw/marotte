import { createPuppetRenderer } from './puppet-renderer';

// Defining some configuration
const PORT = 4000;

async function render() {
  // Create & initialize renderer
  const renderer = await createPuppetRenderer();

  // Run the prerender loop that crawls the page & spits out HTML snapshots
  await renderer.run();

  // Clean up Puppeteer & Express processes
  renderer.cleanup();
}

// Run the renderer
render()
  .then(() => console.log('Static prerendering complete!'))
  .catch(err => {
    console.error('Err', err);
    process.exit(1);
  });

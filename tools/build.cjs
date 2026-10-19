const fs = require('node:fs');
const path = require('node:path');

async function build() {
  // Remove old project pages when a previously published project becomes a draft.
  fs.rmSync(path.resolve(__dirname, '../_site'), { recursive: true, force: true });
  const Eleventy = (await import('@11ty/eleventy')).default;
  await new Eleventy().write();
}

build().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

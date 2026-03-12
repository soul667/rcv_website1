const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const slidesDir = path.join(repoRoot, 'public', 'assets', 'media', 'home_slides');

function listSlides() {
  if (!fs.existsSync(slidesDir)) {
    throw new Error(`Slides directory not found: ${slidesDir}`);
  }
  return fs
    .readdirSync(slidesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'))
    .sort();
}

function buildSnippet(files) {
  const items = files.map(
    (file) =>
      `  { image: getAssetUrl('media/home_slides/${file}'), alt: '${file.replace(/\.[^.]+$/, '')}' }`
  );
  return `slides: [\n${items.join(',\n')}\n]`;
}

function run() {
  const files = listSlides();
  const snippet = buildSnippet(files);
  console.log('Paste into src/utils/config.ts hero or team carousel config:');
  console.log(snippet);
}

if (require.main === module) {
  try {
    run();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

module.exports = { run };

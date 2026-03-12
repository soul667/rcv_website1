const fs = require('fs');
const path = require('path');
const { syncIndex } = require('../scripts/sync_publications_index');

const repoRoot = path.join(__dirname, '..');
const publicationsDir = path.join(repoRoot, 'public', 'content', 'publication');
const indexPath = path.join(repoRoot, 'public', 'assets', 'data', 'publications.json');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function listDirs() {
  return fs
    .readdirSync(publicationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'))
    .sort();
}

function validateIndex() {
  const currentDirs = listDirs();
  syncIndex();
  assert(fs.existsSync(indexPath), 'publications.json was not generated');
  const parsed = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const list = Array.isArray(parsed.publications) ? parsed.publications.sort() : [];
  assert(list.length === currentDirs.length, 'Index count does not match directories count');
  currentDirs.forEach((dir) => {
    assert(list.includes(dir), `Index missing folder ${dir}`);
  });
}

try {
  validateIndex();
  console.log('Publication index validation passed.');
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}

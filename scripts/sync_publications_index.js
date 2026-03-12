const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const publicationsDir = path.join(repoRoot, 'public', 'content', 'publication');
const outputPath = path.join(repoRoot, 'public', 'assets', 'data', 'publications.json');

function listPublicationFolders() {
  if (!fs.existsSync(publicationsDir)) {
    throw new Error(`Publications directory not found: ${publicationsDir}`);
  }

  return fs
    .readdirSync(publicationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'))
    .sort();
}

function syncIndex() {
  const folders = listPublicationFolders();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        publications: folders
      },
      null,
      2
    ),
    'utf8'
  );

  return folders;
}

if (require.main === module) {
  try {
    const list = syncIndex();
    console.log(`Synced publications.json with ${list.length} entries.`);
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

module.exports = { syncIndex };

const { syncAuthorsIndex } = require('./memberTools');

try {
  const authors = syncAuthorsIndex();
  console.log(`Synced authors.json with ${authors.length} author entries.`);
} catch (err) {
  console.error('Failed to sync authors index:', err);
  process.exit(1);
}

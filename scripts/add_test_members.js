const { addTestMembers } = require('./memberTools');

try {
  const created = addTestMembers();
  console.log(`Added/updated ${created.length} test members and refreshed authors.json.`);
} catch (err) {
  console.error('Failed to add test members:', err);
  process.exit(1);
}

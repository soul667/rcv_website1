const { removeTestMembers } = require('./memberTools');

try {
  removeTestMembers();
  console.log('Removed test members and refreshed authors.json.');
} catch (err) {
  console.error('Failed to remove test members:', err);
  process.exit(1);
}

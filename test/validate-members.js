const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { loadTestMembersData } = require('../scripts/memberTools');

const repoRoot = path.join(__dirname, '..');
const authorsDir = path.join(repoRoot, 'public', 'content', 'authors');
const authorsIndexPath = path.join(repoRoot, 'public', 'assets', 'data', 'authors.json');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadAuthorsIndex() {
  assert(fs.existsSync(authorsIndexPath), 'authors.json is missing. Run scripts/sync_authors_index.js.');
  const raw = fs.readFileSync(authorsIndexPath, 'utf8');
  const parsed = JSON.parse(raw);
  const list = Array.isArray(parsed.authors) ? parsed.authors : Array.isArray(parsed) ? parsed : [];
  const ids = list
    .map((entry) => (typeof entry === 'string' ? entry : entry.id))
    .filter(Boolean);
  return { ids, raw: parsed };
}

function validateTestMembers() {
  const testMembers = loadTestMembersData();
  const { ids } = loadAuthorsIndex();

  testMembers.forEach((member) => {
    const mdPath = path.join(authorsDir, member.id, '_index.md');
    const avatarPath = path.join(authorsDir, member.id, 'avatar.png');

    assert(ids.includes(member.id), `authors.json does not include ${member.id}`);
    assert(fs.existsSync(mdPath), `Missing markdown for ${member.id}`);
    assert(fs.existsSync(avatarPath), `Missing avatar for ${member.id}`);

    const parsed = matter.read(mdPath);
    assert(parsed.data.title === member.name, `Title mismatch for ${member.id}`);
    assert(
      Array.isArray(parsed.data.user_groups) && parsed.data.user_groups.includes(member.user_groups[0]),
      `User group missing for ${member.id}`
    );
    assert(parsed.data.role, `Role missing for ${member.id}`);
  });
}

try {
  validateTestMembers();
  console.log('Member data validation passed.');
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}

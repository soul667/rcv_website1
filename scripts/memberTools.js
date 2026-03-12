const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const repoRoot = path.join(__dirname, '..');
const authorsDir = path.join(repoRoot, 'public', 'content', 'authors');
const defaultAvatar = path.join(repoRoot, 'public', 'assets', 'media', 'authors_research', 'default_avatar.png');
const authorsIndexPath = path.join(repoRoot, 'public', 'assets', 'data', 'authors.json');
const testDataPath = path.join(__dirname, 'test-members-data.json');

function loadTestMembersData() {
  if (!fs.existsSync(testDataPath)) {
    throw new Error(`Missing test member dataset at ${testDataPath}`);
  }
  const raw = fs.readFileSync(testDataPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Test member data must be an array');
  }
  return parsed;
}

function renderMemberMarkdown(member) {
  const {
    name,
    weight,
    role,
    user_groups = [],
    social = [],
    bio = '',
    research = [],
    publications = []
  } = member;

  const lines = ['---', `title: ${name}`];

  if (typeof weight === 'number') {
    lines.push(`weight: ${weight}`);
  }

  lines.push(`role: ${role}`);

  if (Array.isArray(social) && social.length > 0) {
    lines.push('social:');
    social.forEach((item) => {
      lines.push(`  - icon: ${item.icon}`);
      lines.push(`    icon_pack: ${item.icon_pack}`);
      lines.push(`    link: ${item.link}`);
    });
  }

  lines.push('user_groups:');
  user_groups.forEach((group) => {
    lines.push(`  - ${group}`);
  });

  lines.push('---', '### About Me', bio.trim(), '', '### Research');

  if (research.length > 0) {
    research.forEach((topic, index) => {
      lines.push(`${index + 1}. ${topic}`);
    });
  } else {
    lines.push('TBD');
  }

  lines.push('', '### Publications');

  if (publications.length > 0) {
    publications.forEach((pub) => lines.push(`- ${pub}`));
  } else {
    lines.push('- Upcoming work to be announced.');
  }

  lines.push('');

  return lines.join('\n');
}

function ensureAvatar(targetDir) {
  const avatarTarget = path.join(targetDir, 'avatar.png');
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(defaultAvatar, avatarTarget);
  return avatarTarget;
}

function writeMember(member) {
  const memberDir = path.join(authorsDir, member.id);
  fs.mkdirSync(memberDir, { recursive: true });
  const markdown = renderMemberMarkdown(member);
  fs.writeFileSync(path.join(memberDir, '_index.md'), markdown, 'utf8');
  ensureAvatar(memberDir);
  return memberDir;
}

function addTestMembers() {
  const data = loadTestMembersData();
  const results = [];

  data.forEach((member) => {
    const memberDir = writeMember(member);
    results.push(memberDir);
  });

  syncAuthorsIndex();
  return results;
}

function removeTestMembers() {
  const data = loadTestMembersData();
  data.forEach((member) => {
    const memberDir = path.join(authorsDir, member.id);
    if (fs.existsSync(memberDir)) {
      fs.rmSync(memberDir, { recursive: true, force: true });
    }
  });
  syncAuthorsIndex();
}

function syncAuthorsIndex() {
  const entries = fs.readdirSync(authorsDir, { withFileTypes: true });
  const authors = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const authorId = entry.name;
      const indexPath = path.join(authorsDir, authorId, '_index.md');
      let weight = 999;

      if (fs.existsSync(indexPath)) {
        try {
          const parsed = matter.read(indexPath);
          if (typeof parsed.data.weight === 'number') {
            weight = parsed.data.weight;
          }
        } catch (err) {
          console.warn(`Failed to read weight for ${authorId}:`, err.message);
        }
      }

      return { id: authorId, weight };
    })
    .sort((a, b) => a.weight - b.weight);

  fs.mkdirSync(path.dirname(authorsIndexPath), { recursive: true });
  fs.writeFileSync(
    authorsIndexPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        authors
      },
      null,
      2
    ),
    'utf8'
  );

  return authors;
}

module.exports = {
  addTestMembers,
  removeTestMembers,
  syncAuthorsIndex,
  loadTestMembersData,
  renderMemberMarkdown
};

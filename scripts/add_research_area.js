const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const researchRoot = path.join(repoRoot, 'public', 'content', 'research');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
}

function loadInput(jsonPath) {
  const resolved = jsonPath || path.join(__dirname, 'sample-research-area.json');
  if (!fs.existsSync(resolved)) {
    throw new Error(`Cannot find input JSON: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf8');
  return JSON.parse(raw);
}

function copyImageIfNeeded(data, folderPath) {
  if (!data.image_src) return data.image;
  const sourcePath = path.isAbsolute(data.image_src)
    ? data.image_src
    : path.join(repoRoot, data.image_src);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Image not found at ${sourcePath}`);
  }
  const fileName = path.basename(sourcePath);
  const targetPath = path.join(folderPath, fileName);
  fs.copyFileSync(sourcePath, targetPath);
  return `/content/research/${path.basename(folderPath)}/${fileName}`;
}

function buildToml(data, imagePath) {
  const lines = [];
  lines.push('[meta]');
  lines.push(`title = "${data.title}"`);
  lines.push(`title_zh = "${data.title_zh}"`);
  lines.push(`weight = ${data.weight || 0}`);
  lines.push(`image = "${imagePath || data.image || ''}"`);
  lines.push(`color = "${data.color || '#4F8EF7'}"`);
  lines.push('');
  lines.push('[description]');
  lines.push(`en = "${(data.description?.en || '').replace(/"/g, '\\"')}"`);
  lines.push(`zh = "${(data.description?.zh || '').replace(/"/g, '\\"')}"`);
  lines.push('');

  (data.keywords || []).forEach((k) => {
    lines.push('[[keywords]]');
    lines.push(`en = "${k.en}"`);
    lines.push(`zh = "${k.zh}"`);
    lines.push('');
  });

  (data.members || []).forEach((m) => {
    lines.push('[[members]]');
    lines.push(`name = "${m.name}"`);
    lines.push(`slug = "${m.slug}"`);
    lines.push(`topic = "${m.topic}"`);
    lines.push(`topic_zh = "${m.topic_zh}"`);
    lines.push('');
  });

  return lines.join('\n');
}

function writeResearchArea(folderName, tomlContent) {
  const targetDir = path.join(researchRoot, folderName);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetFile = path.join(targetDir, 'index.toml');
  fs.writeFileSync(targetFile, tomlContent, 'utf8');
  return targetFile;
}

function run() {
  const inputPath = process.argv[2];
  const data = loadInput(inputPath);
  const folderName = data.folder ? slugify(data.folder) : slugify(data.title);
  if (!folderName) {
    throw new Error('Cannot determine folder slug. Provide a title or folder.');
  }

  const targetFolderPath = path.join(researchRoot, folderName);
  const imagePath = copyImageIfNeeded(data, targetFolderPath);
  const toml = buildToml(data, imagePath);
  const filePath = writeResearchArea(folderName, toml);
  console.log(`Created/updated research area at ${filePath}`);
  if (imagePath && data.image_src) {
    console.log(`Copied image to ${imagePath}`);
  }
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

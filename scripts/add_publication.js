const fs = require('fs');
const path = require('path');
const { syncIndex } = require('./sync_publications_index');
const { stringify } = require('yaml');

const repoRoot = path.join(__dirname, '..');
const publicationsDir = path.join(repoRoot, 'public', 'content', 'publication');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
}

function loadInput(jsonPath) {
  const resolved = jsonPath || path.join(__dirname, 'sample-publication.json');
  if (!fs.existsSync(resolved)) {
    throw new Error(`Cannot find input JSON: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf8');
  return JSON.parse(raw);
}

function mapTypeToCode(type) {
  const normalized = (type || '').toString().toLowerCase();
  if (normalized.startsWith('journal')) return '2';
  if (normalized.startsWith('preprint') || normalized.startsWith('arxiv')) return '3';
  return '1'; // default conference
}

function buildYaml(data) {
  const nowIso = new Date().toISOString();
  const record = {
    title: data.title,
    authors: data.authors || [],
    date: data.date || nowIso.slice(0, 10),
    publishDate: nowIso,
    publication_types: [mapTypeToCode(data.type)],
    publication: data.venue || '',
    abstract: data.abstract || '',
    doi: data.doi || undefined,
    url_pdf: data.url || undefined,
    tags: data.tags && data.tags.length ? data.tags : undefined,
    featured: Boolean(data.featured)
  };
  return stringify(record, { version: '1.2' });
}

function writePublication(folderName, yamlContent) {
  const targetDir = path.join(publicationsDir, folderName);
  fs.mkdirSync(targetDir, { recursive: true });
  const targetFile = path.join(targetDir, 'index.yaml');

  if (fs.existsSync(targetFile)) {
    console.warn(`index.yaml already exists for ${folderName}, it will be overwritten.`);
  }

  fs.writeFileSync(targetFile, yamlContent, 'utf8');
  return targetFile;
}

function run() {
  const inputPath = process.argv[2];
  const data = loadInput(inputPath);
  const folder = data.id ? slugify(data.id) : slugify(data.title);

  if (!folder) {
    throw new Error('Cannot determine folder slug. Provide a title or id.');
  }

  const yaml = buildYaml(data);
  const filePath = writePublication(folder, yaml);
  const updated = syncIndex();

  console.log(`Created/updated publication at ${filePath}`);
  console.log(`Publications index now tracks ${updated.length} entries.`);
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

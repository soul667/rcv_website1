const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const yaml = require('yaml');

const pubDir = path.join(__dirname, '..', 'public/content/publication');

function traverseAndConvert(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += traverseAndConvert(path.join(dir, entry.name));
    } else if (entry.name === 'index.md') {
      const filePath = path.join(dir, entry.name);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const parsed = matter(fileContent);

        // Remove html/markdown body since user said it's explicitly not needed
        const yamlData = parsed.data;

        const yamlPath = path.join(dir, 'index.yaml');
        fs.writeFileSync(yamlPath, yaml.stringify(yamlData));
        
        // Remove the original index.md
        fs.unlinkSync(filePath);
        console.log(`Converted: ${dir}/index.yaml`);
        count++;
      } catch (err) {
        console.error(`Failed to process ${filePath}:`, err);
      }
    }
  }
  return count;
}

try {
  const convertedCount = traverseAndConvert(pubDir);
  console.log(`Successfully converted ${convertedCount} markdown files to YAML.`);
} catch (e) {
  console.error("Error during traversal:", e);
}

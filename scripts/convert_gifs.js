const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  require.resolve('fluent-ffmpeg');
  require.resolve('@ffmpeg-installer/ffmpeg');
} catch (e) {
  console.log("Installing fluent-ffmpeg and @ffmpeg-installer/ffmpeg...");
  execSync('npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg --no-save', { stdio: 'inherit' });
}

const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const PUBLIC_DIR = path.resolve(__dirname, '../public');
const CONTENT_DIR = path.resolve(__dirname, '../public/content');
const AUTHORS_DIR = path.resolve(__dirname, '../public/content/authors');
const RESEARCH_DIR = path.resolve(__dirname, '../public/content/research');

// Search for any .gif files > 2MB
async function walkDirForGifs(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(await walkDirForGifs(fullPath));
    } else if (stat.isFile() && fullPath.toLowerCase().endsWith('.gif') && stat.size > 2 * 1024 * 1024) {
      results.push(fullPath);
    }
  }
  return results;
}

function convertGifToMp4(gifPath) {
  return new Promise((resolve, reject) => {
    const mp4Path = gifPath.replace(/\.gif$/i, '.mp4');
    console.log(`Converting ${path.basename(gifPath)} -> ${path.basename(mp4Path)}...`);
    ffmpeg(gifPath)
      .outputOptions([
        '-movflags faststart',
        '-pix_fmt yuv420p',
        '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-profile:v baseline',
        '-level 3.0',
        '-b:v 1M', // Optimize bitrate
        '-maxrate 2M',
        '-bufsize 2M'
      ])
      .save(mp4Path)
      .on('end', () => {
        console.log(`✅ Converted ${path.basename(mp4Path)}`);
        resolve({ old: gifPath, new: mp4Path });
      })
      .on('error', (err) => {
        console.error(`❌ Failed to convert ${gifPath}: ${err.message}`);
        resolve(null);
      });
  });
}

function replaceTextInFile(filePath, searchParam, replacement) {
  if (fs.existsSync(filePath)) {
    const text = fs.readFileSync(filePath, 'utf8');
    const newText = text.replace(new RegExp(searchParam, 'gi'), replacement);
    if (text !== newText) {
      fs.writeFileSync(filePath, newText, 'utf8');
      console.log(`Updated references in ${path.relative(process.cwd(), filePath)}`);
    }
  }
}

async function run() {
  console.log("=== Finding Large GIFs over 2MB ===");
  const gifs = await walkDirForGifs(PUBLIC_DIR);
  if (gifs.length === 0) {
    console.log("No large GIFs found.");
    return;
  }
  
  console.log(`Found ${gifs.length} large GIFs.`);
  for (const gif of gifs) {
    const sizes = (fs.statSync(gif).size / 1024 / 1024).toFixed(2);
    console.log(`- ${path.relative(process.cwd(), gif)} (${sizes} MB)`);
    
    const result = await convertGifToMp4(gif);
    if (result) {
      const parentDir = path.dirname(result.old);
      const filename = path.basename(result.old);
      const newFilename = path.basename(result.new);
      
      // Attempt to patch possible text references in the same directory files
      const siblings = fs.readdirSync(parentDir);
      for (const sib of siblings) {
        if (sib.endsWith('.md') || sib.endsWith('.yaml') || sib.endsWith('.toml') || sib.endsWith('.json')) {
          replaceTextInFile(path.join(parentDir, sib), filename, newFilename);
        }
      }

      // Rename ORIGINAL gif to backup just in case
      fs.renameSync(result.old, result.old + '.bak');
    }
  }
  console.log("\n✅ Finished converting large GIFs to MP4!");
  console.log("⚠️ Original GIFs were renamed to .gif.bak in case you need them.");
}

run();

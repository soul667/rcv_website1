const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log("正在安装 sharp (图像处理库)......");
  execSync('npm install sharp --no-save', { stdio: 'inherit' });
  sharp = require('sharp');
}

const PUBLIC_DIR = path.resolve(__dirname, '../public');

// 定义不同目录的最大允许宽度
const PROFILES = [
  { match: /authors_research|authors/, maxWidth: 640 }, // 作者头像/组内研究缩略图
  { match: /home_slides/, maxWidth: 1920 },            // 首图轮播
  { match: /research/, maxWidth: 1200 },               // Research领域大图
  { match: /publication/, maxWidth: 1200 },            // 论文附图
];

function getMaxWidth(filePath) {
  for (const profile of PROFILES) {
    if (profile.match.test(filePath)) {
      return profile.maxWidth;
    }
  }
  return 1200; // 默认最大宽度
}

async function processImage(filePath) {
  const stat = fs.statSync(filePath);
  // 只处理大于 500KB 的文件，避免对小图进行不必要的压缩
  if (stat.size < 500 * 1024) return;

  const maxWidth = getMaxWidth(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const backupPath = filePath + '.bak';

  try {
    const originalSizeMB = (stat.size / (1024 * 1024)).toFixed(2);
    
    // 获取图像目前的尺寸
    const metadata = await sharp(filePath).metadata();
    
    let image = sharp(filePath);
    let resized = false;
    
    if (metadata.width && metadata.width > maxWidth) {
      image = image.resize(maxWidth, null, { withoutEnlargement: true });
      resized = true;
    }

    // 格式化输出保证压缩，上调 quality 为 90 以保留极高质量（肉眼无损）
    if (['.jpg', '.jpeg'].includes(ext)) {
      image = image.jpeg({ quality: 90, mozjpeg: true });
    } else if (ext === '.png') {
      // png最高无损压缩级别
      image = image.png({ compressionLevel: 9 });
    } else if (ext === '.webp') {
      image = image.webp({ quality: 90 });
    } else {
      return; // 忽略其他格式
    }

    // 转换到临时 Buffer，以便计算大小是否真的变小了
    const buffer = await image.toBuffer();
    
    if (buffer.length < stat.size) {
      fs.copyFileSync(filePath, backupPath); // 暂时备份原图
      fs.writeFileSync(filePath, buffer);
      
      const newSizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
      console.log(`✅ 已压缩 [${originalSizeMB} MB -> ${newSizeMB} MB]: ${path.relative(PUBLIC_DIR, filePath)}${resized ? ` (降采至 ${maxWidth}px)` : ''}`);
      
      fs.unlinkSync(backupPath); // 压缩成功，删除备份
    }

  } catch (err) {
    console.warn(`❌ 压缩失败 (跳过): ${path.relative(PUBLIC_DIR, filePath)}`, err.message);
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath); // 还原
      fs.unlinkSync(backupPath);
    }
  }
}

async function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await walkDir(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        await processImage(fullPath);
      }
    }
  }
}

console.log("=== 开始全站大体积图像画质优先的自动压缩 ===");
console.log("针对所有 > 500KB 的超大图像进行安全降采样和 Web 优化...\n");

walkDir(PUBLIC_DIR)
  .then(() => console.log("\n✅ 图像批量压缩完成！"))
  .catch(err => console.error("发生错误:", err));

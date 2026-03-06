import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * compress-assets.js
 * 
 * Compresses images for web use with responsive image support.
 * Gallery images are capped at 900px (max display ~600px).
 * Main section images get a full (1200px) and -sm (600px) variant for srcset.
 */

const QUALITY = 82;
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

const configs = [
  {
    dir: path.resolve(process.cwd(), 'src/assets'),
    maxWidth: 1200,
    // Also generate a smaller variant for srcset usage in responsive images
    smWidth: 600,
    // Skip logo and small images from sm generation
    smSkip: ['yirui_logo', 'yirui_cover'],
  },
  {
    dir: path.resolve(process.cwd(), 'src/assets/gallery'),
    maxWidth: 900,  // Gallery cards display at max 600px
    smWidth: 450,   // For mobile (phones show ~330–500px wide)
  },
];

let totalOriginalSize = 0;
let totalCompressedSize = 0;

async function compressImage(filePath, maxWidth, smWidth, smSkip = []) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) return;

  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const outputPath = path.join(dir, baseName + '.webp');
  const smOutputPath = smWidth ? path.join(dir, baseName + '-sm.webp') : null;

  const originalSize = fs.statSync(filePath).size;
  totalOriginalSize += originalSize;

  // Generate main WebP
  if (!fs.existsSync(outputPath)) {
    try {
      const image = sharp(filePath).rotate();
      const metadata = await image.metadata();
      let pipeline = image;
      if (metadata.width > maxWidth) {
        pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
      }
      await pipeline.webp({ quality: QUALITY }).toFile(outputPath);
      const compressedSize = fs.statSync(outputPath).size;
      totalCompressedSize += compressedSize;
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      const origMB = (originalSize / 1024 / 1024).toFixed(2);
      const compMB = (compressedSize / 1024 / 1024).toFixed(2);
      console.log(`✅ ${path.basename(outputPath)}: ${origMB}MB → ${compMB}MB (-${ratio}%)`);
    } catch (err) {
      console.error(`❌ Failed: ${filePath}`, err.message);
    }
  } else {
    totalCompressedSize += fs.statSync(outputPath).size;
    console.log(`⏭  Skipped (exists): ${path.basename(outputPath)}`);
  }

  // Generate -sm WebP if needed
  if (smWidth && smOutputPath && !smSkip.some(s => baseName.includes(s))) {
    if (!fs.existsSync(smOutputPath)) {
      try {
        await sharp(filePath)
          .rotate()
          .resize({ width: smWidth, withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(smOutputPath);
        console.log(`  ↪ generated sm: ${path.basename(smOutputPath)}`);
      } catch (err) {
        console.error(`❌ Failed sm: ${smOutputPath}`, err.message);
      }
    } else {
      console.log(`  ⏭  Skipped sm (exists): ${path.basename(smOutputPath)}`);
    }
  }
}

async function main() {
  console.log('🖼  Starting image compression...\n');

  for (const cfg of configs) {
    const files = fs.readdirSync(cfg.dir).filter(f => EXTENSIONS.includes(path.extname(f)));
    if (files.length === 0) continue;
    console.log(`\n📁 ${cfg.dir}`);
    for (const file of files) {
      await compressImage(path.join(cfg.dir, file), cfg.maxWidth, cfg.smWidth, cfg.smSkip);
    }
  }

  const savedMB = ((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(2);
  console.log(`\n📊 Summary:`);
  console.log(`   Original: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Compressed: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Saved: ${savedMB} MB`);
}

main();

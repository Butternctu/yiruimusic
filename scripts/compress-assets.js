import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * compress-assets.js
 * 
 * Batch compresses all images in src/assets/ and src/assets/gallery/
 * - Converts to WebP format for best compression
 * - Resizes to max 1920px width (preserving aspect ratio)
 * - Keeps original JPEG as backup with suffix _orig
 * 
 * Usage: node scripts/compress-assets.js
 */

const MAX_WIDTH = 1920;
const QUALITY = 82;

const dirs = [
  path.resolve(process.cwd(), 'src/assets'),
  path.resolve(process.cwd(), 'src/assets/gallery'),
];

const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

let totalOriginalSize = 0;
let totalCompressedSize = 0;

async function compressImage(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) return;

  const dir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const outputPath = path.join(dir, baseName + '.webp');

  // Skip if already processed
  if (fs.existsSync(outputPath)) {
    const existingSize = fs.statSync(outputPath).size;
    const origSize = fs.statSync(filePath).size;
    totalOriginalSize += origSize;
    totalCompressedSize += existingSize;
    console.log(`⏭  Skipped (already exists): ${path.basename(outputPath)}`);
    return;
  }

  const originalSize = fs.statSync(filePath).size;
  totalOriginalSize += originalSize;

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    let pipeline = image;
    if (metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    await pipeline
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const compressedSize = fs.statSync(outputPath).size;
    totalCompressedSize += compressedSize;

    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    const origMB = (originalSize / 1024 / 1024).toFixed(2);
    const compMB = (compressedSize / 1024 / 1024).toFixed(2);

    console.log(`✅ ${path.basename(filePath)}: ${origMB}MB → ${compMB}MB (-${ratio}%)`);
  } catch (err) {
    console.error(`❌ Failed: ${filePath}`, err.message);
  }
}

async function main() {
  console.log('🖼  Starting image compression...\n');

  for (const dir of dirs) {
    const files = fs.readdirSync(dir).filter(f => {
      const ext = path.extname(f);
      return EXTENSIONS.includes(ext);
    });

    if (files.length === 0) continue;

    console.log(`\n📁 ${dir}`);
    for (const file of files) {
      await compressImage(path.join(dir, file));
    }
  }

  const savedMB = ((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(2);
  const origTotalMB = (totalOriginalSize / 1024 / 1024).toFixed(2);
  const compTotalMB = (totalCompressedSize / 1024 / 1024).toFixed(2);

  console.log(`\n📊 Summary:`);
  console.log(`   Original total:   ${origTotalMB} MB`);
  console.log(`   Compressed total: ${compTotalMB} MB`);
  console.log(`   Saved:            ${savedMB} MB`);
}

main();

import fs from 'fs';
import path from 'path';

const routes = ['portfolio', 'repertoire'];
const distDir = path.resolve(process.cwd(), 'dist');
const indexFile = path.join(distDir, 'index.html');

if (!fs.existsSync(indexFile)) {
  console.error('Error: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

routes.forEach(route => {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
    console.log(`Created: ${routeDir}`);
  }
  const targetFile = path.join(routeDir, 'index.html');
  fs.copyFileSync(indexFile, targetFile);
  console.log(`Copied index.html -> ${targetFile}`);
});

console.log('Postbuild complete.');

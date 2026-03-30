import fs from 'fs';
import path from 'path';

const routes = [
  {
    path: 'portfolio',
    title: 'Performance Portfolio | Yirui Li',
    description: 'Houston harpist Dr. Yirui Li — orchestral performer, recitalist & private event specialist. Principal harp with leading Texas orchestras. Available for hire across Houston and Greater Texas.',
    url: 'https://yiruimusic.com/portfolio'
  },
  {
    path: 'repertoire',
    title: 'Programs & Repertoire | Yirui Li',
    description: 'Harp repertoire by Dr. Yirui Li — orchestral works, chamber music, church selections & elegant Houston wedding music. Request a custom program for your event in Texas.',
    url: 'https://yiruimusic.com/repertoire'
  },
  {
    path: 'journey',
    title: 'Journey | Dr. Yirui Li',
    description: 'The musical journey, important events, and milestones of Dr. Yirui Li.',
    url: 'https://yiruimusic.com/journey'
  }
];

const distDir = path.resolve(process.cwd(), 'dist');
const indexFile = path.join(distDir, 'index.html');

if (!fs.existsSync(indexFile)) {
  console.error('Error: dist/index.html not found. Run "npm run build" first.');
  process.exit(1);
}

// Read the base index.html
const baseHtml = fs.readFileSync(indexFile, 'utf-8');

routes.forEach(route => {
  const routeDir = path.join(distDir, route.path);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
    console.log(`Created: ${routeDir}`);
  }
  
  let routeHtml = baseHtml;
  
  // Replace <title>
  routeHtml = routeHtml.replace(
    /<title>.*?<\/title>/,
    `<title>${route.title}</title>`
  );

  // Replace og:url
  routeHtml = routeHtml.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${route.url}">`
  );

  // Replace og:title
  routeHtml = routeHtml.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${route.title}">`
  );

  // Replace og:description
  routeHtml = routeHtml.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${route.description}">`
  );

  // Replace twitter:title
  routeHtml = routeHtml.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${route.title}">`
  );

  // Replace twitter:description
  routeHtml = routeHtml.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${route.description}">`
  );

  const targetFile = path.join(routeDir, 'index.html');
  fs.writeFileSync(targetFile, routeHtml, 'utf-8');
  console.log(`Generated SEO-injected index.html -> ${targetFile}`);
});

console.log('Postbuild complete.');

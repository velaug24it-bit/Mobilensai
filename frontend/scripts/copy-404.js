import fs from 'fs';
import path from 'path';

const distIndex = path.resolve('dist', 'index.html');
const dist404 = path.resolve('dist', '404.html');

if (fs.existsSync(distIndex)) {
  fs.copyFileSync(distIndex, dist404);
  console.log('✓ Successfully created dist/404.html for SPA refresh support.');
} else {
  console.warn('Warning: dist/index.html not found, skipping 404.html copy.');
}

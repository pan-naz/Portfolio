import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const started = performance.now();
const imageRequire = createRequire(import.meta.resolve('astro'));
const sharp = imageRequire('sharp');
const policy = JSON.parse(await fs.readFile('scripts/responsive-image-policy.json', 'utf8'));
const directory = 'public/generated/images';
const responsiveWidths = [160, 320, 480, 640, 960, 1280, 1920];
await fs.mkdir(directory, { recursive: true });
const manifest = {};
const activeFiles = new Set();
let generated = 0, reused = 0;
for (const source of policy.images) {
  if (policy.excludedPosters.includes(source) || policy.excludedShadowImages.includes(source) || /\.(?:gif|svg|mp4)$/i.test(source)) throw new Error(`Excluded media in responsive policy: ${source}`);
  const input = await fs.readFile(`public${source}`);
  const metadata = await sharp(input).metadata();
  if ((metadata.pages ?? 1) > 1) throw new Error(`Animated input in responsive policy: ${source}`);
  const lossless = metadata.format === 'png';
  // Native pixels preserve the exact alpha-derived CSS shadow on these UI screenshots.
  const nativeAlpha = policy.nativeAlphaImages.includes(source);
  const widths = nativeAlpha ? [metadata.width] : [...new Set(responsiveWidths.map(width => Math.min(width, metadata.width)))];
  const formats = lossless ? ['webp'] : ['webp', 'avif'];
  const settings = JSON.stringify({ version: 2, quality: lossless ? 'lossless' : 88, widths, formats });
  const hash = crypto.createHash('sha256').update(input).update(settings).digest('hex').slice(0, 16);
  const variants = { webp: [], avif: [] };
  for (const width of widths) for (const format of formats) {
    const name = `${hash}-${width}.${format}`, filename = path.join(directory, name);
    activeFiles.add(name);
    try { await fs.access(filename); reused++; } catch {
      const resized = sharp(input).resize({ width, withoutEnlargement: true });
      await (format === 'avif' ? resized.avif({ quality: 88, effort: 4 }) : resized.webp(lossless ? { lossless: true, effort: 4 } : { quality: 88, effort: 4 })).toFile(filename);
      generated++;
    }
    const output = await sharp(filename).metadata();
    variants[format].push({ src: `/generated/images/${name}`, width: output.width, height: output.height, bytes: (await fs.stat(filename)).size });
  }
  manifest[source] = { width: metadata.width, height: metadata.height, originalBytes: input.length, policy: lossless ? 'png-lossless-webp' : `${metadata.format}-quality-88`, ...variants };
}
await fs.writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2));
// Retire only obsolete generated candidates so they are not copied into the next build.
for (const name of await fs.readdir(directory)) {
  if (/^[a-f0-9]{16}-\d+\.(?:avif|webp)$/.test(name) && !activeFiles.has(name)) await fs.unlink(path.join(directory, name));
}
console.log(`Responsive candidates: ${Object.keys(manifest).length} static sources, ${generated} generated, ${reused} reused in ${((performance.now() - started) / 1000).toFixed(1)}s; originals unchanged.`);

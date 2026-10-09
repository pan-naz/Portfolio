import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const imageRequire = createRequire(import.meta.resolve('astro'));
const sharp = imageRequire('sharp');
const policy = JSON.parse(await fs.readFile('scripts/responsive-image-policy.json', 'utf8'));
const directory = 'public/generated/images';
await fs.mkdir(directory, { recursive: true });
const manifest = {};
for (const source of policy.images) {
  if (policy.excludedPosters.includes(source) || /\.(?:gif|svg|mp4)$/i.test(source)) throw new Error(`Excluded media in responsive policy: ${source}`);
  const input = await fs.readFile(`public${source}`);
  const metadata = await sharp(input).metadata();
  if ((metadata.pages ?? 1) > 1) throw new Error(`Animated input in responsive policy: ${source}`);
  const photo = policy.photoImages.includes(source);
  // Native pixels preserve the exact alpha-derived CSS shadow on these UI screenshots.
  const nativeAlpha = policy.nativeAlphaImages.includes(source);
  const hash = crypto.createHash('sha256').update(input).update(`responsive-v1:${photo ? 'q88' : 'lossless'}:${nativeAlpha ? 'native-alpha' : '640,1280,1920'}`).digest('hex').slice(0,16);
  const widths = nativeAlpha ? [metadata.width] : [...new Set([640,1280,1920].map(width => Math.min(width, metadata.width)))];
  const variants = { webp: [], avif: [] };
  for (const width of widths) for (const format of photo ? ['webp','avif'] : ['webp']) {
    const name = `${hash}-${width}.${format}`, filename = path.join(directory, name);
    try { await fs.access(filename); } catch {
      const resized = sharp(input).resize({ width, withoutEnlargement: true });
      await (format === 'avif' ? resized.avif({quality:88,effort:4}) : resized.webp(photo ? {quality:88,effort:4} : {lossless:true,effort:4})).toFile(filename);
    }
    const output = await sharp(filename).metadata();
    variants[format].push({ src: `/generated/images/${name}`, width:output.width, height:output.height, bytes:(await fs.stat(filename)).size });
  }
  manifest[source] = { width:metadata.width, height:metadata.height, originalBytes:input.length, policy:photo ? 'photo-quality-88' : 'ui-lossless-webp', ...variants };
}
await fs.writeFile(path.join(directory,'manifest.json'), JSON.stringify(manifest,null,2));
console.log(`Generated responsive candidates for ${Object.keys(manifest).length} static raster images; originals unchanged.`);

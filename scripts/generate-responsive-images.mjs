import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const imageRequire = createRequire(import.meta.resolve('astro'));
const sharp = imageRequire('sharp');
// Bump when generation logic changes. Encoder versions also invalidate entries.
const generatorVersion = 3;
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const responsiveWidths = [160, 320, 480, 640, 960, 1280, 1920];

async function cachedVariants(folder, names) {
  try {
    const entry = JSON.parse(await fs.readFile(path.join(folder, 'entry.json'), 'utf8'));
    if (entry.version !== generatorVersion || entry.files.length !== names.length) return null;
    const files = [];
    for (const [i, name] of names.entries()) {
      const record = entry.files[i];
      if (record.name !== name) return null;
      const bytes = await fs.readFile(path.join(folder, name));
      if (bytes.length !== record.bytes || sha256(bytes) !== record.sha256) return null;
      const metadata = await sharp(bytes).metadata();
      if (metadata.width !== record.width || metadata.height !== record.height || metadata.width !== Number(name.slice(17, name.lastIndexOf('.')))) return null;
      files.push(record);
    }
    return files;
  } catch { return null; } // Missing, partial or corrupt cache: encode this source anew.
}

export async function generateResponsiveImages({
  publicDirectory = 'public',
  cacheDirectory = 'node_modules/.cache/responsive-images',
  policy = undefined,
} = {}) {
  const started = performance.now();
  policy ??= JSON.parse(await fs.readFile('scripts/responsive-image-policy.json', 'utf8'));
  const directory = path.join(publicDirectory, 'generated/images');
  await fs.mkdir(directory, { recursive: true });
  await fs.mkdir(cacheDirectory, { recursive: true });
  const manifest = {}, activeFiles = new Set();
  let generated = 0, reused = 0, generatedSources = 0, cachedSources = 0;
  for (const source of policy.images) {
    if (policy.excludedPosters.includes(source) || policy.excludedShadowImages.includes(source) || /\.(?:gif|svg|mp4)$/i.test(source)) throw new Error(`Excluded media in responsive policy: ${source}`);
    const input = await fs.readFile(path.join(publicDirectory, source));
    const metadata = await sharp(input).metadata();
    if ((metadata.pages ?? 1) > 1) throw new Error(`Animated input in responsive policy: ${source}`);
    const lossless = metadata.format === 'png';
    // Native pixels preserve the exact alpha-derived CSS shadow on these UI screenshots.
    const nativeAlpha = policy.nativeAlphaImages.includes(source);
    const widths = nativeAlpha ? [metadata.width] : [...new Set(responsiveWidths.map(width => Math.min(width, metadata.width)))];
    const formats = lossless ? ['webp'] : ['webp', 'avif'];
    // Keep the existing delivered filename hash and encoding settings unchanged.
    const settings = JSON.stringify({ version: 2, quality: lossless ? 'lossless' : 88, widths, formats });
    const hash = crypto.createHash('sha256').update(input).update(settings).digest('hex').slice(0, 16);
    const webp = lossless ? { lossless: true, effort: 4 } : { quality: 88, effort: 4 };
    const avif = { quality: 88, effort: 4 };
    const cacheKey = crypto.createHash('sha256').update(input).update(settings).update(JSON.stringify({ generatorVersion, webp, avif, withoutEnlargement: true, encoders: sharp.versions, platform: process.platform, arch: process.arch })).digest('hex');
    const folder = path.join(cacheDirectory, cacheKey);
    const names = widths.flatMap(width => formats.map(format => `${hash}-${width}.${format}`));
    let files = await cachedVariants(folder, names);
    if (files) { cachedSources++; reused += files.length; }
    else {
      generatedSources++;
      const temporary = await fs.mkdtemp(path.join(cacheDirectory, '.pending-'));
      try {
        files = [];
        for (const width of widths) for (const format of formats) {
          const name = `${hash}-${width}.${format}`, filename = path.join(temporary, name);
          const resized = sharp(input).resize({ width, withoutEnlargement: true });
          await (format === 'avif' ? resized.avif(avif) : resized.webp(webp)).toFile(filename);
          const bytes = await fs.readFile(filename), output = await sharp(bytes).metadata();
          files.push({ name, width: output.width, height: output.height, bytes: bytes.length, sha256: sha256(bytes) });
          generated++;
        }
        await fs.writeFile(path.join(temporary, 'entry.json'), JSON.stringify({ version: generatorVersion, files }));
        await fs.rm(folder, { recursive: true, force: true });
        await fs.rename(temporary, folder); // Publish only a complete, verified entry.
      } finally { await fs.rm(temporary, { recursive: true, force: true }); }
    }
    const variants = { webp: [], avif: [] };
    for (const file of files) {
      activeFiles.add(file.name);
      await fs.copyFile(path.join(folder, file.name), path.join(directory, file.name));
      const format = path.extname(file.name).slice(1);
      variants[format].push({ src: `/generated/images/${file.name}`, width: file.width, height: file.height, bytes: file.bytes });
    }
    manifest[source] = { width: metadata.width, height: metadata.height, originalBytes: input.length, policy: lossless ? 'png-lossless-webp' : `${metadata.format}-quality-88`, ...variants };
  }
  await fs.writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2));
  for (const name of await fs.readdir(directory)) {
    if (/^[a-f0-9]{16}-\d+\.(?:avif|webp)$/.test(name) && !activeFiles.has(name)) await fs.unlink(path.join(directory, name));
  }
  const result = { sources: Object.keys(manifest).length, generated, reused, generatedSources, cachedSources, seconds: +((performance.now() - started) / 1000).toFixed(1) };
  console.log(`Responsive candidates: ${result.sources} static sources, ${generated} generated, ${reused} cache hits; ${generatedSources} sources encoded, ${cachedSources} cached in ${result.seconds}s; originals unchanged.`);
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) await generateResponsiveImages();

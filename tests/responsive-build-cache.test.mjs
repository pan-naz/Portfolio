import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { generateResponsiveImages } from '../scripts/generate-responsive-images.mjs';
const sharp = createRequire(import.meta.resolve('astro'))('sharp');
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'responsive-cache-test-'));
const publicDirectory = path.join(directory, 'public'), cacheDirectory = path.join(directory, 'cache');
const policy = { images: ['/first.png', '/second.jpg'], excludedPosters: [], excludedShadowImages: [], nativeAlphaImages: [] };
const digest = async () => { const folder = path.join(publicDirectory, 'generated/images'), result = {}; for (const name of (await fs.readdir(folder)).sort()) result[name] = createHash('sha256').update(await fs.readFile(path.join(folder, name))).digest('hex'); return result; };
try {
  await fs.mkdir(publicDirectory);
  await sharp({ create: { width: 200, height: 30, channels: 4, background: 'white' } }).png().toFile(path.join(publicDirectory, 'first.png'));
  await sharp({ create: { width: 48, height: 32, channels: 3, background: 'black' } }).jpeg().toFile(path.join(publicDirectory, 'second.jpg'));
  const options = { publicDirectory, cacheDirectory, policy };
  const cold = await generateResponsiveImages(options), before = await digest();
  assert.equal(cold.generatedSources, 2); assert.equal(cold.reused, 0);
  await fs.rm(path.join(publicDirectory, 'generated'), { recursive: true });
  const warm = await generateResponsiveImages(options); assert.equal(warm.generated, 0); assert.equal(warm.cachedSources, 2); assert.deepEqual(await digest(), before, 'Fresh output restored byte-identically from cache, including manifest');
  const unchanged = JSON.parse(await fs.readFile(path.join(publicDirectory, 'generated/images/manifest.json')) )['/second.jpg'];
  await sharp({ create: { width: 200, height: 30, channels: 4, background: 'black' } }).png().toFile(path.join(publicDirectory, 'first.png'));
  const changed = await generateResponsiveImages(options); assert.equal(changed.generatedSources, 1); assert.equal(changed.cachedSources, 1);
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(publicDirectory, 'generated/images/manifest.json')))['/second.jpg'], unchanged, 'Changing one source never regenerates the other');
  const settings = await generateResponsiveImages({ ...options, policy: { ...policy, nativeAlphaImages: ['/first.png'] } });
  assert.equal(settings.generatedSources, 1); assert.equal(settings.cachedSources, 1, 'Changed settings invalidate only their source');
  await generateResponsiveImages(options);
  // Corrupt every complete entry; no untrusted bytes may reach delivered output.
  for (const name of await fs.readdir(cacheDirectory)) { const entry = JSON.parse(await fs.readFile(path.join(cacheDirectory, name, 'entry.json'))); await fs.writeFile(path.join(cacheDirectory, name, entry.files[0].name), 'corrupt'); }
  const correct = await digest(), recovered = await generateResponsiveImages(options); assert.equal(recovered.generatedSources, 2); assert.deepEqual(await digest(), correct, 'Corrupt cache entries fall back to byte-identical generation');
  await fs.rm(cacheDirectory, { recursive: true }); const missing = await generateResponsiveImages(options); assert.equal(missing.generatedSources, 2); assert.deepEqual(await digest(), correct, 'Absent cache falls back correctly');
} finally { await fs.rm(directory, { recursive: true, force: true }); }
console.log('PASS: cold/warm bytes and manifest, one-source invalidation, corrupt and missing cache recovery.');

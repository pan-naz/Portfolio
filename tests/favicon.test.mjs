import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const filesUnder = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? filesUnder(resolve(directory, entry.name)) : [resolve(directory, entry.name)]);
const pages = filesUnder('dist').filter(file => file.endsWith('.html'));
assert.equal(pages.length, 23);
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const links = [...html.matchAll(/<link\b[^>]*\brel="(?:icon|apple-touch-icon)"[^>]*>/g)].map(match => match[0]);
  assert.equal(links.length, 3, `${page}: favicon declarations occur once`);
  assert.ok(links.some(link => link.includes('href="/favicon.ico"') && link.includes('sizes="16x16 32x32 48x48"')));
  assert.ok(links.some(link => link.includes('href="/favicon-96.png"') && link.includes('type="image/png"') && link.includes('sizes="96x96"')));
  assert.ok(links.some(link => link.includes('href="/apple-touch-icon.png"') && link.includes('sizes="180x180"')));
  assert.ok(links.every(link => !link.includes('.svg')), `${page}: tab icons use regular image formats`);
}
const ico = readFileSync('public/favicon.ico');
assert.equal(ico.readUInt16LE(0), 0);
assert.equal(ico.readUInt16LE(2), 1);
assert.equal(ico.readUInt16LE(4), 3);
for (const [index, size] of [16, 32, 48].entries()) {
  const entry = 6 + index * 16, bytes = ico.readUInt32LE(entry + 8), offset = ico.readUInt32LE(entry + 12);
  assert.equal(ico[entry], size); assert.equal(ico[entry + 1], size);
  assert.ok(offset >= 54 && offset + bytes <= ico.length);
  assert.equal(ico.readUInt32LE(offset), 40, 'Standard bitmap ICO frame');
  assert.equal(ico.readUInt32LE(offset + 4), size);
  assert.equal(ico.readUInt32LE(offset + 8), size * 2, 'XOR bitmap plus AND mask');
  assert.equal(ico.readUInt16LE(offset + 14), 32, 'RGBA frame');
}
const png = readFileSync('public/favicon-96.png');
assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
assert.equal(png.readUInt32BE(16), 96); assert.equal(png.readUInt32BE(20), 96);
console.log('PASS: 23 pages use shared raster icon metadata; ICO contains 16/32/48 RGBA frames and PNG is 96px.');

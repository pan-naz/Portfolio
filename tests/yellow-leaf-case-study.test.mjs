import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const html = readFileSync(new URL('../dist/case-studies/yellow-leaf/index.html', import.meta.url), 'utf8');
const content = html.match(/<article\b[^>]*data-case-content[^>]*>([\s\S]*?)<\/article>/)?.[1];
assert.ok(content, 'The complete case renders in a shared article');
const text = content.replace(/<[^>]*>/g, ' ').replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_, hex, dec) => String.fromCodePoint(parseInt(hex ?? dec, hex ? 16 : 10))).replace(/&(amp|quot|apos|nbsp|lt|gt);/g, (_, entity) => ({ amp: '&', quot: '"', apos: "'", nbsp: ' ', lt: '<', gt: '>' }[entity])).replace(/\s+/g, ' ');
const referenceCopy = JSON.parse(readFileSync(new URL('./fixtures/yellow-leaf-reference.json', import.meta.url), 'utf8'));
for (const copy of referenceCopy) assert.ok(text.includes(copy), 'Preserves supplied copy: ' + copy);
assert.deepEqual([...content.matchAll(/<section\b[^>]*aria-labelledby="(yl-[^"]+)"/g)].map(match => match[1]), ['yl-title', 'yl-idea', 'yl-home', 'yl-estimate', 'yl-navigation', 'yl-responsive', 'yl-pages', 'yl-branding', 'yl-style'], 'Reference chapters retain their order');
assert.deepEqual([...content.matchAll(/<section\b[^>]*class="case-study-chapter--color-neutral-950"[^>]*aria-labelledby="([^"]+)"/g)].map(match => match[1]), ['yl-estimate', 'yl-style'], 'Only the two supplied chapters have dark backgrounds');
assert.equal([...content.matchAll(/<case-study-sticky\b/g)].length, 2, 'Main page and About us reuse sticky scrolling');
assert.ok(/<svg\b[^>]*aria-label="Logo construction:[^"]+"[^>]*aria-hidden="false"[^>]*class="svg-asset yellow-construction"/.test(content), 'The informative shared SVG construction diagram exposes its accessible description');
const links = [...content.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(links, ['https://www.linkedin.com/company/yellow-leaf-technologies/'], 'The only project link is the supplied LinkedIn destination');
for (const video of content.matchAll(/<video\b[^>]*>/g)) {
  assert.ok(/\bmuted\b/.test(video[0]) && /\bloop\b/.test(video[0]) && /\bplaysinline\b/.test(video[0]), 'Recordings play silently, inline and loop');
  assert.ok(!/\bcontrols\b/.test(video[0]), 'No playback controller is added');
}
assert.ok(!content.includes('data-video-controls'));
for (const match of content.matchAll(/<(?:img|source|svg)\b[^>]*(?:src|data-src|data-svg-src)="(\/projects\/yellow-leaf-case-study\/[^"#]+)"/g)) assert.ok(existsSync(new URL('../public' + match[1], import.meta.url)), 'Original local asset exists: ' + match[1]);
const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
assert.ok(!home.includes('project-fieldwork') && !existsSync(new URL('../dist/case-studies/fieldwork/index.html', import.meta.url)), 'The Website sample and route are removed');
console.log('PASS: Yellow Leaf preserves reference copy, chapter order, dark bands, sticky sections, media and LinkedIn-only links.');

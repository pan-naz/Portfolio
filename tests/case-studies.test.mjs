import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { projects, conceptProjects } from '../src/data/portfolio.ts';
import { caseStudySamples } from '../src/data/case-studies.ts';
const all = [...projects, ...conceptProjects];
assert.equal(all.length, 15);
assert.deepEqual(Object.keys(caseStudySamples).sort(), all.map(project => project.id).sort(), 'Every card has its own sample narrative');
const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
assert.ok(css.includes('transition: transform 350ms var(--ease-toggle-rotation)') && css.includes('.icon-button:hover svg > g { transform: rotate(180deg); }'), 'Close glyph turns on hover and transitions back to its resting angle on hover-out');
assert.ok(!css.includes('@keyframes case-close-half-turn'), 'Close hover does not use a one-way fill animation');
for (const project of all) {
  const sample = caseStudySamples[project.id];
  assert.ok(sample.context.length > 100 && sample.direction.length > 100 && sample.detail.length > 100);
  for (const id of sample.related ?? []) assert.ok(all.some(item => item.id === id), `Valid reference imagery for ${project.id}`);
  const path = `/case-studies/${project.id}/`;
  assert.ok(home.includes(`href="${path}"`), `Real link for ${project.id}, including keyboard/new-tab fallback`);
  const html = readFileSync(new URL(`../dist${path}index.html`, import.meta.url), 'utf8');
  assert.ok(html.includes('data-case-home'), 'Direct visits have a return control');
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'Each standalone case has one main title');
  const imageSources = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
  assert.equal(imageSources.length, 3, 'Hero plus two gallery images on every case');
  for (const src of imageSources) assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `Local image exists: ${src}`);
  assert.ok(html.includes(project.placeholder ? 'fictional concept' : 'Draft case study'), 'Samples do not imply new verified project claims');
}
console.log('PASS: all 15 cards have shareable built pages, individual draft narratives, valid three-image galleries and return controls.');

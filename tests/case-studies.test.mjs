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
  if (project.id === 'voximplant') {
    assert.ok(imageSources.length >= 20, 'The full Voximplant case study has its product and process imagery');
    assert.ok(html.includes('For the business') && html.includes('For the team'), 'The full case study reaches its impact ending');
    assert.ok(!html.includes('Draft case study'), 'The full case study is not labeled as a draft');
  } else if (project.id === 'datagpt') {
    assert.ok(imageSources.length >= 12, 'The full DataGPT case study has its research, product and marketing imagery');
    assert.ok(html.includes('dg-impact') && html.includes('dg-conclusion'), 'The full DataGPT story reaches its impact and conclusion');
    assert.ok(!html.includes('Draft case study'), 'The full case study is not labeled as a draft');
  } else {
    assert.equal(imageSources.length, 3, 'Sample cases have a hero and two gallery images');
    assert.ok(html.includes(project.placeholder ? 'fictional concept' : 'Draft case study'), 'Samples do not imply new verified project claims');
  }
  for (const src of imageSources) assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `Local image exists: ${src}`);
}
console.log('PASS: all 15 cards have shareable built pages, valid local imagery and return controls; Voximplant and DataGPT have full case studies.');

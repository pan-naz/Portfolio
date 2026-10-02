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
const textFromMarkup = markup => markup.replace(/<[^>]*>/g, '').replace(/&(amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+);/gi, (_, entity) => {
  if (entity.startsWith('#')) return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10));
  return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[entity.toLowerCase()];
}).replace(/\s+/g, ' ').trim();
const projectMetadata = (markup, card = false) => {
  const title = markup.match(card ? /<h3\b[^>]*class="project-heading"[^>]*>([\s\S]*?)<\/h3>/ : /<h1\b[^>]*data-case-title[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  const tags = markup.match(/<div\b[^>]*class="project-tags"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  const summary = markup.match(card ? /<div\b[^>]*class="project-copy"[^>]*>([\s\S]*?)<\/div>/ : /<div\b[^>]*class="(?:case-study-overview__summary|case-study-summary)"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  assert.ok(title && tags && summary, 'Project identity, tags and summary render together');
  const copy = [...summary.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(match => textFromMarkup(match[1]));
  const identity = markup.match(/<span\b[^>]*class="project-identity[^\"]*"[^>]*>([\s\S]*?)<\/span>/)?.[1];
  return {
    title: textFromMarkup(title),
    tags: [...tags.matchAll(/<span\b[^>]*class="skill-tag\b[^\"]*"[^>]*>\s*<span>([\s\S]*?)<\/span>\s*<\/span>/g)].map(match => textFromMarkup(match[1])),
    outcome: copy[0],
    description: copy[1],
    paragraphCount: copy.length,
    logo: identity?.match(/<img\b[^>]*src="([^\"]+)"/)?.[1],
  };
};
for (const project of all) {
  const sample = caseStudySamples[project.id];
  assert.ok(sample.context.length > 100 && sample.direction.length > 100 && sample.detail.length > 100);
  for (const id of sample.related ?? []) assert.ok(all.some(item => item.id === id), `Valid reference imagery for ${project.id}`);
  const path = `/case-studies/${project.id}/`;
  assert.ok(home.includes(`href="${path}"`), `Real link for ${project.id}, including keyboard/new-tab fallback`);
  const html = readFileSync(new URL(`../dist${path}index.html`, import.meta.url), 'utf8');
  assert.ok(html.includes('data-case-home'), 'Direct visits have a return control');
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'Each standalone case has one main title');
  const card = home.match(new RegExp(`<article\\b[^>]*id="project-${project.id}"[^>]*>([\\s\\S]*?)<\\/article>`))?.[1];
  const template = home.match(new RegExp(`<template\\b[^>]*data-case-template="${project.id}"[^>]*>([\\s\\S]*?)<\\/template>`))?.[1];
  assert.ok(card && template, `${project.id} has both a homepage card and an opened-case template`);
  const hasSubtitle = ['voximplant', 'hooko'].includes(project.id);
  assert.equal(Boolean(project.outcome), hasSubtitle, `${project.id} uses the approved intro hierarchy`);
  const expectedMetadata = { title: project.title, tags: project.tags, outcome: project.outcome ?? project.description, description: hasSubtitle ? project.description : undefined, paragraphCount: hasSubtitle ? 2 : 1, logo: project.logo };
  assert.deepEqual(projectMetadata(card, true), expectedMetadata, `${project.id} card uses the shared project metadata`);
  assert.deepEqual(projectMetadata(html), expectedMetadata, `${project.id} standalone case matches its card`);
  assert.deepEqual(projectMetadata(template), expectedMetadata, `${project.id} opened case matches its card`);
  const imageSources = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
  if (project.id === 'voximplant') {
    assert.ok(imageSources.length >= 20, 'The full Voximplant case study has its product and process imagery');
    assert.ok(html.includes('For the business') && html.includes('For the team'), 'The full case study reaches its impact ending');
    assert.ok(!html.includes('Draft case study'), 'The full case study is not labeled as a draft');
  } else if (project.id === 'datagpt') {
    assert.ok(imageSources.length >= 12, 'The full DataGPT case study has its research, product and marketing imagery');
    assert.ok(html.includes('dg-impact') && html.includes('dg-conclusion'), 'The full DataGPT story reaches its impact and conclusion');
    assert.ok(!html.includes('Draft case study'), 'The full case study is not labeled as a draft');
  } else if (project.id === 'hooko') {
    assert.ok(imageSources.length >= 16, 'The Hooko case study uses its real product screenshots and tool logos');
    for (const section of ['problem', 'flow', 'decisions', 'build', 'growth', 'reflection']) {
      assert.ok(html.includes(`id="hk-${section}"`), `Hooko includes the ${section} chapter`);
    }
    assert.ok(!html.includes('Draft case study'), 'Hooko is a complete case study');
    assert.ok(html.includes('/projects/hooko-logo.svg'), 'Hooko uses the supplied SVG logo');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.equal(videoSources.length, 2, 'The hero and product flow both use the supplied demo');
    for (const src of videoSources) assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `Local video exists: ${src}`);
  } else {
    assert.equal(imageSources.length, 3, 'Sample cases have a hero and two gallery images');
    assert.ok(html.includes(project.placeholder ? 'fictional concept' : 'Draft case study'), 'Samples do not imply new verified project claims');
  }
  for (const src of imageSources) assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `Local image exists: ${src}`);
}
console.log('PASS: all 15 cards, opened cases and standalone pages share matching titles, tags, summaries and logos, with valid imagery and return controls; Voximplant, Hooko and DataGPT have full case studies.');

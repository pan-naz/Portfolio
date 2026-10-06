import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { projects, collectionProjects } from '../src/data/portfolio.ts';
import { caseStudySamples } from '../src/data/case-studies.ts';
import { hookoHero } from '../src/data/hooko-case-study.ts';
const all = [...projects, ...collectionProjects];
assert.equal(all.length, 16);
assert.deepEqual(Object.keys(caseStudySamples).sort(), all.filter(project => !['peak-hotel', 'yellow-leaf', 'index-law-firm', 'blaustrom', 'cravus', 'promshyna'].includes(project.id)).map(project => project.id).sort(), 'Every sample card has its own narrative');
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
    logo: identity?.match(/<svg\b[^>]*data-svg-src="([^\"]+)"/)?.[1],
  };
};
for (const project of all) {
  const sample = caseStudySamples[project.id];
  if (sample) assert.ok(sample.context.length > 100 && sample.direction.length > 100 && sample.detail.length > 100);
  for (const id of sample?.related ?? []) assert.ok(all.some(item => item.id === id), `Valid reference imagery for ${project.id}`);
  const path = `/case-studies/${project.id}/`;
  assert.ok(home.includes(`href="${path}"`), `Real link for ${project.id}, including keyboard/new-tab fallback`);
  const html = readFileSync(new URL(`../dist${path}index.html`, import.meta.url), 'utf8');
  assert.ok(html.includes('data-case-home'), 'Direct visits have a return control');
  const closeLink = html.match(/<a\b[^>]*data-case-home[^>]*>/)?.[0];
  const returnUrl = project.category === 'selected' ? '/#work' : `/#${project.category}`;
  assert.ok(closeLink?.includes(`href="${returnUrl}"`), `${project.id} returns to its own collection after a case reload`);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'Each standalone case has one main title');
  const card = home.match(new RegExp(`<article\\b[^>]*id="project-${project.id}"[^>]*>([\\s\\S]*?)<\\/article>`))?.[1];
  const template = home.match(new RegExp(`<template\\b[^>]*data-case-template="${project.id}"[^>]*>([\\s\\S]*?)<\\/template>`))?.[1];
  assert.ok(card && template, `${project.id} has both a homepage card and an opened-case template`);
  for (const [view, markup] of [['standalone', html], ['opened', template]]) {
    const heroes = [...markup.matchAll(/<(?:div|figure|case-video-player)\b[^>]*class="([^"]*\bcase-study-artwork\b[^"]*)"[^>]*>/g)];
    assert.equal(heroes.length, 1, `${project.id} ${view} case has one hero frame`);
    assert.ok(!/case-study-media--(?:floating|shadow|bare|wide-stroke|outside-stroke)/.test(heroes[0][1]), `${project.id} ${view} hero does not acquire a second content-media frame at the animation handoff`);
  }
  const hasSubtitle = ['voximplant', 'hooko'].includes(project.id);
  assert.equal(Boolean(project.outcome), hasSubtitle, `${project.id} uses the approved intro hierarchy`);
  const expectedMetadata = { title: project.title, tags: project.tags, outcome: project.outcome ?? project.description, description: hasSubtitle ? project.description : undefined, paragraphCount: hasSubtitle ? 2 : 1, logo: project.logo };
  assert.deepEqual(projectMetadata(card, true), expectedMetadata, `${project.id} card uses the shared project metadata`);
  assert.deepEqual(projectMetadata(html), expectedMetadata, `${project.id} standalone case matches its card`);
  assert.deepEqual(projectMetadata(template), expectedMetadata, `${project.id} opened case matches its card`);
  const imageSources = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
  const vectorMarks = [...html.matchAll(/<svg[^>]+data-svg-src="([^"]+)"/g)].map(match => match[1]);
  const visualAssetCount = imageSources.length + vectorMarks.length;
  if (project.id === 'voximplant') {
    assert.ok(visualAssetCount >= 20, 'The full Voximplant case study has its product and process imagery');
    assert.ok(html.includes('For the business') && html.includes('For the team'), 'The full case study reaches its impact ending');
    assert.ok(!html.includes('Draft case study'), 'The full case study is not labeled as a draft');
  } else if (project.id === 'datagpt') {
    assert.ok(visualAssetCount >= 12, 'The full DataGPT case study has its research, product and marketing imagery');
    assert.ok(html.includes('dg-impact') && html.includes('dg-conclusion'), 'The full DataGPT story reaches its impact and conclusion');
    assert.ok(!html.includes('Draft case study'), 'The full case study is not labeled as a draft');
  } else if (project.id === 'hooko') {
    assert.ok(visualAssetCount >= 16, 'The Hooko case study uses its real product screenshots and tool logos');
    for (const section of ['problem', 'flow', 'decisions', 'build', 'growth', 'reflection']) {
      assert.ok(html.includes(`id="hk-${section}"`), `Hooko includes the ${section} chapter`);
    }
    assert.ok(!html.includes('Draft case study'), 'Hooko is a complete case study');
    assert.ok(html.includes('/projects/hooko-logo.svg'), 'Hooko uses the supplied SVG logo');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.equal(videoSources.length, 2, 'Hooko includes the new hero recording and the original product-flow demo');
    assert.equal(videoSources[0], hookoHero.video.src);
    assert.equal(new URL(videoSources[1], 'https://portfolio.local').pathname, '/projects/hooko-case-study/demo.mp4', 'The product-flow demo uses the supplied recording');
    for (const presentation of [card, template]) {
      assert.equal(presentation.match(/<source[^>]+data-src="([^"]+)"/)?.[1], hookoHero.video.src, 'The card, open case and standalone case share the same live hero recording');
    }
    for (const src of videoSources) assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `Local video exists: ${src}`);
  } else if (project.id === 'peak-hotel') {
    assert.ok(imageSources.length >= 14, 'Peak Hotel includes original page, responsive, UI and style-guide imagery');
    for (const section of ['idea', 'home', 'pages', 'navigation', 'responsive', 'ui', 'style']) assert.ok(html.includes('id="peak-' + section + '"'), 'Peak Hotel includes the complete ' + section + ' chapter');
    assert.ok(!html.includes('Draft case study') && !html.includes('fictional concept'), 'Peak Hotel is a complete real case study');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.equal(videoSources.length, 2, 'Peak Hotel includes both original recordings');
    for (const src of videoSources) assert.ok(existsSync(new URL('../public' + src, import.meta.url)), 'Local Peak Hotel video exists');
    assert.ok(html.includes('prefers-reduced-motion: reduce') && html.includes('button-still.webp'), 'Button animation has a static reduced-motion state');
  } else if (project.id === 'yellow-leaf') {
    assert.equal(imageSources.length, 20, 'Yellow Leaf includes every supplied screenshot and video poster');
    assert.equal(vectorMarks.length, 5, 'Yellow Leaf uses its supplied logo and four shared branding vectors');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.equal(videoSources.length, 6, 'Yellow Leaf includes all six original recordings');
    for (const src of videoSources) assert.ok(existsSync(new URL('../public' + src, import.meta.url)), 'Local Yellow Leaf video exists');
    assert.ok(!html.includes('Draft case study') && !html.includes('fictional concept'), 'Yellow Leaf is a complete real case study');
  } else if (project.id === 'index-law-firm') {
    assert.equal(imageSources.length, 9, 'Index includes original screenshots, two tile photos and three video posters');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.equal(videoSources.length, 3, 'Index includes all three original recordings');
    assert.ok(!html.includes('Draft case study') && !html.includes('fictional concept'), 'Index is a complete real case study');
    for (const src of videoSources) assert.ok(existsSync(new URL('../public' + src, import.meta.url)), 'Local Index video exists');
  } else if (project.id === 'blaustrom') {
    for (const section of ['home', 'about', 'products', 'configurator', 'contact', 'responsive', 'style']) assert.ok(html.includes('id="bs-' + section + '"'), 'Blaustrom includes the complete ' + section + ' chapter');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.equal(videoSources.length, 4, 'Blaustrom includes all four original recordings');
    for (const src of videoSources) assert.ok(existsSync(new URL('../public' + src, import.meta.url)), 'Local Blaustrom video exists');
    assert.ok(!html.includes('Draft case study') && !html.includes('fictional concept'), 'Blaustrom is a complete real case study');
  } else if (project.id === 'cravus') {
    for (const section of ['concept', 'home', 'pages', 'mobile', 'style']) assert.ok(html.includes('id="cv-' + section + '"'), 'Cravus includes the complete ' + section + ' chapter');
    assert.equal(imageSources.length, 15, 'Cravus includes every original product screenshot');
    assert.equal(vectorMarks.length, 2, 'Cravus uses its original SVG logo and shared vector icon sheet');
    assert.ok(!html.includes('Draft case study') && !html.includes('fictional concept'), 'Cravus is a complete real case study');
  } else if (project.id === 'promshyna') {
    for (const section of ['path', 'responsive', 'other', 'branding']) assert.ok(html.includes(`id="ps-${section}"`), `PromShyna includes the ${section} chapter`);
    for (const number of ['01', '02', '03', '04', '05', '06']) assert.ok(html.includes(`id="ps-page-${number}"`), `PromShyna includes purchase step ${number}`);
    assert.equal(imageSources.length, 19, 'PromShyna includes every original product screenshot, recording poster and branding specimen');
    assert.equal(vectorMarks.length, 1, 'PromShyna keeps its supplied SVG identity');
    for (const name of ['logo-before', 'logo-after', '404-sign']) {
      const src = `/projects/promshyna-case-study/${name}.png`;
      for (const markup of [html, template]) assert.ok(markup.includes(`src="${src}"`), 'Standalone and opened cases use the original PNG branding specimens');
      assert.deepEqual(readFileSync(new URL(`../public${src}`, import.meta.url)), readFileSync(new URL(`../../reference-research/promshyna/source/${name}.png`, import.meta.url)), 'Brand specimens match the reference bytes without tracing or recompression');
    }
    assert.equal([...html.matchAll(/class="case-study-media__sequence"/g)].length, 2, 'Home and category combine their screenshot and recording segments inside one shared media frame');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(videoSources, ['home-slider', 'listing-top', 'phone-product'].map(name => `/projects/promshyna-case-study/${name}.mp4`), 'All three original recordings retain their narrative order');
    for (const src of videoSources) assert.ok(existsSync(new URL('../public' + src, import.meta.url)), 'Local PromShyna recording exists');
    assert.ok(!html.includes('Draft case study') && !html.includes('fictional concept'), 'PromShyna is a complete real case study');
  } else {
    assert.equal(imageSources.length, 3, 'Sample cases have a hero and two gallery images');
    assert.ok(html.includes(project.placeholder ? 'fictional concept' : 'Draft case study'), 'Samples do not imply new verified project claims');
  }
  for (const src of imageSources) assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `Local image exists: ${src}`);
}
console.log('PASS: all 16 cards, opened cases and standalone pages share matching metadata, valid imagery and return controls; all nine real projects have full case studies.');

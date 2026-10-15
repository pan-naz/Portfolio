import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { projects, collectionProjects, hookoAppUrl } from '../src/data/portfolio.ts';
import { hookoHero } from '../src/data/hooko-case-study.ts';
import { getVideoVariant } from '../src/data/video-variants.ts';
import { caseVideoPreviews } from '../src/data/case-video-previews.ts';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const fingerprints = JSON.parse(readFileSync(new URL('./fixtures/original-media.json', import.meta.url), 'utf8'));
const sourceFingerprint = key => { const record = fingerprints.media[key]; assert.ok(record, 'Committed original fingerprint: ' + key); return record; };
for (const [key, record] of Object.entries(fingerprints.documents)) { const bytes = readFileSync(new URL('./fixtures/reference/' + key, import.meta.url)); assert.equal(bytes.length, record.size); assert.equal(hash(bytes), record.sha256, 'Unchanged source JSON: ' + key); }
function assertOriginalEvidence(src, reference, message) {
  const delivered = readFileSync(new URL(`../public${src}`, import.meta.url));
  if (src.endsWith('.mp4')) {
    const record = getVideoVariant(src);
    assert.ok(record, 'Every web recording has original-source provenance');
    assert.equal(record.originalSha256, reference.sha256, message);
    assert.equal(record.originalBytes, reference.size, 'Original recording size matches the committed provenance fingerprint');
    assert.equal(hash(delivered), record.desktop.sha256, 'Delivered bytes match the quality-gated web recording');
    assert.equal(delivered.length, record.desktop.bytes, 'Delivered recording size matches the quality-gated output');
  } else { assert.equal(hash(delivered), reference.sha256, message); assert.equal(delivered.length, reference.size, message); }
}
const all = [...projects, ...collectionProjects];
const controlledRecordings = new Set();
assert.equal(all.length, 20);
// The browser treats noscript fallback markup as inert when scripts are enabled.
const activeMarkup = html => html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/g, '');
const home = activeMarkup(readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8'));
for (const id of ['afterlight', 'still-life', 'soft-focus', 'slow-sunday', 'desk-notes', 'drift', 'open-water']) {
  assert.ok(!home.includes(`data-case-link="${id}"`), 'Fictional cards are removed');
  assert.ok(!existsSync(new URL(`../dist/case-studies/${id}/index.html`, import.meta.url)), 'Fictional routes are removed');
}
const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
assert.ok(css.includes('transition: transform var(--duration-close-turn) var(--ease-toggle-rotation)') && /\.icon-button--raised\[data-icon='close'\]:hover svg > g[^{}]*\{ transform: rotate\(var\(--rotation-icon-turn\)\); }/.test(css), 'Close glyph turns on hover and transitions back to its resting angle on hover-out');
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
  const copy = [...summary.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)].filter(match => !match[1].includes('data-case-credit')).map(match => textFromMarkup(match[2]));
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
  const path = `/case-studies/${project.id}/`;
  assert.ok(home.includes(`href="${path}"`), `Real link for ${project.id}, including keyboard/new-tab fallback`);
  const html = activeMarkup(readFileSync(new URL(`../dist${path}index.html`, import.meta.url), 'utf8'));
  assert.ok(html.includes('data-case-home'), 'Direct visits have a return control');
  const closeLink = html.match(/<a\b[^>]*data-case-home[^>]*>/)?.[0];
  const returnUrl = project.category === 'selected' ? '/#work' : `/#${project.category}`;
  assert.ok(closeLink?.includes(`href="${returnUrl}"`), `${project.id} returns to its own collection after a case reload`);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'Each standalone case has one main title');
  const card = home.match(new RegExp(`<article\\b[^>]*id="project-${project.id}"[^>]*>([\\s\\S]*?)<\\/article>`))?.[1];
  const template = home.match(new RegExp(`<template\\b[^>]*data-case-template="${project.id}"[^>]*>([\\s\\S]*?)<\\/template>`))?.[1];
  assert.ok(card && template, `${project.id} has both a homepage card and an opened-case template`);
  for (const [view, markup] of [['card', card], ['standalone', html], ['opened', template]]) for (const [video] of markup.matchAll(/<video\b[^>]*>/g)) assert.ok(/\sloop(?:\s|>|=)/.test(video.replace(/"[^"]*"/g, '""')), `${project.id} ${view} video loops regardless of its controls`);
  for (const [view, markup] of [['standalone', html], ['opened', template]]) {
    const heroes = [...markup.matchAll(/<(?:div|figure|case-video-player)\b[^>]*class="([^"]*\bcase-study-artwork\b[^"]*)"[^>]*>/g)];
    assert.equal(heroes.length, 1, `${project.id} ${view} case has one hero frame`);
    assert.ok(!/case-study-media--(?:floating|shadow|bare|wide-stroke|outside-stroke)/.test(heroes[0][1]), `${project.id} ${view} hero does not acquire a second content-media frame at the animation handoff`);
    for (const player of markup.matchAll(/<case-video-player\b([^>]*)>([\s\S]*?)<\/case-video-player>/g)) {
      const source = player[2].match(/<source\b[^>]*data-src="([^"]+)"/)?.[1].split('?')[0];
      const preview = player[1].match(/data-preview="([^"]+)"/)?.[1];
      assert.ok(source && preview && player[2].includes('data-video-preview'), `${project.id} ${view} controlled recordings always include the shared preview`);
      const metadata = JSON.parse(textFromMarkup(preview));
      assert.deepEqual(metadata, caseVideoPreviews[source], 'The thumbnail sheet belongs to this original recording');
      assert.ok(existsSync(new URL(`../public${metadata.src.split('?')[0]}`, import.meta.url)), 'Every shared preview resolves to a real local thumbnail sheet');
      assert.equal(player[2].includes('data-video-mute'), project.id === 'telegram-file-picker', 'Only Telegram has the sound toggle');
      if (view === 'standalone') controlledRecordings.add(source);
    }
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
    assert.ok(html.includes('/projects/hooko-case-study/hooko-logo.svg'), 'Hooko uses the supplied SVG logo');
    for (const [view, markup] of [['standalone', html], ['opened', template]]) {
      const links = [...markup.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
        .filter(([, , label]) => textFromMarkup(label) === 'App Store');
      assert.equal(links.length, 2, `${view} Hooko overview and ending both expose the App Store destination`);
      assert.ok(links.every(([, href]) => href === hookoAppUrl), `${view} Hooko links use the shared canonical destination`);
    }
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
  } else if (project.id === 'team-sternfit') {
    for (const section of ['brands', 'main', 'flow', 'phone', 'guide']) assert.ok(html.includes(`id="ts-${section}"`), `Team Sternfit includes its complete ${section} chapter`);
    assert.equal(imageSources.length, 20, 'Team Sternfit preserves every original photo, screen, type specimen and recording poster');
    assert.equal(vectorMarks.length, 1, 'The original project logo uses shared SVG rendering');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(videoSources, ['signature', 'loader'].map(name => `/projects/team-sternfit-case-study/${name}.mp4`), 'Both original recordings use the shared viewport-aware player lifecycle');
    for (const src of [...imageSources, ...videoSources, project.logo]) {
      assertOriginalEvidence(src, sourceFingerprint(`team-sternfit/source/${src.split('/').at(-1)}`), 'Sternfit evidence matches the reference bytes without reconstruction or recompression');
    }
    assert.ok(html.includes('Roy Huang, Co-Founder of Team Sternfit.') && html.includes('Seeking the crazy ones.'), 'The complete team and five-block story retain the supplied copy');
    assert.ok(!html.includes('Draft case study') && !html.includes('fictional concept'), 'Team Sternfit is a complete real case study');
  } else if (project.id === 'gutsul-made') {
    for (const section of ['branding', 'main', 'catalog', 'product', 'pages', 'responsive', 'style']) assert.ok(html.includes(`id="gm-${section}"`), `Gutsul Made includes the ${section} chapter`);
    assert.equal(imageSources.length, 20, 'Gutsul Made keeps every original photograph, screen and recording poster');
    assert.equal(vectorMarks.length, 9, 'The identity, four original diagrams and four ornament strips use shared SVG rendering');
    assert.equal([...html.matchAll(/class="case-study-media__sequence"/g)].length, 2, 'Main and catalog compose continuous previews');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(videoSources, ['main-counters', 'phone-menu'].map(name => `/projects/gutsul-made-case-study/${name}.mp4`));
    for (const src of [...imageSources, ...videoSources, '/projects/gutsul-made-case-study/logo.svg', ...['sketch','grid','frame','final'].map(name => `/projects/gutsul-made-case-study/logo-${name}.svg`)]) {
      assertOriginalEvidence(src, sourceFingerprint(`gutsul-made/source/${src.split('/').at(-1)}`), 'Gutsul artwork matches the reference bytes');
    }
    assert.ok(html.includes('case-study-media--canvas') && card.includes('background:var(--color-white)'), 'The transparent hero retains the same white canvas in both presentations');
    assert.ok(!html.includes('>Team</h2>') && !html.includes('Draft case study'), 'Only supplied project metadata is rendered');
  } else if (project.id === 'promshyna') {
    for (const section of ['path', 'responsive', 'other', 'branding']) assert.ok(html.includes(`id="ps-${section}"`), `PromShyna includes the ${section} chapter`);
    for (const number of ['01', '02', '03', '04', '05', '06']) assert.ok(html.includes(`id="ps-page-${number}"`), `PromShyna includes purchase step ${number}`);
    assert.equal(imageSources.length, 19, 'PromShyna includes every original product screenshot, recording poster and branding specimen');
    assert.equal(vectorMarks.length, 1, 'PromShyna keeps its supplied SVG identity');
    for (const name of ['logo-before', 'logo-after', '404-sign']) {
      const src = `/projects/promshyna-case-study/${name}.png`;
      for (const markup of [html, template]) assert.ok(markup.includes(`src="${src}"`), 'Standalone and opened cases use the original PNG branding specimens');
      assertOriginalEvidence(src, sourceFingerprint(`promshyna/source/${name}.png`), 'Brand specimens match the reference bytes without tracing or recompression');
    }
    assert.equal([...html.matchAll(/class="case-study-media__sequence"/g)].length, 2, 'Home and category combine their screenshot and recording segments inside one shared media frame');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(videoSources, ['home-slider', 'listing-top', 'phone-product'].map(name => `/projects/promshyna-case-study/${name}.mp4`), 'All three original recordings retain their narrative order');
    for (const src of videoSources) assert.ok(existsSync(new URL('../public' + src, import.meta.url)), 'Local PromShyna recording exists');
    assert.ok(!html.includes('Draft case study') && !html.includes('fictional concept'), 'PromShyna is a complete real case study');
  } else if (project.id === 'pet-care') {
    for (const section of ['competition', 'research', 'prototype', 'main', 'physical', 'emotional', 'needs', 'guide', 'animation']) assert.ok(html.includes(`id="pc-${section}"`), `Pet Care includes ${section}`);
    assert.equal(imageSources.length, 10, 'Pet Care includes the supplied still hero plus all original screens, specimens and animation poster');
    assert.equal(imageSources[0], '/projects/pet-care-case-study/hero-static.jpg', 'The supplied screenshot is the case hero');
    assert.ok(!project.video && !card.includes('data-project-video'), 'The collection card uses the same static hero');
    assert.ok(html.indexOf('id="pc-animation"') > html.indexOf('id="pc-guide"'), 'The original animation closes the case after the style guide');
    assert.equal(vectorMarks.length, 2, 'Identity and style guide use the same supplied SVG through shared components');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(videoSources, ['/projects/pet-care-case-study/hero.mp4']);
    for (const src of [...imageSources, ...videoSources, '/projects/pet-care-case-study/logo.svg']) assertOriginalEvidence(src, sourceFingerprint(`pet-care/source/${src.split('/').at(-1)}`), 'Pet Care evidence is byte-identical to the supplied reference');
    for (const name of ['pets', 'physical', 'needs']) {
      assert.ok(html.includes(`srcset="/projects/pet-care-case-study/${name}-static.png"`), 'Animated screens have reduced-motion alternatives');
      assert.ok(existsSync(new URL(`../public/projects/pet-care-case-study/${name}-static.png`, import.meta.url)));
    }
    assert.ok(html.includes('Winner of a design competition. App concept for pet care.') && html.includes('>300</span>') && html.includes('>2</span>'), 'The approved winning-entry introduction and original brief statistics render');
    assert.ok(!html.includes('>Team</h2>') && !html.includes('data-video-controls'), 'The supplied role and control-free playback are preserved');
  } else if (project.id === 'square') {
    for (const section of ['challenge', 'lookbook', 'libido']) assert.ok(html.includes(`id="sq-${section}"`), `SQUARE includes ${section}`);
    assert.equal(imageSources.length, 4, 'SQUARE retains both Lookbook screens and both original recording posters');
    assert.equal(vectorMarks.length, 1, 'SQUARE uses its supplied SVG identity through the shared component');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^\"]+)"/g)].map(match => match[1]);
    assert.deepEqual(videoSources, ['lookbook', 'libido'].map(name => `/projects/square-case-study/${name}.mp4`), 'Both original motion concepts retain their order');
    for (const src of [...imageSources, ...videoSources, project.logo, '/projects/square-case-study/cover.jpg']) {
      assertOriginalEvidence(src, sourceFingerprint(`square/source/${src.split('/').at(-1)}`), 'SQUARE evidence matches the supplied reference bytes');
    }
    assert.ok(html.includes('Entry 41') && html.includes('Entry 36') && html.includes('Slava Kornilov'), 'Both entries and the original challenge context render');
    const behance = html.match(/<a\b[^>]*href="https:\/\/www\.behance\.net\/gallery\/62789483\/SQUARE-Interface-Game"[^>]*>([\s\S]*?)<\/a>/);
    assert.ok(behance && behance[0].includes('button--secondary') && behance[0].includes('button--arrow-up') && textFromMarkup(behance[1]) === 'See SQUARE on Behance', 'The source destination uses the requested shared secondary button and exact reference label');
    assert.ok(!html.includes('>Team</h2>') && !html.includes('data-video-controls'), 'SQUARE keeps its supplied role and silent control-free animations');
  } else if (project.id === 'kitchen-chatbot') {
    const sourceCopy = JSON.parse(readFileSync(new URL('./fixtures/reference/kitchen-chatbot/reference-copy.json', import.meta.url), 'utf8'));
    assert.ok(html.includes('id="kc-conversation"'), 'Kitchen Chatbot includes its complete conversation chapter');
    assert.deepEqual(imageSources, ['/projects/kitchen-chatbot-case-study/chatbot.gif'], 'The supplied GIF remains the original hero');
    assert.equal(vectorMarks.length, 1, 'Kitchen Chatbot uses its supplied genuine SVG identity through the shared component');
    for (const src of [...imageSources, project.logo]) assertOriginalEvidence(src, sourceFingerprint(`kitchen-chatbot/source/${src.split('/').at(-1)}`), 'Kitchen Chatbot artwork matches the supplied reference bytes');
    for (const markup of [html, template, card]) {
      assert.ok(markup.includes('media-canvas-fade') && markup.includes('--media-fade-size:66.66666666666666% 88.23529411764706%'), 'Every hero presentation fades the native GIF rectangle into the staged canvas');
      assert.ok(markup.includes('prefers-reduced-motion: reduce') && markup.includes('/projects/kitchen-chatbot-case-study/chatbot-static.png'), 'Card, opened case and standalone have a static reduced-motion alternative');
    }
    assert.ok(existsSync(new URL('../public/projects/kitchen-chatbot-case-study/chatbot-static.png', import.meta.url)));
    for (const markup of [html, template]) {
      const credit = markup.match(/<p\b[^>]*data-case-credit[^>]*>([\s\S]*?)<\/p>/)?.[1];
      assert.equal(textFromMarkup(credit), sourceCopy.credit, 'The supplied Vic Bell mascot credit is preserved beside the introduction');
      assert.ok(!markup.includes('>My role</h2>') && !markup.includes('>Team</h2>'), 'The source has no invented role or team block');
      const readable = textFromMarkup(markup);
      for (const copy of sourceCopy.conversation.description) assert.ok(readable.includes(copy), 'Conversation explanation retains exact source copy');
      for (const message of sourceCopy.conversation.messages) {
        if (message.kind === 'dishes') for (const dish of message.items) assert.ok(readable.includes(dish.title), 'All original recipe choices render');
        else assert.ok(readable.includes(message.text), 'The complete original chat sequence renders');
      }
    }
  } else if (project.id === 'telegram-file-picker') {
    const sourceCopy = JSON.parse(readFileSync(new URL('./fixtures/reference/telegram-file-picker/reference-copy.json', import.meta.url), 'utf8'));
    for (const section of ['competition', 'video', 'result']) assert.ok(html.includes(`id="tg-${section}"`), `Telegram includes ${section}`);
    assert.deepEqual(imageSources, ['hero.jpg', 'poster.jpg', 'support.png'].map(name => `/projects/telegram-file-picker-case-study/${name}`), 'Telegram retains both native recording posters and the original support screenshot');
    assert.equal(vectorMarks.length, 1, 'Telegram uses its genuine supplied SVG identity');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(videoSources, ['hero.mp4', 'entry.mp4'].map(name => `/projects/telegram-file-picker-case-study/${name}`), 'The hero loop precedes the full submission');
    for (const src of [...imageSources, ...videoSources, project.logo]) assertOriginalEvidence(src, sourceFingerprint(`telegram-file-picker/source/${src.split('/').at(-1)}`), 'Telegram media matches the supplied original bytes');
    for (const markup of [html, template]) {
      const readable = textFromMarkup(markup);
      for (const text of [...sourceCopy.competition.description, sourceCopy.entry.description, sourceCopy.result.description]) assert.ok(readable.includes(text), 'All narrative copy remains exact');
      for (const stat of sourceCopy.competition.stats) for (const text of [stat.title, stat.value, stat.description]) assert.ok(readable.includes(text), 'All four supplied competition facts render');
      const videos = [...markup.matchAll(/<video\b[^>]*>/g)].map(match => match[0]);
      assert.equal(videos.length, 2);
      assert.ok(videos.every(video => /\bloop\b/.test(video)), 'Both Telegram recordings loop, including the full entry');
      assert.ok(markup.includes('data-audio-controls') && markup.includes('data-video-mute') && markup.includes('Sound off. Turn sound on'), 'The submission has the shared opt-in sound control');
      assert.ok(!markup.includes('>My role</h2>') && !markup.includes('>Team</h2>'), 'Telegram has no invented role or team metadata');
    }
  } else if (project.id === 'design-cup') {
    const sourceCopy = JSON.parse(readFileSync(new URL('./fixtures/reference/design-cup/reference-copy.json', import.meta.url), 'utf8'));
    for (const section of ['page', 'jury', 'page-end', 'style']) assert.ok(html.includes(`id="dc-${section}"`), `Design Cup includes its ${section} chapter`);
    assert.deepEqual(imageSources, ['hero.webp', 'landing.gif', 'jury.gif', 'signup-still.webp', 'organizers-still.webp', 'lettering.webp'].map(name => `/projects/design-cup-case-study/${name}`), 'Design Cup retains each original artwork presentation');
    assert.equal(vectorMarks.length, 1, 'Design Cup identity uses the original genuine SVG');
    const animatedSources = [...html.matchAll(/data-case-animated-image="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(animatedSources, ['signup.webp', 'organizers.webp'].map(name => `/projects/design-cup-case-study/${name}`), 'The two original play-once closing previews start through shared media');
    for (const src of [...imageSources, ...animatedSources, project.logo, sourceCopy.hero.reducedMotionSrc, sourceCopy.jury.media.reducedMotionSrc]) assertOriginalEvidence(src, sourceFingerprint(`design-cup/source/${src.split('/').at(-1)}`), 'Design Cup media is byte-identical to the supplied source');
    for (const markup of [html, template]) {
      const readable = textFromMarkup(markup);
      for (const text of [sourceCopy.page.description, sourceCopy.jury.description, ...sourceCopy.ending.map(block => block.description), sourceCopy.guide.description, sourceCopy.guide.lettering.description, sourceCopy.guide.coloursDescription]) assert.ok(readable.includes(text), 'Design Cup narrative retains exact source copy');
      for (const colour of sourceCopy.guide.colours) for (const text of [colour.name, colour.description, colour.value]) assert.ok(readable.includes(text), 'All six original colour specimens render');
      assert.ok(markup.includes('prefers-reduced-motion: reduce') && markup.includes('hero-still.webp') && markup.includes('jury-still.webp'), 'Every animation has its original static motion alternative');
      assert.ok(markup.includes('>My role</h2>') && !markup.includes('>Team</h2>'), 'Design Cup includes the supplied Designer role without invented team metadata');
      assert.ok(!markup.includes('data-video-controls'), 'Original GIF and WebP evidence does not acquire a video controller');
    }
  } else if (project.id === 'voximplant-ivr') {
    const sourceCopy = JSON.parse(readFileSync(new URL('./fixtures/reference/voximplant-ivr/reference-copy.json', import.meta.url), 'utf8'));
    assert.ok(html.includes('id="ivr-flow"'), 'Voximplant IVR includes its complete test-call flow');
    assert.deepEqual(imageSources, ['hero.webp', 'landing.gif'].map(name => `/projects/voximplant-ivr-case-study/${name}`), 'The original hero and full-page animation retain source order');
    assert.equal(vectorMarks.length, 1, 'Voximplant IVR identity uses the supplied genuine SVG');
    for (const src of [...imageSources, project.logo, sourceCopy.hero.reducedMotionSrc, sourceCopy.flow.media.reducedMotionSrc]) assertOriginalEvidence(src, sourceFingerprint(`voximplant-ivr/source/${src.split('/').at(-1)}`), 'Voximplant IVR artwork matches the source bytes');
    for (const markup of [html, template]) {
      const readable = textFromMarkup(markup);
      for (const text of [sourceCopy.team, sourceCopy.flow.title, ...sourceCopy.flow.description, sourceCopy.role.title, ...sourceCopy.role.items]) assert.ok(readable.includes(text), 'The supplied flow, role and team copy remain exact');
      assert.ok(markup.includes('prefers-reduced-motion: reduce') && markup.includes('hero-still.webp') && markup.includes('landing-still.webp'), 'Both original animations retain their supplied reduced-motion stills');
      assert.ok(markup.includes('>My role</h2>') && markup.includes('>Team</h2>'), 'The supplied Designer and engineering-team context render');
      assert.ok(!markup.includes('data-video-controls'), 'Original animated image evidence does not acquire a video controller');
    }
    for (const markup of [html, template, card]) assert.ok(markup.includes('89.52%'), 'The hero keeps its source purple and white canvas boundary');
  } else if (['offf-conference', 'professions-in-digital', 'quit-university'].includes(project.id)) {
    const sourceCopy = JSON.parse(readFileSync(new URL(`./fixtures/reference/${project.id}/reference-copy.json`, import.meta.url), 'utf8'));
    const base = `/projects/${project.id}-case-study/`;
    const prefix = { 'offf-conference': 'offf', 'professions-in-digital': 'pid', 'quit-university': 'qu' }[project.id];
    assert.ok(html.includes(`id="${prefix}-page"`), 'The shared recording case includes the complete Full scroll chapter');
    assert.deepEqual(imageSources, Array(2).fill(base + 'hero-still.jpg'), 'Both original recordings retain the supplied poster');
    assert.equal(vectorMarks.length, 1, 'The identity uses the supplied genuine SVG through the shared component');
    const videoSources = [...html.matchAll(/<source[^>]+data-src="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(videoSources, ['hero.mp4', 'page.mp4'].map(name => base + name), 'The original hero intro precedes the full recording');
    for (const src of [...new Set(imageSources), ...videoSources, project.logo]) assertOriginalEvidence(src, sourceFingerprint(`${project.id}/source/${src.split('/').at(-1)}`), 'Recording case media matches the original bytes');
    const parts = project.id === 'offf-conference' ? [1, 2, 3] : [1, 2];
    const joined = sourceFingerprint(`${project.id}/source/page.mp4:concatenated`);
    assert.deepEqual(joined.sources, parts.map(i => `${project.id}/source/video-${i}.mp4`), 'Source chunk order is preserved');
    assertOriginalEvidence(base + 'page.mp4', joined, 'The archived full original is verified against its successive byte chunks');
    const previewName = project.id === 'offf-conference' ? 'offf-page' : `${project.id}-page`;
    const previewProof = JSON.parse(readFileSync(new URL(`./fixtures/reference/shared-video-controller/${previewName}-preview-metadata.json`, import.meta.url), 'utf8'));
    const sha = src => createHash('sha256').update(readFileSync(new URL(`../public${src}`, import.meta.url))).digest('hex');
    assert.equal(getVideoVariant(base + 'page.mp4').originalSha256, previewProof.sourceSha256, 'Hover thumbnails were decoded from this original recording');
    assert.equal(sha(base + 'page-preview.jpg'), previewProof.previewSha256, 'The packed thumbnail sheet matches the decoded-frame manifest');
    const preview = caseVideoPreviews[base + 'page.mp4'];
    for (const key of ['count', 'interval', 'columns', 'rows', 'width', 'height']) assert.equal(preview[key], previewProof[key], `Recording preview ${key} matches the original-frame sheet`);
    for (const markup of [html, template]) {
      const readable = textFromMarkup(markup);
      assert.ok(readable.includes(sourceCopy.page.title) && readable.includes(sourceCopy.page.description), 'Full scroll title and caption retain exact reference wording');
      assert.equal([...markup.matchAll(/<case-video-player\b/g)].length, 1, 'The full recording uses the shared controller while the hero stays control-free');
      assert.ok(!markup.includes('data-video-mute') && !markup.includes('data-audio-controls'), 'Recording cases have no sound on/off button');
      assert.ok(!markup.includes('>My role</h2>') && !markup.includes('>Team</h2>'), 'Recording cases add no role or team metadata absent from the source');
    }
    if (['professions-in-digital', 'quit-university'].includes(project.id)) {
      assert.equal(project.video.cropPixels, 3, 'The card uses the reference crop in original source pixels');
      const { width, height, cropPixels } = sourceCopy.hero;
      for (const markup of [card, html, template]) assert.ok(markup.includes('media-crop-content') && markup.includes(`--media-ratio:${width - cropPixels * 2} / ${height - cropPixels * 2}`) && markup.includes(`--media-source-ratio:${width} / ${height}`), 'The same shared crop travels from the card into the hero and full player');
    }
    if (project.id === 'quit-university') {
      assert.equal(project.title, sourceCopy.title, 'Quit University keeps the exact source title');
      assert.equal(project.description, sourceCopy.description, 'Quit University keeps the exact source introduction');
      assert.deepEqual(project.tags, sourceCopy.tags, 'Quit University keeps the exact source disciplines');
    }
  } else {
    assert.fail(`Unverified case study: ${project.id}`);
  }
  assert.ok(!html.includes('Draft case study') && !html.includes('fictional concept'), 'All cases contain real supplied work');
  for (const src of imageSources) assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), `Local image exists: ${src}`);
}
assert.equal(controlledRecordings.size, 10, 'All ten controlled recordings have shared previews');
assert.deepEqual([...controlledRecordings].sort(), Object.keys(caseVideoPreviews).sort(), 'The shared mapping covers each controlled recording exactly once');
console.log('PASS: all 20 real-project cards, opened cases and standalone pages share matching metadata, original imagery and return controls; fictional routes are removed.');
console.log('PASS: all ten shared video controllers have matching thumbnail previews; sound controls appear only in Telegram.');

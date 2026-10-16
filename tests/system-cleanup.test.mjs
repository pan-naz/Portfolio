import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateTokenSource} from '../scripts/validate-foundation-code.mjs';
import {validateSystemCleanup,validateLogoLinks,validateAccentMixes,validateCatalogAccentEdges,validateProjectDemo,validateDataGPTBadges} from '../scripts/validate-system-cleanup.mjs';
assert.deepEqual(validateSystemCleanup(),[]);
assert(validateAccentMixes('.tag{background:color-mix(in srgb,var(--color-interactive-accent) 12%,var(--color-bg-surface))}').length);
assert.deepEqual(validateAccentMixes('.tag{background:var(--color-bg-accent-subtle)}'),[]);
assert.deepEqual(validateAccentMixes('.brand{background:color-mix(in srgb,var(--pc-pink) 8%,transparent)}'),[],'Private artwork keeps its own colors');
const sources=Object.fromEntries(['LogoLink','SiteHeader','DSNavigation','DSPreview'].map(name=>['src/components/'+name+'.astro',fs.readFileSync('src/components/'+name+'.astro','utf8')]));
assert.deepEqual(validateLogoLinks(sources),[]);
assert(validateLogoLinks({...sources,'src/components/Rogue.astro':'<a aria-label="naz.wtf — home"><Logo /></a>'}).length);
assert(validateLogoLinks({...sources,'src/components/DSPreview.astro':sources['src/components/DSPreview.astro'].replace('<LogoLink','<a')}).length);
console.log('Shared home links, accent role, canonical DataGPT labels and original quote/hero constraints pass.');

const tokens=fs.readFileSync('src/styles/tokens.css','utf8');
assert.deepEqual(validateTokenSource(tokens),[]);
assert(validateTokenSource(tokens+'\n:where(.skill-tag--accent){--color-text-primary:red}').some(error=>error.startsWith('Class-driven theme token:')),'Local tint resolution cannot override theme roles.');

const spacing=fs.readFileSync('src/styles/design-system.css','utf8'),motion=fs.readFileSync('src/styles/design-system-motion.css','utf8');
assert.deepEqual(validateCatalogAccentEdges(spacing,motion),[]);
assert(validateCatalogAccentEdges(spacing.replace('border-inline:1px solid var(--color-interactive-accent);',''),motion).length,'The gap marker must keep both accent edges.');
assert(validateCatalogAccentEdges(spacing,motion.replace('border-top:1px solid var(--color-interactive-accent);','border-top:1px solid #F25A30;')).length,'Caption emphasis must use the accent role.');
assert(validateCatalogAccentEdges(spacing.replace('background:var(--color-bg-accent-subtle);','background:var(--color-interactive-accent);'),motion).length,'The marker fill stays the single subtle tint.');

assert.deepEqual(validateProjectDemo(motion),[]);
assert(validateProjectDemo(motion.replace('background:none;','background:var(--color-bg-accent-subtle);')).length,'The card outline cannot cover the caption with a fill.');
assert(validateProjectDemo(motion.replace('z-index:var(--layer-content);','')).length,'The outline stays above the caption.');
const badges=fs.readFileSync('src/styles/datagpt-case-study.css','utf8');
assert.deepEqual(validateDataGPTBadges(badges),[]);
for(const reservation of['inline-size:10em','min-height:26px','width:160px'])assert(validateDataGPTBadges(badges+`.dg-persona .dg-badge{${reservation}}`).length,'Badge reservations fail.');
assert(validateDataGPTBadges(badges.replace('white-space: nowrap;','white-space: normal;')).length,'Badges stay on one line.');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateTokenSource} from '../scripts/validate-foundation-code.mjs';
import {validateSystemCleanup,validateLogoLinks,validateAccentMixes} from '../scripts/validate-system-cleanup.mjs';
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

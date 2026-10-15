import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {validateGeometry,validateSpaceShape,spaceUsageCounts,isWebsiteUsageSource,layoutSource} from '../scripts/validate-space-shape.mjs';
import {spacingLayoutSystem} from '../src/data/system-spacing-layout.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
assert.deepEqual(validateSpaceShape(),[]);
const model=spacingLayoutSystem(buildSystemInventory().tokens),counts=spaceUsageCounts(),layout=layoutSource();
assert.deepEqual(model.spaces.map(s=>s.px),[4,8,12,16,24,32,48,64,96]);
for(const s of model.spaces)assert.equal(s.uses,counts[s.name]);
assert.deepEqual(model.layouts.map(l=>[l.projects,l.metrics]),[[2,3],[2,3],[1,1]]);
assert.equal(model.layouts[0].range,`${layout.desktop}px and wider`);
assert.equal(model.radius[3].value,'Scales with the window · 59 → 100px');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'space-shape-'));
try {
 fs.mkdirSync(path.join(fixture,'src/styles'),{recursive:true});
 fs.copyFileSync('src/styles/tokens.css',path.join(fixture,'src/styles/tokens.css'));
 const test=value=>{fs.writeFileSync(path.join(fixture,'src/styles/test.css'),value);return validateGeometry(fixture,[]);};
 assert(test('@layer system {.x {--local-gap:24px;padding:var(--local-gap)}}').some(e=>e.includes('Exact token equivalent')));
 assert(test('@layer system {.x {padding:24px}}').some(e=>e.includes('Exact token equivalent')));
 assert(test('@layer system {.x {border-radius:12px}}').some(e=>e.includes('Exact token equivalent')));
 assert(test('@layer system {.x {box-shadow:0 8px 24px rgb(22 23 21 / .10)}}').some(e=>e.includes('Exact token equivalent')));
 assert(test('@layer system {.x {box-shadow:0 8px 24px rgb(22 23 21 / 0.1)}}').some(e=>e.includes('Exact token equivalent')));
 assert(test('@layer system {.x {margin:28px}}').some(e=>e.includes('Unlisted off-scale')));
 assert.deepEqual(test('@layer project {.x {padding:24px;margin:28px}}'),[]);
 assert.deepEqual(test('@layer system {.x {padding:var(--space-6)}}'),[]);
}finally{fs.rmSync(fixture,{recursive:true,force:true});}
console.log('Space/shape audit: exact duplicates and unknown exceptions fail; project artwork remains separate; catalog values and counts follow source.');

for(const file of ['src/styles/design-system-motion.css','src/styles/design-system.css','src/components/DSMotion.astro','src/layouts/DSLayout.astro','src/scripts/design-system-motion.ts','src/data/system-motion.ts','src/pages/design-system/index.astro'])assert.equal(isWebsiteUsageSource(file),false,file);
for(const file of ['src/styles/global.css','src/styles/tokens.css','src/components/Button.astro','src/styles/hooko-case-study.css'])assert.equal(isWebsiteUsageSource(file),true,file);
const countsFixture=fs.mkdtempSync(path.join(os.tmpdir(),'website-uses-'));
try{
 fs.mkdirSync(path.join(countsFixture,'src/styles'),{recursive:true});
 fs.writeFileSync(path.join(countsFixture,'src/styles/design-system-motion.css'),'.x{padding:var(--space-6)}');
 assert.equal(spaceUsageCounts(countsFixture)['space-6'],0);
 fs.writeFileSync(path.join(countsFixture,'src/styles/global.css'),'.x{padding:var(--space-6);gap:var(--space-6)}\n// var(--space-6)\n/* var(--space-6) */\n<!-- var(--space-6) -->');
 assert.equal(spaceUsageCounts(countsFixture)['space-6'],2);
}finally{fs.rmSync(countsFixture,{recursive:true,force:true});}

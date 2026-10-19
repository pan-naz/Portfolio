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
 for(const declaration of ['scroll-padding-top:112px','scroll-padding-top:100px','left:206px','padding-bottom:150px','padding-bottom:70px','padding-inline:14px','border-radius:2px'])assert(test('@layer system {.x {'+declaration+'}}').some(e=>e.includes('Exact token equivalent')),'Named component tokens must reject duplicates: '+declaration);
 assert(test('@layer system {.x {margin:28px}}').some(e=>e.includes('Unlisted off-scale')));
 assert(test('@layer project {.x {padding:24px;margin:28px}}').some(e=>e.includes('Unlisted off-scale')),'Case-study geometry must have a reviewed artwork reason');
 for(const declaration of ['scroll-padding-top:112px','scroll-padding-top:100px','width:44px','height:16px','min-height:24px','z-index:2','opacity:.44','--local-size:44px;width:var(--local-size)'])assert(test('@layer system {.x {'+declaration+'}}').length,'Reject raw or hidden token equivalents: '+declaration);
 assert(test('@layer system {.x {z-index:5;opacity:.8;width:37px}}').filter(e=>e.includes('Unlisted off-scale')).length===3,'Unknown dimensions, stacking and opacity each need a reason');
 assert.deepEqual(test('@layer system {.x {opacity:0}.x:hover{opacity:1}}'),[],'Visibility endpoints are not opacity roles');
 const artwork='@layer project {.brand {margin:3px;width:24px}}';
 fs.writeFileSync(path.join(fixture,'src/styles/test.css'),artwork);
 const {auditGeometry}=await import('../scripts/validate-space-shape.mjs');
 const reviewed=auditGeometry(fixture).map(r=>({...r,reason:'Project-only supplied diamond geometry.'}));
 assert.deepEqual(validateGeometry(fixture,reviewed),[]);
 const live={file:'src/styles/test.css',selector:'.brand',context:'@layer project',property:'--advance',value:'10.5em',kind:'spacing',reason:'Project text geometry.'};
 fs.writeFileSync(path.join(fixture,'src/styles/test.css'),'@layer project {.brand {--advance:10.5em}}');
 assert.deepEqual(validateGeometry(fixture,[live]),[],'Live declarations match even when their units are outside the numeric audit');
 for(const changed of [{file:'src/styles/missing.css'},{selector:'.other'},{context:'@layer system'},{property:'--removed'},{value:'11em'}]){
  const entry={...live,...changed};
  assert.deepEqual(validateGeometry(fixture,[entry]),[`Stale geometry exception: ${entry.file} ${entry.context} ${entry.selector} ${entry.property}: ${entry.value}`],'Stale entries name the exact unmatched declaration');
 }
 fs.writeFileSync(path.join(fixture,'src/styles/test.css'),artwork);
 assert(validateGeometry(fixture,reviewed.map(r=>({...r,project:false}))).some(e=>e.includes('Exact token equivalent')),'Only actual project-layer artwork gets the exception');
 assert.deepEqual(test('@layer system {.x {width:var(--control-icon);z-index:var(--layer-raised);opacity:var(--opacity-disabled)}}'),[]);
 assert.deepEqual(test('@layer system {.x {padding:var(--space-6)}}'),[]);
 const tokenFile=path.join(fixture,'src/styles/tokens.css'),tokenSource=fs.readFileSync(tokenFile,'utf8');
 fs.writeFileSync(tokenFile,tokenSource.replace('--header-height: 64px','--header-height: 72px'));
 assert(test('@layer system {.x {height:72px}}').some(e=>e.includes('Exact token equivalent')),'Duplicate checks follow future source token values');
 fs.writeFileSync(tokenFile,tokenSource);
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

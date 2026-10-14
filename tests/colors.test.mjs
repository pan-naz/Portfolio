import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {validateColorPalette,validateColorUses,validateCatalogInnerPanels,validateSharedColorLiterals,validateColorDocumentation,validateColors} from '../scripts/validate-colors.mjs';
import {paletteColors,strokeCards} from '../src/data/system-colors.ts';import {readSystemTokens} from '../src/data/system-inventory.ts';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8'),css=read('src/styles/tokens.css'),tokens=readSystemTokens(css);
assert.deepEqual(validateColors(),[]);
assert.equal(paletteColors.length, 12);
const catalogCss=read('src/styles/design-system.css');
assert.deepEqual(validateCatalogInnerPanels(catalogCss),[]);
assert.ok(validateCatalogInnerPanels(catalogCss+"\n:root[data-theme='dark'] :is(.ds-color-card,.ds-stroke-card,.ds-code pre,.ds-type-device-header,.ds-type-device) { background:var(--color-bg-surface); }").length,'Dark inner-panel Surface override cannot return');
assert.ok(validateCatalogInnerPanels(catalogCss.replace(/(\.ds-code pre \{[^}]*background:)var\(--color-bg-canvas\)/,'$1var(--color-bg-surface)')).length,'Inner Canvas binding cannot be replaced');
for(const token of ['color-charcoal','color-night']){const wrongLabel=structuredClone(paletteColors);wrongLabel.find(color=>color.token===token).uses[0].label='Wrong label';assert.ok(validateColorUses(css,wrongLabel).length,'Dark role labels are guarded');}
for(const role of ['color-smoke','color-bg-raised','color-bg-raised-hover']) assert.ok(!(role in tokens.light) && !(role in tokens.dark), 'Retired role stays removed: ' + role);
assert.ok(validateColorPalette(css+'\n:root {--color-bg-raised:var(--color-white);}').length, 'Merged role cannot return');
assert.deepEqual(validateColorDocumentation(undefined),[],'Vercel validates the reviewed receipt when external docs are absent');
assert.ok(validateColorDocumentation('## Colour\nIncorrect or incomplete contract.').length,'Changed/missing Colour contract fails');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'palette-guard-'));
try{fs.mkdirSync(path.join(fixture,'src/data'),{recursive:true});fs.writeFileSync(path.join(fixture,'src/data/shared.ts'),'export const background = "#123456";');assert.ok(validateSharedColorLiterals(fixture).length,'Shared data colour literals fail');fs.renameSync(path.join(fixture,'src/data/shared.ts'),path.join(fixture,'src/data/example-case-study.ts'));assert.deepEqual(validateSharedColorLiterals(fixture),[],'Private project data stays excluded');}finally{fs.rmSync(fixture,{recursive:true,force:true});}

assert.ok(validateColorPalette(css.replace('--color-ink: #161715;','--color-ink: #FFFFFF;')).length,'Duplicated palette colour fails');
assert.ok(validateColorPalette(css+'\n:root {--color-white:#FFFFFF;}').length,'Repeated palette definition fails');
assert.ok(validateColorPalette(css+'\n:root {--bad:#123456;}').length,'Literal outside palette fails');
assert.ok(validateColorUses(css+'\n:root {--color-extra-role:var(--color-ink);}').length,'A newly declared page role must have a colour use');
assert.ok(validateColorUses(css+'\n:root[data-theme=\"dark\"] {--color-extra-dark-role:var(--color-paper);}').length,'A dark-only page role must also have a colour use');
assert.ok(validateColorPalette(css.replace('--color-ink-8: rgb(22 23 21 / 0.08);','--color-ink-8: rgb(22 23 21 / 0.06);')).length,'Shade names must match opacity');
assert.ok(validateColorUses(css,paletteColors,strokeCards.slice(1)).length,'Missing stroke role fails');
assert.ok(validateColorUses(css,paletteColors,[...strokeCards,strokeCards[0]]).length,'Duplicate stroke role fails');
const missing=structuredClone(paletteColors);missing.find(c=>c.name==='Ink').uses[0].roles.pop();assert.ok(validateColorUses(css,missing).length,'Missing page role fails');
const wrong=structuredClone(paletteColors);wrong[0].uses[0].roles.push('color-bg-canvas');assert.ok(validateColorUses(css,wrong).length,'Wrong colour/use mapping fails');
const duplicate=structuredClone(paletteColors);duplicate[0].uses.push(duplicate[0].uses[0]);assert.ok(validateColorUses(css,duplicate).length,'Repeated page role fails');
for(const name of ['BaseLayout','DSLayout']){const layout=read('src/layouts/'+name+'.astro');assert.ok(layout.includes('content="'+tokens.value(tokens.light,'color-paper')+'"'),'Initial meta theme colour equals Paper');if(name==='BaseLayout')assert.ok(layout.includes("dark ? '"+tokens.value(tokens.dark,'color-ink')+"'"),'Dark initial meta equals Ink');}
assert.ok(read('src/scripts/theme.ts').includes("getPropertyValue('--color-bg-canvas')"),'Runtime theme colour comes from the page role');
console.log('PASS: palette uniqueness/literal guard, exact role-use coverage, rejected missing/wrong/duplicate roles and palette-verified theme metadata.');

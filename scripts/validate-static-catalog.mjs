import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {visibleComponents,dsComponents} from '../src/data/ds-components.ts';
import {componentPropSpecs} from '../src/data/system-props.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
import {validateInventoryCoverage,validateVariantCoverage,validateRenderedComponentNames} from './validate-design-system.mjs';
const root=resolve(import.meta.dirname,'..'),read=file=>readFileSync(resolve(root,file),'utf8');
const catalog=read('dist/design-system/index.html'),home=read('dist/index.html');
const styles=html=>[...html.matchAll(/<link[^>]*href="([^"]+\.css)"[^>]*>/g)].map(([,file])=>read('dist'+file)).concat([...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(([,css])=>css)).join('\n');
assert.equal((catalog.match(/\bdata-theme-control/g)||[]).length,1,'Only the header controls the page theme');
assert.equal((catalog.match(/\bdata-theme=/g)||[]).length,2,'Page theme plus the shared video player’s intentional fixed-dark controls');
assert.ok(catalog.includes('data-catalog')&&!home.includes('data-catalog'));
assert.ok(!styles(catalog).includes('html[data-static]'),'Live specimens must keep genuine transitions and states');
assert.ok(!styles(home).includes('.ds-sidebar')&&!styles(home).includes('.button--catalog')&&!styles(home).includes('.theme-toggle-group'),'Catalog layout and control appearances must not enter the website');
for(const retired of ['overview','accessibility','writing','wordmark','patterns','case-study-transition'])assert.ok(!catalog.includes(`id="${retired}"`),`Hidden or retired view: ${retired}`);
assert.equal((catalog.match(/<h1\b/g)||[]).length,1,'One global item heading');
const views=[...catalog.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*\bdata-ds-view/g)].map(([,id])=>id);
assert.equal(views.length,visibleComponents.length+5);
assert.equal((catalog.match(/<[^>]+role="tablist"/g)||[]).length,views.length*2);
assert.equal((catalog.match(/<[^>]+role="tabpanel"/g)||[]).length,views.length*4);
assert.ok(!catalog.includes('Not used')&&!catalog.includes('data-ds-preview-state'),'No frozen state matrix');
for(const id of views)for(const group of ['canvas','details'])for(let index=0;index<2;index++){
 const tab=`${id}-${group}-tab-${index}`,panel=`${id}-${group}-panel-${index}`;
 assert.ok(new RegExp(`id="${tab}"[^>]*aria-controls="${panel}"`).test(catalog));
 assert.ok(new RegExp(`id="${panel}"[^>]*aria-labelledby="${tab}"`).test(catalog));
}
const ids=[...catalog.matchAll(/\bid="([^"]+)"/g)].map(([,id])=>id);assert.equal(ids.length,new Set(ids).size,'Unique document ids');
const model=buildSystemInventory(root),names=[...new Set([...catalog.matchAll(/data-ds-component="([^"]+)"/g)].map(([,name])=>name))];
assert.deepEqual(validateRenderedComponentNames(names,visibleComponents.map(item=>item.name)),[]);
for(const entry of visibleComponents){const component=model.components.find(item=>item.name===entry.name);const view=catalog.match(new RegExp(`<section[^>]*id="${entry.section}"[\\s\\S]*?</section>`))?.[0]||'';const documented=[...view.matchAll(/data-ds-prop="([^"]+)"/g)].map(([,name])=>name);assert.deepEqual(documented,componentPropSpecs(component).map(prop=>prop.name),`All source props, including inherited fields: ${entry.name}`);}
const paths=dsComponents.map(item=>item.file),tokens=[...new Set([...catalog.matchAll(/data-ds-token="([^"]+)"/g)].map(([,name])=>name))],icons=[...new Set([...catalog.matchAll(/data-ds-icon="([^"]+)"/g)].map(([,name])=>name))];
assert.deepEqual(validateInventoryCoverage(model,paths,tokens,icons,read('src/styles/tokens.css'),catalog+styles(catalog)),[]);
const variantValues=[...catalog.matchAll(/data-ds-variant="([^"]+)"/g)].map(([,value])=>value);assert.deepEqual(validateVariantCoverage(model,variantValues),[]);
assert.ok(!model.projectFonts.some(font=>styles(catalog).includes(font)));
console.log(`Layout C verified: ${views.length} views, 19 reusable entries plus hidden Wordmark, linked panels and live shared styles.`);

import {validateRenderedIcons} from './validate-icons.mjs';
import {foundationSourceCode} from '../src/data/system-code.ts';
import {validateRenderedFoundationCode,validateRenderedThemeZones} from './validate-foundation-code.mjs';
import {spacingLayoutSystem} from '../src/data/system-spacing-layout.ts';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {visibleComponents,catalogComponents,dsComponents} from '../src/data/ds-components.ts';
import {projectCardProps} from '../src/data/system-project-card.ts';
import {navigationProps} from '../src/data/system-navigation.ts';
import {buttonProps} from '../src/data/system-button.ts';
import {componentPropSpecs} from '../src/data/system-props.ts';
import {buildSystemInventory} from '../src/data/system-inventory.ts';
import {validateInventoryCoverage,validateVariantCoverage,validateRenderedComponentNames,validateOverviewHiddenEntries} from './validate-design-system.mjs';
const root=resolve(import.meta.dirname,'..'),read=file=>readFileSync(resolve(root,file),'utf8');
const catalog=read('dist/design-system/index.html'),home=read('dist/index.html');
assert.deepEqual(validateRenderedIcons(catalog),[]);
const styles=html=>[...html.matchAll(/<link[^>]*href="([^"]+\.css)"[^>]*>/g)].map(([,file])=>read('dist'+file)).concat([...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(([,css])=>css)).join('\n');
assert.equal((catalog.match(/\bdata-theme-control/g)||[]).length,1,'Only the header controls the page theme');
assert.equal((catalog.match(/<[a-z][^>]*\sdata-theme=/g)||[]).length,6,'Page theme plus the main Media specimen and its four frozen states');
assert.match(catalog, /<html\b[^>]*\bdata-catalog(?:[\s=>])/);
assert.doesNotMatch(home, /<html\b[^>]*\bdata-catalog(?:[\s=>])/);
assert.ok(!styles(catalog).includes('html[data-static]'),'Live specimens must keep genuine transitions and states');
// The nine shared type rules may name catalog consumers; they carry no layout,
// colour or interaction appearance. Everything else remains catalog-only.
const withoutTypeRoles=styles(home).replace(/([^{}]+)\{([^{}]*)\}/g,(rule,selector,body)=>{
 const id=selector.match(/\.text-(heading-xl|heading-l|heading-m|body-l|body-m-strong|body-m|body-s|label-m|label-s)(?=,|\s|$)/)?.[1];
 if(!id)return rule;
 const expected={'font-family':'font','font-size':'text','font-weight':'font-weight','line-height':'line-height','letter-spacing':'letter-spacing'};
 let rest=body;for(const [property,prefix] of Object.entries(expected)){const declaration=`${property}:var(--${prefix}-${id})`;if(!rest.includes(declaration))return rule;rest=rest.replace(declaration,'');}
 rest=rest.replace('text-transform:uppercase','').replaceAll(';','').trim();return rest?rule:'';
});
assert.ok(!withoutTypeRoles.includes('.ds-sidebar')&&!withoutTypeRoles.includes('.button--catalog')&&!withoutTypeRoles.includes('.theme-toggle-group'),'Catalog layout and control appearances must not enter the website');
for(const retired of ['overview','accessibility','writing','wordmark','patterns','case-study-transition'])assert.ok(!catalog.includes(`id="${retired}"`),`Hidden or retired view: ${retired}`);
assert.equal((catalog.match(/<h1\b/g)||[]).length,1,'One global item heading');
const views=[...catalog.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*\bdata-ds-view/g)].map(([,id])=>id);
assert.equal(views.length,visibleComponents.length+6);
assert.ok(catalog.includes('id="dashboard"'));
const dashboardMarkup=catalog.match(/<section[^>]*id="dashboard"[\s\S]*?<\/section>/)?.[0];assert.ok(dashboardMarkup);
assert.deepEqual(validateOverviewHiddenEntries([...dashboardMarkup.matchAll(/data-ds-hidden-component="([^"]+)"/g)].map(([,key])=>key)),[]);
assert.equal((catalog.match(/data-ds-hidden-component=/g)||[]).length,(dashboardMarkup.match(/data-ds-hidden-component=/g)||[]).length,'Hidden notes belong only to Overview');
const overviewCards=[...catalog.matchAll(/<article class="ds-tile-frame"[^>]*>([\s\S]*?)<\/article>/g)].map(([,html])=>html);
assert.equal(overviewCards.length,visibleComponents.length+5);
for(const card of overviewCards){
 // Specimens keep their real links. Only links outside the inert preview are reachable.
 let divDepth=0,previewDepth=null,previews=0;
 const reachableLinks=[];
 for(const [,closing,tag,attributes] of card.matchAll(/<(\/?)([a-z][\w-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)){
  if(tag==='div'){
   if(closing){if(divDepth===previewDepth)previewDepth=null;divDepth--;}
   else{
    divDepth++;
    if(/\bclass="ds-tile-visual"/.test(attributes)){
     previews++;previewDepth=divDepth;
     assert.match(attributes,/\sinert(?:\s|=|$)/,'Overview preview is inert');
     assert.match(attributes,/\baria-hidden="true"/,'Overview preview is hidden from assistive technology');
    }
   }
  }
  if(tag==='a'&&!closing&&previewDepth===null)reachableLinks.push(attributes);
 }
 assert.equal(previews,1,'Each Overview card has one inert preview');
 assert.equal(reachableLinks.length,1,'One link outside the Overview preview');
 assert.match(reachableLinks[0],/\bclass="ds-tile-link"/,'The reachable link is the stretched title');
 assert.match(reachableLinks[0],/\btabindex="0"/);
 assert.match(reachableLinks[0],/\bdata-ds-nav(?:\s|=|$)/);
}
for(const attribute of ['property="og:title"','property="og:image:alt"'])assert.ok(new RegExp(attribute+'[^>]*content="Design system"').test(catalog),'Catalog metadata uses its short title');
assert.ok(catalog.includes('<title>Design system</title>'));

const sections=views.filter(id=>id!=='dashboard');
assert.equal((catalog.match(/<[^>]+role="tablist"/g)||[]).length,sections.length);
assert.equal((catalog.match(/<[^>]+role="tabpanel"/g)||[]).length,sections.length*2);
assert.ok(!catalog.includes('Not used')&&!catalog.includes('data-ds-preview-state'),'No frozen state matrix');
for(const id of sections)for(const group of ['canvas'])for(let index=0;index<2;index++){
 const tab=`${id}-${group}-tab-${index}`,panel=`${id}-${group}-panel-${index}`;
 assert.ok(new RegExp(`id="${tab}"[^>]*aria-controls="${panel}"`).test(catalog));
 assert.ok(new RegExp(`id="${panel}"[^>]*aria-labelledby="${tab}"`).test(catalog));
}
const templates=[...catalog.matchAll(/<template\b[^>]*>([\s\S]*?)<\/template>/g)].map(([,body])=>body);
for(const scope of [catalog.replace(/<template\b[^>]*>[\s\S]*?<\/template>/g,''),...templates]){const ids=[...scope.matchAll(/\bid="([^"]+)"/g)].map(([,id])=>id);assert.equal(ids.length,new Set(ids).size,'Unique ids within each document/template scope');}
const model=buildSystemInventory(root),names=[...new Set([...catalog.matchAll(/data-ds-component="([^"]+)"/g)].map(([,name])=>name))];
assert.deepEqual(validateRenderedComponentNames(names,catalogComponents.map(item=>item.name)),[]);
for(const entry of catalogComponents){const component=model.components.find(item=>item.name===entry.name);const hook=['button','chip','navigation','project-card'].includes(entry.section)?`data-ds-component-code="${entry.name}"`:`id="${entry.section}"`;const view=catalog.match(new RegExp(`<section[^>]*${hook}[\\s\\S]*?</section>`))?.[0]||'';const documented=[...view.matchAll(/data-ds-prop="([^"]+)"/g)].map(([,name])=>name);assert.deepEqual(documented,(entry.section==='button'?buttonProps(component):entry.section==='navigation'?navigationProps(component):entry.section==='project-card'?projectCardProps(component):componentPropSpecs(component)).map(prop=>prop.name),`All source props, including inherited fields: ${entry.name}`);}
const paths=dsComponents.map(item=>item.file),tokens=[...new Set([...catalog.matchAll(/data-ds-token="([^"]+)"/g)].map(([,name])=>name))],icons=[...new Set([...catalog.matchAll(/data-ds-icon="([^"]+)"/g)].map(([,name])=>name))];
assert.deepEqual(validateInventoryCoverage(model,paths,tokens,icons,read('src/styles/tokens.css'),catalog+styles(catalog)),[]);
const variantValues=[...catalog.matchAll(/data-ds-variant="([^"]+)"/g)].map(([,value])=>value);assert.deepEqual(validateVariantCoverage(model,variantValues),[]);
assert.ok(!model.projectFonts.some(font=>styles(catalog).includes(font)));
console.log(`Final catalog verified: ${views.length} views, eight pages for ten reusable entries plus eleven documented-hidden components, linked panels and live shared styles.`);

const spaceModel=spacingLayoutSystem(model.tokens);
for(const step of spaceModel.spaces){assert.ok(catalog.includes(`data-ds-space-uses="${step.name}">${step.uses} uses`),'Space count must match fresh source occurrences: '+step.name);assert.ok(catalog.includes(`height:var(--${step.name})`),'Scale bars must use the actual source token.');}
assert.deepEqual([...catalog.matchAll(/data-ds-layout-columns="(\d+)"/g)].map(m=>Number(m[1])),spaceModel.layouts.flatMap(l=>[l.projects,l.metrics]));
for(const name of ['spacing','layout','radius','shadows-light','shadows-dark'])assert.ok(catalog.includes('data-ds-code-source="'+name+'"'),'Complete labelled source code: '+name);
for(const token of spaceModel.radius.map(c=>c.token).concat(spaceModel.shadows.map(s=>s.token)))assert.ok(catalog.includes('data-ds-'+(token.startsWith('radius')?'radius':'shadow')+'="'+token+'"'));

assert.deepEqual(validateRenderedFoundationCode(catalog,foundationSourceCode(root).blocks),[]);
const builtPages=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?builtPages(resolve(directory,entry.name)):entry.name.endsWith('.html')?[resolve(directory,entry.name)]:[]);
for(const file of builtPages(resolve(root,'dist')))assert.deepEqual(validateRenderedThemeZones(readFileSync(file,'utf8')),[],`All former theme classes carry their exact zone metadata: ${file}`);

import {createHash} from 'node:crypto';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),astro=path.dirname(require.resolve('astro/package.json')),vite=path.dirname(require.resolve('vite/package.json',{paths:[astro]})),postcss=require(require.resolve('postcss',{paths:[vite]}));
import {readSystemTokens} from '../src/data/system-inventory.ts';
import {paletteColors,colorCards,paletteTokenNames,colorRoles,strokeCards,colorDocumentationReceipt} from '../src/data/system-colors.ts';
const root=path.resolve(import.meta.dirname,'..');
export function validateColorUses(css,colors=colorCards,strokes=strokeCards){
 const tokens=readSystemTokens(css),errors=[],seen={light:new Map(),dark:new Map()};
 for(const color of colors){
  if(!color.uses.length)errors.push('Palette color has no use: '+color.token);
  for(const use of color.uses)for(const mode of use.mode==='both'?['light','dark']:[use.mode])for(const role of use.roles){
   const palette=tokens[use.zone||mode],primitive=use.shade||color.token;
   if(tokens.value(palette,role)!==tokens.value(palette,primitive))errors.push(`${primitive}: ${role} does not resolve to this color in ${mode}`);
   if(!use.zone)seen[mode].set(role,(seen[mode].get(role)||0)+1);
  }
 }
 for(const stroke of strokes)for(const mode of ['light','dark']){
  let alias=stroke.role;const visited=new Set();while(alias&&!paletteTokenNames.includes(alias)&&!visited.has(alias)){visited.add(alias);alias=tokens[mode][alias]?.match(/^var\(--([\w-]+)\)$/)?.[1];}
  if(!alias||!paletteTokenNames.includes(alias))errors.push(`${mode}: ${stroke.role} must resolve to a palette color or shade`);
  seen[mode].set(stroke.role,(seen[mode].get(stroke.role)||0)+1);
 }
 const declaredPageRoles=[...new Set([...colorRoles,...Object.keys({...tokens.light,...tokens.dark}).filter(name=>name.startsWith('color-')&&!paletteTokenNames.includes(name)&&name!=='color-backdrop')])];
 for(const mode of ['light','dark'])for(const role of declaredPageRoles)if(seen[mode].get(role)!==1)errors.push(`${mode}: ${role} must appear exactly once`);
 for(const [token,role,label] of [['color-charcoal','color-bg-surface','Cards and surfaces'],['color-night','color-bg-section','Work and About']]){
  const use=colors.find(color=>color.token===token)?.uses.find(use=>use.mode==='dark'&&use.roles.includes(role));
  if(use?.label!==label)errors.push(`${token}: dark role label must be ${label}`);
 }
 return errors;
}
/** Nested catalog panels keep the page role in both themes; outer cards own Surface. */
export function validateCatalogInnerPanels(css){
 const errors=[],tree=postcss.parse(css),targets=['.ds-color-card','.ds-stroke-card','.ds-code pre','.ds-type-device-header','.ds-type-device'];
 for(const target of targets){let ownsCanvas=false;
  tree.walkRules(rule=>{const selector=rule.selector.replace(/\s+/g,' ').trim();
   if(!selector.includes(target))return;
   for(const decl of rule.nodes.filter(node=>node.type==='decl'&&['background','background-color'].includes(node.prop))){
    if(decl.value!=='var(--color-bg-canvas)')errors.push(`Catalog inner panel must use Canvas: ${selector}`);
    if(selector===target&&decl.value==='var(--color-bg-canvas)')ownsCanvas=true;
   }
  });
  if(!ownsCanvas)errors.push(`Missing Canvas binding for catalog inner panel: ${target}`);
 }
 return errors;
}
export function validateCatalogBoxStyles(css){
 const tree=postcss.parse(css),errors=[];
 const declarations=selector=>{const values={};tree.walkRules(rule=>{if(rule.selector.split(',').map(value=>value.trim()).includes(selector))for(const decl of rule.nodes.filter(node=>node.type==='decl'))values[decl.prop]=decl.value;});return values;};
 const requireValue=(selector,property,value)=>{if(declarations(selector)[property]!==value)errors.push(`Catalog box contract: ${selector} ${property} must be ${value}`);};
 for(const selector of ['.ds-stage','.ds-specs-card','.ds-exclusions-box'])for(const [property,value] of Object.entries({'border':'0','border-radius':'var(--radius-large)','box-shadow':'var(--shadow-small)','overflow':'hidden','background':'var(--color-bg-surface)'}))requireValue(selector,property,value);
 for(const selector of ['.ds-color-card','.ds-stroke-card'])requireValue(selector,'border-radius','var(--radius-medium)');
 requireValue('.ds-canvas','border-radius','0 0 var(--radius-large) var(--radius-large)');
 for(const [property,value] of Object.entries({'position':'absolute','inset':'0 var(--space-6) auto','border-top':'1px solid var(--color-border-default)','pointer-events':'none'}))requireValue('.ds-type-device::before',property,value);
 if(declarations('.ds-type-device')['border-top'])errors.push('Typography device separators must not be full-width borders');
 requireValue('.ds-type-device','padding','var(--space-3) var(--space-6)');
 requireValue('.ds-type-info','border-top','1px solid var(--color-border-default)');
 return errors;
}
export function validateColorPalette(css){
 const errors=[],tree=postcss.parse(css),counts=new Map(),values=new Map();
 tree.walkDecls(decl=>{
  if(paletteTokenNames.includes(decl.prop.slice(2))){const shade=decl.prop.match(/^--color-(?:ink|paper)-(\d+)$/);if(shade){const alpha=decl.value.match(/\/\s*([\d.]+)\s*\)/)?.[1];if(alpha===undefined||Math.abs(Number(alpha)*100-Number(shade[1]))>1e-8)errors.push('Shade token name must match its opacity: '+decl.prop);}
   counts.set(decl.prop,(counts.get(decl.prop)||0)+1);const value=decl.value.toUpperCase().replaceAll(/\s/g,'');if(values.has(value))errors.push('Duplicate palette value: '+decl.prop);values.set(value,decl.prop);}
  else if(/#[0-9a-f]{3,8}\b|\brgba?\(\s*\d/i.test(decl.value)&&!/^--(?:shadow-|color-backdrop)/.test(decl.prop))errors.push('Color literal outside palette: '+decl.prop);
  if(/--color-(?:overlay|inverse|navigation)-|--color-(?:smoke|bg-raised)\b|--project-card-bg-surface/.test(decl.prop+' '+decl.value))errors.push('Removed color family: '+decl.prop);
 });
 for(const token of paletteTokenNames)if(counts.get('--'+token)!==1)errors.push('Palette token must be defined once: '+token);
 return errors;
}
export function validateSharedColorLiterals(directory=root){
 const errors=[],walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
 for(const file of walk(path.join(directory,'src'))){
  if(file.endsWith('tokens.css'))continue;
  const text=fs.readFileSync(file,'utf8');
  const styles=file.endsWith('.css')?[text]:file.endsWith('.astro')?[...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]):[];
  for(const css of styles)postcss.parse(css).walkDecls(decl=>{
   let project=false;for(let parent=decl.parent;parent;parent=parent.parent)if(parent.type==='atrule'&&parent.name==='layer'&&parent.params==='project')project=true;
   if(project)return;
   if(/#[0-9a-f]{3,8}\b|\brgba?\(\s*\d/i.test(decl.value)){
    if(/mask/.test(decl.prop)&&!/(?!#000\b)#[0-9a-f]{3,8}\b/i.test(decl.value)&&text.includes('opacity mask'))return;
    errors.push('Shared color literal: '+path.relative(directory,file)+': '+decl.prop);
   }
  });
  // Project data is private artwork; shared TypeScript must read the palette.
  if(file.endsWith('.ts')&&!file.endsWith('-case-study.ts'))for(const match of text.matchAll(/(['"])(#[0-9a-f]{3,8}|rgba?\(\s*\d[^)]*\))\1/gi)){
   if(file.endsWith('/waterfall-gpu.ts')&&match[2].toLowerCase()==='#ffffff'&&text.includes('Atlas white stroke is coverage data'))continue;
   errors.push('Shared script color literal: '+path.relative(directory,file));
  }
 }
 return errors;
}
export function validateColorDocumentation(text,receipt=colorDocumentationReceipt){
 const errors=[];if(receipt.section!=='Color'||!/^[a-f0-9]{64}$/.test(receipt.sha256)||receipt.characters<100)errors.push('Missing reviewed Color documentation receipt');
 if(text!==undefined){const start=text.indexOf('## Color\n'),next=text.indexOf('\n## ',start+4),body=start<0?'':text.slice(start,next<0?undefined:next).trim();if(!body||body.length!==receipt.characters||createHash('sha256').update(body).digest('hex')!==receipt.sha256)errors.push('Stale Color documentation receipt');}return errors;
}
export function validateColors(){const css=fs.readFileSync(path.join(root,'src/styles/tokens.css'),'utf8'),catalogCss=fs.readFileSync(path.join(root,'src/styles/design-system.css'),'utf8');return [...validateColorPalette(css),...validateColorUses(css),...validateCatalogInnerPanels(catalogCss),...validateCatalogBoxStyles(catalogCss),...validateSharedColorLiterals(),...validateColorDocumentation(fs.existsSync(path.join(root,'../docs/design-system.md'))?fs.readFileSync(path.join(root,'../docs/design-system.md'),'utf8'):undefined)];}
if(process.argv[1]&&path.resolve(process.argv[1])===import.meta.filename){const errors=validateColors();if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log('Color contract verified: 12 palette colors, six alpha shades, one role family, exact use coverage and no shared literals.');}

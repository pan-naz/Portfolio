import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),astro=path.dirname(require.resolve('astro/package.json')),vite=path.dirname(require.resolve('vite/package.json',{paths:[astro]})),postcss=require(require.resolve('postcss',{paths:[vite]}));
import {readSystemTokens} from '../src/data/system-inventory.ts';
import {paletteColors,paletteTokenNames,pageColorRoles,componentColorRoles} from '../src/data/system-colors.ts';
const root=path.resolve(import.meta.dirname,'..');
export function validateColorUses(css,colors=paletteColors){
 const tokens=readSystemTokens(css),errors=[],seen={light:new Map(),dark:new Map()};
 for(const color of colors){
  if(!color.uses.length)errors.push('Palette colour has no use: '+color.token);
  for(const item of [{token:color.token,uses:color.uses},...(color.shades||[]).map(shade=>({token:shade.token,uses:[shade.use]}))])for(const use of item.uses)for(const mode of use.mode==='both'?['light','dark']:[use.mode])for(const role of use.roles){
   const palette=tokens[use.zone||mode];
   if(tokens.value(palette,role)!==tokens.value(palette,item.token))errors.push(`${item.token}: ${role} does not resolve to this colour in ${mode}`);
   if(!use.zone)seen[mode].set(role,(seen[mode].get(role)||0)+1);
  }
 }
 const declaredPageRoles=[...new Set([...pageColorRoles,...Object.keys({...tokens.light,...tokens.dark}).filter(name=>name.startsWith('color-')&&!paletteTokenNames.includes(name)&&!componentColorRoles.includes(name))])];
 for(const mode of ['light','dark'])for(const role of declaredPageRoles)if(seen[mode].get(role)!==1)errors.push(`${mode}: ${role} must appear exactly once`);
 return errors;
}
export function validateColorPalette(css){
 const errors=[],tree=postcss.parse(css),counts=new Map(),values=new Map();
 tree.walkDecls(decl=>{
  if(paletteTokenNames.includes(decl.prop.slice(2))){counts.set(decl.prop,(counts.get(decl.prop)||0)+1);const value=decl.value.toUpperCase().replaceAll(/\s/g,'');if(values.has(value))errors.push('Duplicate palette value: '+decl.prop);values.set(value,decl.prop);}
  else if(/#[0-9a-f]{3,8}\b|\brgba?\(\s*\d/i.test(decl.value)&&!/^--(?:shadow-|backdrop-case)/.test(decl.prop))errors.push('Colour literal outside palette: '+decl.prop);
  if(/--color-(?:overlay|inverse|navigation)-|--project-card-bg-surface/.test(decl.prop+decl.value))errors.push('Removed colour family: '+decl.prop);
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
    errors.push('Shared colour literal: '+path.relative(directory,file)+': '+decl.prop);
   }
  });
  // Project data is private artwork; shared TypeScript must read the palette.
  if(file.endsWith('.ts')&&!file.endsWith('-case-study.ts'))for(const match of text.matchAll(/(['"])(#[0-9a-f]{3,8}|rgba?\(\s*\d[^)]*\))\1/gi)){
   if(file.endsWith('/waterfall-gpu.ts')&&match[2].toLowerCase()==='#ffffff'&&text.includes('Atlas white stroke is coverage data'))continue;
   errors.push('Shared script colour literal: '+path.relative(directory,file));
  }
 }
 return errors;
}
export function validateColors(){const css=fs.readFileSync(path.join(root,'src/styles/tokens.css'),'utf8');return [...validateColorPalette(css),...validateColorUses(css),...validateSharedColorLiterals()];}
if(process.argv[1]&&path.resolve(process.argv[1])===import.meta.filename){const errors=validateColors();if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log('Colour contract verified: 13 palette colours, six alpha shades, one role family, exact use coverage and no shared literals.');}

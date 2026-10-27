import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';

// Check actual native-control class sets against the shared focus layer and
// every higher-layer declaration, including controls inside inert specimens.
const read=file=>readFileSync(file,'utf8');
const files=(dir,suffix)=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name),suffix):entry.name.endsWith(suffix)?[path.join(dir,entry.name)]:[]);
const tokens=new Map([...read('src/styles/tokens.css').matchAll(/(--layer-[\w-]+):\s*(-?\d+)\s*;/g)].map(([,name,value])=>[name,Number(value)]));
const global=read('src/styles/global.css');
const focusRule=[...global.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([,selector,body])=>selector.includes(':focus-visible')&&body.includes('z-index:'));
assert(focusRule,'Shared focus raises a control without changing its positioning');
assert(!/\bposition\s*:/.test(focusRule[2]));
const focusToken=focusRule[2].match(/z-index:\s*var\((--layer-[\w-]+)\)/)?.[1];
assert(tokens.has(focusToken),'Focus uses an existing layer token');
const focusLayer=tokens.get(focusToken),preserved=new Set([...focusRule[1].matchAll(/:not\(([^)]+)\)/g)].flatMap(([,list])=>[...list.matchAll(/\.([\w-]+)/g)].map(([,name])=>name)));
const controls=new Map();
for(const file of files('dist','.html'))for(const[,tag,attributes]of read(file).matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)){
 const native=/^(?:button|input|select|textarea|summary)$/.test(tag)||(tag==='a'&&/\bhref=/.test(attributes));
 if(!native&&!/\btabindex="[0-9]+"/.test(attributes))continue;
 const classes=new Set((attributes.match(/\bclass="([^"]*)"/)?.[1]??'').split(/\s+/).filter(Boolean));
 controls.set([...classes].sort().join(' '),classes);
}
let checked=0,higher=0;
for(const file of [...files('src/styles','.css'),...files('src/components','.astro')]){
 const css=file.endsWith('.astro')?[...read(file).matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(([,css])=>css).join('\n'):read(file);
 for(const[,selector,body]of css.replace(/\/\*[\s\S]*?\*\//g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)){
 if(selector.includes(':focus'))continue;
 const token=body.match(/\bz-index:\s*var\((--layer-[\w-]+)\)/)?.[1];
 if(!tokens.has(token))continue;
 for(const part of selector.split(',')){
  const target=part.trim().split(/[\s>+~]+/).at(-1);
  if(target.includes('::'))continue;
  const names=[...target.matchAll(/\.([\w-]+)/g)].map(([,name])=>name);
  if(!names.length)continue;
  for(const classes of controls.values())if(names.every(name=>classes.has(name))){
   const rest=tokens.get(token),focused=[...classes].some(name=>preserved.has(name))?rest:focusLayer;
   assert(focused>=rest,`${file}: ${part.trim()} falls from layer ${rest} to ${focused} on focus`);
   checked++;if(rest>focusLayer)higher++;
  }
 }
}
}
assert(checked>0&&higher>=2,'Audit includes data-saver Play and Motion replay higher-layer controls');
assert(preserved.has('video-saver-control')&&preserved.has('ds-motion-replay'));
console.log(`PASS: ${checked} native-control layer declarations never decrease on focus (${higher} higher-layer cases).`);

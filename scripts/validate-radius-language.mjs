import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const word=String.fromCharCode(99,111,114,110,101,114),retired=new RegExp(word+'s?','i');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
export function validateRadiusLanguage(sources,exceptions){
 const errors=[];for(const [file,source] of Object.entries(sources))for(const [i,line]of source.split('\n').entries())if(retired.test(line)){
  const approved=exceptions.some(e=>e.file===file&&e.reason&&(e.needle?line.includes(e.needle):new RegExp(e.pattern).test(line)));
  if(!approved)errors.push(`Retired system scale wording: ${file}:${i+1}`);
 }return errors;
}
export function validateRadiusContract(){
 const sources=Object.fromEntries(['src','scripts','tests'].flatMap(dir=>walk(path.join(root,dir))).filter(f=>/\.(?:css|astro|ts|js|mjs|json)$/.test(f)&&!f.endsWith('radius-language-exceptions.json')).map(f=>[path.relative(root,f),fs.readFileSync(f,'utf8')]));
 for(const doc of ['../DESIGN.md','../AGENTS.md','../docs/design-system.md','../docs/breakpoints.md','../docs/copy.md','../docs/motion.md','../docs/assets-datagpt.md','../docs/case-study-recipe.md'])if(fs.existsSync(path.join(root,doc)))sources[doc]=fs.readFileSync(path.join(root,doc),'utf8');
 const errors=validateRadiusLanguage(sources,JSON.parse(fs.readFileSync(path.join(root,'scripts/radius-language-exceptions.json'))));
 const tokens=sources['src/styles/tokens.css'],global=sources['src/styles/global.css'],preview=sources['src/components/DSButtonSpecimen.astro'];
 if(!sources['src/components/AboutSection.astro'].includes('data-color-zone="dark" data-zone-keep="section large-shadow"')||!/\[data-zone-keep~='large-shadow'\]\s*\{\s*--shadow-large:\s*inherit;\s*}/.test(tokens))errors.push('About must resolve only Small from the existing Dark shadow definition.');
 if(!/\.tool-card\s*\{[^}]*border:\s*0[^}]*padding:calc\(var\(--space-1\) \/ 4\)[^}]*box-shadow:var\(--shadow-small\)/.test(global))errors.push('Logo cards must keep their content inset, remove the border and use Small.');
 if(preview.includes('class="ds-media-backdrop"')||!preview.includes('class="case-video-controls ds-media-controls"'))errors.push('Button Media specimens use only the genuine video-control pill, without an artwork backdrop.');
 if(!sources['src/styles/tooltip.css'].includes('[data-tooltip-target]:focus-visible .tooltip')||!sources['src/styles/tooltip.css'].includes('[data-tooltip-target].is-pointer-hovered .tooltip'))errors.push('The inset tool-card Tooltip must retain hover and keyboard visibility.');
 if(!sources['src/styles/design-system-button.css'].includes('.ds-button-view .ds-media-controls {')||!sources['src/styles/design-system-button.css'].includes('position:static; opacity:1; pointer-events:auto;'))errors.push('Button Media specimens must keep their native pill visible and in the specimen flow.');
 return errors;
}

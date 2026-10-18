import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
export const overviewCoverIds=['color','typography','spacing-layout','motion','icons','button','chip','navigation','project-card','section-heading','statistic','timeline-row','tooltip'];
/** Browser-free build contract; the local fresh-render gate separately checks genuine pixels. */
export function validateOverviewManifest(manifest,read){
 const errors=[],expected=overviewCoverIds.flatMap(id=>['light','dark'].map(theme=>`${id}-${theme}`));
 if(manifest.scale!==2||manifest.canvas?.width!==304||manifest.canvas?.height!==104)errors.push('Covers reserve the existing largest tile at 2x.');
 const names=manifest.covers?.map(c=>`${c.id}-${c.theme}`)||[];
 if(names.length!==26||new Set(names).size!==26||expected.some(n=>!names.includes(n)))errors.push('Overview requires exactly thirteen Light/Dark cover pairs.');
 for(const item of manifest.covers||[]){const name=`${item.id}-${item.theme}`;if(!expected.includes(name))continue;let bytes;try{bytes=read(name+'.webp');}catch{errors.push('Missing cover: '+name);continue;}
  const lossless=bytes.toString('ascii',12,16)==='VP8L'&&bytes[20]===0x2f,header=lossless?bytes.readUInt32LE(21):0;
  const width=(header&0x3fff)+1,height=((header>>>14)&0x3fff)+1,alpha=Boolean(header&(1<<28));
  if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WEBP'||!lossless||!alpha||width!==608||height!==208||item.width!==width||item.height!==height||bytes.length!==item.bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)errors.push('Invalid or unrecorded transparent lossless cover: '+name);
 }
 return errors;
}
export function validateOverviewCovers(root=process.cwd()){
 const read=file=>fs.readFileSync(path.join(root,file),'utf8'),errors=[],directory=path.join(root,'public/design-system/covers');
 try{errors.push(...validateOverviewManifest(JSON.parse(read('public/design-system/covers/manifest.json')),name=>fs.readFileSync(path.join(directory,name))));if(fs.readdirSync(directory).filter(n=>n.endsWith('.webp')).length!==26)errors.push('Only the 26 committed covers belong in the cover directory.');}catch(error){errors.push('Overview assets: '+error.message);}
 const dashboard=read('src/components/DSDashboard.astro'),css=read('src/styles/design-system.css');
 for(const expected of ['<img class={`ds-cover-image ds-cover-image--${theme}`}','width={dimensions.width*2}','height={dimensions.height*2}','alt="" aria-hidden="true"','inert aria-hidden="true"'])if(!dashboard.includes(expected))errors.push('Decorative cover image contract: '+expected);
 if(/DSPreview|DS\w+Specimen|ResponsiveImage|<Icon\b|miniature/.test(dashboard))errors.push('Overview must render static images, never live specimens.');
 if(!css.includes('object-fit:contain')||!css.includes('inset:var(--space-4)')||!css.includes("[data-theme='dark'] .ds-cover-image--dark { visibility:visible; }"))errors.push('CSS alone selects the theme and preserves Space4 image clearance.');
 const scripts=fs.readdirSync(path.join(root,'src/scripts')).filter(n=>n.startsWith('design-system')&&n.endsWith('.ts'));
 for(const file of scripts)if(/--ds-cover-fit|ds-(?:button|chip|navigation|stat|heading)-cover|ds-project-tile/.test(read('src/scripts/'+file)))errors.push('No cover measurement in runtime: '+file);
 for(const name of ['DSPreview','DSButtonSpecimen','DSStatisticSpecimen','DSSectionHeadingSpecimen','DSMotionCurve'])if(/cover\?:|miniature\?:/.test(read('src/components/'+name+'.astro')))errors.push('Retired cover mode: '+name);
 return errors;
}

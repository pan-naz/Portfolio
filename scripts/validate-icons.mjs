import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {icons} from '../src/data/icons.ts';
import {iconGroups,decorativeIconCount,decorativeIcons,coverIcons} from '../src/data/system-icons.ts';
import {waterfallIconNodes} from '../src/scripts/waterfall/waterfall-icon-data.ts';
const require=createRequire(import.meta.url),astro=path.dirname(require.resolve('astro/package.json')),vite=path.dirname(require.resolve('vite/package.json',{paths:[astro]})),postcss=require(require.resolve('postcss',{paths:[vite]}));
/** One group per source icon; never a parallel drawing or a manually maintained count. */
export function validateIconGroups(groups=iconGroups,set=icons){
 const errors=[],names=groups.flatMap(group=>group.icons);
 for(const name of Object.keys(set))if(names.filter(n=>n===name).length!==1)errors.push('Icon needs exactly one group: '+name);
 for(const name of names)if(!(name in set))errors.push('Unknown grouped icon: '+name);
 return errors;
}
/** Only the pre-existing footer SVG projection scales a normalized 24-unit stroke. */
export const iconGeometryExceptions=[{file:'src/components/SiteFooter.astro',reason:'The settled footer SVG projects the existing ten-pixel canvas paths; 24 / waterfallIconSize keeps the original one-screen-pixel stroke.'}];
export function validateIconStyles(css,file='fixture.css'){
 const errors=[];postcss.parse(css).walkRules(rule=>{
  if(!/(?:\.icon\b|\.icon--|\.arrow\b|\.arrow--|theme-icon-glyph|theme-toggle-glyph|data-icon-hover)/.test(rule.selector))return;
  if(/footer-icon-pile-rest/.test(rule.selector))return;
  rule.walkDecls(decl=>{if(/^(?:width|height|stroke-width|rotate|transform)$/.test(decl.prop)&&/(?:-?\d*\.?\d+(?:px|deg)\b|^\d*\.?\d+$)/.test(decl.value.replace(/rotate\(0deg\)/g,'rotate(identity)'))&&!/^0(?:px|deg)?$/.test(decl.value)&&!/^rotate\(0deg\)$/.test(decl.value)&&!/^translateY\(0\) rotate\(0deg\) scale\(1\)$/.test(decl.value))errors.push(`Typed icon geometry: ${file} ${rule.selector} ${decl.prop}: ${decl.value}`);});
 });return errors;
}
export function validateIcons(root=process.cwd()){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),errors=validateIconGroups();
 if(icons.close.nodes!==icons.plus.nodes||icons.close.weight!=='strong'||!icons.close.close)errors.push('Close must reuse Plus nodes at Strong, with token-driven rotation.');
 if(icons.equals.weight!=='strong')errors.push('Equals must use Strong.');
 if(!/--rotation-icon-close:\s*45deg;/.test(read('src/styles/tokens.css')))errors.push('Missing close rotation token.');
 const preview=read('src/components/DSIcons.astro'),cover=read('src/components/DSDashboard.astro'),model=read('src/data/system-icons.ts'),renderer=read('src/components/Icon.astro');
 if(!preview.includes('iconGroups.map')||!preview.includes('group.icons.map')||!preview.includes('<Icon name={name}')||/<svg|<path|<Tooltip/.test(preview))errors.push('Icon tiles must use the genuine shared set, with no copied geometry or tooltips.');
 if(!model.includes('decorativeIconCount = waterfallIconNodes.length')||decorativeIconCount!==waterfallIconNodes.length||decorativeIcons.length!==40||coverIcons.length!==18||!cover.includes('coverIcons.map')||!cover.includes('class="ds-icon-tile"')||!/<div class="ds-tile-visual" inert aria-hidden="true">/.test(cover))errors.push('Decorative library/cover must read the real data and stay inert.');
 if(!renderer.includes('iconSizeTokens.get(size)')||!renderer.includes('tokens.css?raw'))errors.push('Numeric size API must resolve the real source size tokens.');
 if(!preview.includes('data-icon-sample')||!read('src/styles/design-system.css').includes('.ds-icon-control {')||read('src/components/IconButton.astro').includes("'tile'"))errors.push('Icon tiles are catalog presentation, never a new website-control variant.');
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const f of walk(path.join(root,'src'))){const file=path.relative(root,f);if(file.endsWith('.css')&&!file.endsWith('tokens.css'))errors.push(...validateIconStyles(fs.readFileSync(f,'utf8'),file));
  if(!file.endsWith('.astro'))continue;const source=fs.readFileSync(f,'utf8');
  for(const [markup]of source.matchAll(/<Icon\b[\s\S]*?\/>/g))if((/\b(?:size|strokeWidth)=\{[\d.]+\}/.test(markup)||/\bstyle=["'][^"']*(?:rotate\([\d.-]+deg\)|(?:width|height|stroke-width):\s*[\d.]+)/.test(markup))&&!iconGeometryExceptions.some(e=>e.file===file))errors.push('Typed Icon prop/style: '+file);
 }
 for(const file of['src/components/CaseStudyPage.astro','src/components/DSPreview.astro'])if(!read(file).includes('<Icon name="close" />')||/rotate\(45deg\)/.test(read(file)))errors.push('Close control must consume the named icon: '+file);
 return errors;
}
export function validateRenderedIcons(html){
 const errors=[],names=[...html.matchAll(/data-ds-icon="([^"]+)"/g)].map(([,name])=>name);
 for(const name of Object.keys(icons))if(names.filter(n=>n===name).length!==1)errors.push('Missing/duplicate rendered icon: '+name);
 if(!html.includes(`data-ds-library-count="${waterfallIconNodes.length}"`))errors.push('Stale decorative library count.');
 if((html.match(/data-ds-cover-icon=/g)||[]).length!==18)errors.push('Overview needs eighteen real rain icons.');
 return errors;
}

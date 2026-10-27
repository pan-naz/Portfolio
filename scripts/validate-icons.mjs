import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {icons} from '../src/data/icons.ts';
import {iconGroups,decorativeIconCount,decorativeIcons,iconWeights} from '../src/data/system-icons.ts';
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
/** Interface strokes have two roles; only the weight demonstration may choose either role through its source alias. */
export function validateUIIconStrokes(css,file='fixture.css'){
 const errors=[];postcss.parse(css).walkRules(rule=>{
  if(!/(?:\.icon\b|\.icon--|\.arrow\b|\.arrow--|theme-icon-glyph|theme-toggle-glyph)/.test(rule.selector)||/footer-icon-pile-rest/.test(rule.selector))return;
  rule.walkDecls('stroke-width',decl=>{if(!/^var\(--icon-stroke-(?:regular|strong)\)$/.test(decl.value)&&!(file==='src/styles/design-system.css'&&rule.selector==='.ds-icons-weight .icon'&&decl.value==='var(--ds-icon-stroke)'))errors.push('Interface stroke must use Regular or Strong: '+file+' '+rule.selector);});
 });return errors;
}
/** Project artwork must not inherit interface sizing, including through local aliases. */
export function validateProjectIconSizes(css,file='fixture.css'){
 const tree=postcss.parse(css),aliases=new Map(),errors=[];
 const project=node=>{for(let p=node.parent;p;p=p.parent)if(p.type==='atrule'&&p.name==='layer'&&p.params==='project')return true;return false;};
 tree.walkDecls(decl=>{if(project(decl)&&decl.prop.startsWith('--'))aliases.set(decl.prop,(aliases.get(decl.prop)||'')+' '+decl.value);});
 const depends=(value,seen=new Set())=>[...value.matchAll(/var\((--[\w-]+)/g)].some(([,name])=>/^--icon-size(?:-|$)/.test(name)||(!seen.has(name)&&depends(aliases.get(name)||'',new Set([...seen,name]))));
 // Hooko's flow glyphs are shared UI Arrows, not case-study artwork.
 const flowArrow=decl=>file==='src/styles/hooko-case-study.css'&&decl.parent.selector==='.hk-flowline > .arrow'&&/^(?:width|height)$/.test(decl.prop)&&decl.value==='var(--icon-size-compact)';
 tree.walkDecls(decl=>{if(project(decl)&&!flowArrow(decl)&&/^(?:(?:min-|max-)?(?:width|height)|(?:inline|block)-size|font-size|flex-basis|grid-template-(?:columns|rows))$/.test(decl.prop)&&depends(decl.value))errors.push('Project artwork derives size from interface icons: '+file+' '+decl.parent.selector+' '+decl.prop);});
 return errors;
}
export function validateIcons(root=process.cwd()){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),errors=[...validateIconGroups()];
 if(icons.close.nodes!==icons.plus.nodes||icons.close.weight!=='strong'||!icons.close.close)errors.push('Close must reuse Plus nodes at Strong, with token-driven rotation.');
 if(icons.equals.weight!=='strong')errors.push('Equals must use Strong.');
 if(JSON.stringify(iconWeights.map(weight=>[weight.name,weight.token]))!==JSON.stringify([['Regular','icon-stroke-regular'],['Strong','icon-stroke-strong']]))errors.push('Icons show exactly Regular and Strong.');
 if(iconWeights[1]?.description!=='Plus, close, play, pause, shield, equals, and the arrows in buttons and text links.')errors.push('Strong documents both arrow consumers.');
 if(!/\.text-link \.arrow path\s*\{\s*stroke-width:\s*var\(--icon-stroke-strong\)/.test(read('src/styles/global.css')))errors.push('TextLink arrows must use Strong.');
 for(const definition of Object.values(icons))for(const [,attrs]of definition.nodes)if('stroke-width'in attrs&&!/^var\(--icon-stroke-(?:regular|strong)\)$/.test(attrs['stroke-width']))errors.push('Interface SVG nodes cannot override their stroke with raw geometry.');
 if(!/--rotation-icon-close:\s*45deg;/.test(read('src/styles/tokens.css')))errors.push('Missing close rotation token.');
 const preview=read('src/components/DSIcons.astro'),model=read('src/data/system-icons.ts'),renderer=read('src/components/Icon.astro');
 if(!preview.includes('iconGroups.map')||!preview.includes('group.icons.map')||!preview.includes('<Icon name={name}')||/<svg|<path|<Tooltip/.test(preview))errors.push('Icon tiles must use the genuine shared set, with no copied geometry or tooltips.');
 if(!model.includes('decorativeIconCount = waterfallIconNodes.length')||decorativeIconCount!==waterfallIconNodes.length||decorativeIcons.length!==40)errors.push('Decorative library must read the real data.');
 if(!renderer.includes('iconSizeTokens.get(size)')||!renderer.includes('tokens.css?raw'))errors.push('Numeric size API must resolve the real source size tokens.');
 if(!preview.includes('data-icon-sample')||!read('src/styles/design-system.css').includes('.ds-icon-control {')||read('src/components/IconButton.astro').includes("'tile'"))errors.push('Icon tiles are catalog presentation, never a new website-control variant.');
 const catalogCSS=read('src/styles/design-system.css');
 const interfaceMarkup=preview.slice(preview.indexOf('class="ds-icons-groups"'),preview.indexOf('<section class="ds-icons-section"><p class="text-label-m">Size'));
 if(/tabindex|data-icon-hover|theme-icon-control|theme-icon-glyph/.test(interfaceMarkup)||!interfaceMarkup.includes('role="img" aria-label={iconLabels[name]}'))errors.push('Interface tiles are named pictures, never focusable or animated controls.');
 const catalogScript=read('src/scripts/design-system.ts');
 if(catalogScript.includes('fitIconNames')||catalogScript.includes('fitCatalogColumns(grid,4')||!catalogScript.includes('fitCatalogColumns(iconGroups,')||!catalogScript.includes("minimum=token('--control-icon'),maximum=token('--space-16')"))errors.push('Interface pictures need common 44–64px slots; reflow group cards, never the four icon slots.');
 postcss.parse(catalogCSS).walkRules(rule=>{
  if(!/\.ds-icon-control\b|\.ds-icons-grid\b|\.ds-icon-name\b/.test(rule.selector))return;
  if(/:(?:hover|focus|active)/.test(rule.selector))errors.push('Interface pictures cannot have pointer or focus states: '+rule.selector);
  rule.walkDecls(decl=>{if(/^(?:animation|transition|transform)(?:-|$)/.test(decl.prop))errors.push('Interface pictures cannot animate: '+rule.selector);});
 });
 if(!catalogCSS.includes('repeat(4,var(--ds-icon-tile-size')||!catalogCSS.includes('.ds-icon-name { justify-self:center; width:max-content; white-space:nowrap; }'))errors.push('Interface names stay centred and whole beneath fixed, nonstretching picture slots.');

 if(!preview.includes('ds-icons-sample ds-icons-accent')||!catalogCSS.includes('.ds-icons-accent .icon { width:var(--space-12); height:var(--space-12); }'))errors.push('One accent must show the genuine Layers at 48px.');
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const f of walk(path.join(root,'src'))){const file=path.relative(root,f);if(/\.(?:css|astro|ts)$/.test(file))for(const [token]of fs.readFileSync(f,'utf8').matchAll(/--icon-stroke-[\w-]+/g))if(!['--icon-stroke-regular','--icon-stroke-strong'].includes(token))errors.push('Only two interface stroke tokens: '+file+' '+token);
  if(file.endsWith('.css')&&!file.endsWith('tokens.css'))errors.push(...validateIconStyles(fs.readFileSync(f,'utf8'),file),...validateUIIconStrokes(fs.readFileSync(f,'utf8'),file),...validateProjectIconSizes(fs.readFileSync(f,'utf8'),file));
  if(!file.endsWith('.astro'))continue;const source=fs.readFileSync(f,'utf8');for(const [,css] of source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g))errors.push(...validateProjectIconSizes(css,file));
  for(const [markup]of source.matchAll(/<Icon\b[\s\S]*?\/>/g))if((/\b(?:size|strokeWidth)=\{[\d.]+\}/.test(markup)||/\bstyle=["'][^"']*(?:rotate\([\d.-]+deg\)|(?:width|height|stroke-width):\s*[\d.]+)/.test(markup))&&!iconGeometryExceptions.some(e=>e.file===file))errors.push('Typed Icon prop/style: '+file);
 }
 for(const file of['src/components/CaseStudyPage.astro','src/components/DSButtonSpecimen.astro'])if(!read(file).includes('icon="close"')||/rotate\(45deg\)/.test(read(file)))errors.push('Close control must consume the named icon: '+file);
 return errors;
}
export function validateRenderedIcons(html){
 const errors=[],names=[...html.matchAll(/data-ds-icon="([^"]+)"/g)].map(([,name])=>name);
 for(const name of Object.keys(icons))if(names.filter(n=>n===name).length!==1)errors.push('Missing/duplicate rendered icon: '+name);
 if(!html.includes(`data-ds-library-count="${waterfallIconNodes.length}"`))errors.push('Stale decorative library count.');
 return errors;
}

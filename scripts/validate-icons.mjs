import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {icons} from '../src/data/icons.ts';
import {iconGroups,decorativeIconCount,decorativeIcons,coverIcons,coverIconScatter,iconWeights} from '../src/data/system-icons.ts';
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
/** The approved decorative composition is fixed data, not grid rules or randomness. */
export function validateIconScatter(scatter=coverIconScatter){
 const errors=[];
 if(scatter.length!==18||new Set(scatter.map(icon=>icon.name)).size!==18)errors.push('Scatter needs eighteen distinct real rain icons.');
 for(const icon of scatter){
  if(!decorativeIcons.some(source=>source.name===icon.name))errors.push('Unknown scatter glyph: '+icon.name);
  for(const [key,min,max] of [['x',0,100],['y',0,100],['size',18,26],['opacity',.4,.9],['rotation',-12,12]])if(!Number.isFinite(icon[key])||icon[key]<min||icon[key]>max)errors.push('Invalid scatter '+key+': '+icon.name);
 }
 if(new Set(scatter.map(icon=>icon.x)).size!==18||new Set(scatter.map(icon=>icon.y)).size!==18)errors.push('Scatter centres must be staggered, never shared grid tracks.');
 return errors;
}
/** Project artwork must not inherit interface sizing, including through local aliases. */
export function validateProjectIconSizes(css,file='fixture.css'){
 const tree=postcss.parse(css),aliases=new Map(),errors=[];
 const project=node=>{for(let p=node.parent;p;p=p.parent)if(p.type==='atrule'&&p.name==='layer'&&p.params==='project')return true;return false;};
 tree.walkDecls(decl=>{if(project(decl)&&decl.prop.startsWith('--'))aliases.set(decl.prop,(aliases.get(decl.prop)||'')+' '+decl.value);});
 const depends=(value,seen=new Set())=>[...value.matchAll(/var\((--[\w-]+)/g)].some(([,name])=>/^--icon-size(?:-|$)/.test(name)||(!seen.has(name)&&depends(aliases.get(name)||'',new Set([...seen,name]))));
 tree.walkDecls(decl=>{if(project(decl)&&/^(?:(?:min-|max-)?(?:width|height)|(?:inline|block)-size|font-size|flex-basis|grid-template-(?:columns|rows))$/.test(decl.prop)&&depends(decl.value))errors.push('Project artwork derives size from interface icons: '+file+' '+decl.parent.selector+' '+decl.prop);});
 return errors;
}
export function validateIcons(root=process.cwd()){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),errors=[...validateIconGroups(),...validateIconScatter()];
 if(icons.close.nodes!==icons.plus.nodes||icons.close.weight!=='strong'||!icons.close.close)errors.push('Close must reuse Plus nodes at Strong, with token-driven rotation.');
 if(icons.equals.weight!=='strong')errors.push('Equals must use Strong.');
 if(JSON.stringify(iconWeights.map(weight=>[weight.name,weight.token]))!==JSON.stringify([['Regular','icon-stroke-regular'],['Strong','icon-stroke-strong']]))errors.push('Icons show exactly Regular and Strong.');
 if(iconWeights[1]?.description!=='Plus, close, play, pause, shield, equals, and the arrows in buttons and text links.')errors.push('Strong documents both arrow consumers.');
 if(!/\.text-link \.arrow path\s*\{\s*stroke-width:\s*var\(--icon-stroke-strong\)/.test(read('src/styles/global.css')))errors.push('TextLink arrows must use Strong.');
 for(const definition of Object.values(icons))for(const [,attrs]of definition.nodes)if('stroke-width'in attrs&&!/^var\(--icon-stroke-(?:regular|strong)\)$/.test(attrs['stroke-width']))errors.push('Interface SVG nodes cannot override their stroke with raw geometry.');
 if(!/--rotation-icon-close:\s*45deg;/.test(read('src/styles/tokens.css')))errors.push('Missing close rotation token.');
 const preview=read('src/components/DSIcons.astro'),cover=read('src/components/DSDashboard.astro'),model=read('src/data/system-icons.ts'),renderer=read('src/components/Icon.astro');
 if(!preview.includes('iconGroups.map')||!preview.includes('group.icons.map')||!preview.includes('<Icon name={name}')||/<svg|<path|<Tooltip/.test(preview))errors.push('Icon tiles must use the genuine shared set, with no copied geometry or tooltips.');
 if(!model.includes('decorativeIconCount = waterfallIconNodes.length')||decorativeIconCount!==waterfallIconNodes.length||decorativeIcons.length!==40||coverIcons.length!==18||!cover.includes('coverIcons.map')||!cover.includes('class="ds-icon-tile"')||!/<div class="ds-tile-visual" inert aria-hidden="true">/.test(cover))errors.push('Decorative library/cover must read the real data and stay inert.');
 if(!renderer.includes('iconSizeTokens.get(size)')||!renderer.includes('tokens.css?raw'))errors.push('Numeric size API must resolve the real source size tokens.');
 if(!preview.includes('data-icon-sample')||!read('src/styles/design-system.css').includes('.ds-icon-control {')||read('src/components/IconButton.astro').includes("'tile'"))errors.push('Icon tiles are catalog presentation, never a new website-control variant.');
 if(!model.includes('export const coverIconScatter = [')||/Math\.random|Date\.now/.test(model))errors.push('Cover placements must be one fixed source list.');
 for(const field of ['x','y','size','opacity','rotation'])if(!cover.includes('${icon.'+field+'}'))errors.push('Cover must render source scatter '+field);
 const catalogCSS=read('src/styles/design-system.css');
 if(/\.ds-icon-tile[^{}]*:nth-child/.test(catalogCSS)||!catalogCSS.includes('inset:var(--space-8)'))errors.push('Cover needs an inset scatter, never nth-child grid geometry.');
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
 if((html.match(/data-ds-cover-icon=/g)||[]).length!==18)errors.push('Overview needs eighteen real rain icons.');
 return errors;
}

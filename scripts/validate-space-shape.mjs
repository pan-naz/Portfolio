import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),astro=path.dirname(require.resolve('astro/package.json')),vite=path.dirname(require.resolve('vite/package.json',{paths:[astro]}));
const postcss=require(require.resolve('postcss',{paths:[vite]}));
export const spacingScale={4:'space-1',8:'space-2',12:'space-3',16:'space-4',24:'space-6',32:'space-8',48:'space-12',64:'space-16',96:'space-24'};
const radiusScale={12:'radius-small',24:'radius-medium',40:'radius-large',999:'radius-full'};
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
export function styleSources(root=process.cwd()){
 return walk(path.join(root,'src')).flatMap(file=>{
  const text=fs.readFileSync(file,'utf8'),relative=path.relative(root,file);
  if(file.endsWith('.css'))return[{file:relative,css:text,offset:0}];
  if(!file.endsWith('.astro'))return[];
  const styles=[...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(m=>({file:relative,css:m[1],offset:text.slice(0,m.index).split('\n').length-1}));
  // Static and template inline styles retain their actual declarations; expressions
  // are inert placeholders for parsing, not token or geometry replacements.
  for(const m of text.matchAll(/\bstyle=(?:"([^"]*)"|'([^']*)'|\{`([^`]+)`\})/g)){
   const css=(m[1]??m[2]??m[3]).replace(/\$\{[^}]*\}/g,'__dynamic__');
   if(css.includes(':'))styles.push({file:relative,css:`[inline-style-${m.index}] {${css}}`,offset:text.slice(0,m.index).split('\n').length-1,inline:true});
  }
  return styles;
 });
}
const context=node=>{const parts=[];for(let p=node.parent;p;p=p.parent)if(p.type==='atrule')parts.unshift('@'+p.name+' '+p.params);return parts.join(' > ');};
const isProject=node=>{for(let p=node.parent;p;p=p.parent)if(p.type==='atrule'&&p.name==='layer'&&p.params==='project')return true;return false;};
export function auditGeometry(root=process.cwd()){
 const records=[],locals=[],references=new Map();
 // Read actual component roles, so a future token-value change cannot leave a
 // stale numeric duplicate check. Equal numbers in unrelated roles stay separate.
 const spacing={...spacingScale},sizes={...spacingScale},layers={},opacities={},radii={...radiusScale};
 const tokenTree=postcss.parse(fs.readFileSync(path.join(root,'src/styles/tokens.css'),'utf8'));
 tokenTree.walkDecls(decl=>{
  const name=decl.prop.slice(2),px=decl.value.match(/^(-?[\d.]+)px$/),unitless=decl.value.match(/^(-?[\d.]+)$/);
  if(px){
   if(/^(?:header-clearance|scroll-clearance|work-rail-offset|hero-bottom-(?:desktop|compact)|button-padding-inline-small)$/.test(name))spacing[Number(px[1])]=name;
   if(/^(?:control-(?:height(?:-small)?|icon)|icon-size(?:-compact)?|header-height|player-(?:thumb-size|track-height)|navigation-dot-size|project-logo-size)$/.test(name))sizes[Number(px[1])]=name;
   if(name==='media-frame-radius-outset')radii[Number(px[1])]=name;
  }
  if(unitless&&name.startsWith('layer-'))layers[Number(unitless[1])]=name;
  if(unitless&&name.startsWith('opacity-'))opacities[Number(unitless[1])]=name;
 });
 const remember=(name,kind)=>{if(!references.has(name)||kind==='spacing')references.set(name,kind);};
 const scan=(decl,source,kind)=>{
  const value=decl.value.replace(/(?:rgb|rgba|hsl|hsla)\([^)]*\)/g,'__colour__');
  const scale=kind==='radius'?radii:kind==='size'?sizes:kind==='layer'?layers:kind==='opacity'?opacities:kind==='shadow'?spacingScale:spacing;
  const pattern=kind==='layer'||kind==='opacity'?/(?<![\w.-])-?\d*\.?\d+\b/g:/(?<![\w.])-?\d*\.?\d+px\b/g;
  const values=[...value.matchAll(pattern)].map(m=>{const number=parseFloat(m[0]),token=scale[kind==='layer'?number:Math.abs(number)];return{raw:m[0],number,token};});
  if(values.length)records.push({file:source.file,line:source.offset+decl.source.start.line,selector:decl.parent.selector,context:context(decl),property:decl.prop,value:decl.value,kind,values,inline:Boolean(source.inline),...(isProject(decl)?{project:true}:{})});
 };
 for(const source of styleSources(root)){
  if(source.file.endsWith('/tokens.css'))continue;
  const tree=postcss.parse(source.css);
  tree.walkDecls(decl=>{
   const kind=/^(padding|margin|scroll-padding|gap|row-gap|column-gap|inset|top|right|bottom|left)(-|$)/.test(decl.prop)?'spacing':/^border.*radius$/.test(decl.prop)?'radius':decl.prop==='box-shadow'?'shadow':/^(?:(?:(?:min|max)-)?(?:width|height)|grid-template-(?:columns|rows))$/.test(decl.prop)?'size':decl.prop==='z-index'?'layer':decl.prop==='opacity'?'opacity':null;
   if(decl.prop.startsWith('--'))locals.push({decl,source});
   if(!kind)return;
   for(const m of decl.value.matchAll(/var\((--[\w-]+)/g))remember(m[1],kind);
   scan(decl,source,kind);
  });
 }
 // Follow local geometry aliases transitively. Core definitions are excluded;
 // project-layer artwork stays scoped and needs a reviewed reason.
 for(let pass=0;pass<=locals.length;pass++)for(const {decl} of locals)if(references.has(decl.prop))for(const m of decl.value.matchAll(/var\((--[\w-]+)/g))remember(m[1],references.get(decl.prop));
 for(const {decl,source} of locals)if(references.has(decl.prop))scan(decl,source,references.get(decl.prop));
 return records;
}
/** Count website/shared consumers, never the catalog's own presentation. */
export function isWebsiteUsageSource(file){
 const name=file.replaceAll('\\','/');
 return /\.(css|astro|ts|js)$/.test(name)&&!/(?:^|\/)(?:DS[^/]*\.astro|DSLayout\.astro|(?:design-system(?:-[\w-]+)?|ds-components|system-[\w-]+)\.(?:css|ts|js)|static-preview\.css)(?:$|\/)/.test(name)&&!name.includes('/pages/design-system/');
}
export function spaceUsageCounts(root=process.cwd()){
 const counts=Object.fromEntries(Object.values(spacingScale).map(name=>[name,0]));
 for(const file of walk(path.join(root,'src')).filter(isWebsiteUsageSource)){
  const text=fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/<!--[\s\S]*?-->/g,'').replace(/^\s*\/\/.*$/gm,'');
  for(const [,name] of text.matchAll(/var\(--(space-\d+)\b/g))if(name in counts)counts[name]++;
 }
 return counts;
}
export function validateGeometry(root=process.cwd(),allowlist){
 const errors=[],allowed=allowlist??JSON.parse(fs.readFileSync(path.join(root,'scripts/geometry-exceptions.json'),'utf8'));
 const key=r=>JSON.stringify([r.file,r.selector,r.context,r.property,r.value]);
 const keys=new Map(allowed.map(r=>[key(r),r]));
 const normalize=value=>value.toLowerCase().replace(/\s+/g,'').replace(/0px/g,'0').replace(/(?<=[/,(])0\./g,'.').replace(/\d*\.\d+/g,number=>String(Number(number)));
 const tokenCss=postcss.parse(fs.readFileSync(path.join(root,'src/styles/tokens.css'),'utf8')),shadows=[];
 tokenCss.walkDecls(/^--shadow-/,decl=>shadows.push(normalize(decl.value)));
 for(const r of auditGeometry(root)){
  const entry=keys.get(key(r));
  // Project artwork keeps its own coordinates, even when a number happens to
  // equal a UI token. Only individually documented artwork may use this exemption.
  const artwork=r.project&&entry?.project&&entry?.reason;
  if(!artwork&&((r.kind==='shadow'&&shadows.includes(normalize(r.value)))||(r.kind!=='shadow'&&r.values.some(v=>v.token))))errors.push(`Exact token equivalent remains: ${r.file}:${r.line} ${r.selector} ${r.property}: ${r.value}`);
  // Zero/one are visibility endpoints, not opacity roles or off-scale spacing.
  if(r.kind==='opacity'&&/^(?:0|1)$/.test(r.value))continue;
  if(!entry?.reason)errors.push(`Unlisted off-scale geometry: ${r.file}:${r.line} ${r.selector} ${r.property}: ${r.value}`);
 }
 return errors;
}

/** Read actual grid counts and the two real layout boundaries, not mockup numbers. */
export function layoutSource(root=process.cwd()){
 const tokens=postcss.parse(fs.readFileSync(path.join(root,'src/styles/tokens.css'),'utf8'));
 const global=postcss.parse(fs.readFileSync(path.join(root,'src/styles/global.css'),'utf8'));
 /** @type {Record<string,string>} */ const base={};
 /** @type {Record<string,string>} */ const phone={};
 const changes=[];
 tokens.walkRules(rule=>{if(rule.selector!==':root')return;let width=0;for(let p=rule.parent;p;p=p.parent)if(p.type==='atrule'&&p.name==='media')width=Number(p.params.match(/min-width:\s*(\d+)px/)?.[1]||0);const values=Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(d=>[d.prop.slice(2),d.value]));if(width)changes.push({width,values});else Object.assign(phone,values);});
 Object.assign(base,phone);for(const change of changes.sort((a,b)=>a.width-b.width))Object.assign(base,change.values);
 const query=fs.readFileSync(path.join(root,'src/scripts/layout-capabilities.js'),'utf8');
 const desktop=Number(query.match(/min-width:\s*(\d+)px/)[1]);
 const tablet=Number(fs.readFileSync(path.join(root,'src/styles/tokens.css'),'utf8').match(/@media\s*\(min-width:\s*(\d+)px\)/)[1]);
 /** @type {Record<string,{regular:number,compact:number}>} */ const grids={};for(const [name,selector] of [['projects','.project-collection--bento'],['metrics','.impact-metrics']]){
  let regular,compact;global.walkRules(rule=>{if(rule.selector!==selector)return;const d=rule.nodes.find(n=>n.type==='decl'&&n.prop==='grid-template-columns');if(!d)return;const count=Number(d.value.match(/repeat\((\d+)/)?.[1]||1);if(context(rule).includes('max-width: 767px'))compact=count;else if(!context(rule).includes('@media'))regular=count;});grids[name]={regular,compact};
 }
 return{desktop,tablet,base,phone,grids};
}

export function validateSpaceShape(root=process.cwd()) {
 const read=file=>fs.readFileSync(path.join(root,file),'utf8'),errors=validateGeometry(root);
 const removed=new RegExp('--(?:radius-(?:'+['media','chapter','pill'].join('|')+')|shadow-(?:'+['overlay','floating(?:-navigation)?'].join('|')+'))\\b');
 for(const file of ['src','scripts','tests'].flatMap(dir=>walk(path.join(root,dir))).filter(file=>/\.(?:css|astro|ts|js|mjs)$/.test(file)))if(removed.test(fs.readFileSync(file,'utf8')))errors.push('Removed geometry token in '+path.relative(root,file));
 const nav=read('src/components/DSNavigation.astro'),css=read('src/styles/design-system.css'),foundation=read('src/components/DSFoundations.astro'),cover=read('src/components/DSDashboard.astro'),model=read('src/data/system-spacing-layout.ts');
 if(!nav.includes('class="text-label-m"')||nav.includes('class="text-label-s"'))errors.push('Catalog groups must use Label/M.');
 for(const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g))if(m[1].includes('.ds-nav-group > p')&&/(?:font[^:]*|text-transform)\s*:/.test(m[2]))errors.push('Catalog group labels have local typography.');
 if(/\.ds-tile-link\s*\{[^}]*min-height/.test(css))errors.push('Overview text may not reserve a fixed minimum height.');
 if(!cover.includes('inert aria-hidden="true"'))errors.push('Overview covers must be unreachable, inert and hidden.');
 for(const hook of ['spaceUsageCounts()','layoutSource()','resolvedLight','resolvedDark'])if(!model.includes(hook))errors.push('Spacing model must derive '+hook);
 for(const hook of ['spaceSystem.spaces.map','spaceSystem.layouts.map','spaceSystem.radius.map','spaceSystem.shadows.map','data-ds-space-uses={space.name}','data-ds-layout-columns={layout.projects}','data-ds-layout-columns={layout.metrics}','data-color-zone={mode}','foundationCode[item.id]'])if(!foundation.includes(hook))errors.push('Spacing page missing source-derived '+hook);
 return errors;
}

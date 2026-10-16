import fs from'node:fs';import path from'node:path';import{createRequire}from'node:module';
const require=createRequire(import.meta.url),astro=path.dirname(require.resolve('astro/package.json')),vite=path.dirname(require.resolve('vite/package.json',{paths:[astro]})),postcss=require(require.resolve('postcss',{paths:[vite]}));
export const tokenSectionOrder=['Color','Typography','Spacing','Layout','Radius','Shadows','Motion','Icons','Controls and layers','Component tokens'];
export const themeSelectorExceptions=[{selector:"[data-fixed-shadow='light']",reason:'The two original artwork substrates keep isolated Light elevation without resetting project copy or surfaces.'}];
export const codeLineLimits={paired:60,full:80};
const oldZoneAttributes=[['color','surface'],['color','section'],['shadow','theme']].map(parts=>'data-'+parts.join('-'));
export function validateTokenSource(css){
 const errors=[],tree=postcss.parse(css),layer=tree.nodes.find(n=>n.type==='atrule'&&n.name==='layer'&&n.params==='system'),sections=(layer?.nodes||[]).filter(n=>n.type==='comment'&&tokenSectionOrder.includes(n.text.split(/\s*·\s*/)[0])).map(n=>n.text.split(/\s*·\s*/)[0]);
 // Shadows has two real source subsections; its section name is counted once.
 const ordered=sections.filter((name,index)=>name!==sections[index-1]);if(JSON.stringify(ordered)!==JSON.stringify(tokenSectionOrder))errors.push('tokens.css section order differs from the catalog.');
 tree.walkAtRules('media',rule=>{if(/max-width/.test(rule.params)||!/^\(min-width: (?:768|1024)px\)$/.test(rule.params))errors.push('Token breakpoints must be phone-first at768/1024 only.');});
 if(/--radius-(?:12|24|40|999)\b/.test(css))errors.push('Numbered radius aliases must not return.');
 // Recompute only the derived tint at consumers; project accent overrides stay local.
 const counts=new Map();tree.walkDecls(d=>{counts.set(d.prop,(counts.get(d.prop)||0)+1);if(/^--(?:color-|shadow-)/.test(d.prop))for(const selector of d.parent.selector.split(',').map(s=>s.trim()))if(!/^:root(?:\[data-theme=[^\]]+\])?$|^\[data-(?:theme|color-zone|zone-keep)(?:[^\]]*)\](?:\[data-[^\]]+\])*$/.test(selector)&&!themeSelectorExceptions.some(e=>e.selector===selector&&e.reason)&&!(d.prop==='--color-bg-accent-subtle'&&[':where(.skill-tag--accent)',':where(.case-study-decision-card__icon)'].includes(selector)))errors.push('Class-driven theme token: '+selector);});
 let paired=false;for(const [index,line]of css.split('\n').entries()){
  if(/^\/\* (Roles|Shared roles|Scoped surfaces|Styles|Tablet|Desktop|Spacing|Radius|Radius changes|Shadows|Scoped shadows) ·/.test(line))paired=true;
  else if(/^\/\* (Color|Palette|Typography|Font families|Layout|Tablet and desktop|Motion|Icons|Controls and layers|Component tokens|Component changes) ·/.test(line))paired=false;
  if(line.length>codeLineLimits[paired?'paired':'full'])errors.push(`Source line ${index+1} exceeds ${paired?60:80} characters.`);
 }
 if(/\n[ \t]*\n[ \t]*\n/.test(css))errors.push('tokens.css has double blank lines.');
 if(/\n[ \t]*\n[ \t]*}/.test(css))errors.push('tokens.css has a blank line before a closing brace.');
 tree.walkRules(rule=>{if(rule.selector.includes(',')&&rule.selector.split('\n').some(line=>line.replace(/,\s*$/,'').includes(',')))errors.push('Each token selector needs its own line.');if(/:root\[data-theme=['"]dark['"]\]/.test(rule.selector)&&/\[data-theme=['"]dark['"]\]/.test(rule.selector.replace(/:root\[data-theme=['"]dark['"]\]/g,''))&&!(rule.prev()?.type==='comment'&&/priority:/i.test(rule.prev().text)))errors.push('Duplicate Dark root selector needs a priority comment.');});
 tree.walkDecls(/^--shadow-/,decl=>{if(decl.value.includes(',')&&!decl.value.includes('\n'))errors.push('Each shadow layer needs its own line.');});
 for(const name of ['--font-heading','--font-body','--color-backdrop'])if(counts.get(name)!==1)errors.push(name+' must be defined once.');
 for(const name of ['--color-border-control','--color-focus-ring']){const defs=[];tree.walkDecls(name,d=>defs.push(d.value));if(defs.filter(value=>value==='var(--color-text-primary)').length!==1||defs.some(value=>value!=='var(--color-text-primary)'&&!(name==='--color-focus-ring'&&value==='inherit')))errors.push(name+' must derive once from local primary text.');}
 tree.walkDecls('--color-focus-ring',decl=>{if(decl.value==='inherit'&&decl.parent.selector!=="[data-zone-keep~='focus-ring']")errors.push('Only fixed-Light controls may keep their surrounding focus ring.');});
 const raw=new Map();tree.walkDecls(d=>{if(d.prop.startsWith('--')&&!raw.has(d.prop))raw.set(d.prop,d.value);});
 for(const [name,value]of Object.entries({'radius-small':'12px','radius-medium':'24px','radius-large':'24px','radius-xlarge':'40px','radius-full':'999px','gutter':'var(--space-6)','header-inset':'var(--space-6)','grid-gap':'var(--space-4)','section-space':'var(--space-16)'}))if(raw.get('--'+name)!==value)errors.push('Incorrect phone default: '+name);
 return errors;
}
const decode=text=>text.replace(/<[^>]*>/g,'').replace(/&#(?:x([\da-f]+)|(\d+));/gi,(_,hex,number)=>String.fromCodePoint(parseInt(hex||number,hex?16:10))).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&');
export function validateRenderedThemeZones(html){
 const errors=[];
 for(const[,attributes]of html.matchAll(/<[a-z][\w-]*\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi)){
  const classes=new Set((attributes.match(/\bclass="([^"]*)"/)?.[1]||'').split(/\s+/)),has=(name,value)=>attributes.includes(`${name}="${value}"`);
  const inverse=classes.has('case-study-chapter--inverse'),impact=classes.has('case-study-decision-card__impact'),about=classes.has('about-details');
  const light=['icon-button--raised','tooltip','case-study-decision-card--figure','case-study-service-demo'].some(name=>classes.has(name))||(classes.has('floating-control-theme')&&!classes.has('floating-navigation-theme'));
  const zone=light?'light':inverse||impact||about?'dark':null;
  if(zone&&!has('data-color-zone',zone))errors.push('Missing rendered '+zone+' zone: '+[...classes].join(' '));
  const keep=new Set((attributes.match(/\bdata-zone-keep="([^"]*)"/)?.[1]||'').split(/\s+/));
  if((inverse||impact||about)&&!keep.has('section'))errors.push('Scoped copy must retain the original section background: '+[...classes].join(' '));
  if(inverse&&!keep.has('surface'))errors.push('Inverse artwork must retain its inherited surface.');
  if(zone&&!keep.has(about?'large-shadow':'shadows'))errors.push('Scoped copy must retain its original shadow mode: '+[...classes].join(' '));
  if([...keep].some(keyword=>!['surface','section','shadows','large-shadow','focus-ring',''].includes(keyword))||keep.has('shadows')&&keep.has('large-shadow'))errors.push('Unknown/redundant zone keyword.');
  if(classes.has('icon-button--raised')&&!keep.has('focus-ring'))errors.push('Raised must keep its surrounding focus ring.');
  if(oldZoneAttributes.some(name=>attributes.includes(name+'=')))errors.push('Retired zone helper attribute.');
 }
 return errors;
}
export function validateRenderedFoundationCode(html,blocks){
 const paired=new Set(['roles-light','roles-dark','type-styles','type-tablet','type-desktop','type-use','spacing','radius','shadows-light','shadows-dark']);
 const errors=[],seen=new Map();for(const[,key,body]of html.matchAll(/<code\b[^>]*data-ds-code-source="([^"]+)"[^>]*>([\s\S]*?)<\/code>/g)){seen.set(key,(seen.get(key)||0)+1);const expected=blocks.find(b=>b.key===key);if(!expected||decode(body)!==expected.source)errors.push('Code differs from verbatim source: '+key);}
 for(const block of blocks)if(block.source.split('\n').some(line=>line.length>codeLineLimits[paired.has(block.key)?'paired':'full']))errors.push('Overlong actual Code source: '+block.key);
 for(const block of blocks)if(seen.get(block.key)!==1)errors.push('Missing/duplicate source block: '+block.key);
 for(const[,label]of html.matchAll(/<button\b[^>]*role="tab"[^>]*>([\s\S]*?)<\/button>/g))if(!['Preview','Code'].includes(decode(label).trim()))errors.push('Catalog tabs must be Preview | Code.');return errors;
}
export function validateFoundationCodeContract(root=process.cwd()){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),errors=validateTokenSource(read('src/styles/tokens.css')),retired=[['control','border'],['focus','ring'],['color','section','bg','surface'],['waterfall','icon','color'],['footer','pile','icon','color'],['backdrop','case']].map(parts=>'--'+parts.join('-'));
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const f of ['src','scripts','tests'].flatMap(dir=>walk(path.join(root,dir))).filter(f=>/\.(css|astro|ts|js|mjs|json)$/.test(f)).concat(['../DESIGN.md','../docs/design-system.md','../AGENTS.md','../docs/motion.md','../docs/case-study-recipe.md','../docs/breakpoints.md','../docs/copy.md'].map(f=>path.join(root,f)).filter(fs.existsSync))){const text=fs.readFileSync(f,'utf8');if(retired.some(name=>text.includes(name)))errors.push('Retired color role in '+path.relative(root,f));if(oldZoneAttributes.some(name=>text.includes(name)))errors.push('Retired zone helper in '+path.relative(root,f));}
 if(!read('src/components/DSFoundations.astro').includes('foundationSourceCode().groups')||/const (?:codeFor|deviceCode|sharedTypeCode)=/.test(read('src/components/DSFoundations.astro')))errors.push('Foundation Code must use literal source blocks.');
 if(!read('src/components/DSFoundations.astro').includes("labels={['Preview','Code']}"))errors.push('Foundation labels must be Preview | Code.');
 const impact=read('src/components/ImpactSection.astro'),global=postcss.parse(read('src/styles/global.css'));let cap=false,line=false,contents=false;
 global.walkRules(rule=>{if(!rule.selector.includes('.impact-company'))return;const values=Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));if(rule.selector==='.impact-company-line,.impact-company-cap'&&values.display==='contents')contents=true;if(rule.parent.params==='(min-width:1024px)'&&rule.selector==='.impact-company-line'&&values.display==='block')line=true;if(rule.parent.params==='(min-width:1024px)'&&rule.selector==='.impact-company-cap'&&values['vertical-align']==='middle'&&values.translate==='0 calc((1ex - 1cap) / 2)'&&values['line-height']==='0')cap=true;});
 if(!impact.includes('class="impact-company-line text-heading-l"')||!impact.includes('class="impact-company-cap"')||!cap||!line||!contents)errors.push('Impact company alignment must use the shared Heading/L line and native cap/ex geometry, desktop only.');
 const catalog=postcss.parse(read('src/styles/design-system.css'));let stretch=false;catalog.walkRules(rule=>{if(rule.selector==='.ds-code-columns'&&rule.nodes.some(n=>n.prop==='align-items'&&n.value==='stretch'))stretch=true;if(rule.selector.includes('.ds-code-columns')&&rule.nodes.some(n=>n.prop==='align-items'&&n.value==='start'))errors.push('Code row must not hug content.');});if(!stretch)errors.push('Shared Code rows must stretch.');
 return errors;
}

import fs from'node:fs';import path from'node:path';import{createRequire}from'node:module';
const require=createRequire(import.meta.url),astro=path.dirname(require.resolve('astro/package.json')),vite=path.dirname(require.resolve('vite/package.json',{paths:[astro]})),postcss=require(require.resolve('postcss',{paths:[vite]}));
export const tokenSectionOrder=['Color','Typography','Spacing','Layout','Radius','Shadows','Motion','Icons','Controls and layers','Component tokens'];
export const themeSelectorExceptions=[{selector:"[data-shadow-theme='light']",reason:'The two original artwork substrates keep isolated Light elevation without resetting project copy or surfaces.'}];
export function validateTokenSource(css){
 const errors=[],tree=postcss.parse(css),layer=tree.nodes.find(n=>n.type==='atrule'&&n.name==='layer'&&n.params==='system'),sections=(layer?.nodes||[]).filter(n=>n.type==='comment'&&tokenSectionOrder.includes(n.text.split(' · ')[0])).map(n=>n.text.split(' · ')[0]);
 // Shadows has two real source subsections; its section name is counted once.
 const ordered=sections.filter((name,index)=>name!==sections[index-1]);if(JSON.stringify(ordered)!==JSON.stringify(tokenSectionOrder))errors.push('tokens.css section order differs from the catalog.');
 tree.walkAtRules('media',rule=>{if(/max-width/.test(rule.params)||!/^\(min-width: (?:768|1024)px\)$/.test(rule.params))errors.push('Token breakpoints must be phone-first at768/1024 only.');});
 if(/--radius-(?:12|24|40|999)\b/.test(css))errors.push('Numbered radius aliases must not return.');
 const counts=new Map();tree.walkDecls(d=>{counts.set(d.prop,(counts.get(d.prop)||0)+1);if(/^--(?:color-|shadow-)/.test(d.prop))for(const selector of d.parent.selector.split(',').map(s=>s.trim()))if(!/^:root(?:\[data-theme=[^\]]+\])?$|^\[data-(?:theme|color-zone)(?:[^\]]*)\](?:\[data-[^\]]+\])*$/.test(selector)&&!themeSelectorExceptions.some(e=>e.selector===selector&&e.reason))errors.push('Class-driven theme token: '+selector);});
 for(const name of ['--font-heading','--font-body','--color-backdrop'])if(counts.get(name)!==1)errors.push(name+' must be defined once.');
 for(const name of ['--color-border-control','--color-focus-ring']){const defs=[];tree.walkDecls(name,d=>defs.push(d.value));if(defs.length!==1||defs[0]!=='var(--color-text-primary)')errors.push(name+' must derive once from local primary text.');}
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
  const light=['case-study-direct-close','tooltip','case-study-decision-card--figure','case-study-service-demo'].some(name=>classes.has(name))||(classes.has('floating-control-theme')&&!classes.has('floating-navigation-theme'));
  const zone=light?'light':inverse||impact||about?'dark':null;
  if(zone&&!has('data-color-zone',zone))errors.push('Missing rendered '+zone+' zone: '+[...classes].join(' '));
  if((inverse||impact||about)&&!has('data-color-section','page'))errors.push('Scoped copy must retain the original section background: '+[...classes].join(' '));
  if(inverse&&!has('data-color-surface','page'))errors.push('Inverse artwork must retain its inherited surface.');
  if(zone&&!has('data-shadow-theme',about?'small':'page'))errors.push('Scoped copy must retain its original shadow mode: '+[...classes].join(' '));
 }
 return errors;
}
export function validateRenderedFoundationCode(html,blocks){
 const errors=[],seen=new Map();for(const[,key,body]of html.matchAll(/<code\b[^>]*data-ds-code-source="([^"]+)"[^>]*>([\s\S]*?)<\/code>/g)){seen.set(key,(seen.get(key)||0)+1);const expected=blocks.find(b=>b.key===key);if(!expected||decode(body)!==expected.source)errors.push('Code differs from verbatim source: '+key);}
 for(const block of blocks)if(seen.get(block.key)!==1)errors.push('Missing/duplicate source block: '+block.key);
 for(const[,label]of html.matchAll(/<button\b[^>]*role="tab"[^>]*>([\s\S]*?)<\/button>/g))if(!['Preview','Code'].includes(decode(label).trim()))errors.push('Catalog tabs must be Preview | Code.');return errors;
}
export function validateFoundationCodeContract(root=process.cwd()){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),errors=validateTokenSource(read('src/styles/tokens.css')),retired=[['control','border'],['focus','ring'],['color','section','bg','surface'],['waterfall','icon','color'],['footer','pile','icon','color'],['backdrop','case']].map(parts=>'--'+parts.join('-'));
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const f of ['src','scripts','tests'].flatMap(dir=>walk(path.join(root,dir))).filter(f=>/\.(css|astro|ts|js|mjs|json)$/.test(f)).concat(['../DESIGN.md','../docs/design-system.md','../AGENTS.md','../docs/motion.md','../docs/case-study-recipe.md','../docs/breakpoints.md','../docs/copy.md'].map(f=>path.join(root,f)).filter(fs.existsSync)))if(retired.some(name=>fs.readFileSync(f,'utf8').includes(name)))errors.push('Retired color role in '+path.relative(root,f));
 if(!read('src/components/DSFoundations.astro').includes('foundationSourceCode().groups')||/const (?:codeFor|deviceCode|sharedTypeCode)=/.test(read('src/components/DSFoundations.astro')))errors.push('Foundation Code must use literal source blocks.');
 if(!read('src/components/DSFoundations.astro').includes("labels={['Preview','Code']}"))errors.push('Foundation labels must be Preview | Code.');
 return errors;
}

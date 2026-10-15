import fs from'node:fs';import path from'node:path';import{createRequire}from'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),astro=path.dirname(require.resolve('astro/package.json')),vite=path.dirname(require.resolve('vite/package.json',{paths:[astro]})),postcss=require(require.resolve('postcss',{paths:[vite]}));
// Source anchors identify the actual website step; no catalog easing is guessed.
export const motionCurveSources={
 logo:['src/styles/global.css',String.raw`transition: transform var\(--duration-logo-wave\) var\(--([\w-]+)\)`],
 button:['src/styles/global.css',String.raw`clip-path var\(--duration-button-fill\) var\(--([\w-]+)\)`],
 arrow:['src/styles/global.css',String.raw`\.arrow \{[^}]*var\(--duration-fast\) var\(--([\w-]+)\)`],
 tooltip:['src/styles/tooltip.css',String.raw`opacity var\(--duration-tooltip-opacity\) var\(--([\w-]+)\)`],
 theme:['src/styles/global.css',String.raw`transform var\(--duration-toggle-return\) var\(--([\w-]+)\)`],
 header:['src/styles/global.css',String.raw`transform var\(--duration-header-exit\) var\(--([\w-]+)\)`],
 navigation:['src/styles/global.css',String.raw`opacity var\(--duration-navigation\) var\(--([\w-]+)\)`],
 skills:['src/styles/global.css',String.raw`skills-up var\(--duration-skills-loop\) var\(--([\w-]+)\)`],
 tool:['src/styles/global.css',String.raw`transform var\(--duration-tool-icon\) var\(--([\w-]+)\)`],
 close:['src/styles/global.css',String.raw`transform var\(--duration-close-turn\) var\(--([\w-]+)\)`],
 work:['src/scripts/work-stage/work-stage.ts',String.raw`const stageEase = \(\) => tokens.getPropertyValue\('--([\w-]+)'\)`],
 about:['src/scripts/section-reveals.ts',String.raw`const easing = tokens.getPropertyValue\('--([\w-]+)'\)`],
 entrance:['src/scripts/hero-intro.ts',String.raw`const easing = tokens.getPropertyValue\('--([\w-]+)'\)`],
 role:['src/scripts/hero-intro.ts',String.raw`exitEase: tokens.getPropertyValue\('--([\w-]+)'\)`],
 travel:['src/scripts/case-study/case-study-motion.ts',String.raw`travelEasing: tokens.getPropertyValue\('--([\w-]+)'\)`],
 radius:['src/scripts/case-study/case-study-motion.ts',String.raw`radiusEasing: tokens.getPropertyValue\('--([\w-]+)'\)`],
 filterIn:['src/scripts/work-filter/work-filter.ts',String.raw`easing: entering \? tokens.getPropertyValue\('--([\w-]+)'\)`],
 filterOut:['src/scripts/work-filter/work-filter.ts',String.raw`easing: entering[^\n]* : tokens.getPropertyValue\('--([\w-]+)'\)`],
 linear:['src/scripts/hero-intro.ts',String.raw`duration: number\('--duration-layout'\), easing: tokens.getPropertyValue\('--([\w-]+)'\)`],
};
/** @returns {Record<string,string>} */
export function readMotionSourceCurves(root=process.cwd()){
 const curves=Object.fromEntries(Object.entries(motionCurveSources).map(([step,[file,pattern]])=>{
  const match=fs.readFileSync(path.join(root,file),'utf8').match(new RegExp(pattern));
  if(!match)throw Error('Motion source anchor missing: '+step+' in '+file);
  return [step,match[1]];
 }));
 // Section scroll uses the shared exact Lenis function, not a CSS approximation.
 if(!fs.readFileSync(path.join(root,'src/scripts/motion.ts'),'utf8').includes('easing: easeSectionScroll'))throw Error('Section scroll must keep the source curve');
 return {...curves,scroll:'ease-section-scroll'};
}
// Simulation integration and frame scheduling are physical models, not UI tweens.
export const motionTimingAllowlist=[
 {prefix:'src/scripts/waterfall/',reason:'Rain physics, simulation deadlines, frame caps and rendering are explicitly unchanged.'},
 {prefix:'src/scripts/footer-pile/',reason:'Footer physics and simulation integration retain their measured model.'},
 {file:'src/scripts/project-tilt.ts',reason:'Analytic critically damped pointer spring: omega, settling thresholds and frame integration are physical model constants.'},
 {file:'src/scripts/header-morph/header-morph-model.ts',reason:'Normalized progress, smoothstep shaping and measured capsule geometry are preserved, while durations are supplied from tokens.'},
 {file:'src/scripts/work-filter/work-filter-magnet.ts',reason:'The pointer capture radius is a physical interaction boundary, not a timed UI tween.'},
 {file:'src/styles/global.css',value:'0s',reason:'The existing prefers-reduced-motion override disables transitions.'},
];
const typedTime=/(?:^|[^\w-])(?:\d*\.)?\d+(?:ms|s)\b/;
const typedCurve=/(?:cubic-bezier|linear)\(|(?:^|[\s,])(?:ease(?:-in-out|-in|-out)?|linear)(?=$|[\s,])/;
const retired=[['ease','stage','entrance'],['ease','work','stage'],['ease','icon','shift'],['ease','case','radius'],['scale','tooltip','end'],['button','fill','ease']].map(p=>'--'+p.join('-'));
export function validateMotionCss(css,file='fixture.css'){
 const errors=[];postcss.parse(css).walkDecls(decl=>{
  if(!/^(?:transition|animation)(?:-|$)/.test(decl.prop))return;
  const plain=decl.value.replace(/var\([^)]*\)/g,'');
  if(typedTime.test(plain)){
   let reduced=false;for(let node=decl.parent;node;node=node.parent)if(node.type==='atrule'&&node.name==='media'&&/prefers-reduced-motion:\s*reduce/.test(node.params))reduced=true;
   const exception=motionTimingAllowlist.some(item=>item.file===file&&plain.includes(item.value)&&reduced&&!/[1-9]\d*(?:ms|s)/.test(plain));
   if(!exception)errors.push(`${file}:${decl.source.start.line}: typed timing in ${decl.prop}`);
  }
  if(typedCurve.test(plain))errors.push(`${file}:${decl.source.start.line}: typed easing in ${decl.prop}`);
 });return errors;
}
export function validateMotionScript(source,file='fixture.ts'){
 const errors=[],tree=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const visit=node=>{
  if(ts.isVariableDeclaration(node)&&/(?:duration|delay|stagger)/i.test(node.name.getText(tree))&&node.initializer&&ts.isNumericLiteral(node.initializer)&&Number(node.initializer.text)>0&&!motionTimingAllowlist.some(item=>item.prefix&&file.startsWith(item.prefix)))errors.push(`${file}: typed timing declaration ${node.name.getText(tree)}`);
  if(ts.isPropertyAssignment(node)&&['duration','delay','stagger','easing','ease'].includes(node.name.getText(tree).replace(/['"]/g,''))){
   const value=node.initializer;
   if(ts.isNumericLiteral(value)&&Number(value.text)>0||ts.isStringLiteralLike(value)&&(typedTime.test(value.text)||typedCurve.test(value.text)))errors.push(`${file}:${tree.getLineAndCharacterOfPosition(node.pos).line+1}: typed animation ${node.name.getText(tree)}`);
  }
  ts.forEachChild(node,visit);
 };visit(tree);return errors;
}
export function validateMotionDemoTriggers(client){
 const triggers=[...client.matchAll(/(?:demo|button)\.addEventListener\('([^']+)'/g)].map(m=>m[1]);
 return triggers.join(',')==='click'&&!client.includes('pointerFocus')?[]:['Motion demos must start only from native play-button activation.'];
}
export function validateMotionCurveBindings(model,client,root=process.cwd()){
 const errors=[],sources=readMotionSourceCurves(root);
 if(/(?:token|curve):'ease-|curves:\['ease-/.test(model))errors.push('Motion labels must read the website step, not a typed easing list.');
 for(const [,key]of (model+'\n'+client).matchAll(/(?:sourceCurves\.|sourceCurve\(')([\w]+)/g))if(!(key in sources))errors.push('Unknown Motion source step: '+key);
 for(const [,key]of client.matchAll(/'duration-[\w-]+','([\w-]+)'/g))if(!(key in sources))errors.push('Demo tween must read its source easing: '+key);
 // Match labels to the native demo recipe, not merely to any valid source key.
 const tree=ts.createSourceFile('system-motion.ts',model,ts.ScriptTarget.Latest,true),recipe=client.slice(client.indexOf('const build='),client.indexOf('const progress=')),branches=[...recipe.matchAll(/if\(id==='([^']+)'\)/g)];
 const bodies=Object.fromEntries(branches.map((m,i)=>[m[1],recipe.slice(m.index,branches[i+1]?.index??recipe.indexOf('const axis=',m.index))]));
 const property=(object,name)=>object.properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(tree)===name)?.initializer;
 const literal=node=>node&&ts.isStringLiteral(node)?node.text:undefined;
 const sourceKey=node=>node&&ts.isPropertyAccessExpression(node)&&node.expression.getText(tree)==='sourceCurves'?node.name.text:undefined;
 const visit=node=>{
  if(ts.isVariableDeclaration(node)&&node.name.getText(tree)==='motionCards'&&ts.isArrayLiteralExpression(node.initializer))for(const card of node.initializer.elements){
   if(!ts.isObjectLiteralExpression(card))continue;
   const id=literal(property(card,'id')),body=bodies[id]||'';
   const actual=new Set([...body.matchAll(/sourceCurve\('([\w]+)'\)|'duration-[\w-]+','([\w]+)'/g)].map(m=>m[1]||m[2]));
   for(const field of ['values','steps']){
    const rows=property(card,field);if(!rows||!ts.isArrayLiteralExpression(rows))continue;
    for(const row of rows.elements){
     if(!ts.isObjectLiteralExpression(row))continue;
     const key=sourceKey(property(row,field==='steps'?'curve':'token'));if(!key)continue;
     const duration=literal(property(row,'duration'));
     const bindings=[...body.matchAll(/'(duration-[\w-]+)','([\w]+)'/g)].filter(m=>m[1]===duration).map(m=>m[2]);
     const matches=bindings.length?bindings.includes(key):actual.has(key);
     if(!matches||(duration==='duration-case-close'&&sources[key]!==sources.travel))errors.push('Motion label differs from its actual recipe: '+id+' / '+(duration||key));
    }
   }
  }
  ts.forEachChild(node,visit);
 };visit(tree);
 if(!model.includes('motionCurves.find')||!model.includes('Undocumented source curve'))errors.push('Every source easing needs an explicit human name.');
 return errors;
}
export function validateMotionContract(root=process.cwd()){
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),walk=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 const errors=[],tokens=read('src/styles/tokens.css'),start=tokens.indexOf('/* Motion ·'),end=tokens.indexOf('/* Icons ·',start);
 for(const match of tokens.matchAll(/--(?:duration|delay|stagger|ease|distance|scale)-[\w-]+\s*:/g))if(match.index<start||match.index>=end)errors.push('Motion token outside Motion section: '+match[0]);
 for(const group of ['Durations','Delays and staggers','Easing','Distances and scales','Spring and physics'])if(!tokens.slice(start,end).includes('/* '+group+' ·'))errors.push('Missing Motion group '+group);
 for(const file of walk('src').filter(f=>/\.(css|astro|ts)$/.test(f))){
  const text=read(file);if(retired.some(name=>text.includes(name)))errors.push('Retired Motion token in '+file);
  if(file==='src/styles/tokens.css')continue;
  if(file.endsWith('.css'))errors.push(...validateMotionCss(text,file));
  else if(file.endsWith('.astro'))for(const[,css]of text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g))errors.push(...validateMotionCss(css,file));
  else if(file.endsWith('.ts'))errors.push(...validateMotionScript(text,file));
 }
 const demo=read('src/components/DSMotion.astro'),client=read('src/scripts/design-system-motion.ts'),control=read('src/components/SegmentedControl.astro'),foundations=read('src/components/DSFoundations.astro'),model=read('src/data/system-motion.ts');
 errors.push(...validateMotionDemoTriggers(client),...validateMotionCurveBindings(model,client,root));
 const defined=new Set([...tokens.matchAll(/--([\w-]+)\s*:/g)].map(match=>match[1]));defined.add('ease-section-scroll');
 for(const name of Object.values(readMotionSourceCurves(root)))if(!defined.has(name))errors.push('Unknown easing at website source: '+name);
 for(const [,name]of model.matchAll(/(?:token|duration|delay|stagger|distance|curve):'([^']+)'/g))if(!defined.has(name))errors.push('Motion specimen references an unknown source token: '+name);
 const ids=[...model.matchAll(/\{id:'([^']+)'/g)].map(match=>match[1]);
 if(ids.join(',')!=='logo,button,arrow,tooltip,theme,tilt,project,header,text,role,filter,skills,other')errors.push('Motion must document all thirteen effects in the reviewed order.');
 if(!read('src/components/DSDashboard.astro').includes('<div class="ds-tile-visual" inert aria-hidden="true">')||!read('src/components/DSDashboard.astro').includes('<div class="ds-motion-tile"><DSMotionCurve cover'))errors.push('The Motion cover must be inert and hidden from assistive technology.');
 const code=read('src/data/system-code.ts'),catalogCss=read('src/styles/design-system.css');
 if(!code.includes("motion:block('motion','Motion','Icons')")||!code.includes('scroll.indexOf(\'/** Section scroll ·\')'))errors.push('Motion Code must show the verbatim Motion source and exact scroll function.');
 if(!catalogCss.includes('repeat(auto-fit,minmax(min(100%,calc(60ch + var(--space-6) * 2)),1fr))'))errors.push('Paired Code blocks need two complete sixty-character columns before sitting side by side.');
 if(!demo.includes('class="ds-motion-art" inert aria-hidden="true"')||!demo.includes('<IconButton class="ds-motion-replay" size="small" variant="secondary"'))errors.push('Motion art must be inert and Replay must use the shared Secondary/Small IconButton.');
 if(!control.includes("import Button from './Button.astro'")||!control.includes("import Icon from './Icon.astro'")||!control.includes('class="theme-icon-glyph"')||!control.includes('choice.label'))errors.push('Segmented controls must compose shared Buttons, icons and labels.');
 if(!foundations.includes('<SegmentedControl label="Playback speed"')||!foundations.includes('data-motion-speed'))errors.push('Motion speed must use the shared segmented control.');
 if(!client.includes('a.updatePlaybackRate(speed)')||/setProperty\(['"]--(?:duration|delay|stagger|ease|distance|scale)-/.test(client))errors.push('Catalog speed changes only local animation playback rates.');
 if(/document\.querySelector(?:All)?[^;\n]*(?:data-logo|wordmark)/.test(client))errors.push('Catalog replay must never target a website/sidebar Logo.');
 if(!client.includes("const root=document.querySelector<HTMLElement>('[data-motion-catalog]')")||!client.includes('if(root)'))errors.push('Catalog animation code must stay scoped to Motion.');
 if(/\d+(?:ms|s)\b/.test(demo))errors.push('Motion values must be derived from tokens, never typed in markup.');
 if(!demo.includes('data-motion-step-curve={step.curve}')||!demo.includes('new Set(card.steps.map(step=>step.curve))'))errors.push('Timeline chips must derive from their actual source steps.');
 if(!demo.includes('[0,end/2,end]')||!read('src/styles/design-system-motion.css').includes('span:last-child { transform:translateX(-100%); }'))errors.push('Timeline ticks need room and a right-aligned endpoint.');
 if(!read('src/styles/design-system-motion.css').includes('#motion .ds-stage-bar .ds-motion-speed { width:100%; display:grid;'))errors.push('Phone playback speed must fill its own three-segment row.');
 if(!read('src/styles/design-system-motion.css').includes('.ds-motion-curve-card .ds-token-swap { align-items:start; }'))errors.push('Curve names must top-align independently of hidden token wrapping.');
 return errors;
}

import {readFileSync,readdirSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),astro=dirname(require.resolve('astro/package.json')),vite=dirname(require.resolve('vite/package.json',{paths:[astro]})),postcss=require(require.resolve('postcss',{paths:[vite]}));
export function unguardedHoverRules(css){const failures=[];postcss.parse(css).walkRules(rule=>{if(!rule.selector.includes(':hover'))return;for(let node=rule.parent;node;node=node.parent)if(node.type==='atrule'&&node.name==='media'&&/\(hover:\s*hover\)/.test(node.params)&&/\(pointer:\s*fine\)/.test(node.params))return;failures.push(rule.selector);});return failures;}
export function validateHoverSource(root=process.cwd()){
 const files=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(resolve(directory,entry.name)):[resolve(directory,entry.name)]);
 return [...files(resolve(root,'src')).filter(file=>/\.(css|astro)$/.test(file)).flatMap(file=>{const text=readFileSync(file,'utf8'),styles=file.endsWith('.css')?[text]:[...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(([,css])=>css);return styles.flatMap(css=>unguardedHoverRules(css).map(selector=>`Unguarded touch hover: ${file.slice(root.length+1)} ${selector}`));}),...validateThemeIconMotion(readFileSync(resolve(root,'src/styles/global.css'),'utf8')+readFileSync(resolve(root,'src/styles/design-system.css'),'utf8'),readFileSync(resolve(root,'src/components/ThemeToggle.astro'),'utf8'))];
}

/** Both theme-control appearances share one set of motion declarations. */
export function validateThemeIconMotion(css,toggle){
 const errors=[],rules=[];postcss.parse(css).walkRules(rule=>{if((rule.selector.includes('theme-icon-glyph')||rule.selector.includes('theme-toggle-group')&&rule.selector.includes('.icon'))&&rule.nodes.some(node=>node.type==='decl'&&node.prop==='transform'))rules.push(rule);});
 if(toggle!==undefined&&(!toggle.includes('<SegmentedControl theme')||!toggle.includes("icon:'sun'")||!toggle.includes("icon:'moon'")||!toggle.includes('class="theme-toggle theme-icon-control"')||!toggle.includes('class="theme-toggle-glyph theme-icon-glyph"')))errors.push('Both theme-control appearances must bind the shared control/glyph motion hooks.');
 const contracts=[
  [['.theme-icon-glyph'],{'transform-origin':'center',transform:'translateY(0) rotate(0deg) scale(1)',transition:'transform var(--duration-toggle-return) var(--ease-toggle-rotation)'}],
  [['.theme-icon-control:hover .theme-icon-glyph', "[data-icon-hover='theme']:focus-visible .theme-icon-glyph"],{transform:'rotate(var(--rotation-icon-turn))','transition-duration':'var(--duration-toggle-enter)'}],
  [['.theme-icon-control:active .theme-icon-glyph'],{transform:'translateY(0) rotate(0deg) scale(var(--scale-press))','transition-duration':'var(--duration-press)','transition-timing-function':'var(--ease-out)'}],
  [['.theme-icon-control .theme-icon-glyph'],{transform:'none',transition:'none'}],
 ];
 if(rules.length!==contracts.length)errors.push('Theme icon motion must have one shared base, hover, press and reduced-motion rule, without copies.');
 for(const [index,[selectors,values]] of contracts.entries()){
  const rule=rules.find(rule=>JSON.stringify(rule.selector.split(',').map(x=>x.trim()))===JSON.stringify(selectors));
  for(const [property,value]of Object.entries(values))if(rule?.nodes.find(node=>node.type==='decl'&&node.prop===property)?.value!==value)errors.push(`Shared theme icon motion ${index}: ${property} must be ${value}`);
  if(index===1){let guarded=false;for(let p=rule?.parent;p;p=p.parent)if(p.type==='atrule'&&p.name==='media'&&/\(hover:\s*hover\)/.test(p.params)&&/\(pointer:\s*fine\)/.test(p.params))guarded=true;if(!guarded)errors.push('Theme icon rotation requires fine-pointer hover.');}
  if(index===3&&(rule?.parent?.params!=='(prefers-reduced-motion: reduce)'||!rule?.nodes.find(node=>node.prop==='transform')?.important))errors.push('Reduced motion must suppress both theme icons.');
 }
 return errors;
}

/** Logo motion is a token-only CSS transition; identity endpoints and the
 * zero-duration visibility paint swap do not define a separate motion recipe. */
export function validateLogoWave(css, logo, tokens, clients='') {
 const failures=[],fail=message=>failures.push('Logo wave: '+message),rules=[];
 postcss.parse(css).walkRules(rule=>{if(rule.selector.includes('[data-logo-letter]'))rules.push(rule);});
 const base=rules.find(rule=>rule.selector.trim()==='.wordmark [data-logo-letter]');
 const wave=rules.find(rule=>rule.selector.includes(':hover')&&rule.selector.endsWith('[data-logo-letter]'));
 const value=(rule,name)=>rule?.nodes?.find(node=>node.type==='decl'&&node.prop===name)?.value.replace(/\s+/g,'')||'';
 if(value(base,'transition')!=='transformvar(--duration-logo-wave)var(--ease-spring-wave)')fail('duration/easing must use the physical spring tokens.');
 if(value(base,'transition-delay')!=='calc(var(--stagger-title-reveal)*0)')fail('leave must reset stagger to zero through the shared token.');
 if(value(wave,'transform')!=='translateY(calc(var(--distance-icon-shift)*-1))scale(var(--scale-logo-wave))')fail('lift/scale must use shared tokens, without literals.');
 if(value(wave,'transition-delay')!=='calc(var(--stagger-title-reveal)*var(--logo-letter-index))')fail('enter must stagger in glyph order using the title token.');
 if(value(base,'transform-box')!=='fill-box'||value(base,'transform-origin')!=='center')fail('glyphs must scale around their own centre.');
 let guarded=false;for(let node=wave?.parent;node;node=node.parent)if(node.type==='atrule'&&node.name==='media'&&/\(hover:\s*hover\)/.test(node.params)&&/\(pointer:\s*fine\)/.test(node.params)&&/\(prefers-reduced-motion:\s*no-preference\)/.test(node.params))guarded=true;
 if(!guarded||!wave?.selector.includes(':focus-visible'))fail('hover/focus must respect input and reduced motion.');
 if(/<script\b/.test(logo)||/logo-(?:wave|replay)|data-logo-letter/.test(clients))fail('no JavaScript or animation library may drive this effect.');
 if(rules.some(rule=>rule.nodes.some(node=>node.type==='decl'&&node.prop.startsWith('animation'))))fail('only transitions are permitted.');
 if(!logo.includes('mark.letters.map')||!logo.includes('--logo-letter-index'))fail('the real Logo must expose source glyphs in order.');
 if(!/--scale-logo-wave:\s*1\.05;/.test(tokens)||!/--ease-spring-wave:\s*linear\(/.test(tokens)||!tokens.includes('--duration-logo-wave:'))fail('missing approved source scale or precomputed spring.');
 return failures;
}

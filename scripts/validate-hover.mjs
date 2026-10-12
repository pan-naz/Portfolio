import {readFileSync,readdirSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),astro=dirname(require.resolve('astro/package.json')),vite=dirname(require.resolve('vite/package.json',{paths:[astro]})),postcss=require(require.resolve('postcss',{paths:[vite]}));
export function unguardedHoverRules(css){const failures=[];postcss.parse(css).walkRules(rule=>{if(!rule.selector.includes(':hover'))return;for(let node=rule.parent;node;node=node.parent)if(node.type==='atrule'&&node.name==='media'&&/\(hover:\s*hover\)/.test(node.params)&&/\(pointer:\s*fine\)/.test(node.params))return;failures.push(rule.selector);});return failures;}
export function validateHoverSource(root=process.cwd()){
 const files=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(resolve(directory,entry.name)):[resolve(directory,entry.name)]);
 return files(resolve(root,'src')).filter(file=>/\.(css|astro)$/.test(file)).flatMap(file=>{const text=readFileSync(file,'utf8'),styles=file.endsWith('.css')?[text]:[...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(([,css])=>css);return styles.flatMap(css=>unguardedHoverRules(css).map(selector=>`Unguarded touch hover: ${file.slice(root.length+1)} ${selector}`));});
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
 if(!/--scale-logo-wave:\s*1\.05;/.test(tokens)||!tokens.includes('--ease-spring-wave: linear(')||!tokens.includes('--duration-logo-wave:'))fail('missing approved source scale or precomputed spring.');
 return failures;
}

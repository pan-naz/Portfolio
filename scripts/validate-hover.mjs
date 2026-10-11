import {readFileSync,readdirSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),astro=dirname(require.resolve('astro/package.json')),vite=dirname(require.resolve('vite/package.json',{paths:[astro]})),postcss=require(require.resolve('postcss',{paths:[vite]}));
export function unguardedHoverRules(css){const failures=[];postcss.parse(css).walkRules(rule=>{if(!rule.selector.includes(':hover'))return;for(let node=rule.parent;node;node=node.parent)if(node.type==='atrule'&&node.name==='media'&&/\(hover:\s*hover\)/.test(node.params)&&/\(pointer:\s*fine\)/.test(node.params))return;failures.push(rule.selector);});return failures;}
export function validateHoverSource(root=process.cwd()){
 const files=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(resolve(directory,entry.name)):[resolve(directory,entry.name)]);
 return files(resolve(root,'src')).filter(file=>/\.(css|astro)$/.test(file)).flatMap(file=>{const text=readFileSync(file,'utf8'),styles=file.endsWith('.css')?[text]:[...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(([,css])=>css);return styles.flatMap(css=>unguardedHoverRules(css).map(selector=>`Unguarded touch hover: ${file.slice(root.length+1)} ${selector}`));});
}

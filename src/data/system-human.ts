import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { SourceToken } from './system-inventory';
export const heroDescriptionMarkup = readFileSync(resolve(process.cwd(),'src/components/Hero.astro'),'utf8').match(/<p class="hero-description text-body-l">([\s\S]*?)<\/p>/)![1];
export const px = (value:string) => value.replace(/(-?[\d.]+)rem\b/g,(_,number)=>`${+(Number(number)*16).toFixed(4)}px`).replace(/px\s*→\s*/,' → ');
export const humanToken = (name:string) => name.replace(/^color-/,'').replace(/^bg-/,'').replaceAll('-',' ').replace(/^./,letter=>letter.toUpperCase());
export const tokenCode=(tokens:SourceToken[])=>`:root {\n${tokens.map(token=>`  --${token.name}: ${token.light};`).join('\n')}\n}\n[data-theme='dark'] {\n${tokens.filter(token=>token.dark!==token.light).map(token=>`  --${token.name}: ${token.dark};`).join('\n')}\n}`;

/** The real project and metric grid counts, including responsive overrides. */
export function sourceGrids() {
 const css=readFileSync(resolve(process.cwd(),'src/styles/global.css'),'utf8');
 return [{name:'Projects',classes:'project-collection project-collection--bento',selector:'.project-collection--bento'},{name:'Metrics',classes:'impact-metrics',selector:'.impact-metrics'}].map(grid=>{
  const counts=[...css.matchAll(new RegExp('(?:^|\\n)\\s*'+grid.selector.replaceAll('.','\\.')+'\\s*\\{([^}]+)\\}','g'))].flatMap(([,body])=>{const columns=body.match(/grid-template-columns:\s*([^;]+)/)?.[1];return columns?[columns.match(/repeat\((\d+)/)?Number(columns.match(/repeat\((\d+)/)![1]):1]:[];});
  if(!counts.length)throw Error('Missing source grid '+grid.selector);
  return {...grid,counts:[...new Set(counts)].sort((a,b)=>a-b)};
 });
}

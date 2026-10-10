import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { projects, experience } from './portfolio';
import type { SourceToken } from './system-inventory';
export const heroDescriptionMarkup = readFileSync(resolve(process.cwd(),'src/components/Hero.astro'),'utf8').match(/<p class="hero-description text-body-l">([\s\S]*?)<\/p>/)![1];
export const typeSamples = [
  {text:'Product Designer',className:'text-heading-xl',use:'Hero title'},
  {text:'Projects worth a closer look.',className:'text-heading-l',use:'Section titles'},
  {text:projects[0].title,className:'font-heading',use:'Project names'},
  {html:heroDescriptionMarkup,className:'hero-description text-body-l',use:'Hero introduction'},
  {text:projects[0].description,className:'text-body-m',use:'Project descriptions'},
  {text:experience[0].role,className:'text-body-m-strong',use:'Buttons, navigation and roles'},
  {text:`${experience[0].company} · ${experience[0].location}`,className:'text-body-s',use:'Supporting information'},
  {text:'01 / Selected work',className:'eyebrow',use:'Section labels'},
  {text:projects[0].tags[0],className:'skill-tag',use:'Skills and project tags'},
];
export const px = (value:string) => value.replace(/(-?[\d.]+)rem\b/g,(_,number)=>`${+(Number(number)*16).toFixed(4)}px`).replace(/px\s*→\s*/,' → ');
export const humanToken = (name:string) => name.replace(/^color-/,'').replace(/^bg-/,'').replaceAll('-',' ').replace(/^./,letter=>letter.toUpperCase());
export const tokenCode=(tokens:SourceToken[])=>`:root {\n${tokens.map(token=>`  --${token.name}: ${token.light};`).join('\n')}\n}\n[data-theme='dark'] {\n${tokens.filter(token=>token.dark!==token.light).map(token=>`  --${token.name}: ${token.dark};`).join('\n')}\n}`;

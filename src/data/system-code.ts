import {interfaceIconNames} from './system-icons.ts';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

export interface CodeBlock {key:string;source:string;}
export type CodeColumns=CodeBlock[][];
/** Literal source slices: no token/value/selector serialization. */
export function foundationSourceCode(root=process.cwd()){
 const tokens=readFileSync(resolve(root,'src/styles/tokens.css'),'utf8');
 const typography=readFileSync(resolve(root,'src/styles/typography.css'),'utf8');
 const scroll=readFileSync(resolve(root,'src/scripts/scroll-policy.ts'),'utf8');
 const slice=(text:string,start:string,end:string)=>{const a=text.indexOf('/* '+start+' ·'),b=text.indexOf('/* '+end+' ·',a+1);if(a<0||b<0)throw Error('Missing source section '+start+' / '+end);return text.slice(a,b).trim();};
 const block=(key:string,start:string,end:string):CodeBlock=>({key,source:slice(tokens,start,end)});
 const code={
  palette:block('palette','Palette','Roles'),
  light:{key:'roles-light',source:tokens.slice(tokens.indexOf('/* Roles · light'),tokens.indexOf('/* Roles · dark')).trim()},
  dark:{key:'roles-dark',source:tokens.slice(tokens.indexOf('/* Roles · dark'),tokens.indexOf('/* Typography ·')).trim()},
  families:block('font-families','Font families','Styles'),
  styles:block('type-styles','Styles','Tablet'),
  tablet:block('type-tablet','Tablet','Desktop'),
  desktop:block('type-desktop','Desktop','Spacing'),
  spacing:block('spacing','Spacing','Layout'),
  layout:block('layout','Layout','Radius'),
  radius:block('radius','Radius','Shadows'),
  shadowLight:{key:'shadows-light',source:tokens.slice(tokens.indexOf('/* Shadows · light'),tokens.indexOf('/* Shadows · dark')).trim()},
  shadowDark:{key:'shadows-dark',source:tokens.slice(tokens.indexOf('/* Shadows · dark'),tokens.indexOf('/* Motion ·')).trim()},
  motion:block('motion','Motion','Icons'),
  scrollCurve:{key:'motion-scroll-curve',source:scroll.slice(scroll.indexOf('/** Section scroll ·'),scroll.indexOf('export const scrollPolicy')).trim()},
  icons:block('icons','Icons','Controls and layers'),
  iconUse:{key:'icon-use',source:`/* Use an icon */
import Icon from '../components/Icon.astro';

<Icon name="arrow" />;
<Icon name="plus" size={20} />;

/* Names · src/data/icons.ts */
${interfaceIconNames.map(name=>`// ${name}`).join('\n')}`},
  iconAdd:{key:'icon-add',source:`/* Add an icon */
// Draw on the 24px grid, with round caps and joins.
// Use Regular weight unless it needs Strong.
// Add it to src/data/icons.ts and to one Icons group.`},
  iconLibrary:{key:'icon-library',source:`/* Decorative library */
// src/scripts/waterfall/waterfall-icon-data.ts
// Lucide (ISC). Decoration only, never a control.`},
  use:{key:'type-use',source:typography.slice(typography.indexOf('/* Use a style ·'),typography.indexOf('/* heading-l ·')).trim()+'\n\n<h2 class="text-heading-l">\n  Projects\n</h2>'},
 };
 const groups:Record<string,CodeColumns[]>={
  color:[[[code.palette]],[[code.light],[code.dark]]],
  typography:[[[code.families]],[[code.styles],[code.tablet,code.desktop,code.use]]],
  'spacing-layout':[[[code.spacing],[code.radius]],[[code.layout]],[[code.shadowLight],[code.shadowDark]]],
  motion:[[[code.motion]],[[code.scrollCurve]]],icons:[[[code.icons]],[[code.iconUse],[code.iconAdd,code.iconLibrary]]],
 };
 return{groups,blocks:Object.values(code),projectFit:tokens.match(/^  --case-hero-fit:[^;]+;/m)![0]};
}
export function codeSegments(source:string){
 const parts:{text:string;comment:boolean}[]=[],pattern=/\/\*[\s\S]*?\*\//g;let from=0;
 for(const match of source.matchAll(pattern)){if(match.index!>from)parts.push({text:source.slice(from,match.index),comment:false});parts.push({text:match[0],comment:true});from=match.index!+match[0].length;}
 if(from<source.length)parts.push({text:source.slice(from),comment:false});return parts;
}

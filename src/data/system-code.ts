import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

export interface CodeBlock {key:string;source:string;}
export type CodeColumns=CodeBlock[][];
/** Literal source slices: no token/value/selector serialization. */
export function foundationSourceCode(root=process.cwd()){
 const tokens=readFileSync(resolve(root,'src/styles/tokens.css'),'utf8');
 const typography=readFileSync(resolve(root,'src/styles/typography.css'),'utf8');
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
  icons:block('icons','Icons','Controls and layers'),
  use:{key:'type-use',source:typography.slice(typography.indexOf('/* Use a style ·'),typography.indexOf('/* heading-l ·')).trim()+'\n\n<h2 class="text-heading-l">Projects</h2>'},
 };
 const groups:Record<string,CodeColumns[]>={
  color:[[[code.palette]],[[code.light],[code.dark]]],
  typography:[[[code.families]],[[code.styles],[code.tablet,code.desktop,code.use]]],
  'spacing-layout':[[[code.spacing],[code.radius]],[[code.layout]],[[code.shadowLight],[code.shadowDark]]],
  motion:[[[code.motion]]],icons:[[[code.icons]]],
 };
 return{groups,blocks:Object.values(code)};
}
export function codeSegments(source:string){
 const parts:{text:string;comment:boolean}[]=[],pattern=/\/\*[\s\S]*?\*\//g;let from=0;
 for(const match of source.matchAll(pattern)){if(match.index!>from)parts.push({text:source.slice(from,match.index),comment:false});parts.push({text:match[0],comment:true});from=match.index!+match[0].length;}
 if(from<source.length)parts.push({text:source.slice(from),comment:false});return parts;
}

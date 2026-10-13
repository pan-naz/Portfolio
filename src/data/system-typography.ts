import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {readSystemTokens} from './system-inventory.ts';

/** Human copy only; every numeric/font value is read from the text tokens. */
export const typeStyles=[
 {id:'heading-xl',name:'Heading/XL',sample:'Hello',use:'Hero and contact titles'},
 {id:'heading-l',name:'Heading/L',sample:'Projects',use:'Section titles, numbers'},
 {id:'heading-m',name:'Heading/M',sample:'Voximplant Kit',use:'Project names'},
 {id:'body-l',name:'Body/L',sample:'Launched from 0 → 1',use:'Intros and descriptions'},
 {id:'body-m',name:'Body/M',sample:'Cloud contact center.',use:'Body text'},
 {id:'body-m-strong',name:'Body/M Strong',sample:'Get in touch',use:'Buttons, navigation, subheadings'},
 {id:'body-s',name:'Body/S',sample:'DataGPT · San Francisco, remote',use:'Supporting text, captions'},
 {id:'label-m',name:'Label/M',sample:'01 / Selected work',use:'Section labels'},
 {id:'label-s',name:'Label/S',sample:'Product design',use:'Tags and chips'},
] as const;
export type TypeStyleId=typeof typeStyles[number]['id'];
export type TypeDevice='desktop'|'tablet'|'phone';
export function readTypographyTokens(css:string){
 const source=readSystemTokens(css),base=source.light;
 const overrides=[...css.matchAll(/@media\s*\(min-width:\s*(\d+)px\)\s*\{\s*:root\s*\{([^}]+)\}/g)].filter(([, ,body])=>/--text-heading/.test(body)).map(([,width,body])=>({width:Number(width),values:Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([,name,value])=>[name,value.trim()]))})).sort((a,b)=>a.width-b.width);
 if(overrides.length!==2)throw Error('Text system requires exactly tablet and desktop boundaries');
 const tablet={...base,...overrides[0].values},desktop={...tablet,...overrides[1].values};
 const devices:Record<TypeDevice,Record<string,string>>={phone:base,tablet,desktop};
 const ranges={desktop:`${overrides[1].width}px and wider`,tablet:`${overrides[0].width}–${overrides[1].width-1}px`,phone:`Under ${overrides[0].width}px`};
 const styles=typeStyles.map(style=>{
  const values=Object.fromEntries((['desktop','tablet','phone'] as const).map(device=>{const palette=devices[device],read=(name:string)=>source.value(palette,name),size=read('text-'+style.id),spacing=read('letter-spacing-'+style.id);return[device,{size,sizeRem:Number.parseFloat(size),lineHeight:read('line-height-'+style.id),spacing,spacingEm:Number.parseFloat(spacing),weight:read('font-weight-'+style.id),family:read('font-'+style.id)}];})) as Record<TypeDevice,{size:string;sizeRem:number;lineHeight:string;spacing:string;spacingEm:number;weight:string;family:string}>;
  const current=values.desktop;return{...style,selector:'.text-'+style.id,sizeToken:'text-'+style.id,family:current.family,fontName:current.family.split(',')[0].replaceAll(/['"]/g,'').replace(' Variable',''),weight:current.weight,lineHeight:current.lineHeight,tracking:current.spacing,rawTracking:current.spacing,range:current.size,devices:values};
 });
 return{styles,ranges,boundaries:{tablet:overrides[0].width,desktop:overrides[1].width}};
}
export function systemTypography(root=process.cwd()){return readTypographyTokens(readFileSync(resolve(root,'src/styles/tokens.css'),'utf8')).styles;}
export function typographySystem(root=process.cwd()){return readTypographyTokens(readFileSync(resolve(root,'src/styles/tokens.css'),'utf8'));}

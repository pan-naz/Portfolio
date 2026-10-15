import {readFileSync} from 'node:fs';
import {componentPropSpecs} from './system-props.ts';
import type {SourceComponent} from './system-inventory.ts';

export const buttonDescription='Buttons, icon buttons and text links: everything you press on the site.';
export const buttonGroups=[
 {name:'Buttons',description:'The main action or destination on a view.',cards:[
  {id:'primary',name:'Primary · arrow',description:'The main call to action. On hover, focus and press, the fill grows out of the arrow circle.',used:'Hero, Contact, header',value:'Large · 48px',token:'--control-height'},
  {id:'secondary',name:'Secondary',description:'A supporting action next to the primary one.',used:'Contact',value:'Large · 48px',token:'--control-height'},
  {id:'small',name:'Secondary · small',description:'A quiet action inside a section heading.',used:'About',value:'Small · 36px',token:'--control-height-small'},
  {id:'outside',name:'Secondary · arrow',description:'An outside destination. The arrow moves on hover.',used:'Square case study',value:'Large · 48px',token:'--control-height'},
  {id:'toggle',name:'Toggle',description:'Two choices. The selected one is filled.',used:'Before / after images',value:'Small · 36px',token:'--control-height-small'},
 ]},
 {name:'Icon buttons',description:'A compact action with an icon only.',cards:[
  {id:'raised',name:'Raised',description:'Floats over content on a white surface.',used:'Cursor, case close',value:'44px',token:'--control-icon'},
  {id:'plain',name:'Plain',description:'Sits in the header with no surface.',used:'Theme switch',value:'44px',token:'--control-icon'},
  {id:'layers',name:'Secondary · small',description:'Outlined, for a small destination.',used:'Footer',value:'36px · 44px tap',token:'--control-height-small · --control-icon'},
  {id:'media',name:'Media',description:'Video controls on top of the video.',used:'Case-study videos',value:'44px',token:'--control-icon'},
 ]},
 {name:'Text links',description:'A link next to or inside text.',cards:[
  {id:'link-default',name:'Default',description:'A destination after text.',used:'Contact',value:'Body/M Strong',token:'--text-body-m-strong'},
  {id:'link-accent',name:'Accent',description:'A highlighted destination.',used:'Contact',value:'Body/M Strong',token:'--text-body-m-strong'},
  {id:'link-compact',name:'Compact',description:'A short link in a case-study header.',used:'Case studies, 404',value:'Body/S',token:'--text-body-s'},
  {id:'link-inline',name:'Inline',description:'Underlined, inside a sentence.',used:'Case-study copy',value:'Inherits the text',token:''},
 ]},
] as const;
export type ButtonSpecimenId=typeof buttonGroups[number]['cards'][number]['id']|'close';
export const buttonStateGroups=[['primary','secondary','outside','toggle'],['close','layers','link-accent']] as const;
export const buttonStateNames:Record<string,string>={primary:'Primary · arrow',secondary:'Secondary',outside:'Secondary · arrow',toggle:'Toggle',close:'Icon button · raised',layers:'Icon button · secondary','link-accent':'Text link'};
export const buttonStates=['Default','Hover','Focus','Active'] as const;
const componentDescriptions:Record<string,Record<string,string>>={
 Button:{href:'Link destination. Without it, renders a button.',variant:'Filled or outlined.',size:'48px or 36px tall.',arrow:'Adds the destination arrow. On primary it sits in the circle that fills the button.',download:'Downloads the file instead of opening it.',appearance:'Comparison makes a two-choice toggle. Pair it with aria-pressed.'},
 IconButton:{label:'Spoken name. There is no visible text.',icon:'Any icon from the Icons page.',href:'Link destination. Without it, renders a button.',variant:'Plain, outlined, or raised on a white surface over content.',size:'44px, or 36px with a 44px tap area.'},
 TextLink:{href:'Destination. Outside links open in a new tab.',accent:'Orange label.',compact:'Smaller text (Body/S).',inline:'Underlined link inside a sentence.'},
};
export const buttonAccessibility=[
 'Tab reaches every button and link.',
 'Keyboard focus always shows a focus ring.',
 'Small controls keep a 44px tap area.',
 'Icon buttons always have a spoken label.',
 'Toggles use aria-pressed for the selected choice.',
 'Links that leave the site open in a new tab with rel="noopener".',
 'With reduced motion, fills, turns and shifts change without animation.',
];
const read=(file:string)=>readFileSync('src/components/'+file+'.astro','utf8');
/** Usage comes from website call sites; layout hooks stay out of copied examples. */
const examples=(file:string,component:string,indices:number[])=>{
 const source=read(file).split('---').slice(2).join('---');
 const pattern=new RegExp(`<${component}\\b[^>]*>`,'g'),snippets:string[]=[];
 for(const match of source.matchAll(pattern)){
  const opening=match[0],end=opening.endsWith('/>')?match.index!+opening.length:source.indexOf(`</${component}>`,match.index!)+component.length+3;
  if(end<match.index!)throw Error('Unclosed source example');
  snippets.push(source.slice(match.index,end));
 }
 const format=(snippet:string)=>snippet.replace(/<([A-Z][\w]*)\b([^>]*?)(\/?)>/g,(_,tag:string,attributes:string,close:string)=>{
  const props:string[]=attributes.trim().match(/[\w:-]+(?:=(?:"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\}))?/g)||[];
  const line='<'+tag+(props.length?' '+props.join(' '):'')+(close?' /':'')+'>';
  return line.length<=76?line:'<'+tag+'\n'+props.map(prop=>'  '+prop).join('\n')+'\n'+(close?'/':'')+'>';
 }).replace(/>\s*</g,'>\n<').replace(/>([^<>\n]+)<\//g,'>\n  $1\n</');
 return indices.map(index=>{if(!snippets[index])throw Error(`Missing ${component} usage in ${file}`);return format(snippets[index].replace(/\s(?:slot|tabindex|data-[\w-]+)(?:="[^"]*"|=\{[^}]*\})?(?=\s|\/?>)/g,''));});
};
export function buttonUsage(name:string){
 const importLine=`import ${name} from '../components/${name}.astro';`+(name==='IconButton'?"\nimport Icon from '../components/Icon.astro';":'');
 const context=name==='Button'?"import {profile,cvUrl} from '../data/portfolio';\nimport {squareChallenge} from '../data/square-case-study';":name==='TextLink'?"import {profile,hookoSiteUrl} from '../data/portfolio';\n"+read('VoximplantCaseStudy').match(/const productUrl = [^;]+;/)![0]:"const returnUrl = "+read('CaseStudyPage').match(/project.category === 'selected' \? ('[^']+')/)![1]+';';
 const entries=name==='Button'?[
  ...examples('ContactSection','Button',[0,1]),...examples('AboutSection','Button',[0]),...examples('SquareCaseStudy','Button',[0]),...examples('CaseStudyComparison','Button',[0,1]),
 ]:name==='IconButton'?[
  ...examples('CaseStudyPage','IconButton',[0]),...examples('ThemeToggle','IconButton',[0]),...examples('SiteFooter','IconButton',[0]),'// Media controls are default icon buttons inside the video player.',
 ]:[...examples('ContactSection','TextLink',[0,1]),...examples('VoximplantCaseStudy','TextLink',[0]),...examples('KitchenChatbotCaseStudy','TextLink',[0])];
 return importLine+'\n'+context+'\n\n'+entries.join('\n');
}
export function buttonProps(component:SourceComponent){return componentPropSpecs(component).map(prop=>{const description=componentDescriptions[component.name][prop.name];if(!description)throw Error(`Missing ${component.name}.${prop.name} description`);return {...prop,description};});}
/** Follow token aliases as well as tokens used directly by selectors/markup. */
export function buttonTokens(components:SourceComponent[]){
 const css=readFileSync('src/styles/global.css','utf8')+readFileSync('src/styles/case-video-player.css','utf8')+readFileSync('src/styles/typography.css','utf8');
 const selected=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,selector])=>/\.button\b|\.button--|\.button-|\.icon-button\b|\.icon-button--|\.text-link\b|\.text-link--|floating-control|\[data-icon-layer\]|\.arrow\b|\.arrow--|\.icon\b|\.icon--|text-body-m-strong|text-body-s|:where\(button/.test(selector)).map(([, ,body])=>body).join('\n')+components.map(component=>component.source).join('\n');
 const tokens=readFileSync('src/styles/tokens.css','utf8'),names=new Set([...selected.matchAll(/var\((--[\w-]+)/g)].map(([,name])=>name));
 const declarations=new Map<string,string[]>();
 for(const [,name,value] of tokens.matchAll(/(--[\w-]+):\s*([^;]+);/g))declarations.set(name,[...(declarations.get(name)||[]),value]);
 for(const name of names)for(const [,dependency] of (declarations.get(name)||[]).join(' ').matchAll(/var\((--[\w-]+)/g))names.add(dependency);
 return [...names].filter(name=>declarations.has(name)).sort();
}

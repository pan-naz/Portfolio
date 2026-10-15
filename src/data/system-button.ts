import {readFileSync} from 'node:fs';
import {componentPropSpecs} from './system-props.ts';
import type {SourceComponent} from './system-inventory.ts';

export const buttonDescription='Buttons, icon buttons and text links: everything you press on the site.';
export const buttonGroups=[
 {name:'Buttons',description:'The main action or destination on a view.',cards:[
  {id:'primary',name:'Primary · arrow',description:'The main call to action. On hover, focus and press, the fill grows out of the arrow circle.',used:'Hero, Contact, header',value:'Large · 48px'},
  {id:'secondary',name:'Secondary',description:'A supporting action next to the primary one.',used:'Contact',value:'Large · 48px'},
  {id:'small',name:'Secondary · small',description:'A quiet action inside a section heading.',used:'About',value:'Small · 36px'},
  {id:'outside',name:'Secondary · arrow',description:'An outside destination. The arrow moves on hover.',used:'Square case study',value:'Large · 48px'},
  {id:'toggle',name:'Toggle',description:'Two choices. The selected one is filled.',used:'Before / after images',value:'Small · 36px'},
 ]},
 {name:'Icon buttons',description:'A compact action with an icon only.',cards:[
  {id:'raised',name:'Raised',description:'Floats over content on a white surface.',used:'Cursor, case close',value:'44px'},
  {id:'plain',name:'Plain',description:'Sits in the header with no surface.',used:'Theme switch',value:'44px'},
  {id:'layers',name:'Secondary · small',description:'Outlined, for a small destination.',used:'Footer',value:'36px · 44px tap'},
  {id:'media',name:'Media',description:'Video controls on top of the video.',used:'Case-study videos',value:'44px'},
 ]},
 {name:'Text links',description:'A link next to or inside text.',cards:[
  {id:'link-default',name:'Default',description:'A destination after text.',used:'Contact',value:'Body/M Strong'},
  {id:'link-accent',name:'Accent',description:'A highlighted destination.',used:'Contact',value:'Body/M Strong'},
  {id:'link-compact',name:'Compact',description:'A short link in a case-study header.',used:'Case studies, 404',value:'Body/S'},
  {id:'link-inline',name:'Inline',description:'Underlined, inside a sentence.',used:'Case-study copy',value:'Inherits the text'},
 ]},
] as const;
export type ButtonSpecimenId=typeof buttonGroups[number]['cards'][number]['id']|'close';
export const buttonStateGroups=buttonGroups.map((group,index)=>({
 name:['Button states','Icon button states','Text link states'][index],
 cards:group.cards.filter(card=>!['small','outside','link-inline'].includes(card.id)),
}));
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
 return indices.map(index=>{if(!snippets[index])throw Error(`Missing ${component} usage in ${file}`);const snippet=snippets[index].replace(/\s(?:class|slot|tabindex|data-[\w-]+)(?:="[^"]*"|=\{[^}]*\})?(?=\s|\/?>)/g,'');return format(snippet);});
};
export function buttonUsage(name:string){
 const importLine=`import ${name} from '../components/${name}.astro';`;
 let context=name==='Button'?"import {profile,cvUrl} from '../data/portfolio';\nimport {squareChallenge} from '../data/square-case-study';":name==='TextLink'?"import {profile,hookoSiteUrl} from '../data/portfolio';\n"+read('VoximplantCaseStudy').match(/const productUrl = [^;]+;/)![0]+'\n'+read('KitchenChatbotCaseStudy').match(/const mascotName = [^;]+;/)![0]:"const returnUrl = "+read('CaseStudyPage').match(/project.category === 'selected' \? ('[^']+')/)![1]+';';
 let entries=name==='Button'?[
  ...examples('ContactSection','Button',[0,1]),...examples('AboutSection','Button',[0]),...examples('SquareCaseStudy','Button',[0]),...examples('CaseStudyComparison','Button',[0,1]),
 ]:name==='IconButton'?[
  ...examples('CaseStudyPage','IconButton',[0]),...examples('SiteFooter','IconButton',[0]),
 ]:[...examples('ContactSection','TextLink',[0,1]),...examples('VoximplantCaseStudy','TextLink',[0]),...examples('KitchenChatbotCaseStudy','TextLink',[0])];
 if(name==='IconButton')context+='\n// The theme switch is <ThemeToggle />, built on IconButton.\n// Media controls are default icon buttons inside the video player.';
 return '---\n'+importLine+'\n'+context+'\n---\n\n'+entries.join('\n');
}
export function buttonProps(component:SourceComponent){
 const order=component.name==='Button'?['href','variant','size','arrow','download','appearance']:component.name==='IconButton'?['label','icon','href','variant','size']:component.props.map(prop=>prop.name);
 return componentPropSpecs(component).map(prop=>{
  const description=componentDescriptions[component.name][prop.name];
  if(!description)throw Error(`Missing ${component.name}.${prop.name} description`);
  return {...prop,description,default:prop.type==='boolean'&&prop.default==='Not set'?'false':prop.default};
 }).sort((a,b)=>order.indexOf(a.name)-order.indexOf(b.name));
}
/** Direct component/control references only; alias internals belong to foundations. */
export function buttonTokens(components:SourceComponent[]){
 const css=readFileSync('src/styles/global.css','utf8');
 const selected=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,selector])=>(!selector.includes('.project-cursor')||selector.includes('svg > g'))&&/\.button\b|\.button-|\.icon-button\b|\.icon-button--|\.text-link\b|\.text-link--|\[data-icon-layer\]|\.arrow\b|\.arrow--|\.icon\b|\.icon--|\[data-icon-hover='close'\]|:where\(button/.test(selector)).map(([, ,body])=>body).join('\n')+components.map(component=>component.source).join('\n');
 const tokens=readFileSync('src/styles/tokens.css','utf8');
 const declarations=new Set([...tokens.matchAll(/(--[\w-]+):/g)].map(([,name])=>name));
 const names=[...new Set([...selected.matchAll(/var\((--[\w-]+)/g)].map(([,name])=>name))];
 return names.filter(name=>declarations.has(name)&&/^(--color-(?:text|bg|border|focus|interactive)-|--(?:control|icon|space|button-padding|radius|shadow|layer|duration|ease|distance|rotation|scale)-)/.test(name)).sort();
}
export function buttonTokenGroups(components:SourceComponent[]){
 const names=buttonTokens(components);
 return [
  {title:'Color',pattern:/^--color-/},
  {title:'Size',pattern:/^--(?:control|icon)-/},
  {title:'Spacing',pattern:/^--(?:space|button-padding)-/},
  {title:'Shape',pattern:/^--(?:radius|shadow|layer)-/},
  {title:'Motion',pattern:/^--(?:duration|ease|distance|rotation|scale)-/},
 ].map(({title,pattern})=>({title,names:names.filter(name=>pattern.test(name))}));
}

import {readFileSync} from 'node:fs';
import type {SourceComponent} from './system-inventory';
import {componentPropSpecs} from './system-props.ts';
import {compareTokenNames,componentTokenPatterns as patterns} from './system-component-tokens.ts';
const read=(file:string)=>readFileSync(file,'utf8');
export const toolCardDescription='Two components: the tool card, and the tooltip that shows its name.';
export const toolCardGroups=[
 {title:'Tool card',description:'A tool I use, as a logo in About or with details in Hooko.',cards:[
  {id:'logo',name:'Logo',description:"The tool's logo. Its name shows in a tooltip.",used:'About',style:'Radius large · Shadow small'},
  {id:'detail',name:'Detail',description:'Icon, label, name and a short description.',used:'Hooko',style:'Label/M · Body/M Strong · Body/M'},
 ]},
 {title:'Tooltip',description:"The tool's name on hover and keyboard focus. Touch screens show none.",cards:[
  {id:'above',name:'Following the mouse',description:'Sits above the pointer and follows it.',used:'About',style:'Body/M · Shadow large · Pill'},
  {id:'below',name:'Near the top',description:'Flips below the pointer near the top of the screen.',used:'About',style:'Body/M · Shadow large · Pill'},
  {id:'focus',name:'Keyboard focus',description:'Centred above the focused card.',used:'About',style:'Body/M · Shadow large · Pill'},
 ]},
];
export function toolCardUsage(name:string){
 const source=read(`src/components/${name}.astro`);
 if(!source.includes('interface Props'))throw Error('Tool documentation requires the genuine component API.');
 if(name==='Tooltip')return `---
import Tooltip from '../components/Tooltip.astro';
---
<!-- Inside ToolCard -->
<Tooltip
  id="tool-claude-code-tooltip"
  label="Claude Code"
/>`;
 return `---
import ToolCard from '../components/ToolCard.astro';
import { tools } from '../data/portfolio';
import { hookoTools } from '../data/hooko-case-study';
---
<!-- About · logo -->
<ul>
  {tools.map(tool => <li><ToolCard tool={tool} /></li>)}
</ul>

<!-- Hooko · detail -->
{hookoTools.map(({
  label, description, iconColor, ...tool
}) =>
  <ToolCard
    tool={tool}
    variant="detail"
    label={label}
    description={description}
    iconColor={iconColor}
  />
)}`;
}
const descriptions:Record<string,Record<string,string>>={
 ToolCard:{tool:'The tool: name, logo and logo size.',variant:'Logo: the logo with a tooltip. Detail: icon, label, name and description.',label:'Detail only. The small label above the name.',description:'Detail only. One sentence under the name.',iconColor:"Detail only. The tool's colour behind its icon.",tooltipId:"Logo only. The tooltip's id, which names the card."},
 Tooltip:{id:'Links the tooltip to its card, so the card is named by it.',label:'The text in the tooltip.'},
};
export const toolCardProps=(component:SourceComponent)=>componentPropSpecs(component).map(prop=>({...prop,default:prop.name==='tooltipId'?'from the name':prop.default==='Required'?'required':prop.default==='Not set'?'—':prop.default,description:descriptions[component.name][prop.name]}));
/** Read only declarations owned by the two components, plus their direct text styles. */
export function toolCardTokenGroups(){
 const global=read('src/styles/global.css').replace(/\/\*[\s\S]*?\*\//g,''),type=read('src/styles/typography.css');
 const rules=[...global.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,selector])=>selector.trim().startsWith('.tool-card')||selector.includes('.about-details .tool-card')).map(([, ,body])=>body).join('\n');
 const roles=['label-m','body-m-strong','body-m'].map(role=>type.match(new RegExp(String.raw`/\* ${role} ·[\s\S]*?\{([^}]+)\}`))![1]).join('\n');
 const focus=global.match(/:where\(button,[^{]+:focus-visible\s*\{([^}]+)\}/)?.[1]||'';
 const sources=[rules,focus,read('src/styles/tool-card.css'),read('src/styles/tooltip.css'),roles].join('\n');
 const names=[...new Set([...sources.matchAll(/var\((--[\w-]+)/g)].map(([,name])=>name))].filter(name=>!['--tool-icon-color','--tooltip-x','--tooltip-y','--tooltip-scale'].includes(name)).sort(compareTokenNames);
 return Object.entries({Color:patterns.color,Type:patterns.type,Size:patterns.size,Spacing:patterns.spacing,Shape:patterns.shape,Elevation:patterns.elevation,Motion:patterns.motion}).map(([title,pattern])=>({title,names:names.filter(name=>pattern.test(name))})).filter(group=>group.names.length);
}
/** Reuse Hooko's stack breakpoints in an invisible width probe, without its project styles. */
export function toolDetailLayout(){
 const css=read('src/styles/hooko-case-study.css').replace(/\/\*[\s\S]*?\*\//g,'');
 const visit=(source:string):string=>{
  let result='',from=0;
  while(from<source.length){const open=source.indexOf('{',from);if(open<0)break;let depth=1,end=open+1;while(depth&&end<source.length){if(source[end]==='{')depth++;if(source[end]==='}')depth--;end++;}
   const selector=source.slice(from,open).trim(),body=source.slice(open+1,end-1);from=end;
   if(selector.startsWith('@')){const children=visit(body);if(children)result+=selector.startsWith('@media')?selector+'{'+children+'}':children;}
   else if(selector.split(',').some(part=>part.trim()==='.hk-stack'))result+='.ds-tools-detail-grid{'+body+'}';
  }
  return result;
 };
 return '@layer system {'+visit(css)+'}';
}
export const toolCardAccessibility=[
 'Each logo card can be reached with Tab. Its name comes from its tooltip, so screen readers read it even when the tooltip is hidden.',
 'The tooltip shows on hover with a mouse and on keyboard focus. Touch screens show none.',
 'Keyboard focus shows a 2px ring 4px outside the card.',
 'With reduced motion, the tooltip appears without growing and jumps to the pointer.',
 'Detail cards are not focusable. The tool name is a heading.',
];

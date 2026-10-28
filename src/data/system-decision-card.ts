import {readFileSync} from 'node:fs';
import type {SourceComponent} from './system-inventory';
import {componentPropSpecs} from './system-props.ts';
import {compareTokenNames,componentTokenPatterns as patterns} from './system-component-tokens.ts';
const read=(file:string)=>readFileSync(file,'utf8');
export const decisionCardDescription='A design decision with its explanation, in case studies.';
export const decisionCardExamples=[
 {id:'figure',name:'Figure',description:'An image above the title and text. The most used layout.',used:'Blaustrom, Gutsul Made, Pet Care and 5 more',style:'Body/M Strong · Body/M · Shadow small'},
 {id:'stack',name:'Card',description:'Title and text in a bordered card. Can end with an Impact box.',used:'Voximplant',style:'Heading/M · Body/M · 1px border'},
 {id:'media',name:'With media',description:'Text with an image beside it. The label can be a chip.',used:'Hooko',style:'Label/S chip · Body/M Strong · Body/M'},
];
/** The displayed text and Usage examples come from the actual case-study calls. */
export function decisionSource(file:string,title:string){
 const source=read('src/components/'+file+'.astro'),escaped=title.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const match=source.match(new RegExp('<CaseStudyDecisionCard title="'+escaped+'"[\\s\\S]*?</CaseStudyDecisionCard>'));
 if(!match)throw Error('Missing genuine decision: '+file+' / '+title);
 return match[0];
}
export const voxDecision=decisionSource('VoximplantCaseStudy','A canvas, not a form builder');
export const hookoDecision=decisionSource('HookoCaseStudy','Niche benchmark');
export const decisionInner=(source:string)=>source.slice(source.indexOf('>')+1,source.lastIndexOf('</CaseStudyDecisionCard>'));
export const voxImpact=decisionInner(voxDecision).match(/<Fragment slot="impact">([\s\S]*?)<\/Fragment>/)![1];
export const voxText=decisionInner(voxDecision).replace(/<Fragment slot="impact">[\s\S]*?<\/Fragment>/,'').trim();
export const hookoText=decisionInner(hookoDecision).match(/<p>[\s\S]*?<\/p>/)![0];
export const hookoImage=Object.fromEntries([...hookoDecision.matchAll(/(src|alt|width|height|style)="([^"]*)"/g)].map(([,name,value])=>[name,value]));
const descriptions:Record<string,string>={title:"The card's heading.",titleHidden:'Hides the heading on screen. Screen readers still read it.',label:'A small label above the title.',labelVariant:'Text: a Label/M line. Accent: an orange chip.',layout:'Stack: a bordered card. Media: an image beside the text. Figure: an image above.'};
export const decisionCardProps=(component:SourceComponent)=>componentPropSpecs(component).map(prop=>({...prop,default:prop.default==='Required'?'required':prop.default==='Not set'?'—':prop.default,description:descriptions[prop.name]}));
export function decisionCardTokens(){
 const css=read('src/styles/case-study-decision-card.css'),names=[...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map(([,name])=>name))].sort(compareTokenNames);
 return Object.entries({Color:patterns.color,Size:patterns.size,Spacing:patterns.spacing,Shape:patterns.shape,Elevation:patterns.elevation}).map(([title,pattern])=>({title,names:names.filter(name=>pattern.test(name))})).filter(group=>group.names.length);
}
/** Only genuine layout selectors are copied into the invisible native-width probes. */
export function decisionLayout(){
 return ['blaustrom','voximplant','hooko'].map((id,index)=>{
  const wanted=['.blaustrom-config-grid','.vox-decisions','.hk-decisions'][index],css=read('src/styles/'+id+'-case-study.css').replace(/\/\*[\s\S]*?\*\//g,'');
  const visit=(source:string):string=>{let result='',from=0;while(from<source.length){const open=source.indexOf('{',from);if(open<0)break;let depth=1,end=open+1;while(depth&&end<source.length){if(source[end]==='{')depth++;if(source[end]==='}')depth--;end++;}const selector=source.slice(from,open).trim(),body=source.slice(open+1,end-1);from=end;if(selector.startsWith('@')){const nested=visit(body);if(nested)result+=selector.startsWith('@media')?selector+'{'+nested+'}':nested;}else if(selector.split(',').some(part=>part.trim()===wanted))result+='[data-decision-probe="'+['figure','stack','media'][index]+'"]{'+body.split(';').filter(declaration=>/^\s*(?:display|grid-template-columns|align-items|gap)\s*:/.test(declaration)).join(';')+';}';}return result;};
  return '@layer system {'+visit(css)+'}';
 }).join('');
}
export const decisionAccessibility=[
 'Each card is an article. Its title is a heading under the case-study chapter heading.',
 'With titleHidden, the title is hidden on screen but screen readers still read it.',
 'The optional icon is decorative and hidden from screen readers.',
 'The Impact box starts with its own heading, Impact.',
 'Images keep their own descriptions from the media.',
];
/** Wrap source text without changing any content, keeping the full-width 80-column limit. */
const wrap=(source:string)=>source.split('\n').flatMap(line=>{
 const indent=line.match(/^\s*/)?.[0]||'',out:string[]=[];let text=line.trim();while(text.length+indent.length>78){const at=text.lastIndexOf(' ',78-indent.length);if(at<1)break;out.push(indent+text.slice(0,at));text=text.slice(at+1);}out.push(indent+text);return out;
}).join('\n');
export function decisionUsage(){
 const figure=`{blaustromConfiguratorSteps.map(step =>
  <CaseStudyDecisionCard
    title={step.title}
    label={step.label}
    layout="figure"
  >
    <CaseStudyMedia slot="media" {...step.media} />
    <p>{step.description}</p>
  </CaseStudyDecisionCard>
)}`;
 const format=(source:string)=>source.replaceAll('<Fragment','<div').replaceAll('</Fragment>','</div>').replace(/<CaseStudyDecisionCard ([^>]+)>/,(_,props)=>'<CaseStudyDecisionCard\n'+[...props.matchAll(/\w+="[^"]*"/g)].map(([prop])=>'  '+prop).join('\n')+'\n>').replace(/><(?=li|p|Fragment)/g,'>\n  <').replace(/<ResponsiveImage ([^>]+)\s*\/>/,(_,props)=>'<ResponsiveImage\n'+[...props.matchAll(/\w+="[^"]*"/g)].filter(([prop])=>!prop.startsWith('loading=')).map(([prop])=>'    '+prop).join('\n')+'\n  />');
 return `---
import CaseStudyDecisionCard
  from '../components/CaseStudyDecisionCard.astro';
import CaseStudyMedia from '../components/CaseStudyMedia.astro';
import ResponsiveImage from '../components/ResponsiveImage.astro';
import { blaustromConfiguratorSteps }
  from '../data/blaustrom-case-study';
---

<!-- Blaustrom · figure -->
${figure}

<!-- Voximplant · card with Impact -->
${wrap(format(voxDecision))}

<!-- Hooko · with media -->
${wrap(format(hookoDecision))}`;
}

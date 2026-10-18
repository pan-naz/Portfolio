import {readFileSync} from 'node:fs';
import {impactHeading,experienceHeading,hookoProblemHeading} from './section-copy.ts';
import type {SourceComponent} from './system-inventory';
import {componentPropSpecs} from './system-props.ts';
import {compareTokenNames,componentTokenPatterns as patterns} from './system-component-tokens.ts';
export const sectionHeadingDescription='The label and title that open each section.';
const headingCopy:Record<string,{label:string;title:string;description?:string}>={impactHeading,experienceHeading,hookoProblemHeading};
const read=(file:string)=>readFileSync(`src/components/${file}.astro`,'utf8');
const call=(file:string,id:string)=>read(file).match(new RegExp(`<SectionHeading\\b[^>]*id="${id}"[^>]*>[\\s\\S]*?</SectionHeading>`))![0].replace(/label=\{(impactHeading|experienceHeading|hookoProblemHeading)\.label\}/g,(_,key:string)=>'label="'+headingCopy[key].label+'"').replace(/\{(impactHeading|experienceHeading|hookoProblemHeading)\.(title|description)\}/g,(_,key:string,field:'title'|'description')=>(headingCopy[key] as {title:string;description?:string})[field]||'');
const impact=call('ImpactSection','impact-title'),problem=call('HookoCaseStudy','hk-problem-h');
export const sectionHeadingExamples={columns:impactHeading,action:experienceHeading,stacked:hookoProblemHeading};
export const sectionHeadingCards=[
 {id:'columns',name:'Two columns',description:'The label on the left, the title and a short description on the right. On phones they stack.',used:'Impact, Work',style:'Label/M · Heading/L · Body/L'},
 {id:'action',name:'With an action',description:'A button takes the place of the label.',used:'Experience',style:'Heading/L · Body/L'},
 {id:'stacked',name:'Stacked',description:'The label above the title. Case studies use it for their chapters.',used:'Case studies',style:'Label/M · Heading/L'},
] as const;
/** Format the actual calls without changing their words or props. */
const formatCall=(source:string)=>{
 let depth=0;const lines:string[]=[];
 for(const part of source.match(/<[^>]+>|[^<]+/g)!){
  if(part.startsWith('</')){depth--;lines.push('  '.repeat(depth)+part);}
  else if(part.startsWith('<')){
   const props=part.match(/^<SectionHeading\b([^>]*)>/)?.[1].trim().match(/[\w:-]+=(?:"[^"]*"|\{[^}]*\})/g);
   if(props&&part.length>76)lines.push('<SectionHeading',...props.map(prop=>'  '+prop),'>');
   else lines.push('  '.repeat(depth)+part);
   depth++;
  }else{
   const words=part.trim().split(/\s+/);let line='';
   for(const word of words){if(line&&line.length+word.length+1>76-depth*2){lines.push('  '.repeat(depth)+line);line='';}line+=(line?' ':'')+word;}
   if(line)lines.push('  '.repeat(depth)+line);
  }
 }
 return lines.join('\n');
};
export const sectionHeadingUsage=()=>`---\nimport SectionHeading from '../components/SectionHeading.astro';\n---\n\n${formatCall(impact)}\n\n${formatCall(problem)}`;
const descriptions:Record<string,string>={id:'The title’s id, so links and the section can point to it.',label:'The small label beside or above the title.',reveal:'Fades the heading in when it scrolls into view.',layout:'Columns: the label on the left, the title on the right. Stacked: the label above the title.'};
export const sectionHeadingProps=(component:SourceComponent)=>componentPropSpecs(component).map(prop=>({...prop,description:descriptions[prop.name]}));
export const sectionHeadingSlots=['The title goes inside the tag.','description: a short text under the title.','index: replaces the label, for example with the Download CV button.'];
export const sectionHeadingAccessibility=['The title is a real h2, so screen readers list it as a section heading.','Each section points to its title by id with aria-labelledby.','The label is plain text, not a heading.','With reduced motion, the heading appears without the fade.'];
/** Direct heading/layout/type/reveal references, without resolved palette or font internals. */
export function sectionHeadingTokenGroups(){
 const css=['src/styles/global.css','src/styles/case-study-narrative.css'].map(file=>readFileSync(file,'utf8')).join('\n').replace(/\/\*[\s\S]*?\*\//g,''),type=readFileSync('src/styles/typography.css','utf8');
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,selector])=>/\.section-heading|^\s*\.section-description|^\s*\.eyebrow|^\s*\.case-study-(?:heading|eyebrow)/.test(selector)&&!/\.work|\.about|\.impact/.test(selector)).map(([, ,body])=>body).join('\n');
 const roles=['label-m','heading-l','body-l'].map(role=>type.match(new RegExp('/\\* '+role+' ·[\\s\\S]*?\\{([^}]+)\\}'))![1]).join('\n');
 const motion=readFileSync('src/scripts/section-reveals.ts','utf8');
 const declared=new Set([...readFileSync('src/styles/tokens.css','utf8').matchAll(/(--[\w-]+):/g)].map(([,n])=>n));
 const names=[...new Set([...`${rules}\n${roles}\n${read('SectionHeading')}`.matchAll(/var\((--[\w-]+)/g)].map(([,n])=>n).concat([...motion.matchAll(/['"](--[\w-]+)['"]/g)].map(([,n])=>n)))].filter(n=>declared.has(n)).sort(compareTokenNames);
 return [{title:'Color',pattern:patterns.color},{title:'Type',pattern:patterns.type},{title:'Spacing',pattern:patterns.spacing},{title:'Motion',pattern:patterns.motion}].map(({title,pattern})=>({title,names:names.filter(n=>pattern.test(n))})).filter(group=>group.names.length);
}

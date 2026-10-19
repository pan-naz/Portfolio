import {readFileSync} from 'node:fs';
import type {SourceComponent} from './system-inventory';
import {componentPropSpecs} from './system-props.ts';
import {compareTokenNames,componentTokenPatterns as patterns} from './system-component-tokens.ts';
const read=(file:string)=>readFileSync(file,'utf8');
export const timelineDescription='One role in the experience timeline.';
export const timelineCards=[
 {id:'row',name:'Row',description:'Period, role, summary and duration. On phones, period and duration share the top line.',used:'About',style:'Body/S · Body/M Strong · Body/M'},
 {id:'timeline',name:'Timeline',description:'Roles newest first, with a thin line between them.',used:'About',style:'1px border · Space 4'},
] as const;
export function timelineUsage(name:string){
 const file=`src/components/${name}.astro`,source=read(file),consumer=name==='TimelineRow'?'ExperienceList':'AboutSection',call=read(`src/components/${consumer}.astro`);
 if(!source.includes('interface Props')||!call.includes(`<${name} `))throw Error('Timeline Usage must follow its real source consumer.');
 const imports=`---\nimport ${name} from '../components/${name}.astro';\nimport { experience } from '../data/portfolio';\n---`;
 return name==='TimelineRow'?`${imports}\n<!-- ExperienceList -->\n<ol>\n  {experience.map(item => <TimelineRow item={item} />)}\n</ol>`:`${imports}\n<!-- About -->\n<ExperienceList items={experience} />`;
}
export const timelineProps=(component:SourceComponent)=>componentPropSpecs(component).map(prop=>({...prop,default:prop.default==='Required'?'required':prop.default,description:component.name==='TimelineRow'?'One role: period, role, company, location, summary and duration.':'The roles, newest first. Nothing shows when the list is empty.'}));
/** Only tokens directly used by the experience rows and their shared text roles. */
export function timelineTokenGroups(){
 const css=read('src/styles/global.css').replace(/\/\*[\s\S]*?\*\//g,''),type=read('src/styles/typography.css');
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,selector])=>selector.trim().startsWith('.experience-')).map(([, ,body])=>body).join('\n');
 const roles=['body-s','body-m-strong','body-m'].map(role=>type.match(new RegExp('/\\* '+role+' ·[\\s\\S]*?\\{([^}]+)\\}'))![1]).join('\n');
 const names=[...new Set([...`${rules}\n${roles}`.matchAll(/var\((--[\w-]+)/g)].map(([,name])=>name))].sort(compareTokenNames);
 return [{title:'Color',pattern:patterns.color},{title:'Type',pattern:patterns.type},{title:'Spacing',pattern:patterns.spacing}].map(({title,pattern})=>({title,names:names.filter(name=>pattern.test(name))}));
}
export const timelineAccessibility=[
 'The timeline is an ordered list labelled Experience timeline, newest role first.',
 'Each role title is a heading under the About section heading.',
 'Rows have no links or hover, so nothing in them takes focus.',
 'Period, company and duration have 7.5:1 contrast on the About background.',
];

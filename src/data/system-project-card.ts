import {readFileSync} from 'node:fs';
import {componentPropSpecs} from './system-props.ts';
import {compareTokenNames,componentTokenPatterns as patterns} from './system-component-tokens.ts';
import type {SourceComponent} from './system-inventory';
export const projectCardDescription='Each project in Work. The whole card opens its case study.';
export const projectCardCards=[
 {id:'full',name:'Full card',description:'Selected work. Name, tags, the outcome and a short description above the project’s hero.',used:'Selected work',style:'Heading/M · Body/L · Radius large'},
 {id:'compact',name:'Compact card',description:'Websites and Misc, with smaller text.',used:'Websites, Misc',style:'Heading/M · Body/M · Radius large'},
 {id:'identity',name:'Identity and tags',description:'The project name with its logo, and the tags as raised chips. Case-study headers use them too.',used:'Project cards, case-study headers',style:'Heading/M · Raised chips'},
] as const;
export const projectCardStates=['Default','Hover','Focus'] as const;
const descriptions:Record<string,Record<string,string>>={
 ProjectCard:{project:'The project: name, logo, tags, texts and hero.',compact:'The smaller card for Websites and Misc.'},
 ProjectIdentity:{title:'The project name.',logo:'The logo file, shown at 32px.',logoBackground:'Puts the logo on a white tile with a soft shadow.'},
 ProjectTags:{tags:'The disciplines, shown as raised chips.'},
};
export const projectCardProps=(component:SourceComponent)=>componentPropSpecs(component).map(prop=>({...prop,description:descriptions[component.name][prop.name]}));
/** Usage reads the actual component calls; each example owns its imports and project. */
export function projectCardUsage(name:string){
 const source=readFileSync('src/components/'+(name==='ProjectCard'?'WorkSection':'ProjectCard')+'.astro','utf8');
 const calls=name==='ProjectCard'?[...source.matchAll(/<ProjectCard\b[^>]+\/>/g)].map(([call])=>call):[source.match(new RegExp('<'+name+'\\b[^>]+\\/>'))![0]];
 const markup=calls.map(call=>name==='ProjectIdentity'?call.replace(/\s+(?=\w+=)/g,'\n  ').replace(' />','\n/>'):call).join('\n');
 return `---\nimport ${name} from '../components/${name}.astro';\nimport {projects} from '../data/portfolio';\nconst [project] = projects;\n---\n\n${markup}`;
}
export const projectCardAccessibility=[
 'The whole card is one link, named “View [project name] case study”.',
 'Tab reaches each card. Focus shows a ring around the card.',
 'The hero video is decorative and hidden from screen readers. Images keep their descriptions.',
 "The tilt and the cursor only appear with a mouse. With reduced motion, the card doesn't tilt.",
 'With reduced motion, the case study opens without the card travelling.',
];
/** Direct shared card/identity/tag/cursor styles and their canonical text roles. */
export function projectCardTokenGroups(){
 const css=readFileSync('src/styles/global.css','utf8').replace(/\/\*[\s\S]*?\*\//g,''),type=readFileSync('src/styles/typography.css','utf8'),tokens=readFileSync('src/styles/tokens.css','utf8');
 const body=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,s])=>(/\.project(?:\b|-)|\.skill-tag--raised/.test(s)&&!/#project-|\.project-collection|\.projects\b|is-case-control/.test(s))||/^\s*\.arrow(?:\s|--up\b)/.test(s)||/:where\(button.*:focus-visible/.test(s)).map(([, ,v])=>v).join('\n');
 const roles=['heading-m','body-l','body-m','body-s'].map(role=>type.match(new RegExp('/\\* '+role+' ·[\\s\\S]*?\\{([^}]+)\\}'))![1]).join('\n');
 const interaction=readFileSync('src/scripts/project-tilt.ts','utf8');
 const declared=new Set([...tokens.matchAll(/(--[\w-]+):/g)].map(([,n])=>n));
 const names=[...new Set([...body.matchAll(/var\((--[\w-]+)/g),...roles.matchAll(/var\((--[\w-]+)/g)].map(([,n])=>n).concat([...interaction.matchAll(/getPropertyValue\('(--[\w-]+)'\)/g)].map(([,n])=>n)))].filter(n=>declared.has(n)).sort(compareTokenNames);
 return [{title:'Color',pattern:patterns.color},{title:'Type',pattern:patterns.type},{title:'Size',pattern:patterns.size},{title:'Spacing',pattern:patterns.spacing},{title:'Shape',pattern:patterns.shape},{title:'Elevation',pattern:patterns.elevation},{title:'Motion',pattern:patterns.motion}].map(({title,pattern})=>({title,names:names.filter(n=>pattern.test(n))}));
}

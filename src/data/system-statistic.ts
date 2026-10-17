import {readFileSync} from 'node:fs';
import {impactGroups} from './portfolio.ts';
import type {SourceComponent} from './system-inventory';
import {componentPropSpecs} from './system-props.ts';
import {compareTokenNames,componentTokenPatterns as patterns} from './system-component-tokens.ts';
const read=(file:string)=>readFileSync(file,'utf8');
/** Read the actual local metric records; the catalog never owns website copy. */
const record=(file:string,name:string,value:string)=>{
 const block=read(`src/components/${file}.astro`).match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`))![1];
 const row=[...block.matchAll(/\{([^}]+)\}/g)].map(([,body])=>Object.fromEntries([...body.matchAll(/(\w+): '([^']*)'/g)].map(([,key,text])=>[key,text]))).find(row=>row.value===value)!;
 return {value:row.value,label:row.label,...(row.note?{note:row.note}:{})};
};
export const statisticDescription='A result with its label and an optional note.';
export const statisticExamples={default:impactGroups[0].metrics[0],case:record('VoximplantCaseStudy','testingMetrics','≈87%'),bare:record('DataGPTCaseStudy','researchMetrics','30+')};
export const statisticNumber=read('src/components/VoximplantCaseStudy.astro').match(/<MetricValue as="strong" value="([^"]+)"\s*\/>/)![1];
export const statisticCards=[
 {id:'default',name:'Default',description:'Value, label and note.',used:'Impact',style:'Heading/L · Body/M Strong · Body/M'},
 {id:'case',name:'Case study',description:'The same parts with a smaller note.',used:'Voximplant',style:'Heading/L · Body/M Strong · Body/S'},
 {id:'bare',name:'Without a note',description:'Value and label only.',used:'DataGPT',style:'Heading/L · Body/M Strong'},
 {id:'number',name:'Number only',description:'The value alone. Case studies give it their own colour.',used:'Voximplant, Pet Care, Telegram',style:'Heading/L'},
] as const;
export type StatisticKind=typeof statisticCards[number]['id'];
const format=(metric:{value:string;label:string;note?:string},reveal=false)=>`<dl>\n  <Stat\n    value="${metric.value}"\n    label="${metric.label}"${metric.note?`\n    note="${metric.note}"`:''}${reveal?'\n    revealValue':''}\n  />\n</dl>`;
export function statisticUsage(name:string){
 if(name==='MetricValue')return `---\nimport MetricValue from '../components/MetricValue.astro';\n---\n\n<!-- Voximplant case study -->\n<MetricValue value="${statisticNumber}" as="strong" />`;
 const testing=record('VoximplantCaseStudy','testingMetrics','2');
 return `---\nimport Stat from '../components/Stat.astro';\n---\n\n<!-- Impact -->\n${format(statisticExamples.default,true)}\n\n<!-- Voximplant case study -->\n${format(testing)}\n\n<!-- DataGPT case study -->\n${format(statisticExamples.bare)}`;
}
const descriptions:Record<string,Record<string,string>>={
 Stat:{value:'The number.',label:'What the number measures.',note:'Where the number comes from or what it is compared with. Leave it out for no note.',revealValue:'Brings the number in letter by letter when its row scrolls into view.'},
 MetricValue:{value:'The number.',as:'The tag around the number.',class:'Extra classes, for example a case study’s own colour.',reveal:'Brings the number in letter by letter when its row scrolls into view.'},
};
export const statisticProps=(component:SourceComponent)=>componentPropSpecs(component).map(prop=>({...prop,default:prop.default==='Required'?'required':prop.default==='Not set'?'—':prop.default,description:descriptions[component.name][prop.name]}));
/** Only direct shared statistic styles and reveal settings, not resolved internals. */
export function statisticTokenGroups(){
 const css=read('src/styles/global.css').replace(/\/\*[\s\S]*?\*\//g,''),type=read('src/styles/typography.css'),motion=read('src/scripts/section-reveals.ts');
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,selector])=>/^\s*\.stat(?:\s|\s*\{|[-.])/.test(selector)&&!selector.includes('.impact')).map(([, ,body])=>body).join('\n');
 const roles=['heading-l','body-m-strong','body-m','body-s'];
 const names=[...new Set([...rules.matchAll(/var\((--[\w-]+)/g)].map(([,name])=>name).concat(roles.filter(role=>type.includes(`var(--text-${role})`)).map(role=>`--text-${role}`),[...motion.matchAll(/['"](--(?:duration|stagger|distance)-title-reveal|--ease-entrance)['"]/g)].map(([,name])=>name)))].sort(compareTokenNames);
 return [{title:'Color',pattern:patterns.color},{title:'Type',pattern:patterns.type},{title:'Spacing',pattern:patterns.spacing},{title:'Motion · revealValue',pattern:patterns.motion}].map(({title,pattern})=>({title,names:names.filter(name=>pattern.test(name))}));
}
export function statisticTokenCode(){
 const tokens=read('src/styles/tokens.css'),labels:Record<string,string>={'color-interactive-accent':'Accent · number','color-text-secondary':'Secondary text · note','color-border-default':'Border · phone line','text-heading-l':'Heading/L · number','text-body-m-strong':'Body/M Strong · label','text-body-m':'Body/M · note','text-body-s':'Body/S · case-study note'};
 return statisticTokenGroups().map(group=>`/* ${group.title} */\n`+group.names.map(token=>{
  const name=token.slice(2),raw=tokens.match(new RegExp(`${token}:\\s*([^;]+);`))?.[1],space=name.startsWith('space-'),detail=space?`Space ${name.slice(6)} · ${parseFloat(raw!)/16}rem (${raw})`:labels[name];
  // A separate comment keeps source-derived names readable in half-width columns.
  return detail?`/* ${detail} */\n${token}`:token;
 }).join('\n')).join('\n\n');
}
export const statisticAccessibility=[
 'Results sit in a description list: the number and label are the term, the note is the description.',
 'With revealValue, screen readers read the whole number once. The moving letters are hidden from them.',
 'With reduced motion, the number appears without the letter animation.',
 'The orange number is at least 26px, so its 3.2:1 contrast on Paper meets the large-text level.',
];
/** Project layout declarations only; no project colour, font or artwork enters the catalog. */
export function statisticProbeCss(){
 const source=read('src/styles/voximplant-case-study.css');
 return source.split(/(?=@media)/).map(block=>{
  const media=block.match(/^@media\s*([^\{]+)/)?.[1];
  const declarations=[...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,selector])=>selector.trim()==='.vox-stats'||selector.split(',').some(s=>s.trim()==='.vox-stats--four')).flatMap(([, ,body])=>[...body.matchAll(/(?:^|;)\s*(grid-template-columns|gap):\s*([^;]+);/g)].map(([,key,value])=>`${key}:${value};`)).join('');
  return declarations?`${media?`@media ${media}{`:''}.ds-stat-width--case{${declarations}}${media?'}':''}`:'';
 }).join('\n');
}

import {readFileSync} from 'node:fs';
import {impactGroups} from './portfolio.ts';
import {testingMetrics,solutionMetric} from './voximplant-case-study.ts';
import {researchMetrics} from './datagpt-case-study.ts';
import type {SourceComponent} from './system-inventory';
import {componentPropSpecs} from './system-props.ts';
import {compareTokenNames,componentTokenPatterns as patterns} from './system-component-tokens.ts';
const read=(file:string)=>readFileSync(file,'utf8');
export const statisticArrowRule='An arrow inside a number uses the Arrow icon at the number’s cap height with the Strong stroke.';
export const statisticDescription='A result with its label and an optional note.';
export const statisticExamples={default:impactGroups[0].metrics[0],case:testingMetrics.find(metric=>metric.value==='≈87%')!,bare:researchMetrics[0]};
export const statisticNumber=solutionMetric;
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
 const testing=testingMetrics.find(metric=>metric.value==='2')!;
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
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,selector])=>/^\s*\.(?:stat(?:\s|\s*\{|[-.])|metric-value-arrow)/.test(selector)&&!selector.includes('.impact')).map(([, ,body])=>body).join('\n');
 const roles=['heading-l','body-m-strong','body-m','body-s'].map(role=>type.match(new RegExp('/\\* '+role+' ·[\\s\\S]*?\\{([^}]+)\\}'))![1]).join('\n');
 const names=[...new Set([...rules.matchAll(/var\((--[\w-]+)/g)].map(([,name])=>name).concat([...roles.matchAll(/var\((--[\w-]+)/g)].map(([,name])=>name),[...motion.matchAll(/['"](--(?:duration|stagger|distance)-title-reveal|--ease-entrance)['"]/g)].map(([,name])=>name)))].sort(compareTokenNames);
 return [{title:'Color',pattern:patterns.color},{title:'Type',pattern:patterns.type},{title:'Size',pattern:patterns.size},{title:'Spacing',pattern:patterns.spacing},{title:'Motion · revealValue',pattern:patterns.motion}].map(({title,pattern})=>({title,names:names.filter(name=>pattern.test(name))}));
}
export const statisticAccessibility=[
 'Results sit in a description list: the number and label are the term, the note is the description.',
 'With revealValue, screen readers read the whole number once. The moving letters are hidden from them.',
 'A spaced arrow is read as “to”; the decorative icon is hidden from screen readers.',
 'With reduced motion, the number appears without the letter animation.',
 'The orange number is at least 26px, so its 3.2:1 contrast on Paper meets the large-text level.',
];

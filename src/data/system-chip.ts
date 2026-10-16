import {readFileSync} from 'node:fs';
import type {SourceComponent} from './system-inventory';
import {componentPropSpecs} from './system-props.ts';

export const chipDescription='Short labels for skills, project tags and design decisions. They can’t be pressed.';
/** The live specimens and Usage share this source; no rendered HTML is copied. */
export const chipCards=[
 {variant:'default',name:'Default',labels:['Accessibility','Design systems','Wireframing'],description:'An outlined label.',used:'Hero skills, Hooko'},
 {variant:'raised',name:'Raised',labels:['Product design','Design system','Mobile UX'],description:'A filled label with a soft shadow. It stays readable over images.',used:'Project cards, case-study headers'},
 {variant:'accent',name:'Accent',labels:['Context','Clarity','I won'],description:'Orange capitals that name a design decision.',used:'Hooko, Pet Care'},
] as const;
export const chipAccessibility=[
 'Chips are plain text: no tab stop, no hover, nothing to press.',
 'Accent shows capitals with CSS. Screen readers read the word as written.',
 'Text and edges are checked for contrast in Light and Dark.',
 'With reduced motion, chips appear without the entrance.',
];
export const chipUsage=()=>"---\nimport Chip from '../components/Chip.astro';\n---\n\n"+chipCards.map(card=>`<Chip label="${card.labels[0]}"${card.variant==='default'?' index={0}':` variant="${card.variant}"`} />`).join('\n');
const descriptions:Record<string,string>={label:'The text on the chip.',index:'Its place in the hero entrance. Chips appear one by one in this order.',variant:'The look: outlined, filled with a soft shadow, or orange.'};
export const chipProps=(component:SourceComponent)=>componentPropSpecs(component).map(prop=>({...prop,description:descriptions[prop.name]}));
/** Direct shared style references only; theme aliases are documented in Color. */
export function chipTokenGroups(){
 const css=readFileSync('src/styles/global.css','utf8').replace(/\/\*[\s\S]*?\*\//g,''),type=readFileSync('src/styles/typography.css','utf8');
 const shared=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,selector])=>/^\s*\.skill-tag(?:[\s{]|--)/.test(selector)).map(([, ,body])=>body).join('\n');
 const label=type.match(/\/\* label-s ·[\s\S]*?\{([^}]+)\}/)![1];
 const motion=readFileSync('src/scripts/hero-intro.ts','utf8').match(/const tagStagger = number\('([^']+)'\)/)![1];
 const names=[...new Set([...shared.matchAll(/var\((--[\w-]+)/g),...label.matchAll(/var\((--[\w-]+)/g)].map(([,name])=>name).concat(motion))].sort();
 return [
  {title:'Color',pattern:/^--color-/},
  {title:'Type · Label/S',pattern:/^--(?:font|text|line-height|letter-spacing)/},
  {title:'Spacing',pattern:/^--space-/},
  {title:'Shape',pattern:/^--radius-/},
  {title:'Elevation',pattern:/^--shadow-/},
  {title:'Motion',pattern:/^--stagger-/},
 ].map(({title,pattern})=>({title,names:names.filter(name=>pattern.test(name))}));
}

/** Website callers only; catalog specimens are documentation, not consumers. */
export function chipConsumers(component:SourceComponent){
 return [...new Set(component.usages.map(usage=>usage.file))].sort();
}

import {readFileSync} from 'node:fs';
import {componentPropSpecs} from './system-props.ts';
import type {SourceComponent} from './system-inventory';
export const navigationDescription='The header, the Work filter and the links inside them.';
export const navigationGroups=[
 {name:'Header',description:'The site header at the top of the page and after scrolling.',cards:[
  {id:'top',name:'Top header',description:'Logo, page links and the theme switch. The logo’s letters wave on hover. Under 335px, only the logo and the theme switch stay.',used:'Home',style:'Body/M Strong'},
  {id:'floating',name:'Floating header',description:'After scrolling, the header becomes a pill with the short logo and Get in touch.',used:'Desktop with a mouse',style:'Body/M Strong · Shadow large'},
 ]},
 {name:'Work filter',description:'Filters the projects in Work.',cards:[
  {id:'side',name:'Side filter',description:'Sits in the left margin next to the projects.',used:'Desktop with a mouse',style:'Body/M Strong · Shadow large'},
  {id:'pill',name:'Work pill',description:'Slides in at the top while you scroll through Work. Under 381px the text drops to Body/S, and the theme switch hides when it doesn’t fit.',used:'Under 1024px, touch screens',style:'Body/M Strong · Shadow large'},
 ]},
] as const;
export const navigationStates=['Default','Hover','Focus','Selected'] as const;
const read=(name:string)=>readFileSync('src/components/'+name+'.astro','utf8');
/** Examples derive their labels, category and defaults from the rendered components. */
export function navigationUsage(name:string){
 const imports=`---\nimport ${name} from '../components/${name}.astro';\n---\n\n`;
 if(name==='NavigationItem'){
  const nav=read('SectionNavigation'),label=nav.match(/label: '([^']+)'/)![1],filter=nav.match(/value: '([^']+)'/)![1],controls=nav.match(/controls="([^"]+)"/)![1];
  const links=readFileSync('src/data/navigation.ts','utf8'),work=links.match(/label:\s*'([^']+)',\s*href:\s*'([^']+)'/)!;
  return imports+`<NavigationItem label="${work[1]}" href="${work[2]}" />\n<NavigationItem\n  label="${label}"\n  filter="${filter}"\n  controls="${controls}"\n  pressed\n/>`;
 }
 if(name==='SectionNavigation')return imports+read('WorkSection').match(/<SectionNavigation compact theme pill\s*\/>/)![0].replace(' compact theme pill','')+'\n'+read('WorkSection').match(/<SectionNavigation compact theme pill\s*\/>/)![0];
 return imports+read('SiteHeader').match(/<LogoLink\b[^>]+\/>/)![0].replace(/\s(?:tabindex|class|data-[\w-]+)(?:="[^"]*")?/g,'')+'\n'+read('DSNavigation').match(/<LogoLink\b[^>]+\/>/)![0].replace(/\s(?:class|tabindex|data-[\w-]+)(?:="[^"]*")?/g,'');
}
const descriptions:Record<string,Record<string,string>>={
 NavigationItem:{label:'The visible text.',href:'Makes it a page link to this address.',filter:'Without href, it’s a button that shows this Work category.',controls:'The id of the project list the filter changes.',pressed:'Marks the selected filter.'},
 SectionNavigation:{compact:'Puts the filters in one row instead of a column.',theme:'Adds the theme switch at the end, when it fits.',pill:'Uses the round pill that slides in over Work.'},
 LogoLink:{href:'Where the logo goes.',compact:'Shows the short logo, naz.',morph:'Holds both logos so the header can switch between them while scrolling.'},
};
export function navigationProps(component:SourceComponent){
 const props=componentPropSpecs(component);
 // href is inherited from Astro's native anchor attributes and destructured first.
 if(component.name==='LogoLink')props.unshift({name:'href',type:'string',optional:true,default:component.source.match(/href = ('[^']+')/)![1],description:''});
 return props.map(prop=>({...prop,description:descriptions[component.name][prop.name]}));
}
export const navigationAccessibility=[
 'Page links are links. The current page uses aria-current.',
 'Work filters are buttons with aria-pressed. A hidden status line announces the chosen category.',
 'Tab reaches every item. Focus shows the ring, the dot and the moved text.',
 'Every item keeps a 44px tap area.',
 'The logo link is named “naz.wtf — home”.',
 'With reduced motion, the Work pill appears without sliding.',
];
/** Only direct shared declarations, without following palette/type alias internals. */
export function navigationTokenGroups(){
 const global=readFileSync('src/styles/global.css','utf8').replace(/\/\*[\s\S]*?\*\//g,''),type=readFileSync('src/styles/typography.css','utf8');
 const body=[...global.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([,s])=>/\.wordmark|\[data-logo|:where\(button|\.navigation-item|\.section-navigation|\.header-(?:pill-surface|full-logo|compact-logo)|\.identity\b|\.header-controls|\.desktop-nav|\.floating-navigation|\.work-filter-pill/.test(s)).map(([, ,v])=>v).join('\n');
 const text=type.match(/\/\* body-m-strong ·[\s\S]*?\{([^}]+)\}/)![1],tokens=readFileSync('src/styles/tokens.css','utf8'),declared=new Set([...tokens.matchAll(/(--[\w-]+):/g)].map(([,n])=>n));
 const names=[...new Set([...body.matchAll(/var\((--[\w-]+)/g),...text.matchAll(/var\((--[\w-]+)/g)].map(([,n])=>n))].filter(n=>declared.has(n)&&!/^--(?:safe|work-preview|gutter)/.test(n)).sort();
 return [{title:'Color',pattern:/^--color-/},{title:'Type · Body/M Strong',pattern:/^--(?:font|text|line-height|letter-spacing)/},{title:'Size',pattern:/^--(?:header|control|icon|navigation-dot|layer)-/},{title:'Spacing',pattern:/^--space-/},{title:'Shape',pattern:/^--radius-/},{title:'Elevation',pattern:/^--shadow-/},{title:'Motion',pattern:/^--(?:duration|ease|distance|scale|rotation|stagger)-/}].map(({title,pattern})=>({title,names:names.filter(n=>pattern.test(n))}));
}

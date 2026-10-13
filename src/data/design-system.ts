import { visibleComponents } from './ds-components.ts';
export const foundations = [
  {id:'color',title:'Color',description:'Each colour once, and where it is used.'},
  {id:'typography',title:'Typography',description:'Funnel Display for headings and Urbanist for reading, shown at their real sizes.'},
  {id:'spacing-layout',title:'Spacing & layout',description:'One spacing scale, shared corners and a responsive grid.'},
  {id:'motion',title:'Motion',description:'Shared durations and easing keep feedback consistent. Reduced motion skips decoration.'},
  {id:'icons',title:'Icons',description:'The interface icons used on the portfolio, drawn from the live geometry.'},
];
export const dsGroups = [
 {label:'Foundations',links:foundations.map(item=>[item.id,item.title])},
 {label:'Components',links:visibleComponents.map(item=>[item.section,item.title!])},
];
export const dashboardDescription='The foundations and components behind this portfolio, taken from the live code.';

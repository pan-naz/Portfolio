import { visibleComponents } from './ds-components.ts';
export const foundations = [
  {id:'color',title:'Color',description:'Each color once, and where it is used.'},
  {id:'typography',title:'Typography',description:'Nine text styles, and how each one looks on desktop, tablet and phone.'},
  {id:'spacing-layout',title:'Spacing & layout',description:'One spacing scale, a radius scale and a responsive grid.'},
  {id:'motion',title:'Motion',description:'Every animation on the site: how long it takes, how it eases and where it is used.'},
  {id:'icons',title:'Icons',description:'The interface icons, where each one is used, and the decorative icon library.'},
];
export const dsGroups = [
 {label:'Foundations',links:foundations.map(item=>[item.id,item.title])},
 {label:'Components',links:visibleComponents.map(item=>[item.section,item.title!])},
];
export const dashboardDescription='The foundations and components behind this portfolio, taken from the live code.';

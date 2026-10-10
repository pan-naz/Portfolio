import { visibleComponents } from './ds-components.ts';
export const foundations = [
  { id:'color', title:'Color', description:'Choose a role, then let the theme choose its value.' },
  { id:'typography', title:'Typography', description:'The text styles used by the portfolio, shown at their real sizes.' },
  { id:'spacing-layout', title:'Spacing & layout', description:'Shared spacing, corners, elevation and grids give the page its rhythm.' },
  { id:'motion', title:'Motion', description:'Shared durations and easings keep interaction consistent.' },
  { id:'icons', title:'Icons', description:'Named SVG geometry for the portfolio’s interface.' },
];
export const dsGroups = [
  { label:'Foundations', links:foundations.map(item => [item.id,item.title]) },
  { label:'Components', links:visibleComponents.map(item => [item.section,item.title!]) },
];
export const catalogItems = [...foundations.map(item=>({...item,group:'Foundations'})), ...visibleComponents.map(item=>({id:item.section,title:item.title!,description:item.description,group:'Components'}))];

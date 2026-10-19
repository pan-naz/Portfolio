import {observeCatalogLayout} from './design-system-width';
const view=document.querySelector<HTMLElement>('#decision-card')!;
observeCatalogLayout('decision-card',widths=>{
 for(const id of ['figure','stack','media']){
  const value=widths[id]+'px',name=`--ds-decision-${id}-width`;
  if(view.style.getPropertyValue(name)!==value)view.style.setProperty(name,value);
 }
});

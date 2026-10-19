import {observeCatalogLayout} from './design-system-width';
const arts=[...document.querySelectorAll<HTMLElement>('[data-stat-art]')];
const write=(element:HTMLElement,name:string,value:string)=>{if(element.style.getPropertyValue(name)!==value)element.style.setProperty(name,value);};
observeCatalogLayout('statistic',widths=>{
 for(const art of arts){
  if(!art.getClientRects().length)continue;
  const kind=art.dataset.statArt!,width=widths[kind]||widths.case;
  write(art,'--ds-stat-width',width+'px');

 }
},arts.flatMap(art=>[art,art.closest('.ds-button-stage')!]));

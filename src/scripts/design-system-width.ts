/** Measure genuine website layouts once; specimen fitting remains with its page. */
export type CatalogLayout='statistic'|'section-heading'|'project-card'|'tool-card'|'decision-card';
type Widths=Record<string,number>;
const clients=new Map<CatalogLayout,()=>void>();
let pending=false;
const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;clients.forEach(update=>update());});};
const observer=new ResizeObserver(schedule);
window.addEventListener('resize',schedule);void document.fonts.ready.then(schedule);
export function observeCatalogLayout(layout:CatalogLayout,fit:(widths:Widths)=>void,targets:Element[]=[]){
 const probe=document.querySelector<HTMLElement>(`[data-ds-layout="${layout}"]`)!;
 const width=(selector:string)=>probe.querySelector(selector)!.getBoundingClientRect().width;
 const update=()=>{
  let widths:Widths;
  if(layout==='statistic')widths=Object.fromEntries([...probe.querySelectorAll<HTMLElement>('[data-stat-width]')].map(node=>[node.dataset.statWidth!,node.getBoundingClientRect().width]));
  else if(layout==='section-heading')widths={native:parseFloat(getComputedStyle(probe.querySelector('.container')!).width)};
  else if(layout==='project-card'){
   if(!probe.getClientRects().length)return;
   const content=probe.querySelector('.work-content')!;
   widths={full:parseFloat(getComputedStyle(content).width),compact:parseFloat(getComputedStyle(content.firstElementChild!).gridTemplateColumns)};
  }else if(layout==='tool-card')widths={logo:width('.tools-grid > li'),detail:width('.ds-tools-detail-grid > div')};
  else widths=Object.fromEntries(['figure','stack','media'].map(id=>[id,width(`[data-decision-probe="${id}"] > div`)]));
  fit(widths);
 };
 clients.set(layout,update);observer.observe(probe);targets.forEach(target=>observer.observe(target));
 if(layout==='tool-card'||layout==='decision-card')update();
 return schedule;
}

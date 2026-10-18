const probe=document.querySelector<HTMLElement>('.ds-stat-width-probe')!;
const arts=[...document.querySelectorAll<HTMLElement>('[data-stat-art]')];
const write=(element:HTMLElement,name:string,value:string)=>{if(element.style.getPropertyValue(name)!==value)element.style.setProperty(name,value);};
function fit(){
 const widths=new Map([...probe.querySelectorAll<HTMLElement>('[data-stat-width]')].map(node=>[node.dataset.statWidth!,node.getBoundingClientRect().width]));
 for(const art of arts){
  if(!art.getClientRects().length)continue;
  const kind=art.dataset.statArt!,width=widths.get(kind)||widths.get('case')!;
  write(art,'--ds-stat-width',width+'px');

 }
}
let pending=false;
const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;fit();});};
const observer=new ResizeObserver(schedule);arts.forEach(art=>{observer.observe(art);observer.observe(art.closest('.ds-button-stage')!);});
window.addEventListener('resize',schedule);document.fonts.ready.then(schedule);

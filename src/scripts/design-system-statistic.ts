const probe=document.querySelector<HTMLElement>('.ds-stat-width-probe')!;
const arts=[...document.querySelectorAll<HTMLElement>('[data-stat-art]')];
const write=(element:HTMLElement,name:string,value:string)=>{if(element.style.getPropertyValue(name)!==value)element.style.setProperty(name,value);};
function fit(){
 const widths=new Map([...probe.querySelectorAll<HTMLElement>('[data-stat-width]')].map(node=>[node.dataset.statWidth!,node.getBoundingClientRect().width]));
 for(const art of arts){
  if(!art.getClientRects().length)continue;
  const kind=art.dataset.statArt!,cover=art.parentElement!.classList.contains('ds-stat-cover'),width=widths.get(kind)||widths.get('case')!;
  write(art,'--ds-stat-width',width+'px');
  if(cover){
   const holder=art.parentElement!,stage=holder.parentElement!,clearance=parseFloat(getComputedStyle(stage).getPropertyValue('--space-4')),previous=Number(art.style.getPropertyValue('--ds-stat-cover-scale'))||1,height=art.getBoundingClientRect().height/previous;
   const scale=Math.min(1,(stage.clientWidth-clearance*2)/width,(stage.clientHeight-clearance*2)/height);
   write(art,'--ds-stat-cover-scale',String(scale));write(holder,'--ds-stat-cover-width',width*scale+'px');write(holder,'--ds-stat-cover-height',height*scale+'px');
  }
 }
}
let pending=false;
const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;fit();});};
const observer=new ResizeObserver(schedule);arts.forEach(art=>{observer.observe(art);observer.observe(art.closest('.ds-button-stage,.ds-tile-visual')!);});
window.addEventListener('resize',schedule);document.fonts.ready.then(schedule);

import {prepareSpecimenHeadings} from './design-system';
const view=document.querySelector<HTMLElement>('#section-heading')!,probe=document.querySelector<HTMLElement>('.ds-heading-width-probe .container')!;
const arts=[...document.querySelectorAll<HTMLElement>('[data-heading-art]')];
for(const art of arts)prepareSpecimenHeadings(art);
const write=(element:HTMLElement,name:string,value:string)=>{if(element.style.getPropertyValue(name)!==value)element.style.setProperty(name,value);};
const fit=()=>{
 const native=parseFloat(getComputedStyle(probe).width);if(!Number.isFinite(native)||native<=0)return;
 for(const art of arts){
  const holder=art.parentElement!,stage=holder.parentElement!;if(!stage.getClientRects().length)continue;
  write(art,'--ds-heading-width',native+'px');
  const css=getComputedStyle(stage),clearance=parseFloat(css.paddingLeft);
  const room=parseFloat(css.width)-clearance*2;if(room<=0)continue;
  const previousScale=parseFloat(getComputedStyle(art).getPropertyValue('--ds-heading-scale'))||1,height=art.getBoundingClientRect().height/previousScale,scale=Math.min(1,room/native);if(scale<=0)continue;
  write(art,'--ds-heading-scale',String(scale));holder.style.width=native*scale+'px';holder.style.height=height*scale+'px';
 }
 view.dataset.headingReady='true';
};
let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;fit();});};
const observer=new ResizeObserver(schedule);arts.forEach(art=>{observer.observe(art);observer.observe(art.parentElement!.parentElement!);});
window.addEventListener('resize',schedule);document.fonts.ready.then(schedule);

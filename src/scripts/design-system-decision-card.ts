export {};
const view=document.querySelector<HTMLElement>('#decision-card')!,probe=document.querySelector<HTMLElement>('.ds-decision-width-probe')!;
const fit=()=>{
 for(const id of ['figure','stack','media']){
  const width=probe.querySelector<HTMLElement>(`[data-decision-probe="${id}"] > div`)!.getBoundingClientRect().width,value=width+'px',name=`--ds-decision-${id}-width`;
  if(view.style.getPropertyValue(name)!==value)view.style.setProperty(name,value);
 }
};
const resize=new ResizeObserver(fit);resize.observe(probe);window.addEventListener('resize',fit);void document.fonts.ready.then(fit);fit();

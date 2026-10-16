import {prepareSpecimenHeadings} from './design-system';
/** Clone genuine inert components; keep native links, names and media geometry. */
for(const template of document.querySelectorAll<HTMLTemplateElement>('[data-project-template]')){
 const art=template.parentElement!,kind=template.dataset.projectTemplate!,fragment=template.content.cloneNode(true) as DocumentFragment;
 const card=fragment.querySelector<HTMLElement>('.project');
 if(card){card.id=`ds-project-${kind}-${card.id}`;if(card.querySelector('.project-surface'))card.dataset.tiltReady='true';}
 if(kind==='hover')card!.classList.add('is-tilting');
 if(kind==='focus')fragment.querySelector('.project-surface')!.setAttribute('data-ds-focus','');
 for(const video of fragment.querySelectorAll<HTMLVideoElement>('video')){
  video.removeAttribute('data-project-video');video.removeAttribute('autoplay');
  if(video.dataset.poster)video.poster=video.dataset.poster;
  for(const source of video.querySelectorAll('source')){source.removeAttribute('src');source.removeAttribute('data-src');source.removeAttribute('data-mobile-src');}
 }
 if(kind==='identity')for(const [name,selector]of [['project-card-identity','.project-identity'],['project-card-tags','.project-tags']]){const target=fragment.querySelector<HTMLElement>(selector)!;target.dataset.dsExample=name;target.dataset.dsTarget=selector;}
 prepareSpecimenHeadings(fragment);art.append(fragment);
}
/** Frozen states read the shared CSSOM; no second implementation of tilt or focus. */
const freeze=(rules:CSSRuleList):string=>[...rules].map(rule=>{
 if(rule instanceof CSSStyleRule){
  const selector=rule.selectorText;
  if(selector.includes(':focus-visible')&&(selector.includes('.project-surface')||selector.startsWith(':where(button')))
   return `#project-card ${selector.replaceAll(':focus-visible','[data-ds-focus]')}{${rule.style.cssText}}`;
  if(selector.includes('.project.is-tilting')||selector.includes('.project-cursor')&&(rule.style.visibility==='visible'||selector.includes('.is-visible')))
   return `#project-card .ds-project-state--hover ${selector}{${rule.style.cssText}}`;
  return '';
 }
 if('cssRules'in rule){if(rule instanceof CSSMediaRule&&/prefers-reduced-motion:\s*reduce/.test(rule.conditionText))return '';return freeze((rule as CSSGroupingRule).cssRules);}return '';
}).join('\n');
const frozen=document.createElement('style');frozen.dataset.dsProjectStates='';frozen.textContent='@layer system {'+[...document.styleSheets].map(sheet=>{try{return freeze(sheet.cssRules)}catch{return ''}}).join('\n')+'}';document.head.append(frozen);
const view=document.querySelector<HTMLElement>('#project-card')!,probe=view.querySelector<HTMLElement>('.ds-project-width-probe .work-content')!;
const covers=[...document.querySelectorAll<HTMLElement>('.ds-project-tile')];
const write=(element:HTMLElement,name:string,value:string)=>{if(element.style.getPropertyValue(name)!==value)element.style.setProperty(name,value);};
const fit=()=>{
 if(probe.getClientRects().length){
  // The real container/bento CSS owns viewport widths and the desktop rail inset.
  const full=parseFloat(getComputedStyle(probe).width),compact=parseFloat(getComputedStyle(probe.firstElementChild!).gridTemplateColumns);
  for(const art of view.querySelectorAll<HTMLElement>('[data-project-art]'))write(art,'--ds-project-width',(art.dataset.projectArt==='full'?full:compact)+'px');
  const fullDetails=view.querySelector<HTMLElement>('[data-project-art="full"] .project-details')!;
  const identity=view.querySelector<HTMLElement>('[data-project-art="identity"]')!;
  write(identity,'--ds-project-width',getComputedStyle(fullDetails).width);
  const cursor=view.querySelector<HTMLElement>('.ds-project-cursor')!,hover=cursor.parentElement!,media=hover.querySelector<HTMLElement>('.project-media')!,button=cursor.firstElementChild as HTMLElement;
  cursor.style.left=(media.offsetLeft+(media.offsetWidth-button.offsetWidth)/2)+'px';cursor.style.top=(media.offsetTop+(media.offsetHeight-button.offsetHeight)/2)+'px';
  for(const grid of view.querySelectorAll<HTMLElement>('.ds-project-grid,.ds-project-states')){
   const rows=new Map<number,HTMLElement[]>();
   for(const card of grid.children as HTMLCollectionOf<HTMLElement>)rows.set(card.offsetTop,[...(rows.get(card.offsetTop)||[]),card]);
   // State cards retain one common scale even when they become separate rows.
   const sets=grid.matches('.ds-project-states')?[[...grid.children] as HTMLElement[]]:[...rows.values()];
   for(const cards of sets){
    const items=cards.map(card=>{
     const stage=card.querySelector<HTMLElement>('.ds-project-stage')!,holder=stage.firstElementChild as HTMLElement,art=holder.firstElementChild as HTMLElement;
     const old=Number(getComputedStyle(art).getPropertyValue('--ds-project-scale'))||1,r=art.getBoundingClientRect(),surface=art.querySelector<HTMLElement>('.project-surface'),paint=surface?.getBoundingClientRect();
     const outline=surface?getComputedStyle(surface):null,ring=outline&&outline.outlineStyle!=='none'?parseFloat(outline.outlineWidth)+parseFloat(outline.outlineOffset):0;
     const left=Math.min(0,paint?(paint.left-r.left)/old-ring:0),top=Math.min(0,paint?(paint.top-r.top)/old-ring:0),right=Math.max(art.offsetWidth,paint?(paint.right-r.left)/old+ring:0),bottom=Math.max(art.offsetHeight,paint?(paint.bottom-r.top)/old+ring:0);
     const css=getComputedStyle(stage),room=parseFloat(css.width)-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight)-parseFloat(css.getPropertyValue('--space-1'));
     return{stage,holder,art,left,top,width:right-left,height:bottom-top,room,padding:parseFloat(css.paddingTop)+parseFloat(css.paddingBottom)};
    });
    const scale=Math.min(1,...items.map(item=>item.room/item.width));
    for(const item of items){
     write(item.art,'--ds-project-scale',String(scale));item.art.style.left=(-item.left*scale)+'px';item.art.style.top=(-item.top*scale)+'px';
     item.holder.style.width=(item.width*scale)+'px';item.holder.style.height=(item.height*scale)+'px';
    }
    // Subgrid keeps stages, descriptions and value rows aligned in each visual row.
    for(const row of rows.values()){
     const members=items.filter(item=>row.includes(item.stage.parentElement!));if(!members.length)continue;
     const height=Math.max(...members.map(item=>item.height*scale+item.padding));for(const item of members)item.stage.style.height=height+'px';
    }
   }
  }
 }
 for(const cover of covers){if(!cover.parentElement!.clientWidth)continue;const css=getComputedStyle(cover),stage=cover.parentElement!,clearance=parseFloat(css.getPropertyValue('--space-4'))*2+parseFloat(css.getPropertyValue('--space-1'));
  write(cover,'--ds-cover-fit',String(Math.min(parseFloat(css.getPropertyValue('--ds-cover-base-scale')),(parseFloat(getComputedStyle(stage).width)-clearance)/cover.offsetWidth,(stage.clientHeight-clearance)/cover.offsetHeight)));
 }
 view.dataset.projectReady='true';
};
let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;fit();});};
const observer=new ResizeObserver(schedule);view.querySelectorAll('.ds-project-grid,.ds-project-states,.ds-project-art').forEach(el=>observer.observe(el));covers.forEach(cover=>observer.observe(cover.parentElement!));
window.addEventListener('resize',schedule);document.fonts.ready.then(schedule);view.querySelectorAll('img').forEach(img=>img.addEventListener('load',schedule));

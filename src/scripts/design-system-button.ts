import {splitSelectors} from './design-system';
/** Freeze the actual shared pseudo-class rules; never redraw component states. */
const states=document.querySelector<HTMLElement>('#button');
if(states){
 const stateSelector=(selector:string)=>selector.replace(/:hover\b/g,':is([data-ds-state="hover"],[data-ds-state="active"])').replace(/:focus-visible\b/g,'[data-ds-state="focus"]').replace(/:active\b/g,'[data-ds-state="active"]');
 const rules=(list:CSSRuleList):string=>[...list].map(rule=>{
  if(rule instanceof CSSStyleRule){
   if(!/:hover|:focus-visible|:active/.test(rule.selectorText))return '';
   return splitSelectors(stateSelector(rule.selectorText)).map(selector=>`:where(#button) ${selector}`).join(',')+`{${rule.style.cssText}}`;
  }
  if('cssRules' in rule){if(rule instanceof CSSMediaRule&&/prefers-reduced-motion:\s*reduce\)/.test(rule.conditionText))return '';const group=rule as CSSGroupingRule;const children=rules(group.cssRules);if(!children)return '';if(rule.cssText.startsWith('@layer')||rule instanceof CSSMediaRule&&/hover:|pointer:|prefers-reduced-motion/.test(rule.conditionText))return children;return rule.cssText.slice(0,rule.cssText.indexOf('{')+1)+children+'}';}
  return '';
 }).join('\n');
 const style=document.createElement('style');style.dataset.dsButtonStates='';
 style.textContent='@layer system {'+[...document.styleSheets].map(sheet=>{try{return rules(sheet.cssRules)}catch{return ''}}).join('\n')+'}';
 document.head.append(style);
 for(const art of states.querySelectorAll<HTMLElement>('[data-button-state]'))for(const control of art.querySelectorAll<HTMLElement>('.button,.icon-button,.text-link'))if(!control.dataset.dsState)control.dataset.dsState=art.dataset.buttonState;
 const covers=[...document.querySelectorAll<HTMLElement>('.ds-button-cover')];
 const groups=[...states.querySelectorAll<HTMLElement>('.ds-button-states')];
 const fit=()=>{
  const writes:{element:HTMLElement;scale:number}[]=[];
  const metadata:{element:HTMLElement;heights:number[]}[]=[];
  for(const grid of states.querySelectorAll<HTMLElement>('.ds-button-grid')){
   if(!grid.clientWidth)continue;
   const rows=new Map<number,HTMLElement[]>();
   for(const card of grid.children as HTMLCollectionOf<HTMLElement>){
    const top=card.offsetTop;
    rows.set(top,[...(rows.get(top)||[]),card]);
   }
   for(const cards of rows.values()){
    const count=Math.max(...cards.map(card=>card.querySelectorAll('.ds-button-values > div').length));
    const heights=Array.from({length:count},(_,index)=>Math.max(...cards.map(card=>{
     const row=card.querySelectorAll<HTMLElement>('.ds-button-values > div')[index];
     return row?Math.max(...[...row.children].map(child=>child.getBoundingClientRect().height)):0;
    })));
    for(const card of cards)metadata.push({element:card,heights});
   }
  }
  const section=states.querySelector<HTMLElement>('.ds-button-state-section')!;
  const visible=groups.filter(group=>group.clientWidth);
  const paintWidth=(group:HTMLElement)=>Math.max(...[...group.querySelectorAll<HTMLElement>('.ds-button-state-art')].map(art=>{
   const ring=Math.max(0,...[...art.querySelectorAll<HTMLElement>('[data-ds-state]')].map(control=>{
    const style=getComputedStyle(control);
    return style.outlineStyle==='none'?0:parseFloat(style.outlineWidth)+parseFloat(style.outlineOffset);
   }));
   return art.offsetWidth+ring*2;
  }));
  // Keep real sizes comparable: one scale per block, or cards for the entire section.
  const stacked=visible.some(group=>{
   const style=getComputedStyle(group),token=(name:string)=>parseFloat(style.getPropertyValue(name));
   const column=(group.clientWidth-token('--space-6')*2-token('--space-16')-token('--space-3')*4)/4;
   return column/paintWidth(group)<.8;
  });
  const layout=stacked?'stacked':'grid';
  if(visible.length&&section.dataset.layout!==layout){section.dataset.layout=layout;schedule();return;}
  const labelsAbove=stacked&&visible.some(group=>{
   const available=Math.min(...[...group.querySelectorAll<HTMLElement>('.ds-button-state-cell')].map(cell=>cell.clientWidth-cell.querySelector<HTMLElement>(':scope > span')!.offsetWidth-parseFloat(getComputedStyle(cell).columnGap)));
   return available/paintWidth(group)<.8;
  });
  const labels=labelsAbove?'above':'beside';
  if(visible.length&&section.dataset.labels!==labels){section.dataset.labels=labels;schedule();return;}
  for(const group of visible){
   const available=Math.min(...[...group.querySelectorAll<HTMLElement>('.ds-button-state-example')].map(example=>example.clientWidth));
   writes.push({element:group,scale:Math.max(.8,Math.min(1,available/paintWidth(group)))});
  }
  const write=(element:HTMLElement,name:string,value:string)=>{if(element.style.getPropertyValue(name)!==value)element.style.setProperty(name,value);};
  for(const art of states.querySelectorAll<HTMLElement>('.ds-button-stage-art')){
   if(art.parentElement!.clientWidth)writes.push({element:art,scale:Math.min(1,art.parentElement!.clientWidth/art.offsetWidth)});
  }
  for(const cover of covers){
   if(!cover.parentElement!.clientWidth)continue;
   const room=parseFloat(getComputedStyle(cover).getPropertyValue('--space-4'))*2;
   const scale=Math.min(1,(cover.parentElement!.clientWidth-room)/cover.offsetWidth,(cover.parentElement!.clientHeight-room)/cover.offsetHeight);
   write(cover,'--ds-cover-fit',String(scale));
  }
  for(const {element,scale} of writes)write(element,element.matches('.ds-button-states')?'--ds-state-scale':'--ds-specimen-fit',String(scale));
  for(const {element,heights} of metadata)write(element,'--ds-button-value-rows',heights.map(height=>height+'px').join(' '));
 };
 let pending=false;
 const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;fit();});};
 const observer=new ResizeObserver(schedule);[...groups,...states.querySelectorAll('.ds-button-grid'),...covers.map(cover=>cover.parentElement!)].forEach(group=>observer.observe(group));
 document.fonts.ready.then(schedule);
}

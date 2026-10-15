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
  for(const group of groups){
   const units=matchMedia('(max-width:767px)').matches?[...group.children] as HTMLElement[]:[group];
   for(const unit of units){
    const art=[...unit.querySelectorAll<HTMLElement>('.ds-button-state-art')];
    if(!art.length||!unit.clientWidth)continue;
    const width=Math.max(...art.map(element=>element.offsetWidth));
    const available=Math.min(...art.map(element=>element.parentElement!.clientWidth));
    const focus=unit.querySelector<HTMLElement>('[data-ds-state="focus"]')!;
    const computed=getComputedStyle(focus),ring=(parseFloat(computed.outlineWidth)+parseFloat(computed.outlineOffset))*2;
    const scale=Math.min(1,(available-ring)/width);
    for(const element of art)writes.push({element,scale});
   }
  }
  const write=(element:HTMLElement,name:string,value:string)=>{if(element.style.getPropertyValue(name)!==value)element.style.setProperty(name,value);};
  for(const art of states.querySelectorAll<HTMLElement>('.ds-button-stage-art')){
   if(art.parentElement!.clientWidth)writes.push({element:art,scale:Math.min(1,art.parentElement!.clientWidth/art.offsetWidth)});
  }
  for(const {element,scale} of writes)write(element,'--ds-specimen-fit',String(scale));
  for(const {element,heights} of metadata)write(element,'--ds-button-value-rows',heights.map(height=>height+'px').join(' '));
 };
 let pending=false;
 const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;fit();});};
 const observer=new ResizeObserver(schedule);[...groups,...states.querySelectorAll('.ds-button-grid')].forEach(group=>observer.observe(group));
 document.fonts.ready.then(schedule);
}

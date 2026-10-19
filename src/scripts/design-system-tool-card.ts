import {splitSelectors} from './design-system';
const view=document.querySelector<HTMLElement>('#tooltip')!,probe=document.querySelector<HTMLElement>('.ds-tools-width-probe')!;
/** Freeze the website's own hover/focus declarations, including its outline. */
const rules=(list:CSSRuleList):string=>[...list].map(rule=>{
 if(rule instanceof CSSStyleRule){
  if(!/:focus-visible|\.is-pointer-hovered/.test(rule.selectorText))return '';
  const selector=rule.selectorText.replace(/:focus-visible\b/g,'[data-tool-state="focus"]').replace(/\.is-pointer-hovered\b/g,'[data-tool-state="hover"]');
  return splitSelectors(selector).map(part=>`:where(#tooltip) ${part}`).join(',')+`{${rule.style.cssText}}`;
 }
 if('cssRules' in rule){if(rule instanceof CSSMediaRule&&/prefers-reduced-motion/.test(rule.conditionText))return '';const children=rules((rule as CSSGroupingRule).cssRules);if(!children)return '';if(rule.cssText.startsWith('@layer')||rule instanceof CSSMediaRule&&/hover:|pointer:/.test(rule.conditionText))return children;return rule.cssText.slice(0,rule.cssText.indexOf('{')+1)+children+'}';}
 return '';
}).join('\n');
const style=document.createElement('style');style.dataset.dsToolStates='';style.textContent='@layer system {'+[...document.styleSheets].map(sheet=>{try{return rules(sheet.cssRules)}catch{return ''}}).join('\n')+'}';document.head.append(style);
for(const art of view.querySelectorAll<HTMLElement>('[data-tool-art]')){
 const state=art.dataset.toolArt!;
 if(['logo','detail'].includes(state))continue;
 const card=art.querySelector<HTMLElement>('.tool-card')!,tooltip=art.querySelector<HTMLElement>('.tooltip')!;
 card.dataset.toolState=state==='focus'?'focus':'hover';
 tooltip.toggleAttribute('data-tooltip-visible',true);tooltip.dataset.placement=state==='below'?'below':'above';
 art.style.setProperty('--tooltip-y',state==='below'?'calc(50% - var(--space-8))':'50%');
}
const fit=()=>{
 const logo=probe.querySelector('.tools-grid > li')!.getBoundingClientRect().width,detail=probe.querySelector('.ds-tools-detail-grid > div')!.getBoundingClientRect().width;
 for(const [name,width]of [['--ds-tool-logo-width',logo],['--ds-tool-detail-width',detail]] as const){const value=width+'px';if(view.style.getPropertyValue(name)!==value)view.style.setProperty(name,value);}
 for(const art of view.querySelectorAll<HTMLElement>('[data-tool-art="above"],[data-tool-art="below"],[data-tool-art="focus"]')){
  if(!art.getClientRects().length)continue;
  const stage=art.parentElement!.getBoundingClientRect(),box=art.getBoundingClientRect(),inner=art.querySelector<HTMLElement>('.tool-card-inner')!.getBoundingClientRect(),tip=art.querySelector<HTMLElement>('.tooltip')!,half=tip.getBoundingClientRect().width/2;
  const desired=box.width/2+(art.dataset.toolArt==='focus'?0:parseFloat(getComputedStyle(art).getPropertyValue('--space-4')))-(inner.left-box.left);
  const x=Math.max(stage.left-inner.left+half,Math.min(stage.right-inner.left-half,desired));
  art.style.setProperty('--tooltip-x',x+'px');art.style.setProperty('--ds-pointer-x',(x+inner.left-box.left)+'px');
 }

};
let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;fit();});};
const observer=new ResizeObserver(schedule);observer.observe(probe.querySelector('.container')!);view.querySelectorAll('.ds-tools-stage').forEach(stage=>observer.observe(stage));window.addEventListener('resize',schedule);document.fonts.ready.then(schedule);fit();

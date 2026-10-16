import {pillGeometry} from './header-morph/header-morph-model';
import {splitSelectors} from './design-system';
/** Static header placement uses the same measured geometry as the live morph. */
const specimens=[...document.querySelectorAll<HTMLElement>('[data-nav-specimen]')];
const fit=()=>{
 for(const specimen of specimens){
  const header=specimen.querySelector<HTMLElement>('.site-header'),kind=specimen.dataset.navSpecimen;
  if(header&&specimen.getClientRects().length){
   const style=getComputedStyle(header),control=parseFloat(style.getPropertyValue('--control-icon')),height=parseFloat(style.getPropertyValue('--header-height')),gap=parseFloat(style.getPropertyValue('--space-3'));
   const identity=header.querySelector<HTMLElement>('.identity')!,controls=header.querySelector<HTMLElement>('.header-controls')!,nav=controls.querySelector<HTMLElement>('.desktop-nav')!;
   if(kind==='top'){
    nav.hidden=false;
    const inset=parseFloat(style.getPropertyValue('--header-inset')),full=header.querySelector<SVGSVGElement>('.header-full-logo svg')!;
    nav.hidden=full.getBoundingClientRect().width+controls.offsetWidth+gap>innerWidth-inset*2;
    header.style.width=(parseFloat(full.style.width)+controls.offsetWidth+gap)+'px';
   }else{
    const button=specimen.querySelector<HTMLElement>('.button')!,target=pillGeometry(innerWidth,controls.offsetWidth,button.offsetWidth),y=(height-control)/2;
    header.style.width=target.width+'px';
    identity.style.left=target.paddingLeft+'px';identity.style.top=y+'px';identity.style.width=target.logoWidth+'px';
    controls.style.left=(target.paddingLeft+target.logoWidth+target.logoGap)+'px';controls.style.top=y+'px';controls.style.right='auto';
    const surface=header.querySelector<HTMLElement>('.header-pill-surface')!;surface.style.left='0';surface.style.width=target.width+'px';
    button.classList.add('header-cta');button.style.left=(target.width-target.paddingRight-button.offsetWidth)+'px';button.style.top=(height-button.offsetHeight)/2+'px';
   }
  }
  if(kind==='pill'){
   const nav=specimen.querySelector<HTMLElement>('.section-navigation')!;
   nav.toggleAttribute('data-small-work-type',innerWidth<381);
   nav.removeAttribute('data-theme-fit');
   const margin=parseFloat(getComputedStyle(nav).getPropertyValue('--space-4'));
   nav.dataset.themeFit=String(nav.offsetWidth<=innerWidth-margin*2);
  }
  const examples:Record<string,string>=kind==='top'?{'nav-top-logo':'.header-full-logo','nav-top':'.desktop-nav','nav-top-theme':'.theme-toggle'}:kind==='floating'?{'nav-wordmark':'.header-compact-logo','nav-floating':'.desktop-nav','nav-floating-theme':'.theme-toggle','nav-action':'.button'}:kind==='side'?{'nav-filter':'.section-navigation'}:{'nav-work-pill':'.section-navigation'};
  for(const[name,selector]of Object.entries(examples)){const el=specimen.querySelector<HTMLElement>(selector)!;el.dataset.dsExample=name;el.dataset.dsTarget=selector.includes('logo')?'.wordmark':selector;}
  const stage=specimen.closest<HTMLElement>('.ds-nav-stage');if(stage?.clientWidth){const style=getComputedStyle(stage),room=stage.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight);specimen.style.setProperty('--ds-specimen-fit',String(Math.min(1,room/specimen.offsetWidth)));}
 }
 for(const cover of document.querySelectorAll<HTMLElement>('.ds-navigation-cover')){const stage=cover.parentElement!;if(!stage.clientWidth)continue;const style=getComputedStyle(cover),clearance=parseFloat(style.getPropertyValue('--space-4'))*2+parseFloat(style.getPropertyValue('--space-1'));cover.style.setProperty('--ds-cover-fit',String(Math.min(1,(Math.floor(parseFloat(getComputedStyle(stage).width))-clearance)/parseFloat(getComputedStyle(cover).width),(stage.clientHeight-clearance)/cover.offsetHeight)));}
};
// Freeze only the actual shared pseudo-class declarations, including fine-pointer hover.
const freeze=(list:CSSRuleList):string=>[...list].map(rule=>{
 if(rule instanceof CSSStyleRule){if(!/:hover|:focus-visible/.test(rule.selectorText)||!rule.selectorText.includes('.navigation-item')&&!rule.selectorText.includes(':where(button'))return '';const selectors=rule.selectorText.replace(/:hover\b/g,'[data-ds-state="hover"]').replace(/:focus-visible\b/g,'[data-ds-state="focus"]');return splitSelectors(selectors).map(s=>`:where(#navigation .ds-nav-state) ${s}`).join(',')+`{${rule.style.cssText}}`;}
 if('cssRules'in rule){const group=rule as CSSGroupingRule;if(rule instanceof CSSMediaRule&&/prefers-reduced-motion:\s*reduce/.test(rule.conditionText))return '';return freeze(group.cssRules);}return '';
}).join('\n');
const frozen=document.createElement('style');frozen.dataset.dsNavigationStates='';frozen.textContent='@layer system {'+[...document.styleSheets].map(sheet=>{try{return freeze(sheet.cssRules)}catch{return ''}}).join('\n')+'}';document.head.append(frozen);
let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;fit();});};
const observer=new ResizeObserver(schedule);document.querySelectorAll('.ds-nav-stage,.ds-navigation-cover').forEach(el=>observer.observe(el));
window.addEventListener('resize',schedule);document.fonts.ready.then(schedule);

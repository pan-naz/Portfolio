import { initializeCardTilt } from './project-tilt';
import { scrollImmediately } from './smooth-scroll';

history.scrollRestoration='manual';
const views=[...document.querySelectorAll<HTMLElement>('[data-ds-view]')];
const links=[...document.querySelectorAll<HTMLAnchorElement>('[data-ds-nav],[data-ds-dashboard-link]')];
const dashboard=document.querySelector<HTMLElement>('#dashboard')!;
const dashboardTilt=initializeCardTilt(dashboard,{cardSelector:'.ds-tile-frame',surfaceSelector:'.ds-tile'});
const phone=matchMedia('(max-width:767px)');
const navigation=document.querySelector<HTMLElement>('[data-ds-nav-scroll]')!;
const horizontal=()=>document.documentElement.dataset.workStageLayout!=='true';
const updateNavigationEdges=()=>{
 navigation.toggleAttribute('data-scroll-start',horizontal()&&navigation.scrollLeft>0);
 navigation.toggleAttribute('data-scroll-end',horizontal()&&navigation.scrollLeft+navigation.clientWidth<navigation.scrollWidth-1);
};
const revealNavigationLink=(link:HTMLAnchorElement|null)=>{
 if(!link||!horizontal())return;
 const row=navigation.getBoundingClientRect(),item=link.getBoundingClientRect();
 const gutter=parseFloat(getComputedStyle(navigation).scrollPaddingInlineStart)||0;
 const delta=item.left<row.left+gutter?item.left-row.left-gutter:item.right>row.right-gutter?item.right-row.right+gutter:0;
 if(delta)scrollImmediately(navigation.scrollLeft+delta,navigation);
 updateNavigationEdges();
};
navigation.addEventListener('scroll',updateNavigationEdges,{passive:true});
navigation.addEventListener('focusin',event=>revealNavigationLink((event.target as Element).closest<HTMLAnchorElement>('.navigation-item')));
navigation.addEventListener('keydown',event=>{
 const visible=links.filter(link=>navigation.contains(link)&&link.getClientRects().length>0);
 const current=visible.indexOf(document.activeElement as HTMLAnchorElement);
 const next=event.key==='ArrowRight'?(current+1)%visible.length:event.key==='ArrowLeft'?(current+visible.length-1)%visible.length:event.key==='Home'?0:event.key==='End'?visible.length-1:undefined;
 if(next!==undefined&&current>=0){event.preventDefault();visible[next].focus({preventScroll:horizontal()});revealNavigationLink(visible[next]);}
});

// Show the actual website pill state, and pin its real phone typography when
// the small specimen is viewed in a desktop catalog. No private size value.
for(const specimen of document.querySelectorAll<HTMLElement>('[data-ds-pill][data-ds-phone-filter]')){
 const nav=specimen.querySelector<HTMLElement>('.section-navigation')!;
 nav.dataset.themeFit='false';
 nav.toggleAttribute('data-small-work-type',true);
}

// Preserve genuine shared typography while removing specimen heading semantics.
// Replacement selectors and declarations come from the loaded shared CSSOM.
const headingSelector=(selector:string)=>selector.replace(/(^|[^\w-])h([1-6])\b/g,'$1:is(h$2,:where([data-ds-heading="$2"]))');
export const splitSelectors=(text:string)=>{const parts:string[]=[];let depth=0,start=0,quote='';for(let i=0;i<text.length;i++){const char=text[i];if(char==='\\'){i++;continue;}if(quote){if(char===quote)quote='';continue;}if(char==='"'||char==="'"){quote=char;continue;}if(char==='('||char==='[')depth++;if(char===')'||char===']')depth--;if(char===','&&depth===0){parts.push(text.slice(start,i));start=i+1;}}parts.push(text.slice(start));return parts;};
const headingRules=(rules:CSSRuleList):string=>[...rules].map(rule=>{
 if(rule instanceof CSSStyleRule){const selector=headingSelector(rule.selectorText);return selector===rule.selectorText?'':splitSelectors(selector).map(part=>`:where(.ds-specimens) :is(${part.trim()})`).join(',')+`{${rule.style.cssText}}`;}
 if('cssRules' in rule){const group=rule as CSSGroupingRule;const children=headingRules(group.cssRules);return children?rule.cssText.slice(0,rule.cssText.indexOf('{')+1)+children+'}':'';}
 return '';
}).join('\n');
const style=document.createElement('style');style.dataset.dsHeadingStyles='';
style.textContent=[...document.styleSheets].map(sheet=>{try{return headingRules(sheet.cssRules);}catch{return '';}}).join('\n');document.head.append(style);
for(const heading of document.querySelectorAll<HTMLElement>('.ds-specimens :is(h1,h2,h3,h4,h5,h6)')){
 const replacement=document.createElement('div');for(const attribute of heading.attributes)replacement.setAttribute(attribute.name,attribute.value);
 replacement.dataset.dsHeading=heading.tagName.slice(1);replacement.replaceChildren(...heading.childNodes);heading.replaceWith(replacement);
}
const refreshMarkup=(view:HTMLElement)=>{
 const specimen=view.querySelector('.ds-specimens'),code=view.querySelector('[data-ds-markup]');if(!specimen||!code)return;
 const clone=specimen.cloneNode(true) as HTMLElement;clone.querySelectorAll('script,style').forEach(node=>node.remove());
 code.textContent=clone.innerHTML.trim().replace(/></g,'>\n<');
};
const selectView=(resetScroll=true)=>{
 dashboardTilt.reset();dashboardTilt.deferHoverUntilPointerMove();
 let requested=location.hash.slice(1)||'dashboard';
 if(['icon-button','text-link'].includes(requested)){requested='button';history.replaceState(history.state,'','#button');}
 const id=phone.matches&&requested==='dashboard'?'color':requested;
 const selected=views.find(view=>view.id===id)||views.find(view=>view.id===(phone.matches?'color':'dashboard'))!;
 for(const view of views)view.hidden=view!==selected;
 for(const link of links){if(link.closest('.ds-navigation')&&(selected.id==='dashboard'?link.hasAttribute('data-ds-dashboard-link'):link.hash===`#${selected.id}`))link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
 document.querySelector('[data-ds-title]')!.textContent=selected.dataset.title!;
 document.querySelector('[data-ds-group]')!.textContent=selected.dataset.group!;
 document.querySelector<HTMLElement>('[data-ds-breadcrumb]')!.hidden=selected.id==='dashboard';
 document.querySelector('[data-ds-description]')!.textContent=selected.dataset.description!;
 refreshMarkup(selected);refreshValues();
 revealNavigationLink(navigation.querySelector<HTMLAnchorElement>('[aria-current=page]'));
 if(resetScroll){scrollImmediately(0);requestAnimationFrame(()=>requestAnimationFrame(()=>scrollImmediately(0)));}
};
window.addEventListener('hashchange',()=>selectView());window.addEventListener('popstate',()=>selectView());
const syncNavigation=()=>{const previous=views.find(view=>!view.hidden)?.id;selectView(false);if(previous!==views.find(view=>!view.hidden)?.id)scrollImmediately(0);};
window.addEventListener('workstagelayoutchange',syncNavigation);phone.addEventListener('change',syncNavigation);
window.addEventListener('resize',()=>{revealNavigationLink(navigation.querySelector<HTMLAnchorElement>('[aria-current=page]'));updateNavigationEdges();});
links.filter(link=>!link.hasAttribute('data-ds-dashboard-link')).forEach(link=>link.addEventListener('click',event=>{event.preventDefault();if(link.hash!==location.hash)history.pushState(null,'',link.hash);selectView();}));
for(const tabset of document.querySelectorAll<HTMLElement>('[data-ds-tabset]')){
 const tabs=[...tabset.querySelectorAll<HTMLButtonElement>('[role=tab]')];
 const select=(index:number,focus=false)=>{tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;document.getElementById(tab.getAttribute('aria-controls')!)!.hidden=i!==index;});if(focus)tabs[index].focus();};
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>{select(index);const view=tab.closest<HTMLElement>('[data-ds-view]');if(view)refreshMarkup(view);});tab.addEventListener('keydown',event=>{const next=event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:undefined;if(next!==undefined){event.preventDefault();select(next,true);}});});
}
document.querySelectorAll('[data-ds-dashboard-link]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();history.pushState(null,'',location.pathname);selectView();}));
for(const toggle of document.querySelectorAll<HTMLButtonElement>('[data-ds-names]'))toggle.addEventListener('click',()=>{const on=toggle.getAttribute('aria-checked')!=='true';toggle.setAttribute('aria-checked',String(on));const view=toggle.closest<HTMLElement>('[data-ds-view]')!;view.dataset.showNames=String(on);view.querySelectorAll('.ds-token-human').forEach(node=>node.setAttribute('aria-hidden',String(on)));view.querySelectorAll('.ds-token-swap .ds-token-name').forEach(node=>node.setAttribute('aria-hidden',String(!on)));});
for(const preview of document.querySelectorAll<HTMLElement>('.ds-specimens')){
 preview.querySelectorAll('[data-work-filter]').forEach(button=>button.removeAttribute('aria-controls'));
 const blockLink=(event:Event)=>{if((event.target as Element).closest('a,.theme-toggle')){event.preventDefault();event.stopImmediatePropagation();}};
 for(const event of ['click','auxclick','contextmenu','dragstart'])preview.addEventListener(event,blockLink,{capture:true});
 preview.addEventListener('click',event=>{
  const target=(event.target as Element).closest<HTMLElement>('[data-work-filter],[data-ds-comparison-choice]');if(!target)return;
  const comparison=target.hasAttribute('data-ds-comparison-choice');
  const scope=target.closest('.section-navigation')||preview;
  scope.querySelectorAll<HTMLElement>(comparison?'[data-ds-comparison-choice]':'[data-work-filter]').forEach(button=>{const active=button===target;button.setAttribute('aria-pressed',String(active));if(comparison){button.classList.toggle('button--primary',active);button.classList.toggle('button--secondary',!active);}});
  const status=scope.querySelector('[data-work-filter-status]');if(status)status.textContent=`${target.textContent?.trim()} selected`;
 });
}
// Human values are resolved by the same browser CSS engine as the specimens.
const hex=(value:string)=>{const match=value.match(/^rgba?\(([^)]+)\)$/);if(!match)return value;const parts=match[1].split(',').map(Number);return '#'+parts.slice(0,3).map(number=>number.toString(16).padStart(2,'0')).join('').toUpperCase()+(parts.length>3&&parts[3]<1?Math.round(parts[3]*255).toString(16).padStart(2,'0').toUpperCase():'');};
const readable=(value:string)=>value.replace(/-?[\d.]+px/g,number=>`${+parseFloat(number).toFixed(2)}px`);
const refreshValues=()=>{
 const view=views.find(view=>!view.hidden);if(!view)return;
 const probe=document.createElement('span');probe.style.cssText='position:absolute;visibility:hidden;';view.append(probe);
 const tokenSource=(node:HTMLElement)=>node.dataset.dsTokenContext?view.querySelector<HTMLElement>('.ds-specimens '+node.dataset.dsTokenContext)||node:document.documentElement;
 for(const node of view.querySelectorAll<HTMLElement>('[data-ds-human-token]')){
  const name=node.dataset.dsHumanToken!,raw=getComputedStyle(tokenSource(node)).getPropertyValue('--'+name).trim();
  if(/^(color-|color-border-control|color-focus-ring|backdrop)/.test(name)){probe.style.backgroundColor=raw;node.textContent=hex(getComputedStyle(probe).backgroundColor);}
  else if(/^(duration-|ease-|scale-)/.test(name))node.textContent=raw;
  else if(name.startsWith('icon-stroke-'))node.textContent=parseFloat(raw)+'px';
  else {probe.style.width=`var(--${name})`;node.textContent=getComputedStyle(probe).width;}
 }
 for(const node of view.querySelectorAll<HTMLElement>('[data-ds-token-swatch]')){const name=node.dataset.dsTokenSwatch!;if(name.startsWith('color-')){node.style.backgroundColor=getComputedStyle(tokenSource(node)).getPropertyValue('--'+name).trim();node.dataset.color='';}}
 probe.remove();
 for(const grid of view.querySelectorAll<HTMLElement>('[data-ds-grid]')){const computed=getComputedStyle(grid),count=computed.gridTemplateColumns.split(' ').length;view.querySelector('[data-ds-grid-spec="'+grid.dataset.dsGrid+'"]')!.textContent=`${count} columns here · ${computed.gap} gap`;}
 const namedWeights:Record<string,string>={'400':'Regular','500':'Medium','600':'Semibold'};
 for(const node of view.querySelectorAll<HTMLElement>('[data-ds-measure]')){
  const sample=view.querySelector<HTMLElement>('.ds-specimens '+node.dataset.dsMeasure);if(!sample)continue;
  const computed=getComputedStyle(sample);node.textContent=node.dataset.properties!.split(',').map(property=>{const value=computed.getPropertyValue(property).trim();return property==='font-weight'?namedWeights[value]||value:readable(value);}).join(' · ');
 }
};
window.addEventListener('resize',refreshValues);window.addEventListener('themechange',refreshValues);selectView();document.documentElement.dataset.docNavigationReady='true';

// Exercise the shared bubble itself; phone catalog previews show its focus anchor.
const tooltipExample=document.querySelector<HTMLElement>('#tooltip [data-ds-example=tooltip-tool] .tooltip');
const showTooltipExample=(state:string)=>{
 if(!tooltipExample)return;
 tooltipExample.toggleAttribute('data-tooltip-visible',state!=='hidden');
 tooltipExample.dataset.placement=state==='below'?'below':'above';
 const target=tooltipExample.parentElement!;
 target.style.setProperty('--tooltip-x','50%');
 target.style.setProperty('--tooltip-y','50%');
 for(const button of document.querySelectorAll('[data-ds-tooltip-state]'))button.setAttribute('aria-pressed',String(button.getAttribute('data-ds-tooltip-state')===state));
};
for(const button of document.querySelectorAll<HTMLElement>('[data-ds-tooltip-state]'))button.addEventListener('click',()=>showTooltipExample(button.dataset.dsTooltipState!));
if(matchMedia('(hover: none), (pointer: coarse)').matches)showTooltipExample('focus');

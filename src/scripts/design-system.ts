import { initializeCardTilt } from './project-tilt';
import { scrollImmediately } from './smooth-scroll';

history.scrollRestoration='manual';
const views=[...document.querySelectorAll<HTMLElement>('[data-ds-view]')];
const links=[...document.querySelectorAll<HTMLAnchorElement>('[data-ds-nav],[data-ds-dashboard-link]')];
const dashboard=document.querySelector<HTMLElement>('#dashboard')!;
const dashboardTilt=initializeCardTilt(dashboard,{cardSelector:'.ds-tile-frame',surfaceSelector:'.ds-tile'});
const phone=matchMedia('(max-width:767px)');
const navigation=document.querySelector<HTMLElement>('[data-ds-nav-scroll]')!;
const navigationBar=navigation.closest<HTMLElement>('.ds-navigation')!;
const logoRow=document.querySelector<HTMLElement>('.ds-logo-row')!;
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
export const prepareSpecimenHeadings=(root:ParentNode)=>{
for(const heading of root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6')){
 const replacement=document.createElement('div');for(const attribute of heading.attributes)replacement.setAttribute(attribute.name,attribute.value);
 replacement.dataset.dsHeading=heading.tagName.slice(1);replacement.replaceChildren(...heading.childNodes);heading.replaceWith(replacement);
}
};
document.querySelectorAll('.ds-specimens').forEach(prepareSpecimenHeadings);
const selectView=(resetScroll=true,fromNavigation=false)=>{
 // A sticky bar's own rect follows the viewport; the logo row keeps its flow origin.
 const scrollTarget=fromNavigation&&horizontal()?Math.min(window.scrollY,window.scrollY+logoRow.getBoundingClientRect().bottom-(parseFloat(getComputedStyle(navigationBar).top)||0)):0;
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
 refreshValues();
 revealNavigationLink(navigation.querySelector<HTMLAnchorElement>('[aria-current=page]'));
 if(resetScroll){scrollImmediately(scrollTarget);requestAnimationFrame(()=>requestAnimationFrame(()=>scrollImmediately(scrollTarget)));}
};
window.addEventListener('hashchange',()=>selectView());window.addEventListener('popstate',()=>selectView());
const syncNavigation=()=>{const previous=views.find(view=>!view.hidden)?.id;selectView(false);if(previous!==views.find(view=>!view.hidden)?.id)scrollImmediately(0);};
window.addEventListener('workstagelayoutchange',syncNavigation);phone.addEventListener('change',syncNavigation);
window.addEventListener('resize',()=>{revealNavigationLink(navigation.querySelector<HTMLAnchorElement>('[aria-current=page]'));updateNavigationEdges();});
links.filter(link=>!link.hasAttribute('data-ds-dashboard-link')).forEach(link=>link.addEventListener('click',event=>{event.preventDefault();if(link.hash!==location.hash)history.pushState(null,'',link.hash);selectView(true,Boolean(link.closest('.ds-navigation')));}));
for(const tabset of document.querySelectorAll<HTMLElement>('[data-ds-tabset]')){
 const tabs=[...tabset.querySelectorAll<HTMLButtonElement>('[role=tab]')];
 const select=(index:number,focus=false)=>{tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;document.getElementById(tab.getAttribute('aria-controls')!)!.hidden=i!==index;});if(focus)tabs[index].focus();};
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>{select(index);});tab.addEventListener('keydown',event=>{const next=event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:undefined;if(next!==undefined){event.preventDefault();select(next,true);}});});
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
const hex=(value:string)=>{const srgb=value.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);if(srgb)return '#'+srgb.slice(1,4).map(number=>Math.round(Number(number)*255).toString(16).padStart(2,'0')).join('').toUpperCase()+(srgb[4]&&Number(srgb[4])<1?Math.round(Number(srgb[4])*255).toString(16).padStart(2,'0').toUpperCase():'');const match=value.match(/^rgba?\(([^)]+)\)$/);if(!match)return value;const parts=match[1].split(',').map(Number);return '#'+parts.slice(0,3).map(number=>number.toString(16).padStart(2,'0')).join('').toUpperCase()+(parts.length>3&&parts[3]<1?Math.round(parts[3]*255).toString(16).padStart(2,'0').toUpperCase():'');};
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

};
window.addEventListener('resize',refreshValues);window.addEventListener('themechange',refreshValues);selectView();document.documentElement.dataset.docNavigationReady='true';

/** Keep the existing column count unless a real, unwrapped specimen needs more room. */
export const fitCatalogColumns=(grid:HTMLElement,maximum:number,required:number)=>{
 const gap=parseFloat(getComputedStyle(grid).columnGap)||0;
 let count=maximum;
 while(count>1&&(grid.clientWidth-gap*(count-1))/count<required)count--;
 const columns=`repeat(${count},minmax(0,1fr))`;
 if(grid.style.gridTemplateColumns!==columns)grid.style.gridTemplateColumns=columns;
 grid.dataset.dsColumns=String(count);
};

const observeCatalogFit=(element:HTMLElement,fit:()=>void)=>{
 let pending=false;
 const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;fit();});};
 new ResizeObserver(schedule).observe(element);
 document.fonts.ready.then(schedule);
};

// Icons size specimens reflow first and share one scale across the complete row.
const iconSizes=document.querySelector<HTMLElement>('.ds-icons-sizes');
if(iconSizes){
 const fitIconSizes=()=>{
  const arts=[...iconSizes.querySelectorAll<HTMLElement>('.ds-icons-size-art')];
  if(!iconSizes.clientWidth)return;
  const required=Math.max(...arts.map(art=>{const stage=getComputedStyle(art.parentElement!),card=getComputedStyle(art.closest('.ds-icons-card')!),css=getComputedStyle(art),widths=[...art.children].map(child=>(child as HTMLElement).offsetWidth),width=css.flexDirection==='column'?Math.max(...widths):widths.reduce((sum,width)=>sum+width,0)+parseFloat(css.columnGap)*(widths.length-1);return width+parseFloat(stage.paddingLeft)+parseFloat(stage.paddingRight)+parseFloat(card.paddingLeft)+parseFloat(card.paddingRight);}));
  fitCatalogColumns(iconSizes,innerWidth<768?1:2,required);
  const scale=Math.min(1,...arts.map(art=>{const stage=art.parentElement!,css=getComputedStyle(stage);return (stage.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight))/art.offsetWidth;}));
  iconSizes.style.setProperty('--ds-icons-row-scale',String(scale));
 };
 observeCatalogFit(iconSizes,fitIconSizes);
}

const strokeCards=document.querySelector<HTMLElement>('.ds-stroke-cards');
if(strokeCards){
 const fitStrokeCards=()=>{
  if(!strokeCards.clientWidth)return;
  const required=Math.max(...[...strokeCards.querySelectorAll<HTMLElement>('.ds-stroke-sample > .button')].map(button=>{const card=getComputedStyle(button.closest('.ds-stroke-card')!);return button.offsetWidth+parseFloat(card.paddingLeft)+parseFloat(card.paddingRight);}));
  fitCatalogColumns(strokeCards,innerWidth<768?1:innerWidth<1100?2:4,required);
 };
 observeCatalogFit(strokeCards,fitStrokeCards);
}

// Interface pictures keep four fixed slots; only the surrounding cards may reflow.
const iconGroups=document.querySelector<HTMLElement>('.ds-icons-groups');
if(iconGroups){
 const fitIconCards=()=>{
  if(!iconGroups.clientWidth)return;
  const css=getComputedStyle(iconGroups),token=(name:string)=>parseFloat(css.getPropertyValue(name));
  const minimum=token('--control-icon'),maximum=token('--space-16');
  const grid=iconGroups.querySelector<HTMLElement>('.ds-icons-grid')!,card=grid.closest<HTMLElement>('.ds-icons-card')!;
  const cardCSS=getComputedStyle(card),padding=parseFloat(cardCSS.paddingLeft)+parseFloat(cardCSS.paddingRight);
  const gap=innerWidth<768?token('--space-1'):token('--space-2');
  const labels=[...iconGroups.querySelectorAll<HTMLElement>('.ds-icon-name')];
  const labelWidth=Math.max(...labels.map(label=>label.getBoundingClientRect().width));
  fitCatalogColumns(iconGroups,innerWidth<768?1:innerWidth<1100?2:3,4*Math.max(minimum,labelWidth-gap)+3*gap+padding);
  const room=grid.getBoundingClientRect().width;
  // Use the existing half-space only when it lets four full-size phone pictures fit.
  const tileGap=innerWidth<768&&room>=4*maximum+3*gap/2?gap/2:gap;
  const size=Math.max(minimum,Math.min(maximum,(room-3*tileGap)/4));
  iconGroups.style.setProperty('--ds-icon-tile-size',`${size}px`);
  iconGroups.style.setProperty('--ds-icon-tile-gap',`${tileGap}px`);
 };
 observeCatalogFit(iconGroups,fitIconCards);
}

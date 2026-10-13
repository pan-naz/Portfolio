history.scrollRestoration='manual';
const views=[...document.querySelectorAll<HTMLElement>('[data-ds-view]')];
const links=[...document.querySelectorAll<HTMLAnchorElement>('[data-ds-nav]')];
const contents=document.querySelector<HTMLDetailsElement>('[data-ds-contents]');
const wide=matchMedia('(min-width:1100px)');
const syncMenu=()=>{if(contents)contents.open=wide.matches;};syncMenu();wide.addEventListener('change',syncMenu);
document.documentElement.dataset.docNavigationReady='true';

// Show the actual website pill state, and pin its real phone typography when
// the small specimen is viewed in a desktop catalog. No private size value.
const phoneFilterFont=(rules:CSSRuleList,phone=false):string=>{
 for(const rule of rules){
  if(rule instanceof CSSStyleRule&&phone&&rule.selectorText.includes('.section-navigation--compact .navigation-item'))return rule.style.getPropertyValue('font-size');
  if('cssRules' in rule){const value=phoneFilterFont((rule as CSSGroupingRule).cssRules,phone||(rule instanceof CSSMediaRule&&/(?:max-width[^)]*|width\s*<=\s*)380px/.test(rule.conditionText)));if(value)return value;}
 }
 return '';
};
const smallFilterFont=[...document.styleSheets].map(sheet=>{try{return phoneFilterFont(sheet.cssRules);}catch{return '';}}).find(Boolean);
for(const specimen of document.querySelectorAll<HTMLElement>('[data-ds-pill]')){
 const nav=specimen.querySelector<HTMLElement>('.section-navigation')!;
 if(specimen.hasAttribute('data-ds-phone-filter')){
  if(!smallFilterFont)throw Error('Missing shared phone-filter typography rule');
  nav.dataset.themeFit='false';
  nav.querySelectorAll<HTMLElement>('.navigation-item').forEach(item=>item.style.fontSize=smallFilterFont);
 }
}

// Preserve genuine shared typography while removing specimen heading semantics.
// Replacement selectors and declarations come from the loaded shared CSSOM.
const headingSelector=(selector:string)=>selector.replace(/(^|[^\w-])h([1-6])\b/g,'$1:is(h$2,:where([data-ds-heading="$2"]))');
const splitSelectors=(text:string)=>{const parts:string[]=[];let depth=0,start=0,quote='';for(let i=0;i<text.length;i++){const char=text[i];if(char==='\\'){i++;continue;}if(quote){if(char===quote)quote='';continue;}if(char==='"'||char==="'"){quote=char;continue;}if(char==='('||char==='[')depth++;if(char===')'||char===']')depth--;if(char===','&&depth===0){parts.push(text.slice(start,i));start=i+1;}}parts.push(text.slice(start));return parts;};
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
const selectView=()=>{
 const id=location.hash.slice(1)||'dashboard';const selected=views.find(view=>view.id===id)||views.find(view=>view.id==='dashboard')!;
 for(const view of views)view.hidden=view!==selected;
 for(const link of links){if(selected.id!=='dashboard'&&link.hash===`#${selected.id}`)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
 document.querySelector('[data-ds-title]')!.textContent=selected.dataset.title!;
 document.querySelector('[data-ds-group]')!.textContent=selected.dataset.group!;
 document.querySelector<HTMLElement>('[data-ds-breadcrumb]')!.hidden=selected.id==='dashboard';
 document.querySelector('[data-ds-description]')!.textContent=selected.dataset.description!;
 refreshMarkup(selected);refreshValues();if(contents&&!wide.matches)contents.open=false;
 scrollTo({top:0,left:0,behavior:'instant'});
 requestAnimationFrame(()=>requestAnimationFrame(()=>scrollTo({top:0,left:0,behavior:'instant'})));
};
window.addEventListener('hashchange',selectView);window.addEventListener('popstate',selectView);
links.forEach(link=>link.addEventListener('click',event=>{event.preventDefault();if(link.hash!==location.hash)history.pushState(null,'',link.hash);selectView();}));
for(const tabset of document.querySelectorAll<HTMLElement>('[data-ds-tabset]')){
 const tabs=[...tabset.querySelectorAll<HTMLButtonElement>('[role=tab]')];
 const select=(index:number,focus=false)=>{tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;document.getElementById(tab.getAttribute('aria-controls')!)!.hidden=i!==index;});if(focus)tabs[index].focus();};
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>{select(index);const view=tab.closest<HTMLElement>('[data-ds-view]');if(view)refreshMarkup(view);});tab.addEventListener('keydown',event=>{const next=event.key==='ArrowRight'?(index+1)%tabs.length:event.key==='ArrowLeft'?(index+tabs.length-1)%tabs.length:event.key==='Home'?0:event.key==='End'?tabs.length-1:undefined;if(next!==undefined){event.preventDefault();select(next,true);}});});
}
document.querySelector('[data-ds-dashboard-link]')?.addEventListener('click',event=>{event.preventDefault();history.pushState(null,'',location.pathname);selectView();});
for(const toggle of document.querySelectorAll<HTMLButtonElement>('[data-ds-names]'))toggle.addEventListener('click',()=>{const on=toggle.getAttribute('aria-checked')!=='true';toggle.setAttribute('aria-checked',String(on));toggle.closest<HTMLElement>('[data-ds-view]')!.dataset.showNames=String(on);});
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
 for(const node of view.querySelectorAll<HTMLElement>('[data-ds-human-token]')){
  const name=node.dataset.dsHumanToken!,raw=getComputedStyle(document.documentElement).getPropertyValue('--'+name).trim();
  if(/^(color-|control-border|focus-ring|backdrop)/.test(name)){probe.style.backgroundColor=`var(--${name})`;node.textContent=hex(getComputedStyle(probe).backgroundColor);}
  else if(/^(duration-|ease-|scale-)/.test(name))node.textContent=raw;
  else if(name.startsWith('icon-stroke-'))node.textContent=parseFloat(raw)+'px';
  else {probe.style.width=`var(--${name})`;node.textContent=getComputedStyle(probe).width;}
 }
 for(const node of view.querySelectorAll<HTMLElement>('[data-ds-token-swatch]')){const name=node.dataset.dsTokenSwatch!;if(name.startsWith('color-')){node.style.backgroundColor=`var(--${name})`;node.dataset.color='';}}
 probe.remove();
 for(const grid of view.querySelectorAll<HTMLElement>('[data-ds-grid]')){const computed=getComputedStyle(grid),count=computed.gridTemplateColumns.split(' ').length;view.querySelector('[data-ds-grid-spec="'+grid.dataset.dsGrid+'"]')!.textContent=`${count} columns here · ${computed.gap} gap`;}
 const namedWeights:Record<string,string>={'400':'Regular','500':'Medium','600':'Semibold'};
 for(const node of view.querySelectorAll<HTMLElement>('[data-ds-measure]')){
  const sample=view.querySelector<HTMLElement>('.ds-specimens '+node.dataset.dsMeasure);if(!sample)continue;
  const computed=getComputedStyle(sample);node.textContent=node.dataset.properties!.split(',').map(property=>{const value=computed.getPropertyValue(property).trim();return property==='font-weight'?namedWeights[value]||value:readable(value);}).join(' · ');
 }
 for(const row of view.querySelectorAll<HTMLElement>('[data-ds-type]')){const sample=row.querySelector<HTMLElement>('.ds-type-sample > *')!,computed=getComputedStyle(sample);row.querySelector('[data-ds-type-metrics]')!.textContent=`Line height ${readable(computed.lineHeight)} · tracking ${computed.letterSpacing==='normal'?'0px':readable(computed.letterSpacing)}`;}
};
window.addEventListener('resize',refreshValues);window.addEventListener('themechange',refreshValues);selectView();

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

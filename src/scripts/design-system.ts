history.scrollRestoration='manual';
const views=[...document.querySelectorAll<HTMLElement>('[data-ds-view]')];
const links=[...document.querySelectorAll<HTMLAnchorElement>('.ds-navigation a')];
const contents=document.querySelector<HTMLDetailsElement>('[data-ds-contents]');
const wide=matchMedia('(min-width:1100px)');
const syncMenu=()=>{if(contents)contents.open=wide.matches;};syncMenu();wide.addEventListener('change',syncMenu);
document.documentElement.dataset.docNavigationReady='true';

// Preserve genuine shared typography while removing specimen heading semantics.
// Replacement selectors and declarations come from the loaded shared CSSOM.
const headingSelector=(selector:string)=>selector.replace(/(^|[^\w-])h([1-6])\b/g,'$1[data-ds-heading="$2"]');
const headingRules=(rules:CSSRuleList):string=>[...rules].map(rule=>{
 if(rule instanceof CSSStyleRule){const selector=headingSelector(rule.selectorText);return selector===rule.selectorText?'':selector.split(',').map(part=>`:where(.ds-specimens) :is(${part.trim()})`).join(',')+`{${rule.style.cssText}}`;}
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
 const id=location.hash.slice(1)||'color';const selected=views.find(view=>view.id===id)||views[0];
 for(const view of views)view.hidden=view!==selected;
 for(const link of links){if(link.hash===`#${selected.id}`)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}
 document.querySelector('[data-ds-title]')!.textContent=selected.dataset.title!;
 document.querySelector('[data-ds-group]')!.textContent=selected.dataset.group!;
 document.querySelector('[data-ds-description]')!.textContent=selected.dataset.description!;
 refreshMarkup(selected);if(contents&&!wide.matches)contents.open=false;
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
for(const preview of document.querySelectorAll<HTMLElement>('.ds-specimens')){
 const blockLink=(event:Event)=>{if((event.target as Element).closest('a')){event.preventDefault();event.stopImmediatePropagation();}};
 for(const event of ['click','auxclick','contextmenu','dragstart'])preview.addEventListener(event,blockLink,{capture:true});
 preview.addEventListener('click',event=>{
  const target=(event.target as Element).closest<HTMLElement>('[data-work-filter],[data-ds-comparison-choice]');if(!target)return;
  const comparison=target.hasAttribute('data-ds-comparison-choice');
  const scope=target.closest('.section-filter')||preview;
  scope.querySelectorAll<HTMLElement>(comparison?'[data-ds-comparison-choice]':'[data-work-filter]').forEach(button=>{const active=button===target;button.setAttribute('aria-pressed',String(active));if(comparison){button.classList.toggle('button--primary',active);button.classList.toggle('button--secondary',!active);}});
 });
}
const syncSpecimenChoice=()=>{document.querySelector('#theme-switch .skill-tag')?.replaceChildren(document.documentElement.dataset.theme==='dark'?'Dark':'Light');};
window.addEventListener('themechange',syncSpecimenChoice);syncSpecimenChoice();selectView();

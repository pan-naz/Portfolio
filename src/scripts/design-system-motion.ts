import {readMotionToken,revealEffects} from './native-motion';
import {easeSectionScroll} from './motion';
import {stepTiltSpring} from './project-tilt';
const root=document.querySelector<HTMLElement>('[data-motion-catalog]');
if(root){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 let speed=1;
 const controllers:{pause:()=>void;resume:()=>void;finish:()=>void;rate:()=>void}[]=[];
 for(const card of root.querySelectorAll<HTMLElement>('[data-motion-card]')){
  const demo=card.querySelector<HTMLElement>('[data-motion-demo]'),button=card.querySelector<HTMLButtonElement>('[data-motion-replay]');if(!demo||!button)continue;
  const art=demo.querySelector<HTMLElement>('.ds-motion-art')!,id=card.dataset.motionCard!,name=card.dataset.motionName!;
  const css=()=>getComputedStyle(card),number=(name:string)=>readMotionToken(css(),'--'+name),curve=(name:string)=>css().getPropertyValue('--'+name).trim();
  const find=(selector:string)=>art.querySelector<HTMLElement>(selector)!;
  let animations:Animation[]=[],clock:Animation|undefined,frame=0,state:'idle'|'playing'|'paused'|'ended'='idle';
  let scrollUpdate:((progress:number)=>void)|undefined,total=0,pointerFocus=false;
  const cleanup=()=>{cancelAnimationFrame(frame);animations.forEach(a=>a.cancel());animations=[];clock=undefined;scrollUpdate=undefined;};
  const add=(element:Element,frames:Keyframe[],duration:number,easing:string,delay=0,pseudoElement?:string)=>{
   const animation=new Animation(new KeyframeEffect(element,frames,{duration,easing,delay,fill:'both',...(pseudoElement?{pseudoElement}:{})}),document.timeline);
   animation.pause();animation.currentTime=0;animation.playbackRate=speed;animations.push(animation);total=Math.max(total,delay+duration);return animation;
  };
  const tween=(element:Element,frames:Keyframe[],duration:string,easing:string,delay=0)=>add(element,frames,number(duration),curve(easing),delay);
  const build=()=>{
   cleanup();total=0;
   if(id==='logo'){
    find('[data-logo-rest]').style.visibility='hidden';find('[data-logo-glyphs]').style.visibility='visible';
    const letters=[...art.querySelectorAll<SVGElement>('[data-logo-letter]')],duration=number('duration-logo-wave'),stagger=number('stagger-title-reveal');
    const peak=`translateY(${-number('distance-icon-shift')}px) scale(${number('scale-logo-wave')})`;
    letters.forEach((letter,i)=>{add(letter,[{transform:'translateY(0) scale(1)'},{transform:peak}],duration,curve('ease-spring-wave'),i*stagger);add(letter,[{transform:peak},{transform:'translateY(0) scale(1)'}],duration,curve('ease-spring-wave'),duration+(letters.length-1)*stagger).effect!.updateTiming({fill:'forwards'});});
   }else if(id==='button'){
    const target=find('.button'),duration=number('duration-button-fill'),easing=curve('ease-button-fill');
    add(target,[{clipPath:getComputedStyle(target,'::before').clipPath},{clipPath:`inset(0 0 0 0 round ${css().getPropertyValue('--radius-full')})`}],duration,easing,0,'::before');
    const label=find('.button-fill-label');add(label,[{color:'var(--color-text-on-primary)'},{color:'var(--color-text-primary)'}],duration,easing);
    const incoming=find('.button-arrow-icon--in'),outgoing=find('.button-arrow-icon--out');
    add(incoming,[{opacity:0,transform:getComputedStyle(incoming).transform},{opacity:1,transform:'translate(0,0) scale(1)'}],duration,easing);
    add(outgoing,[{opacity:1,transform:getComputedStyle(outgoing).transform},{opacity:0,transform:`translate(${getComputedStyle(target).getPropertyValue('--button-arrow-exit-x')},${getComputedStyle(target).getPropertyValue('--button-arrow-exit-y')}) scale(${number('scale-button-arrow-start')})`}],duration,easing);
   }else if(id==='arrow')tween(find('.icon'),[{transform:'translateX(0)'},{transform:`translateX(${number('distance-icon-shift')}px)`}],'duration-fast','ease-out');
   else if(id==='tooltip'){
    tween(find('.tooltip'),[{opacity:0},{opacity:1}],'duration-tooltip-opacity','ease-entrance');
    tween(find('.tooltip'),[{transform:`scale(${number('scale-tooltip-start')})`},{transform:'scale(1)'}],'duration-tooltip-scale','ease-entrance');
   }else if(id==='theme')tween(find('.theme-icon-glyph'),[{transform:'rotate(0deg)'},{transform:`rotate(${number('rotation-icon-turn')}deg)`}],'duration-toggle-enter','ease-toggle-rotation');
   else if(id==='tilt'){
    const perspective=number('project-tilt-perspective'),angle=number('project-tilt-angle');
    // Sample the real pointer spring at its normal reference rate, then let
    // the local native clock handle playback-rate changes and pause/resume.
    const spring={value:0,velocity:0,target:angle},samples=[0],hz=60;
    while(spring.value!==spring.target||spring.velocity!==0){stepTiltSpring(spring,1/hz);samples.push(spring.value);}
    add(find('.ds-motion-tilt'),samples.map((value,index)=>({offset:index/(samples.length-1),transform:`perspective(${perspective}px) rotateX(${value}deg) rotateY(${-value}deg)`})),(samples.length-1)*1000/hz,curve('ease-linear'));
   }else if(id==='project'){
    const panel=find('[data-motion-panel]'),caption=find('[data-motion-caption]'),ratio=caption.getBoundingClientRect().width/panel.getBoundingClientRect().width;
    tween(panel,[{transform:`scale(${ratio})`,transformOrigin:'left bottom'},{transform:'scale(1)',transformOrigin:'left bottom'}],'duration-case-open','ease-case-travel');
    tween(panel,[{borderRadius:css().getPropertyValue('--radius-large')},{borderRadius:css().getPropertyValue('--radius-medium')}],'duration-case-radius','ease-in-out');
    tween(caption,[{opacity:1},{opacity:0}],'duration-case-caption-exit','ease-entrance');
    tween(caption,[{opacity:0},{opacity:1}],'duration-case-caption-enter','ease-entrance',number('delay-case-caption-enter'));
    tween(find('[data-motion-artwork]'),[{opacity:0,transform:`translateY(${number('distance-case-copy')}px)`},{opacity:1,transform:'translateY(0)'}],'duration-case-body-enter','ease-entrance',number('delay-case-body-enter'));
   }else if(id==='header'){
    const pill=find('.ds-motion-header'),ratio=number('control-height')/pill.getBoundingClientRect().width;
    tween(pill,[{transform:`scaleX(${ratio})`},{transform:'scaleX(1)'}],'duration-header-enter','ease-header-pill');
   }else if(id==='text'){
    for(const effect of revealEffects([...art.querySelectorAll<HTMLElement>('[data-motion-letter]')],{duration:number('duration-title-reveal'),distance:number('distance-title-reveal'),stagger:number('stagger-title-reveal'),easing:curve('ease-entrance')}))add(effect.element,effect.keyframes,effect.duration,effect.easing,effect.delay);
   }else if(id==='role'){
    tween(find('[data-motion-old-role]'),[{opacity:1},{opacity:0}],'duration-role-exit','ease-role-swap',number('duration-role-hold'));
    for(const effect of revealEffects([...art.querySelectorAll<HTMLElement>('[data-motion-role-letter]')],{duration:number('duration-title-reveal'),distance:number('distance-title-reveal'),stagger:number('stagger-title-reveal'),delay:number('duration-role-hold')+number('duration-role-exit'),easing:curve('ease-entrance')}))add(effect.element,effect.keyframes,effect.duration,effect.easing,effect.delay);
   }else if(id==='filter'){
    tween(find('.ds-motion-filter'),[{gap:css().getPropertyValue('--space-2')},{gap:css().getPropertyValue('--space-4')}],'duration-filter-layout','ease-filter-enter');
    art.querySelectorAll<HTMLElement>('[data-motion-filter-item]').forEach(element=>{
     tween(element,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:`scale(${number('scale-filter-exit')})`}],'duration-filter-exit','ease-in');
     tween(element,[{opacity:0,transform:`translateY(${number('distance-filter-enter')}px) scale(${number('scale-filter')})`},{opacity:1,transform:'translateY(0) scale(1)'}],'duration-filter-enter','ease-filter-enter',number('delay-filter-enter')).effect!.updateTiming({fill:'forwards'});
    });
   }else if(id==='skills')tween(find('[data-motion-skill-track]'),[{transform:'translateY(0)'},{transform:'translateY(-50%)'}],'duration-skills-loop','ease-linear');
   else if(id==='scroll'){
    total=number('duration-section-scroll');scrollUpdate=progress=>{const y=easeSectionScroll(progress)*number('space-12');find('[data-motion-scroll-content]').style.transform=`translateY(${-y}px)`;find('[data-motion-scroll-thumb]').style.transform=`translateY(${y}px)`;};
   }
   const axis=card.querySelector<HTMLElement>('[data-motion-timeline]');if(axis)total=Math.max(total,Number(axis.dataset.motionEnd));
   clock=add(art,[{opacity:1},{opacity:1}],total,curve('ease-linear'));
  };
  const progress=()=>{
   const elapsed=Math.min(total,Number(clock?.currentTime)||0),fraction=total?elapsed/total:1;
   card.style.setProperty('--motion-progress',String(fraction));scrollUpdate?.(fraction);
   const timeline=card.querySelector<HTMLElement>('[data-motion-timeline]'),head=card.querySelector<HTMLElement>('[data-motion-playhead]');
   if(timeline&&head){
    const track=timeline.querySelector<HTMLElement>('.ds-motion-track')!,axis=timeline.querySelector<HTMLElement>('.ds-motion-axis > div')!,rect=track.getBoundingClientRect(),base=timeline.getBoundingClientRect(),end=Number(timeline.dataset.motionEnd),x=Math.min(elapsed/end,1)*rect.width;
    head.hidden=state==='idle'||state==='ended';head.style.left=`${rect.left-base.left+x}px`;
    head.querySelector('[data-motion-time]')!.textContent=Math.round(elapsed)+'ms';
    const label=head.querySelector('span')!.getBoundingClientRect();axis.querySelectorAll<HTMLElement>('span').forEach(tick=>{const r=tick.getBoundingClientRect();tick.style.visibility=!head.hidden&&r.right>=label.left&&r.left<=label.right?'hidden':'';});
   }
   if(state==='playing')frame=requestAnimationFrame(progress);
  };
  const renderState=()=>{card.toggleAttribute('data-motion-playing',state==='playing');card.toggleAttribute('data-motion-paused',state==='paused');button.setAttribute('aria-label',`${state==='playing'?'Pause':'Play'} ${name}`);};
  const finish=()=>{if(clock)clock.onfinish=null;cancelAnimationFrame(frame);animations.forEach(a=>{a.pause();a.currentTime=Number(a.effect!.getComputedTiming().endTime);});if(id==='logo'){find('[data-logo-rest]').style.visibility='visible';find('[data-logo-glyphs]').style.visibility='hidden';}state='ended';renderState();progress();};
  const resume=()=>{
   if(reduced.matches)return;state='playing';renderState();
   for(const a of animations){a.updatePlaybackRate(speed);if(Number(a.currentTime)<Number(a.effect!.getComputedTiming().endTime))a.play();}
   clock!.onfinish=finish;progress();
  };
  const play=()=>{if(reduced.matches)return;build();resume();};
  const pause=()=>{if(state!=='playing')return;state='paused';animations.forEach(a=>a.pause());cancelAnimationFrame(frame);renderState();progress();};
  button.addEventListener('pointerdown',()=>{pointerFocus=true;});
  button.addEventListener('focus',()=>{if(!pointerFocus&&button.matches(':focus-visible'))play();});
  button.addEventListener('blur',()=>{pointerFocus=false;});
  button.addEventListener('click',event=>{event.stopPropagation();pointerFocus=false;if(state==='playing')pause();else if(state==='paused')resume();else play();});
  demo.addEventListener('pointerenter',event=>{if(fine.matches&&!button.contains(document.elementFromPoint(event.clientX,event.clientY))&&(state==='idle'||state==='ended'))play();});
  demo.addEventListener('click',event=>{if(!(event.target as Element).closest('[data-motion-replay]'))play();});
  const rate=()=>{animations.forEach(a=>a.updatePlaybackRate(speed));};
  const syncReduced=()=>{if(reduced.matches){if(!root.closest<HTMLElement>('[data-ds-view]')!.hidden){build();finish();}}else{cleanup();state='idle';renderState();card.style.removeProperty('--motion-progress');}};
  reduced.addEventListener('change',syncReduced);syncReduced();controllers.push({pause,resume,finish:()=>{build();finish();},rate});
 }
 for(const choice of document.querySelectorAll<HTMLButtonElement>('[data-motion-speed]'))choice.addEventListener('click',()=>{
  speed=Number(choice.dataset.motionSpeed);document.querySelectorAll('[data-motion-speed]').forEach(node=>node.setAttribute('aria-pressed',String(node===choice)));controllers.forEach(controller=>controller.rate());
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)controllers.forEach(controller=>controller.pause());});
 new MutationObserver(()=>{if(root.closest<HTMLElement>('[data-ds-view]')!.hidden)controllers.forEach(controller=>controller.pause());else if(reduced.matches)controllers.forEach(controller=>controller.finish());}).observe(root.closest('[data-ds-view]')!,{attributes:true,attributeFilter:['hidden']});
}

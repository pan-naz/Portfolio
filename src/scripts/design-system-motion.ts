import {readMotionToken,revealEffects} from './native-motion';
import {stepTiltSpring} from './project-tilt';
const root=document.querySelector<HTMLElement>('[data-motion-catalog]');
if(root){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sourceCurves:Record<string,string>=JSON.parse(root.dataset.motionSourceCurves!);
 let speed=1;
 const controllers:{pause:()=>void;resume:()=>void;finish:()=>void;rate:()=>void}[]=[];
 for(const card of root.querySelectorAll<HTMLElement>('[data-motion-card]')){
  const demo=card.querySelector<HTMLElement>('[data-motion-demo]'),button=card.querySelector<HTMLButtonElement>('[data-motion-replay]');if(!demo||!button)continue;
  const art=demo.querySelector<HTMLElement>('.ds-motion-art')!,id=card.dataset.motionCard!,name=card.dataset.motionName!;
  const css=()=>getComputedStyle(card),number=(name:string)=>readMotionToken(css(),'--'+name),curve=(name:string)=>css().getPropertyValue('--'+name).trim();
  const sourceCurve=(step:string)=>curve(sourceCurves[step]);
  const find=(selector:string)=>art.querySelector<HTMLElement>(selector)!;
  let animations:Animation[]=[],clock:Animation|undefined,frame=0,state:'idle'|'playing'|'paused'|'ended'='idle';
  let total=0;
  const cleanup=()=>{cancelAnimationFrame(frame);animations.forEach(a=>a.cancel());animations=[];clock=undefined;};
  const add=(element:Element,frames:Keyframe[],duration:number,easing:string,delay=0,pseudoElement?:string)=>{
   const animation=new Animation(new KeyframeEffect(element,frames,{duration,easing,delay,fill:'both',...(pseudoElement?{pseudoElement}:{})}),document.timeline);
   animation.pause();animation.currentTime=0;animation.playbackRate=speed;animations.push(animation);total=Math.max(total,delay+duration);return animation;
  };
  const tween=(element:Element,frames:Keyframe[],duration:string,easing:string,delay=0)=>add(element,frames,number(duration),sourceCurve(easing),delay);
  const build=()=>{
   cleanup();total=0;
   if(id==='logo'){
    find('[data-logo-rest]').style.visibility='hidden';find('[data-logo-glyphs]').style.visibility='visible';
    const letters=[...art.querySelectorAll<SVGElement>('[data-logo-letter]')],duration=number('duration-logo-wave'),stagger=number('stagger-title-reveal');
    const peak=`translateY(${-number('distance-icon-shift')}px) scale(${number('scale-logo-wave')})`;
    letters.forEach((letter,i)=>{add(letter,[{transform:'translateY(0) scale(1)'},{transform:peak}],duration,sourceCurve('logo'),i*stagger);add(letter,[{transform:peak},{transform:'translateY(0) scale(1)'}],duration,sourceCurve('logo'),duration+(letters.length-1)*stagger).effect!.updateTiming({fill:'forwards'});});
   }else if(id==='button'){
    const target=find('.button'),duration=number('duration-button-fill'),easing=sourceCurve('button');
    add(target,[{clipPath:getComputedStyle(target,'::before').clipPath},{clipPath:`inset(0 0 0 0 round ${css().getPropertyValue('--radius-full')})`}],duration,easing,0,'::before');
    const label=find('.button-fill-label');add(label,[{color:'var(--color-text-on-primary)'},{color:'var(--color-text-primary)'}],duration,easing);
    const incoming=find('.button-arrow-icon--in'),outgoing=find('.button-arrow-icon--out');
    add(incoming,[{opacity:0,transform:getComputedStyle(incoming).transform},{opacity:1,transform:'translate(0,0) scale(1)'}],duration,easing);
    add(outgoing,[{opacity:1,transform:getComputedStyle(outgoing).transform},{opacity:0,transform:`translate(${getComputedStyle(target).getPropertyValue('--button-arrow-exit-x')},${getComputedStyle(target).getPropertyValue('--button-arrow-exit-y')}) scale(${number('scale-button-arrow-start')})`}],duration,easing);
   }else if(id==='arrow')tween(find('.icon'),[{transform:'translateX(0)'},{transform:`translateX(${number('distance-icon-shift')}px)`}],'duration-fast','arrow');
   else if(id==='tooltip'){
    tween(find('.tooltip'),[{opacity:0},{opacity:1}],'duration-tooltip-opacity','tooltip');
    tween(find('.tooltip'),[{transform:`scale(${number('scale-tooltip-start')})`},{transform:'scale(1)'}],'duration-tooltip-scale','tooltip');
   }else if(id==='theme')tween(find('.theme-icon-glyph'),[{transform:'rotate(0deg)'},{transform:`rotate(${number('rotation-icon-turn')}deg)`}],'duration-toggle-enter','theme');
   else if(id==='tilt'){
    const perspective=number('project-tilt-perspective'),angle=number('project-tilt-angle');
    // Sample the real pointer spring at its normal reference rate, then let
    // the local native clock handle playback-rate changes and pause/resume.
    const spring={value:0,velocity:0,target:angle},samples=[0],hz=60;
    while(spring.value!==spring.target||spring.velocity!==0){stepTiltSpring(spring,1/hz);samples.push(spring.value);}
    add(find('.ds-motion-tilt'),samples.map((value,index)=>({offset:index/(samples.length-1),transform:`perspective(${perspective}px) rotateX(${value}deg) rotateY(${-value}deg)`})),(samples.length-1)*1000/hz,sourceCurve('skills'));
   }else if(id==='project'){
    const panel=find('[data-motion-panel]'),caption=find('[data-motion-caption]'),ratio=caption.getBoundingClientRect().width/panel.getBoundingClientRect().width;
    tween(panel,[{transform:`scale(${ratio})`,transformOrigin:'left bottom'},{transform:'scale(1)',transformOrigin:'left bottom'}],'duration-case-open','travel');
    tween(panel,[{borderRadius:css().getPropertyValue('--radius-large')},{borderRadius:css().getPropertyValue('--radius-medium')}],'duration-case-radius','radius');
    tween(caption,[{opacity:1},{opacity:0}],'duration-case-caption-exit','travel');
    tween(caption,[{opacity:0},{opacity:1}],'duration-case-caption-enter','travel',number('delay-case-caption-enter'));
    tween(find('[data-motion-artwork]'),[{opacity:0,transform:`translateY(${number('distance-case-copy')}px)`},{opacity:1,transform:'translateY(0)'}],'duration-case-body-enter','travel',number('delay-case-body-enter'));
   }else if(id==='header'){
    const pill=find('.ds-motion-header'),items=find('[data-motion-header-items]');
    const compact=number('control-height'),full=pill.getBoundingClientRect().width;
    const enter=number('duration-header-enter'),hold=number('duration-layout'),fade=number('duration-fast');
    add(pill,[{width:`${compact}px`},{width:`${full}px`}],enter,sourceCurve('header'));
    add(items,[{opacity:0},{opacity:1}],fade,sourceCurve('header'),enter-fade);
    tween(pill,[{width:`${full}px`},{width:`${compact}px`}],'duration-header-exit','header',enter+hold).effect!.updateTiming({fill:'forwards'});
    add(items,[{opacity:1},{opacity:0}],fade,sourceCurve('header'),enter+hold).effect!.updateTiming({fill:'forwards'});
   }else if(id==='text'){
    for(const effect of revealEffects([...art.querySelectorAll<HTMLElement>('[data-motion-letter]')],{duration:number('duration-title-reveal'),distance:number('distance-title-reveal'),stagger:number('stagger-title-reveal'),easing:sourceCurve('entrance')}))add(effect.element,effect.keyframes,effect.duration,effect.easing,effect.delay);
   }else if(id==='role'){
    tween(find('[data-motion-old-role]'),[{opacity:1},{opacity:0}],'duration-role-exit','role',number('duration-role-hold'));
    for(const effect of revealEffects([...art.querySelectorAll<HTMLElement>('[data-motion-role-letter]')],{duration:number('duration-title-reveal'),distance:number('distance-title-reveal'),stagger:number('stagger-title-reveal'),delay:number('duration-role-hold')+number('duration-role-exit'),easing:sourceCurve('entrance')}))add(effect.element,effect.keyframes,effect.duration,effect.easing,effect.delay);
   }else if(id==='filter'){
    const items=[...art.querySelectorAll<HTMLElement>('[data-motion-filter-item]')];
    const row=items[2].offsetTop-items[0].offsetTop;
    for(const item of items.slice(0,2))tween(item,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:`scale(${number('scale-filter-exit')})`}],'duration-filter-exit','filterOut');
    for(const item of items.slice(2,4))tween(item,[{transform:'translateY(0)'},{transform:`translateY(${-row}px)`}],'duration-filter-layout','filterIn');
    for(const item of items.slice(4))tween(item,[{opacity:0,transform:`translateY(${number('distance-filter-enter')}px) scale(${number('scale-filter')})`},{opacity:1,transform:'translateY(0) scale(1)'}],'duration-filter-enter','filterIn',number('delay-filter-enter'));
    const navigation=[...art.querySelectorAll<HTMLElement>('.navigation-item')];
    navigation.forEach((item,index)=>item.setAttribute('aria-pressed',String(index===0)));
    navigation.forEach((item,index)=>{
     const dot=item.querySelector('.navigation-item-indicator')!,label=item.querySelector('.navigation-item-label')!,shift=readMotionToken(getComputedStyle(item),'--navigation-item-shift'),distance=number('distance-navigation-dot');
     const active={opacity:1,transform:'translate3d(0,-50%,0) scale(1)'},inactive={opacity:0,transform:`translate3d(${-distance}px,-50%,0) scale(0)`};
     tween(dot,index?[inactive,active]:[active,inactive],'duration-navigation','navigation');
     tween(label,[{transform:`translateX(${index?0:shift}px)`},{transform:`translateX(${index?shift:0}px)`}],'duration-navigation','navigation');
    });
   }else if(id==='skills'){
    const track=find('[data-motion-skill-track]'),chips=[...track.children] as HTMLElement[],distance=chips[4].offsetTop-chips[0].offsetTop;
    tween(track,[{transform:'translateY(0)'},{transform:`translateY(${-distance}px)`}],'duration-skills-loop','skills');
   }
   const axis=card.querySelector<HTMLElement>('[data-motion-timeline]');if(axis)total=Math.max(total,Number(axis.dataset.motionEnd));
   clock=add(art,[{opacity:1},{opacity:1}],total,sourceCurve('skills'));
  };
  const progress=()=>{
   const elapsed=Math.min(total,Number(clock?.currentTime)||0),fraction=total?elapsed/total:1;
   card.style.setProperty('--motion-progress',String(fraction));
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
  const finish=()=>{if(clock)clock.onfinish=null;cancelAnimationFrame(frame);animations.forEach(a=>{a.pause();a.currentTime=Number(a.effect!.getComputedTiming().endTime);});if(id==='logo'){find('[data-logo-rest]').style.visibility='visible';find('[data-logo-glyphs]').style.visibility='hidden';}if(id==='filter')art.querySelectorAll('.navigation-item').forEach((item,index)=>item.setAttribute('aria-pressed',String(index===1)));state='ended';renderState();progress();};
  const resume=()=>{
   if(reduced.matches)return;state='playing';renderState();
   for(const a of animations){a.updatePlaybackRate(speed);if(Number(a.currentTime)<Number(a.effect!.getComputedTiming().endTime))a.play();}
   clock!.onfinish=finish;progress();
  };
  const play=()=>{if(reduced.matches)return;build();resume();};
  const pause=()=>{if(state!=='playing')return;state='paused';animations.forEach(a=>a.pause());cancelAnimationFrame(frame);renderState();progress();};
  // Native button activation covers click, Enter and Space; focus/hover/art never play.
  button.addEventListener('click',event=>{event.stopPropagation();if(state==='playing')pause();else if(state==='paused')resume();else play();});
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

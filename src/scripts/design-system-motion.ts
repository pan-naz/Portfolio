import {readMotionToken,revealEffects} from './native-motion';
import {stepTiltSpring} from './project-tilt';
import {roleRevealEffects} from './hero-role-transition';
const root=document.querySelector<HTMLElement>('[data-motion-catalog]');
if(root){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const sourceCurves:Record<string,string>=JSON.parse(root.dataset.motionSourceCurves!);
 let speed=1;
 const controllers:{pause:()=>void;resume:()=>void;finish:()=>void;rate:()=>void;prepare:()=>void}[]=[];
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
  // A later segment fills forwards only: it must never repaint an earlier segment.
  const after=(animation:Animation)=>{animation.effect!.updateTiming({fill:'forwards'});return animation;};
  const hold=()=>number('duration-layout');
  const roundTrip=(element:Element,frames:Keyframe[],duration:number,easing:string,pseudo?:string)=>{
   add(element,frames,duration,easing,0,pseudo);
   after(add(element,[...frames].reverse(),duration,easing,duration+hold(),pseudo));
  };
  let commitEnd=()=>{},roleIndex=0,filterIndex=0,themeAngle=0;
  const panel=find('[data-motion-panel]');
  if(panel)new ResizeObserver(()=>{if(panel.offsetWidth)art.style.setProperty('--motion-panel-ratio',String(find('[data-motion-caption]').offsetWidth/panel.offsetWidth));}).observe(art);
  const fitPill=()=>{
   const holder=art.querySelector<HTMLElement>('.ds-motion-filter-nav'),pill=holder?.querySelector<HTMLElement>('.section-navigation');if(!holder||!pill)return;
   const scale=Math.min(1,holder.clientWidth/pill.offsetWidth);pill.style.transform=`translateX(-50%) scale(${scale})`;holder.style.height=`${pill.offsetHeight*scale}px`;
  };
  if(id==='filter'){new ResizeObserver(fitPill).observe(art);fitPill();}
  const arrowParts=art.querySelector<HTMLElement>('.ds-motion-arrow-parts');if(arrowParts)new ResizeObserver(()=>{arrowParts.style.transform=`scale(${Math.min(1,(art.clientWidth-parseFloat(getComputedStyle(art).paddingLeft)*2)/arrowParts.offsetWidth)})`;}).observe(art);
  const build=()=>{
   cleanup();total=0;commitEnd=()=>{};
   if(id==='logo'){
    const letters=[...art.querySelectorAll<SVGElement>('[data-logo-letter]')],duration=number('duration-logo-wave'),stagger=number('stagger-title-reveal');
    const peak=`translateY(${-number('distance-icon-shift')}px) scale(${number('scale-logo-wave')})`;
    letters.forEach((letter,i)=>{add(letter,[{transform:'translateY(0) scale(1)'},{transform:peak}],duration,sourceCurve('logo'),i*stagger);after(add(letter,[{transform:peak},{transform:'translateY(0) scale(1)'}],duration,sourceCurve('logo'),duration+(letters.length-1)*stagger));});
   }else if(id==='button'){
    const target=find('.button'),duration=number('duration-button-fill'),easing=sourceCurve('button');
    roundTrip(target,[{clipPath:getComputedStyle(target,'::before').clipPath},{clipPath:`inset(0 0 0 0 round ${css().getPropertyValue('--radius-full')})`}],duration,easing,'::before');
    roundTrip(find('.button-fill-label'),[{color:'var(--color-text-on-primary)'},{color:'var(--color-text-primary)'}],duration,easing);
    const incoming=find('.button-arrow-icon--in'),outgoing=find('.button-arrow-icon--out');
    roundTrip(incoming,[{opacity:0,transform:getComputedStyle(incoming).transform},{opacity:1,transform:'translate(0,0) scale(1)'}],duration,easing);
    roundTrip(outgoing,[{opacity:1,transform:getComputedStyle(outgoing).transform},{opacity:0,transform:`translate(${getComputedStyle(target).getPropertyValue('--button-arrow-exit-x')},${getComputedStyle(target).getPropertyValue('--button-arrow-exit-y')}) scale(${number('scale-button-arrow-start')})`}],duration,easing);
   }else if(id==='arrow'){
    roundTrip(find('.arrow'),[{transform:'translateX(0)'},{transform:`translateX(${number('distance-icon-shift')}px)`}],number('duration-fast'),sourceCurve('arrow'));
    for(const layer of ['top','bottom'])roundTrip(find(`[data-icon-layer="${layer}"]`),[{transform:'translateY(0)'},{transform:`translateY(calc(${layer==='top'?-1:1} * var(--icon-layer-shift)))`}],number('duration-fast'),sourceCurve('arrow'));
   }else if(id==='tooltip'){
    const tip=find('.tooltip'),fade=number('duration-tooltip-opacity'),grow=number('duration-tooltip-scale'),enter=Math.max(fade,grow)+hold();
    tween(tip,[{opacity:1},{opacity:0}],'duration-tooltip-opacity','tooltip');
    tween(tip,[{transform:'scale(1)'},{transform:`scale(${number('scale-tooltip-start')})`}],'duration-tooltip-scale','tooltip');
    after(tween(tip,[{opacity:0},{opacity:1}],'duration-tooltip-opacity','tooltip',enter));
    after(tween(tip,[{transform:`scale(${number('scale-tooltip-start')})`},{transform:'scale(1)'}],'duration-tooltip-scale','tooltip',enter));
   }else if(id==='theme'){
    const glyph=find('.theme-icon-glyph'),next=themeAngle+number('rotation-icon-turn');
    tween(glyph,[{transform:`rotate(${themeAngle}deg)`},{transform:`rotate(${next}deg)`}],'duration-toggle-enter','theme');
    commitEnd=()=>{themeAngle=next;glyph.style.transform=`rotate(${next}deg)`;};
   }else if(id==='tilt'){
    const target=find('.ds-motion-tilt'),cursor=find('.ds-motion-cursor');
    const perspective=number('project-tilt-perspective')*target.offsetWidth/find('.ds-motion-project-width').offsetWidth,angle=number('project-tilt-angle');
    // Sample the unchanged website spring; pointer travel and holds use the layout token.
    const x={value:0,velocity:0,target:0},y={...x},hz=60,segment=hold(),samples=[{px:0,py:0,rx:0,ry:0}],waypoints=[[0,0],[-1,-1],[1,-1],[1,1],[-1,1],[0,0]];
    for(let point=1;point<waypoints.length;point++){
     const from=waypoints[point-1],to=waypoints[point],steps=Math.ceil(segment*hz/1000);
     for(let step=1;step<=steps*(point===waypoints.length-1?1:2);step++){
      const fraction=Math.min(1,step/steps),px=from[0]+(to[0]-from[0])*fraction,py=from[1]+(to[1]-from[1])*fraction;
      x.target=-py*angle;y.target=px*angle;stepTiltSpring(x,1/hz);stepTiltSpring(y,1/hz);samples.push({px,py,rx:x.value,ry:y.value});
     }
    }
    while(x.value!==0||x.velocity!==0||y.value!==0||y.velocity!==0){stepTiltSpring(x,1/hz);stepTiltSpring(y,1/hz);samples.push({px:0,py:0,rx:x.value,ry:y.value});}
    const sampledTime=(samples.length-1)*1000/hz;
    add(target,samples.map((s,i)=>({offset:i/(samples.length-1),transform:`perspective(${perspective}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg)`})),sampledTime,sourceCurve('skills'));
    add(cursor,samples.map((s,i)=>({offset:i/(samples.length-1),transform:`translate(${s.px*target.offsetWidth/2}px,${s.py*target.offsetHeight/2}px)`})),sampledTime,sourceCurve('skills'));
   }else if(id==='project'){
    const panel=find('[data-motion-panel]'),caption=find('[data-motion-caption]'),artwork=find('[data-motion-artwork]'),ratio=caption.offsetWidth/panel.offsetWidth;
    const small={transform:`scale(${ratio})`,transformOrigin:'left bottom'},full={transform:'scale(1)',transformOrigin:'left bottom'};
    tween(panel,[small,full],'duration-case-open','travel');
    tween(panel,[{borderRadius:css().getPropertyValue('--radius-large')},{borderRadius:css().getPropertyValue('--radius-medium')}],'duration-case-radius','radius');
    tween(caption,[{opacity:1},{opacity:0}],'duration-case-caption-exit','travel');
    tween(artwork,[{opacity:0,transform:`translateY(${number('distance-case-copy')}px)`},{opacity:1,transform:'translateY(0)'}],'duration-case-body-enter','travel',number('delay-case-body-enter'));
    const close=total+hold();
    after(tween(caption,[{opacity:0},{opacity:1}],'duration-case-caption-enter','travel',close+number('delay-case-caption-enter')));
    after(tween(panel,[full,small],'duration-case-close','travel',close));
    after(tween(panel,[{borderRadius:css().getPropertyValue('--radius-medium')},{borderRadius:css().getPropertyValue('--radius-large')}],'duration-case-close','travel',close));
    after(tween(artwork,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:`translateY(${number('distance-case-copy')}px)`}],'duration-case-close','travel',close));
   }else if(id==='header'){
    const pill=find('.ds-motion-header'),items=find('[data-motion-header-items]'),compact=number('control-height'),full=pill.offsetWidth;
    const exit=number('duration-header-exit'),enter=number('duration-header-enter'),fade=number('duration-fast'),grow=exit+hold();
    tween(pill,[{width:`${full}px`},{width:`${compact}px`}],'duration-header-exit','header');
    add(items,[{opacity:1},{opacity:0}],fade,sourceCurve('header'));
    after(add(pill,[{width:`${compact}px`},{width:`${full}px`}],enter,sourceCurve('header'),grow));
    after(add(items,[{opacity:0},{opacity:1}],fade,sourceCurve('header'),grow+enter-fade));
   }else if(id==='text'){
    const letters=[...art.querySelectorAll<HTMLElement>('[data-motion-letter]')],fade=number('duration-fast');
    letters.forEach(letter=>tween(letter,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(0)'}],'duration-fast','arrow'));
    for(const effect of revealEffects(letters,{duration:number('duration-title-reveal'),distance:number('distance-title-reveal'),stagger:number('stagger-title-reveal'),delay:fade+hold(),easing:sourceCurve('entrance')}))after(add(effect.element,effect.keyframes,effect.duration,effect.easing,effect.delay));
   }else if(id==='role'){
    const next=1-roleIndex,old=find(`[data-motion-role="${roleIndex}"]`),incoming=find(`[data-motion-role="${next}"]`),start=number('duration-role-hold')+number('duration-role-exit');
    tween(old,[{opacity:1},{opacity:0}],'duration-role-exit','role',number('duration-role-hold'));
    const letters=[...incoming.querySelectorAll<HTMLElement>('[data-motion-role-letter]')];
    for(const effect of roleRevealEffects({phrase:incoming,letters},{hold:number('duration-role-hold'),exit:number('duration-role-exit'),enter:number('duration-title-reveal'),distance:number('distance-title-reveal'),stagger:number('stagger-title-reveal'),ease:sourceCurve('entrance'),exitEase:sourceCurve('role')},start))add(effect.element,effect.keyframes,effect.duration,effect.easing,effect.delay);
    commitEnd=()=>{old.style.opacity='0';incoming.style.opacity='1';incoming.querySelectorAll<HTMLElement>('[data-motion-role-letter]').forEach(letter=>{letter.style.opacity='1';letter.style.transform='translateY(0)';});roleIndex=next;};
   }else if(id==='filter'){
    const items=[...art.querySelectorAll<HTMLElement>('[data-motion-filter-item]')],next=1-filterIndex,row=items[2].offsetTop-items[0].offsetTop;
    const leaving=next?items.slice(0,2):items.slice(4),incoming=next?items.slice(4):items.slice(0,2);
    for(const item of leaving)tween(item,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:`translateY(0) scale(${number('scale-filter-exit')})`}],'duration-filter-exit','filterOut');
    for(const item of items.slice(2,4))tween(item,[{transform:`translateY(${filterIndex?-row:0}px)`},{transform:`translateY(${next?-row:0}px)`}],'duration-filter-layout','filterIn');
    for(const item of incoming)tween(item,[{opacity:0,transform:`translateY(${number('distance-filter-enter')}px) scale(${number('scale-filter')})`},{opacity:1,transform:'translateY(0) scale(1)'}],'duration-filter-enter','filterIn',number('delay-filter-enter'));
    const navigation=[...art.querySelectorAll<HTMLElement>('.navigation-item')];
    const snapshot=(item:HTMLElement)=>({paddingInlineEnd:getComputedStyle(item).paddingInlineEnd,dot:{opacity:getComputedStyle(item.querySelector('.navigation-item-indicator')!).opacity,transform:getComputedStyle(item.querySelector('.navigation-item-indicator')!).transform},label:{transform:getComputedStyle(item.querySelector('.navigation-item-label')!).transform}});
    const before=navigation.map(snapshot);navigation.forEach((item,index)=>item.setAttribute('aria-pressed',String(index===next)));const target=navigation.map(snapshot);
    navigation.forEach((item,index)=>{
     tween(item,[{paddingInlineEnd:before[index].paddingInlineEnd},{paddingInlineEnd:target[index].paddingInlineEnd}],'duration-navigation','navigation');
     tween(item.querySelector('.navigation-item-indicator')!,[before[index].dot,target[index].dot],'duration-navigation','navigation');
     tween(item.querySelector('.navigation-item-label')!,[before[index].label,target[index].label],'duration-navigation','navigation');
    });
    commitEnd=()=>{
     leaving.forEach(item=>{item.style.opacity='0';item.style.transform=`scale(${number('scale-filter-exit')})`;});
     incoming.forEach(item=>{item.style.opacity='1';item.style.transform='translateY(0) scale(1)';});
     items.slice(2,4).forEach(item=>item.style.transform=`translateY(${next?-row:0}px)`);filterIndex=next;
    };
   }else if(id==='skills'){
    const track=find('[data-motion-skill-track]'),chips=[...track.children] as HTMLElement[],distance=chips[4].getBoundingClientRect().top-chips[0].getBoundingClientRect().top;
    const loop=tween(track,[{transform:'translateY(0)'},{transform:`translateY(${-distance}px)`}],'duration-skills-loop','skills');
    // One repeated period is the same resting image; keep its native phase at zero.
    commitEnd=()=>{loop.currentTime=0;};
   }
   const axis=card.querySelector<HTMLElement>('[data-motion-timeline]');if(axis)total=Math.max(total,Number(axis.dataset.motionEnd));
   // An unused local property keeps the clock on this subtree without promoting its paint.
   clock=add(art,[{'--motion-clock':'0'},{'--motion-clock':'1'}],total,sourceCurve('skills'));
  };
  const progress=()=>{
   const elapsed=state==='ended'?total:Math.min(total,Number(clock?.currentTime)||0),fraction=total?elapsed/total:1;
   if(id==='logo'&&elapsed>0&&state==='playing'){find('[data-logo-rest]').style.visibility='hidden';find('[data-logo-glyphs]').style.visibility='visible';}
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
  const finish=()=>{if(clock)clock.onfinish=null;cancelAnimationFrame(frame);animations.forEach(a=>{a.pause();a.currentTime=Number(a.effect!.getComputedTiming().endTime);});if(id==='logo'){find('[data-logo-rest]').style.visibility='visible';find('[data-logo-glyphs]').style.visibility='hidden';}commitEnd();build();state='ended';renderState();progress();};
  const resume=()=>{
   if(reduced.matches)return;state='playing';renderState();
   for(const a of animations){a.updatePlaybackRate(speed);if(Number(a.currentTime)<Number(a.effect!.getComputedTiming().endTime))a.play();}
   clock!.onfinish=finish;progress();
  };
  const play=()=>{if(reduced.matches)return;if(!clock)build();resume();};
  const pause=()=>{if(state!=='playing')return;state='paused';animations.forEach(a=>a.pause());cancelAnimationFrame(frame);renderState();progress();};
  // Native button activation covers click, Enter and Space; focus/hover/art never play.
  button.addEventListener('click',event=>{event.stopPropagation();if(state==='playing')pause();else if(state==='paused')resume();else play();});
  const rate=()=>{animations.forEach(a=>a.updatePlaybackRate(speed));};
  const syncReduced=()=>{if(reduced.matches){if(!root.closest<HTMLElement>('[data-ds-view]')!.hidden){build();finish();}}else{cleanup();state='idle';renderState();card.style.removeProperty('--motion-progress');}};
  const prepare=()=>{if(!clock&&state==='idle')build();};
  reduced.addEventListener('change',syncReduced);syncReduced();if(!reduced.matches&&!root.closest<HTMLElement>('[data-ds-view]')!.hidden)prepare();controllers.push({pause,resume,finish:()=>{build();finish();},rate,prepare});
 }
 for(const choice of document.querySelectorAll<HTMLButtonElement>('[data-motion-speed]'))choice.addEventListener('click',()=>{
  speed=Number(choice.dataset.motionSpeed);document.querySelectorAll('[data-motion-speed]').forEach(node=>node.setAttribute('aria-pressed',String(node===choice)));controllers.forEach(controller=>controller.rate());
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)controllers.forEach(controller=>controller.pause());});
 new MutationObserver(()=>{if(root.closest<HTMLElement>('[data-ds-view]')!.hidden)controllers.forEach(controller=>controller.pause());else if(reduced.matches)controllers.forEach(controller=>controller.finish());else controllers.forEach(controller=>controller.prepare());}).observe(root.closest('[data-ds-view]')!,{attributes:true,attributeFilter:['hidden']});
}

import { scrollImmediately, scrollToSection, sectionScrollDestination } from './smooth-scroll.ts';
import { easeSectionScroll } from './scroll-policy.ts';
import { initializeControlMagnet } from './control-magnet.ts';
import { readMotionToken } from './native-motion.ts';
import { refreshViewportPointer } from './viewport-pointer.ts';

export interface WalkthroughCue {
  name: string;
  anchor: string;
  start: number;
  glide?: boolean | `#${string}` | 'next';
  align?: 'center';
  comparison?: 'before' | 'after';
  stops?: Pick<WalkthroughCue, 'anchor' | 'start' | 'glide' | 'align' | 'comparison'>[];
}
type State = 'rest' | 'on' | 'paused';
export const walkthroughTimeline = (cues: WalkthroughCue[]) => {
  const entries = cues.flatMap(cue => [
    ...[{start:cue.start,anchor:cue.anchor,glide:cue.glide,align:cue.align,comparison:cue.comparison}, ...(cue.stops ?? [])].map(entry=>({...entry,chapterStart:cue.start})),
  ]).sort((a,b) => a.start-b.start);
  return entries.map(({glide,align,comparison,...entry}, index) => ({
    ...entry, selection: comparison, alignment: align,
    glideAnchor: typeof glide === 'string' ? glide === 'next' ? entries[index+1]?.anchor : glide : undefined,
    glideAlignment: glide === 'next' ? entries[index+1]?.align : typeof glide === 'string' ? 'center' as const : undefined,
    glideUntil: glide ? entries[index+1]?.start : undefined,
  }));
};
/** Linear in video time, clamped to the landed position and section end. */
export function walkthroughGlidePosition(landed:number, end:number, startTime:number, endTime:number, time:number):number {
  if (end <= landed) return landed;
  const progress = endTime > startTime ? Math.max(0,Math.min(1,(time-startTime)/(endTime-startTime))) : Number(time >= endTime);
  return landed + (end-landed) * progress;
}
export function currentWalkthroughCue<T extends {start:number}>(cues: T[], time: number): T | undefined {
  return cues.findLast(cue => cue.start <= time) ?? cues[0];
}
/** Restore only selections already spoken in the current chapter, without cue lead. */
export function currentWalkthroughSelection(timeline: ReturnType<typeof walkthroughTimeline>, time:number) {
  const chapter = currentWalkthroughCue(timeline,time)?.chapterStart;
  return timeline.findLast(entry=>entry.chapterStart===chapter && entry.start<=time && entry.selection);
}
export function walkthroughEntryStart(entry: ReturnType<typeof walkthroughTimeline>[number], rate:number, stationary:boolean) {
  return Math.max(0,entry.start - (entry.selection && stationary ? 0 : walkthroughCueLeadSeconds * rate));
}
export const walkthroughCueLeadSeconds = 1;
export function walkthroughChapterTitle(name: string | undefined, eyebrow: string | undefined, mode?: 'names') {
  return mode === 'names' ? name || '' : eyebrow?.trim() || name || '';
}
const formatTime = (time: number) => `${Math.floor(time / 60)}:${String(Math.floor(time) % 60).padStart(2,'0')}`;

interface WalkthroughContext { parent?:HTMLElement; content?:Document|HTMLElement; scroller?:Window|HTMLElement; }
/** The direct-page blueprint reserves no space or media requests below desktop. */
export function initializeWalkthrough(template: HTMLTemplateElement, context: WalkthroughContext = {}) {
  const lifetime=new AbortController();
  let ready=Boolean(context.parent);
  const desktop = matchMedia('(min-width: 1024px)');
  let dispose: (() => void) | undefined;
  const sync = () => {
    if (!ready) return;
    if (!desktop.matches) { dispose?.(); dispose = undefined; return; }
    if (dispose) return;
    const root = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    (context.parent ?? document.body).append(root);
    dispose = mount(root,context.content ?? document,context.scroller ?? window);
  };
  desktop.addEventListener('change', sync);
  const destroy = () => { lifetime.abort(); dispose?.(); dispose = undefined; desktop.removeEventListener('change',sync); };
  window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); },{signal:lifetime.signal});
  const begin=()=>{void document.fonts.ready.then(()=>{if(lifetime.signal.aborted)return;ready=true;sync();});};
  if(context.parent || document.readyState==='complete')begin();
  else window.addEventListener('load',begin,{once:true,signal:lifetime.signal});
  return {destroy};
}

function mount(root: HTMLElement, content: Document|HTMLElement, scroller: Window|HTMLElement) {
  const lifecycle = new AbortController(), {signal} = lifecycle;
  const listen = (target: EventTarget, name: string, callback: EventListener, passive = false) =>
    target.addEventListener(name,callback,{signal,passive});
  const config: {cues:WalkthroughCue[];lengthSeconds:number;chapterTitles?:'names'} = JSON.parse(root.querySelector('[data-walkthrough-config]')!.textContent!);
  const cues = config.cues, timeline = walkthroughTimeline(cues);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fineHover = matchMedia('(hover: hover) and (pointer: fine)');
  let pointerWasFine = fineHover.matches;
  const video = root.querySelector<HTMLVideoElement>('video')!;
  const face = root.querySelector<HTMLButtonElement>('[data-walkthrough-face]')!;
  const playButton = root.querySelector<HTMLButtonElement>('[data-walkthrough-play]')!;
  const sounds = [...root.querySelectorAll<HTMLButtonElement>('[data-walkthrough-sound]')];
  const speedButton=root.querySelector<HTMLButtonElement>('[data-walkthrough-speed]')!;
  const speedLabel=speedButton.querySelector('[data-walkthrough-rate]')!;
  const rates=[1,1.5,2];
  const setRate=(rate:number)=>{
    video.playbackRate=rate;video.preservesPitch=true;
    speedLabel.textContent=`${rate}×`;
    speedButton.setAttribute('aria-label',`Playback speed, ${rate}×`);
  };
  const invite = root.querySelector<HTMLElement>('.wt-invite')!;
  const frameElement = root.querySelector<HTMLElement>('.wt-frame')!;
  const pill = root.querySelector<HTMLElement>('.wt-pill')!;
  let pillTimer: ReturnType<typeof setTimeout> | undefined;
  let pillStartUntil = 0;
  const clearPillTimer = () => { clearTimeout(pillTimer); pillTimer = undefined; };
  const raisePill = () => { clearPillTimer(); if (state !== 'rest') root.dataset.pill = 'raised'; };
  const schedulePill = () => {
    raisePill();
    if (!fineHover.matches || state !== 'on' || root.matches(':hover') || pill.matches(':has(:focus-visible)')) return;
    pillTimer = setTimeout(() => {
      pillTimer = undefined;
      if (fineHover.matches && state === 'on' && !root.matches(':hover') && !pill.matches(':has(:focus-visible)')) root.dataset.pill = 'tucked';
    }, Math.max(readMotionToken(tokens,'--delay-walkthrough-pill'),pillStartUntil-performance.now()));
  };
  const chapter = root.querySelector<HTMLElement>('[data-walkthrough-chapter]')!;
  const time = root.querySelector<HTMLElement>('[data-walkthrough-time]')!;
  let state: State = 'rest', duration = config.lengthSeconds, nextCue = 0, frame = 0;
  let cancelScroll: (() => void) | undefined;
  let scrollRevision = 0;
  let glide: { entry:typeof timeline[number]; landed:number; end:number; startTime:number } | undefined;
  let glideReturn: { from:number; started:number } | undefined;
  const tokens=getComputedStyle(root),inviteStyle=getComputedStyle(invite);
  const magnet = initializeControlMagnet(root, {
    enabled: () => state === 'rest',
    inside: () => root.matches(':hover'),
    bounds: () => {
      // The fixed root anchors the resting bounds. Read the final layout sizes,
      // never the rectangle/invite bounds interpolating through their transitions.
      const box=root.getBoundingClientRect();
      const width=readMotionToken(tokens,'--wt-w'),height=readMotionToken(tokens,'--wt-h');
      const size=readMotionToken(tokens,'--wt-rest');
      const rest={left:box.right-size,right:box.right,top:box.bottom-size,bottom:box.bottom};
      if(!root.matches(':hover'))return rest;
      const cardWidth=Number.parseFloat(inviteStyle.width),cardHeight=Number.parseFloat(inviteStyle.height);
      const top=rest.bottom-height,cardTop=top+(height-cardHeight)/2;
      return {
        left:rest.right-width-readMotionToken(tokens,'--space-4')-cardWidth,
        right:rest.right,top:Math.min(top,cardTop),bottom:Math.max(rest.bottom,cardTop+cardHeight),
      };
    },
  });
  const previousPadding=scroller instanceof HTMLElement?scroller.style.scrollPaddingTop:'';
  if(scroller instanceof HTMLElement)scroller.style.scrollPaddingTop='calc(var(--scroll-clearance) + var(--safe-top))';
  root.inert=true;
  const entrance=root.animate([{transform:'scale(0)'},{transform:'scale(1)'}],{
    duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:readMotionToken(tokens,'--duration-button-fill'),
    easing:tokens.getPropertyValue('--ease-button-fill').trim(),fill:'both',
  });
  root.dispatchEvent(new CustomEvent('walkthroughentrance',{bubbles:true,detail:{at:performance.now()}}));
  void entrance.finished.then(()=>{
    root.inert=false;entrance.cancel();refreshViewportPointer();
  }).catch(()=>{ /* Teardown cancels an unfinished entrance. */ });
  const show = (element: Element | null, on: boolean) => element?.toggleAttribute('hidden',!on);
  const labelFace = () => {
    const expandable = !fineHover.matches && state === 'rest';
    const closed = expandable && !root.hasAttribute('data-open');
    if (expandable) face.setAttribute('aria-expanded',String(!closed));
    else face.removeAttribute('aria-expanded');
    face.setAttribute('aria-label',closed ? 'Open walkthrough' : state === 'paused' ? 'Walkthrough paused. Continue' : video.muted ? 'Sound off. Turn sound on' : 'Sound on. Turn sound off');
    if (closed || state === 'paused') face.removeAttribute('aria-pressed');
    else face.setAttribute('aria-pressed',String(!video.muted));
    sounds.forEach(button => {
      button.setAttribute('aria-label',closed ? 'Open walkthrough' : video.muted ? 'Sound off. Turn sound on' : 'Sound on. Turn sound off');
      if (closed) button.removeAttribute('aria-pressed');
      else button.setAttribute('aria-pressed',String(!video.muted));
    });
  };
  const sound = (on: boolean) => {
    video.muted = !on;
    sounds.forEach(button => {
      button.setAttribute('aria-pressed',String(on));
      button.setAttribute('aria-label',on ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on');
      show(button.querySelector('[data-muted-icon]'),!on);
      show(button.querySelector('[data-sound-icon]'),on);
    });
    labelFace();
  };
  const render = () => {
    const position = state === 'rest' ? 0 : video.currentTime;
    const current = currentWalkthroughCue(cues,position);
    const anchor = current?.anchor && current.anchor !== 'top' ? content.querySelector(current.anchor) : null;
    const eyebrow = anchor?.closest('.section-heading')?.querySelector('.eyebrow')
      ?? anchor?.closest('section')?.querySelector('.case-study-eyebrow');
    chapter.textContent = walkthroughChapterTitle(current?.name,eyebrow?.textContent ?? undefined,config.chapterTitles);
    time.textContent = state === 'paused' ? 'Paused' : `${formatTime(position)} / ${formatTime(duration)}`;
    show(playButton.querySelector('[data-play-icon]'),state === 'paused');
    show(playButton.querySelector('[data-pause-icon]'),state !== 'paused');
    playButton.setAttribute('aria-label',state === 'paused' ? 'Play' : 'Pause');
    labelFace();
  };
  const setState = (next: State) => {
    // Leaving the disappearing invitation must not shorten the first hold.
    pillStartUntil = fineHover.matches && state === 'rest' && next === 'on'
      ? performance.now() + readMotionToken(tokens,'--delay-walkthrough-pill-start') : 0;
    state = next; root.dataset.state = next;
    delete root.dataset.open;
    schedulePill();
    if (state === 'rest') delete root.dataset.pill;
    render(); refreshViewportPointer();
  };
  const measure = () => {
    if (Number.isFinite(video.duration) && video.duration > 0) duration = video.duration;
    root.querySelector('[data-walkthrough-length]')!.textContent = `${Math.round(duration / 60)} min`;
    render();
  };
  const scrollPosition = () => scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop;
  const targetFor = (entry:typeof timeline[number]) => entry.anchor === 'top' ? (scroller === window ? document.documentElement : scroller as HTMLElement) : content.querySelector<HTMLElement>(entry.anchor);
  const stationary = (entry:typeof timeline[number]) => {
    const target = targetFor(entry);
    return !!target && Math.abs(sectionScrollDestination(target,scroller,entry.alignment)-scrollPosition())<=1;
  };
  const select = (entry:typeof timeline[number] | undefined) => {
    if (!entry?.selection) return;
    const target = targetFor(entry);
    const comparison = (target?.matches('case-study-comparison') ? target : target?.querySelector('case-study-comparison')) as (HTMLElement & {select(value:NonNullable<(typeof timeline)[number]['selection']>):void}) | null;
    comparison?.select(entry.selection);
  };
  const landedEvent = (entry:typeof timeline[number], target:HTMLElement) => root.dispatchEvent(new CustomEvent('walkthroughcuelanded',{
    detail:{anchor:entry.anchor,cue:entry.start,time:video.currentTime,scrollY:scrollPosition(),anchorTop:target.getBoundingClientRect().top},bubbles:true,
  }));
  const scroll = (entry:typeof timeline[number]) => {
    const {anchor} = entry;
    const target = targetFor(entry);
    if (!target) return;
    select(entry);
    cancelScroll?.();
    glide = glideReturn = undefined;
    const revision = ++scrollRevision;
    cancelScroll = scrollToSection(target, () => {
      if (revision !== scrollRevision) return;
      landedEvent(entry,target);
      const section = entry.glideAnchor ? targetFor({...entry,anchor:entry.glideAnchor}) : target.closest('section');
      if (entry.glideUntil === undefined || reduced.matches || !section) return;
      const landed = scrollPosition();
      const viewportTop = scroller === window ? 0 : (scroller as HTMLElement).getBoundingClientRect().top;
      const viewportHeight = scroller === window ? innerHeight : (scroller as HTMLElement).clientHeight;
      const rect = section.getBoundingClientRect();
      const end = entry.glideAnchor ? sectionScrollDestination(section,scroller,entry.glideAlignment) : landed + rect.bottom - viewportTop - viewportHeight;
      glide = {entry,landed,end,startTime:video.currentTime};
    },scroller,entry.alignment);
    root.dispatchEvent(new CustomEvent('walkthroughcue',{detail:{anchor,cue:entry.start,time:video.currentTime},bubbles:true}));
  };
  const stopClock = () => { cancelAnimationFrame(frame); frame = 0; };
  const tick = () => {
    if (state !== 'on') { frame = 0; return; }
    // Reconcile live capability changes on the existing playback clock too.
    if (pointerWasFine !== fineHover.matches) changePointer();
    if (glide && !reduced.matches) {
      let position = walkthroughGlidePosition(glide.landed,glide.end,glide.startTime,glide.entry.glideUntil! - walkthroughCueLeadSeconds * video.playbackRate,video.currentTime);
      if (glideReturn) {
        // Rejoin the moving video-clock position with the shared section-scroll curve.
        const progress = Math.min(1,(performance.now()-glideReturn.started)/readMotionToken(tokens,'--duration-section-scroll'));
        position = glideReturn.from + (position-glideReturn.from) * easeSectionScroll(progress);
        if (progress === 1) glideReturn = undefined;
      }
      scrollImmediately(position,scroller);
    }
    // Lead the sentence by one real second; the site's shared section-scroll owns travel.
    while (nextCue < timeline.length && video.currentTime >= walkthroughEntryStart(timeline[nextCue],video.playbackRate,!!timeline[nextCue].selection && stationary(timeline[nextCue]))) {
      scroll(timeline[nextCue++]);
    }
    render();
    frame = requestAnimationFrame(tick);
  };
  const pause = (reason: string) => {
    if (state !== 'on') return;
    video.pause(); stopClock();
    root.dataset.pausedBy = reason;
    setState('paused');
  };
  const play = () => void video.play().catch(() => {
    // A rejected explicit play stays resumable; the poster/decoded frame remains.
    if (state === 'on') pause('playback');
  });
  const start = () => {
    stopClock(); glide = glideReturn = undefined; setRate(1); nextCue = 0; video.loop = false; video.currentTime = 0;
    select(currentWalkthroughSelection(timeline,video.currentTime));
    delete root.dataset.pausedBy;
    sound(true); setState('on'); play(); tick();
  };
  const resume = () => {
    if (state !== 'paused') return;
    delete root.dataset.pausedBy;
    select(currentWalkthroughSelection(timeline,video.currentTime));
    let entry = currentWalkthroughCue(timeline,video.currentTime + walkthroughCueLeadSeconds * video.playbackRate)!;
    if (entry.selection && video.currentTime < walkthroughEntryStart(entry,video.playbackRate,stationary(entry))) entry=currentWalkthroughCue(timeline,video.currentTime)!;
    nextCue = timeline.indexOf(entry)+1;
    if (glide?.entry === entry && !reduced.matches) glideReturn = {from:scrollPosition(),started:performance.now()};
    else scroll(entry);
    setState('on'); play(); tick();
  };
  const exit = () => {
    setRate(1); sound(false); stopClock(); cancelScroll?.(); scrollRevision++; glide = glideReturn = undefined;
    if (root.matches(':hover')) root.dataset.quiet = '';
    delete root.dataset.pausedBy;
    video.currentTime = 0; video.loop = true; nextCue = 0; setState('rest'); play();
    if (root.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
  };
  listen(root.querySelector('[data-walkthrough-start]')!,'click',start);
  listen(speedButton,'click',event=>{
    event.stopPropagation();
    setRate(rates[(rates.indexOf(video.playbackRate)+1)%rates.length]);
    if((event as MouseEvent).detail>0)speedButton.blur();
  });
  listen(playButton,'click',() => state === 'on' ? pause('button') : resume());
  listen(root.querySelector('[data-walkthrough-close]')!,'click',exit);
  const openFromTouch = () => {
    if (fineHover.matches || state !== 'rest' || root.hasAttribute('data-open')) return false;
    delete root.dataset.quiet;
    root.dataset.open = '';
    labelFace();
    return true;
  };
  sounds.forEach(button => listen(button,'click',event => {
    event.stopPropagation(); if (!openFromTouch()) sound(video.muted);
    if ((event as MouseEvent).detail > 0) button.blur();
  }));
  listen(face,'click',event => {
    if (!openFromTouch()) {
      if (state === 'paused') resume(); else sound(video.muted);
    }
    if ((event as MouseEvent).detail > 0) face.blur();
  });
  listen(root,'pointerenter',raisePill);
  listen(root,'pointerleave',() => { delete root.dataset.quiet; schedulePill(); });
  for (const event of ['focusin','focusout']) listen(pill,event,() => {
    queueMicrotask(() => { if (!signal.aborted) schedulePill(); });
  });
  listen(frameElement,'transitionend',refreshViewportPointer);
  listen(document,'pointerdown',event => {
    if (fineHover.matches || state !== 'rest' || !root.hasAttribute('data-open') || root.contains(event.target as Node)) return;
    delete root.dataset.open;
    if (root.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
    labelFace();
  });
  const changePointer = () => {
    pointerWasFine = fineHover.matches;
    delete root.dataset.open;
    delete root.dataset.quiet;
    schedulePill(); labelFace(); refreshViewportPointer();
  };
  fineHover.addEventListener('change',changePointer);
  listen(scroller,'wheel',() => pause('scroll'),true);
  listen(scroller,'touchmove',() => pause('scroll'),true);
  listen(window,'keydown',event => {
    const key = event as KeyboardEvent;
    if (key.key === 'Escape') { pause('escape'); return; }
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End',' '].includes(key.key)) return;
    // Space on a widget button activates that control, rather than scrolling.
    if (key.key === ' ' && root.contains(key.target as Node)) return;
    pause('scroll');
  });
  listen(document,'visibilitychange',() => { if (document.hidden) pause('away'); });
  listen(window,'blur',() => pause('away'));
  listen(window,'pagehide',() => pause('away'));
  listen(video,'ended',() => { if (state === 'on') exit(); });
  listen(video,'loadedmetadata',measure);
  const source = video.querySelector<HTMLSourceElement>('source[data-src]')!;
  source.src = source.dataset.src!;
  setRate(1);video.preload = 'auto'; video.muted = true; video.load(); play(); measure();
  root.dataset.ready = 'true';
  return () => {
    fineHover.removeEventListener('change',changePointer);
    clearPillTimer(); stopClock(); cancelScroll?.(); magnet.destroy(); lifecycle.abort(); entrance.cancel();
    if(scroller instanceof HTMLElement)scroller.style.scrollPaddingTop=previousPadding;
    setRate(1);video.muted=true;video.pause(); source.removeAttribute('src'); video.removeAttribute('src'); video.load(); root.remove();
  };
}

/** Fetch the genuine direct-page component; never put it in a case template. */
export async function preparePopupWalkthrough(url:string, signal:AbortSignal) {
  const response=await fetch(url,{signal});
  if(!response.ok)throw Error('Walkthrough page unavailable');
  const page=new DOMParser().parseFromString(await response.text(),'text/html');
  return page.querySelector<HTMLTemplateElement>('[data-walkthrough-template]');
}

/** Created only at the completed popup-open endpoint; owns lazy width changes. */
export function initializePopupWalkthrough(url:string, context:WalkthroughContext) {
  const lifetime=new AbortController(),desktop=matchMedia('(min-width: 1024px)');
  let widget:ReturnType<typeof initializeWalkthrough>|undefined,pending=false;
  const sync=()=>{
    if(!desktop.matches || pending || widget || lifetime.signal.aborted)return;
    pending=true;
    void preparePopupWalkthrough(url,lifetime.signal).then(template=>{
      if(!template || lifetime.signal.aborted)return;
      widget=initializeWalkthrough(template,context);
      desktop.removeEventListener('change',sync);
    }).catch(()=>{ /* A missing optional guide must leave the case study usable. */ }).finally(()=>{pending=false;});
  };
  desktop.addEventListener('change',sync);
  const destroy=()=>{lifetime.abort();desktop.removeEventListener('change',sync);widget?.destroy();};
  window.addEventListener('pagehide',event=>{if(!event.persisted)destroy();},{signal:lifetime.signal});
  sync();
  return {destroy};
}

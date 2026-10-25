import { readMotionToken } from './native-motion.ts';
import { scrollPolicy, easeSectionScroll } from './scroll-policy.ts';
import type { ScrollEngine } from './scroll-engine';
interface ScrollRoot { readonly ready: Promise<void>; readonly lenis: ScrollEngine['lenis'] | undefined; resize: () => void; destroy: () => void; }
const scrollRoots = new Map<Window | HTMLElement, ScrollRoot>();
let createEngine: typeof import('./scroll-engine').createScrollEngine | undefined;
let rootsChanged: (() => void) | undefined;
let smoothScroll: ScrollEngine['lenis'] | undefined;
let wheelOwner: Window | HTMLElement | undefined;
let scrollPaused = false;
export const pauseScroll = () => { scrollPaused = true; smoothScroll?.stop(); };
export const resumeScroll = () => { scrollPaused = false; smoothScroll?.start(); };

export const scrollImmediately = (position: number, wrapper: Window | HTMLElement = window) => {
  const active = scrollRoots.get(wrapper)?.lenis;
  if (active) active.scrollTo(Math.max(0, position), {immediate:true});
  else if (wrapper !== window && scrollAxis(wrapper as HTMLElement) === 'horizontal') wrapper.scrollTo({left:Math.max(0, position),behavior:'instant'});
  else wrapper.scrollTo({top:Math.max(0, position),behavior:'instant'});
};
/** Centre below the floating control when necessary; ordinary top landings retain their clearance. */
export function sectionScrollTarget(position: number, top: number, height: number, viewportTop: number, viewportHeight: number, clearance: number, alignment?: 'center', minimumTop = 0) {
  const gap = alignment === 'center' ? Math.max(minimumTop,(viewportHeight - height) / 2) : clearance;
  const destination = position + top - viewportTop - gap;
  // Native and Lenis round scroll positions; keep a minimum-gap landing on its safe side.
  return alignment === 'center' && gap === minimumTop ? Math.floor(destination) : destination;
}
export function sectionScrollDestination(target: HTMLElement, owner: Window | HTMLElement = window, alignment?: 'center') {
  const atStart = target === owner || target === document.documentElement || target.id === 'top';
  const isDocument = owner === window;
  const container = isDocument ? document.documentElement : owner as HTMLElement;
  const position = isDocument ? window.scrollY : container.scrollTop;
  const viewportTop = isDocument ? 0 : container.getBoundingClientRect().top + container.clientTop;
  const viewportHeight = isDocument ? innerHeight : container.clientHeight;
  const rect = target.getBoundingClientRect();
  const clearance = (parseFloat(getComputedStyle(container).scrollPaddingTop) || 0) + (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
  const close = alignment === 'center' ? isDocument
    ? document.querySelector<HTMLElement>('.case-study-direct-close [data-case-home]')
    : container.closest('[data-case-dialog]')?.querySelector<HTMLElement>('.project-cursor.is-case-control .icon-button') : null;
  const minimumTop = close ? close.getBoundingClientRect().bottom - viewportTop + readMotionToken(getComputedStyle(close),'--space-2') : 0;
  return Math.max(0,Math.min(container.scrollHeight - viewportHeight,atStart ? 0 : sectionScrollTarget(position,rect.top,rect.height,viewportTop,viewportHeight,clearance,alignment,minimumTop)));
}
export function scrollToSection(target: HTMLElement, onComplete?: () => void, wrapper?: Window | HTMLElement, alignment?: 'center') {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const owner = wrapper ?? (document.documentElement.hasAttribute('data-catalog') ? scrollOwner(target) : window);
  const atStart = target === owner || target === document.documentElement || target.id === 'top';
  const active = scrollRoots.get(owner)?.lenis;
  const completed = () => onComplete?.();
  const isDocument = owner === window;
  const container = isDocument ? document.documentElement : owner as HTMLElement;
  const position = isDocument ? window.scrollY : container.scrollTop;
  const destination = sectionScrollDestination(target,owner,alignment);
  // A stationary native scroll emits no scrollend; both engines still land next frame.
  if (Math.abs(destination - position) <= 1) {
    const frame = requestAnimationFrame(completed);
    return () => cancelAnimationFrame(frame);
  }
  const nativeCompleted = () => {
    // An immediate glide can leave a queued scrollend from the preceding move.
    if (Math.abs((isDocument ? window.scrollY : container.scrollTop) - destination) > 1) return;
    owner.removeEventListener('scrollend', nativeCompleted);
    completed();
  };
  // Native smooth scrolling reports completion itself; Lenis owns its completion callback.
  if (onComplete && !active && !reduced) owner.addEventListener('scrollend', nativeCompleted);
  if (!reduced && active) active.scrollTo(alignment ? destination : atStart ? 0 : target, { duration: readMotionToken(getComputedStyle(target), '--duration-section-scroll') / 1000, easing: easeSectionScroll, lerp: 0, onComplete });
  else if (alignment) owner.scrollTo({ top: destination, behavior: reduced ? 'instant' : 'smooth' });
  else if (atStart) owner.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  else target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  if (onComplete && reduced) queueMicrotask(completed);
  return () => owner.removeEventListener('scrollend', nativeCompleted);
}

/** Load the unchanged wheel engine only where it is used. */
export function initializeSmoothScroll(wrapper: Window | HTMLElement = window, content: HTMLElement = document.documentElement, orientation: 'vertical' | 'horizontal' = 'vertical') {
  const existing = scrollRoots.get(wrapper);
  if (existing) return existing;
  const capability = window.matchMedia(scrollPolicy.capability);
  const isDocument = wrapper === window;
  const managedDimensions = document.documentElement.hasAttribute('data-catalog');
  const eligible = () => capability.matches && (navigator.maxTouchPoints ?? 0) === 0;
  let engine: ScrollEngine | undefined;
  let revision = 0, disposed = false, measured = '';
  const measure = () => {
    const element = isDocument ? document.documentElement : wrapper as HTMLElement;
    return [isDocument ? innerWidth : element.clientWidth, isDocument ? innerHeight : element.clientHeight, element.scrollWidth, element.scrollHeight].join(':');
  };
  let ready = Promise.resolve();
  const clear = () => {
    if (engine && smoothScroll === engine.lenis) smoothScroll = undefined;
    engine?.destroy(); engine = undefined;
  };
  const sync = () => {
    const ticket = ++revision;
    clear();
    if (disposed || !eligible()) return;
    const mount = () => {
      if (disposed || ticket !== revision || !eligible() || !createEngine) return;
      engine = createEngine(wrapper, content, managedDimensions ? node => scrollOwner(node) !== wrapper : undefined, managedDimensions, orientation);
      if (managedDimensions) measured = measure();
      rootsChanged?.();
      if (isDocument) {
        smoothScroll = engine.lenis;
        if (scrollPaused) smoothScroll.stop();
      }
    };
    if (createEngine) { mount(); ready = Promise.resolve(); }
    else ready = import('./scroll-engine').then(module => { createEngine = module.createScrollEngine; mount(); })
      .catch(() => { /* Native scrolling remains available if loading fails. */ });
  };
  capability.addEventListener('change', sync);
  sync();
  const controller = { get ready() { return ready; }, get lenis() { return engine?.lenis; }, resize() {
    if (!managedDimensions || !engine) return;
    const next = measure();
    if (next === measured) return;
    measured = next;
    const {lenis} = engine;
    // Refresh the public dimension model without resetting an active destination.
    lenis.dimensions.resize();
    if (lenis.animatedScroll > lenis.limit) lenis.scrollTo(lenis.limit, {immediate:true});
  }, destroy() { if (disposed) return; disposed = true; revision++; capability.removeEventListener('change', sync); clear(); scrollRoots.delete(wrapper); rootsChanged?.(); } };
  scrollRoots.set(wrapper, controller);
  rootsChanged?.();
  return controller;
}

/** Modal close measurements must stop whichever instance survived a BFCache return. */
export function destroySmoothScroll(wrapper: Window | HTMLElement) { scrollRoots.get(wrapper)?.destroy(); }

function installTouchBoundaries() {
  // WebKit can still pull the page to refresh when the viewport is already at
  // the top. Only cancel that downward gesture; keep native touch scrolling.
  let touchStartX = NaN;
  let touchStartY = NaN;
  const start = (event: TouchEvent) => {
    if (event.touches.length !== 1) {
      touchStartX = NaN;
      touchStartY = NaN;
      return;
    }
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  };
  const move = (event: TouchEvent) => {
    if (!event.cancelable || event.touches.length !== 1 || window.scrollY > 0) return;
    if (event.target instanceof Element && event.target.closest('[data-case-dialog], .case-study-scroll')) return;
    const deltaX = event.touches[0].clientX - touchStartX;
    const deltaY = event.touches[0].clientY - touchStartY;
    if (deltaY > 0 && deltaY > Math.abs(deltaX)) event.preventDefault();
  };

  document.addEventListener('touchstart', start, {passive:true});
  document.addEventListener('touchmove', move, {passive:false});
  return () => { document.removeEventListener('touchstart', start); document.removeEventListener('touchmove', move); };
}

/** Find only the input's ancestor chain; never scan the page during startup. */
function scrollAxis(element: HTMLElement): 'vertical' | 'horizontal' | undefined {
  const style = getComputedStyle(element);
  if (/(auto|scroll|overlay)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1) return 'vertical';
  if (/(auto|scroll|overlay)/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1) return 'horizontal';
}
function scrollOwner(node: Element | null): Window | HTMLElement {
  if (wheelOwner) return wheelOwner;
  for (let parent = node; parent; parent = parent.parentElement) {
    // SVG input targets still belong to their nearest HTML scroll surface.
    if (!(parent instanceof HTMLElement)) continue;
    if (parent.matches('.case-study-scroll')) return parent;
    if (parent === document.body || parent === document.documentElement) break;
    if (scrollAxis(parent)) return parent;
  }
  const modal = document.querySelector<HTMLElement>('[data-case-dialog][open] [data-case-scroll]');
  return modal || window;
}

/** A single lifecycle serves document layouts and any independently scrolling content. */
function startSharedScrolling() {
  const controller = new AbortController(), {signal} = controller;
  const stopTouchBoundary = installTouchBoundaries();
  const documentScroll = initializeSmoothScroll();
  const restoredModal = document.querySelector<HTMLElement>('[data-case-dialog][open] [data-case-scroll]');
  if (restoredModal && !restoredModal.hasAttribute('data-scroll-locked')) initializeSmoothScroll(restoredModal, restoredModal.querySelector<HTMLElement>('[data-case-content]') || restoredModal);

  if (!document.documentElement.hasAttribute('data-catalog')) return {destroy() {
    controller.abort(); stopTouchBoundary();
    for (const root of [...scrollRoots.values()]) root.destroy();
  }};
  let alive = true, pendingFrame = 0;
  const observed = new Map<HTMLElement, Element[]>();
  const surfaces = new Set<HTMLElement>();
  const markSurface = (owner: Window | HTMLElement) => {
    if (owner === window) return;
    const wrapper = owner as HTMLElement, axis = scrollAxis(wrapper);
    if (axis) { wrapper.dataset.scrollSurface = axis; surfaces.add(wrapper); }
  };
  const dimensions = () => {
    pendingFrame = 0;
    for (const surface of surfaces) if (!surface.isConnected || surface.closest('[hidden]') || !scrollAxis(surface)) {
      surface.removeAttribute('data-scroll-surface'); surfaces.delete(surface);
    }
    for (const [wrapper, nodes] of observed) if (!scrollRoots.has(wrapper)) { for (const node of nodes) sizes.unobserve(node); observed.delete(wrapper); }
    for (const [wrapper, root] of scrollRoots) {
      if (wrapper !== window && (!(wrapper as HTMLElement).isConnected || (wrapper as HTMLElement).closest('[hidden]') || !scrollAxis(wrapper as HTMLElement))) {
        root.destroy();
        for (const node of observed.get(wrapper as HTMLElement) || []) sizes.unobserve(node);
        observed.delete(wrapper as HTMLElement);
      } else {
        if (wrapper !== window) {
          const next = [wrapper as HTMLElement, ...(wrapper as HTMLElement).children];
          for (const node of observed.get(wrapper as HTMLElement) || []) if (!next.includes(node)) sizes.unobserve(node);
          for (const node of next) sizes.observe(node);
          observed.set(wrapper as HTMLElement, next);
        }
        root.resize();
      }
    }
  };
  const refresh = () => { if (!pendingFrame && alive) pendingFrame = requestAnimationFrame(dimensions); };
  rootsChanged = refresh;
  const observer = new MutationObserver(refresh);
  observer.observe(document.body, {subtree:true,childList:true,attributes:true,attributeFilter:['hidden','open','data-scroll-locked']});
  const sizes = new ResizeObserver(refresh);
  sizes.observe(document.documentElement);
  const ensure = (owner: Window | HTMLElement) => {
    markSurface(owner);
    let existing = scrollRoots.get(owner);
    if (existing?.lenis && owner !== window && existing.lenis.options.orientation !== scrollAxis(owner as HTMLElement)) { existing.destroy(); existing = undefined; }
    // The modal registers after its opening travel and disposes before closing.
    // Both that lifecycle and automatic surfaces use this same idempotent factory.
    if (existing || owner === window || (owner as HTMLElement).matches('.case-study-scroll')) return existing;
    const wrapper = owner as HTMLElement;
    if (!wrapper.isConnected || wrapper.closest('[hidden],[inert]') || (!matchMedia(scrollPolicy.capability).matches || navigator.maxTouchPoints > 0)) return;
    const root = initializeSmoothScroll(wrapper, wrapper.firstElementChild instanceof HTMLElement ? wrapper.firstElementChild : wrapper, scrollAxis(wrapper));
    const nodes = [wrapper, ...wrapper.children];
    for (const node of nodes) sizes.observe(node);
    observed.set(wrapper, nodes);
    return root;
  };
  const wheel = (event: WheelEvent) => {
    if (event.ctrlKey || !(event.target instanceof Element)) return;
    let owner = scrollOwner(event.target);
    const verticalOnHorizontal = owner !== window && scrollAxis(owner as HTMLElement) === 'horizontal' && !event.shiftKey && Math.abs(event.deltaY) >= Math.abs(event.deltaX);
    if (verticalOnHorizontal) {
      const surface = owner as HTMLElement;
      const position = scrollRoots.get(surface)?.lenis?.targetScroll ?? surface.scrollLeft;
      const canMove = event.deltaY < 0 ? position > 0 : position < surface.scrollWidth - surface.clientWidth - 1;
      // Only navigation converts a mouse wheel; content and navigation edges
      // hand this same event to the document's unchanged scrolling engine.
      if (!surface.matches('[data-ds-nav-scroll]') || !canMove || navigator.maxTouchPoints > 0) owner = window;
    }
    wheelOwner = owner;
    // Native event dispatch can run microtasks between listeners. Keep the
    // owner through bubbling so every scroll root sees this same wheel event.
    setTimeout(() => { wheelOwner = undefined; }, 0);
    if (owner === window) {
      // WebKit can swallow document wheel input under a nonpassive router.
      // Without Lenis, forward its vertical delta once; touch gestures stay native.
      if (!documentScroll.lenis && event.cancelable && !event.shiftKey && event.deltaY !== 0) {
        event.preventDefault();
        const scale = event.deltaMode === 1 ? parseFloat(getComputedStyle(document.documentElement).lineHeight) || 16 : event.deltaMode === 2 ? innerHeight : 1;
        window.scrollBy({top:event.deltaY * scale,behavior:'instant'});
      }
      return;
    }
    const root = ensure(owner);
    if (root?.lenis) return; // Its native Lenis listener consumes this same event.
    // Native sideways input stays in its block; only the navigation maps Y to X.
    if (scrollAxis(owner as HTMLElement) === 'horizontal' && event.cancelable) {
      event.preventDefault();
      const scale = event.deltaMode === 1 ? parseFloat(getComputedStyle(owner as HTMLElement).lineHeight) || 16 : event.deltaMode === 2 ? (owner as HTMLElement).clientWidth : 1;
      (owner as HTMLElement).scrollBy({left:(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*scale,behavior:'instant'});
    }
  };
  document.addEventListener('wheel', wheel, {capture:true,passive:false,signal});
  // Contain native gestures only on the touched overflow surface, never on
  // ordinary catalog cards (which would change their compositing at rest).
  document.addEventListener('pointerdown', event => { markSurface(scrollOwner(event.target instanceof Element ? event.target : null)); }, {capture:true,passive:true,signal});
  document.addEventListener('focusin', event => { ensure(scrollOwner(event.target instanceof Element ? event.target : null)); }, {signal});
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!link || link.target === '_blank' || link.hasAttribute('download') || link.origin !== location.origin || link.pathname !== location.pathname || link.search !== location.search || !link.hash) return;
    let target: HTMLElement | null = null;
    try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch {}
    if (!target || target.closest('[hidden],[inert]')) return;
    event.preventDefault();
    const root = ensure(scrollOwner(target));
    if (location.hash !== link.hash) history.pushState(history.state, '', link.hash);
    const destination = target;
    if (root && !root.lenis) void root.ready.then(() => { if (alive) scrollToSection(destination); });
    else scrollToSection(destination);
  }, {signal});
  window.addEventListener('resize', refresh, {passive:true,signal});
  document.addEventListener('load', refresh, {capture:true,signal});
  document.addEventListener('loadedmetadata', refresh, {capture:true,signal});
  document.fonts.addEventListener('loadingdone', refresh, {signal});
  document.fonts.ready.then(() => { if (alive) refresh(); });
  return {destroy() {
    if (!alive) return;
    alive = false;
    if (rootsChanged === refresh) rootsChanged = undefined;
    controller.abort(); stopTouchBoundary(); observer.disconnect(); sizes.disconnect();
    for (const surface of surfaces) surface.removeAttribute('data-scroll-surface');
    surfaces.clear();
    if (pendingFrame) cancelAnimationFrame(pendingFrame);
    for (const root of [...scrollRoots.values()]) root.destroy();
    documentScroll.destroy();
  }};
}

let installed = false;
/** Full navigations, BFCache and Astro swaps all own exactly one page lifecycle. */
export function installSharedScrolling() {
  if (installed) return;
  installed = true;
  let active: ReturnType<typeof startSharedScrolling> | undefined;
  const start = () => { active ??= startSharedScrolling(); };
  const stop = () => { active?.destroy(); active = undefined; };
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', start);
  document.addEventListener('astro:before-swap', stop);
  document.addEventListener('astro:page-load', start);
  start();
}

import type { ScrollEngine } from './scroll-engine';
let smoothScroll: ScrollEngine['lenis'] | undefined;
let scrollPaused = false;
export const pauseScroll = () => { scrollPaused = true; smoothScroll?.stop(); };
export const resumeScroll = () => { scrollPaused = false; smoothScroll?.start(); };

export const repositionWork = (top: number) => {
  if (smoothScroll) smoothScroll.scrollTo(Math.max(0, top), { immediate: true });
  else window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
};
export function scrollToSection(target: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (smoothScroll) smoothScroll.scrollTo(target.id === 'top' ? 0 : target, { duration: .65, lerp: 0 });
  else if (target.id === 'top') window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  else target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
}

/** Load the unchanged wheel engine only where it is used. */
export function initializeSmoothScroll(wrapper: Window | HTMLElement = window, content: HTMLElement = document.documentElement) {
  const capability = window.matchMedia('(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const isDocument = wrapper === window;
  let engine: ScrollEngine | undefined;
  let revision = 0, disposed = false;
  let ready = Promise.resolve();
  const clear = () => {
    if (engine && smoothScroll === engine.lenis) smoothScroll = undefined;
    engine?.destroy(); engine = undefined;
  };
  const sync = () => {
    const ticket = ++revision;
    clear();
    if (disposed || !capability.matches) return;
    ready = import('./scroll-engine').then(({ createScrollEngine }) => {
      if (disposed || ticket !== revision || !capability.matches) return;
      engine = createScrollEngine(wrapper, content);
      if (isDocument) {
        smoothScroll = engine.lenis;
        if (scrollPaused) smoothScroll.stop();
      }
    }).catch(() => { /* Native scrolling remains available if loading fails. */ });
  };
  capability.addEventListener('change', sync);
  sync();
  return { get ready() { return ready; }, destroy() { disposed = true; revision++; capability.removeEventListener('change', sync); clear(); } };
}

export function initializeMotion() {

  // WebKit can still pull the page to refresh when the viewport is already at
  // the top. Only cancel that downward gesture; keep native touch scrolling.
  let touchStartX = NaN;
  let touchStartY = NaN;
  document.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) {
      touchStartX = NaN;
      touchStartY = NaN;
      return;
    }
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchmove', event => {
    if (!event.cancelable || event.touches.length !== 1 || window.scrollY > 0) return;
    if (event.target instanceof Element && event.target.closest('#mobile-menu, [data-case-dialog], .case-study-scroll')) return;
    const deltaX = event.touches[0].clientX - touchStartX;
    const deltaY = event.touches[0].clientY - touchStartY;
    if (deltaY > 0 && deltaY > Math.abs(deltaX)) event.preventDefault();
  }, { passive: false });

  initializeSmoothScroll();

  // Font metrics affect the start/end positions of all scroll scenes.
  const refresh = () => window.dispatchEvent(new Event('sectionrevealrefresh'));
  document.fonts.ready.then(refresh);
  return { refresh };
}

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
let smoothScroll: Lenis | undefined;

export const pauseScroll = () => smoothScroll?.stop();
export const resumeScroll = () => smoothScroll?.start();

/** Keep filter focus when a shorter collection replaces a long one. */
export const repositionWork = (top: number) => {
  if (smoothScroll) smoothScroll.scrollTo(Math.max(0, top), { immediate: true });
  else window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
};

export function scrollToSection(target: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (smoothScroll) {
    // Lenis already reads CSS scroll-padding and scroll-margin for element targets.
    smoothScroll.scrollTo(target.id === 'top' ? 0 : target, { duration: .65, lerp: 0 });
  } else if (target.id === 'top') {
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  } else {
    target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  }
}

/** One wheel pace for the homepage, standalone cases and modal case scroller. */
export function initializeSmoothScroll(wrapper: Window | HTMLElement = window, content: HTMLElement = document.documentElement) {
  const media = gsap.matchMedia();
  const isDocument = wrapper === window;

  // Light wheel smoothing: follow input closely without a long trailing glide.
  // Touch, small screens and reduced motion stay native.
  media.add('(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const lenis = new Lenis({
      wrapper, content, lerp: .18, smoothWheel: true, syncTouch: false, anchors: false,
      prevent: node => isDocument && node.closest('#mobile-menu, [data-case-dialog]') !== null,
    });
    if (isDocument) {
      smoothScroll = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      if (document.querySelector('dialog[open]')) lenis.stop();
    }
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const cancelTravel = (event: KeyboardEvent) => {
      if (['Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
        lenis.scrollTo(lenis.actualScroll, { immediate: true });
      }
    };
    wrapper.addEventListener('keydown', cancelTravel as EventListener);
    return () => {
      wrapper.removeEventListener('keydown', cancelTravel as EventListener);
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (smoothScroll === lenis) smoothScroll = undefined;
    };
  });
  return { destroy: () => media.revert() };
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
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  return { refresh: () => ScrollTrigger.refresh() };
}

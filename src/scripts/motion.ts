import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
let smoothScroll: Lenis | undefined;

export const pauseScroll = () => smoothScroll?.stop();
export const resumeScroll = () => smoothScroll?.start();

export function scrollToSection(target: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.focus({ preventScroll: true });
  if (smoothScroll) {
    // Lenis already reads CSS scroll-padding and scroll-margin for element targets.
    smoothScroll.scrollTo(target.id === 'top' ? 0 : target, { duration: .65, lerp: 0 });
  } else if (target.id === 'top') {
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  } else {
    target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  }
}

export function initializeMotion() {
  const media = gsap.matchMedia();

  // Light wheel smoothing: follow input closely without a long trailing glide.
  // Touch, small screens and reduced motion stay native.
  media.add('(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const lenis = new Lenis({ lerp: .18, smoothWheel: true, syncTouch: false, anchors: false, prevent: node => node.closest('#mobile-menu') !== null });
    if (document.documentElement.dataset.reloadToTop === 'true') lenis.scrollTo(0, { immediate: true });
    smoothScroll = lenis;
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    if (document.querySelector<HTMLDialogElement>('#mobile-menu')?.open) lenis.stop();
    const cancelTravel = (event: KeyboardEvent) => {
      if (['Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
        lenis.scrollTo(window.scrollY, { immediate: true });
      }
    };
    window.addEventListener('keydown', cancelTravel);
    return () => {
      window.removeEventListener('keydown', cancelTravel);
      gsap.ticker.remove(tick);
      lenis.destroy();
      smoothScroll = undefined;
    };
  });

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const small = window.matchMedia('(max-width: 767px)').matches;
    // The hero owns its intro sequence; section reveals stay independent.
    const reveals: { element: HTMLElement; animation: gsap.core.Tween }[] = [];
    document.querySelectorAll<HTMLElement>('[data-reveal], .project-caption').forEach(element => {
      const children = element.matches('.section-heading')
        ? [...element.querySelectorAll(':scope > .eyebrow, :scope > div > *')]
        : element.matches('.project-caption') ? [...element.children] : [element];
      const animation = gsap.from(children, {
        y: small ? 18 : 28, opacity: 0, duration: .85, stagger: .09, ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: element, start: 'top 92%', once: true },
      });
      reveals.push({ element, animation });
    });
    // Keyboard navigation must never land on content still waiting to appear.
    const onFocus = (event: FocusEvent) => {
      reveals.forEach(({ element, animation }) => {
        if (event.target instanceof HTMLElement && (element.contains(event.target) || event.target.contains(element))) animation.progress(1);
      });
    };
    document.addEventListener('focusin', onFocus);
    return () => {
      document.removeEventListener('focusin', onFocus);
    };
  });

  media.add({ desktop: '(min-width: 768px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
    if (!context.conditions?.motion) return;
    const desktop = context.conditions.desktop;
    document.querySelectorAll<HTMLElement>('.project-media').forEach(panel => {
      gsap.fromTo(panel, { y: desktop ? 56 : 22, scale: desktop ? .965 : 1 }, {
        y: 0, scale: 1, ease: desktop ? 'none' : 'power3.out', duration: .85,
        scrollTrigger: { trigger: panel.parentElement, start: 'top 98%', end: 'top 48%', scrub: desktop ? .55 : false, once: !desktop, invalidateOnRefresh: true },
      });
    });
  });

  // Font metrics affect the start/end positions of all scroll scenes.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  return { refresh: () => ScrollTrigger.refresh() };
}

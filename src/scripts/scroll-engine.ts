import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
export interface ScrollEngine { lenis: Lenis; destroy: () => void; }
/** The same options, GSAP clock and keyboard cancellation as the original engine. */
export function createScrollEngine(wrapper: Window | HTMLElement, content: HTMLElement): ScrollEngine {
  const isDocument = wrapper === window;
  const lenis = new Lenis({
    wrapper, content, lerp: .18, smoothWheel: true, syncTouch: false, anchors: false,
    prevent: node => isDocument && node.closest('[data-case-dialog]') !== null,
  });
  if (isDocument && document.querySelector('dialog[open]')) lenis.stop();
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  const cancelTravel = (event: KeyboardEvent) => {
    if (['Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) lenis.scrollTo(lenis.actualScroll, { immediate: true });
  };
  wrapper.addEventListener('keydown', cancelTravel as EventListener);
  return { lenis, destroy() { wrapper.removeEventListener('keydown', cancelTravel as EventListener); gsap.ticker.remove(tick); lenis.destroy(); } };
}

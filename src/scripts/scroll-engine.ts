import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { scrollPolicy } from './scroll-policy.ts';
export interface ScrollEngine { lenis: Lenis; destroy: () => void; }
/** Original wheel physics and GSAP clock; shared lifecycle owns input and resizing. */
export function createScrollEngine(wrapper: Window | HTMLElement, content: HTMLElement, prevent?: (node: HTMLElement) => boolean, managedDimensions = false, orientation: 'vertical' | 'horizontal' = 'vertical'): ScrollEngine {
  const isDocument = wrapper === window;
  const lenis = new Lenis({
    wrapper, content, lerp: scrollPolicy.lerp, smoothWheel: scrollPolicy.smoothWheel, syncTouch: scrollPolicy.syncTouch, anchors: scrollPolicy.anchors, autoResize: managedDimensions ? false : scrollPolicy.autoResize, orientation, gestureOrientation: orientation === 'horizontal' ? 'both' : 'vertical',
    prevent: prevent ?? (node => isDocument && node.closest('[data-case-dialog]') !== null),
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

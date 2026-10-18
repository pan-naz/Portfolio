import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { scrollPolicy } from './scroll-policy.ts';
export interface ScrollEngine { lenis: Lenis; destroy: () => void; }
const clocks = new Set<(time: number) => void>();
const clockOrigin = Date.now();
let clockFrame = 0;
function advanceClock() {
  clockFrame = requestAnimationFrame(advanceClock);
  // Preserve the former ticker's Date.now milliseconds and seconds conversion.
  const time = ((Date.now() - clockOrigin) / 1000) * 1000;
  for (const tick of clocks) tick(time);
}
/** Original wheel physics; one unsmoothed frame clock shared by all scroll roots. */
export function createScrollEngine(wrapper: Window | HTMLElement, content: HTMLElement, prevent?: (node: HTMLElement) => boolean, managedDimensions = false, orientation: 'vertical' | 'horizontal' = 'vertical'): ScrollEngine {
  const isDocument = wrapper === window;
  const lenis = new Lenis({
    wrapper, content, lerp: scrollPolicy.lerp, smoothWheel: scrollPolicy.smoothWheel, syncTouch: scrollPolicy.syncTouch, anchors: scrollPolicy.anchors, autoResize: managedDimensions ? false : scrollPolicy.autoResize, orientation, gestureOrientation: orientation === 'horizontal' ? 'both' : 'vertical',
    prevent: prevent ?? (node => isDocument && node.closest('[data-case-dialog]') !== null),
  });
  if (isDocument && document.querySelector('dialog[open]')) lenis.stop();
  const tick = (time: number) => lenis.raf(time);
  clocks.add(tick);
  if (!clockFrame) clockFrame = requestAnimationFrame(advanceClock);
  const cancelTravel = (event: KeyboardEvent) => {
    if (['Tab', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) lenis.scrollTo(lenis.actualScroll, { immediate: true });
  };
  wrapper.addEventListener('keydown', cancelTravel as EventListener);
  return { lenis, destroy() { wrapper.removeEventListener('keydown', cancelTravel as EventListener); clocks.delete(tick); if (!clocks.size) { cancelAnimationFrame(clockFrame); clockFrame = 0; } lenis.destroy(); } };
}

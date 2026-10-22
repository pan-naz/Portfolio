import { readSafeAreaInsets } from './safe-area.ts';
import { calculateWorkFilterMagnet as calculateMagnet, resolveWorkFilterSpringSpeed, stepSpring, type Spring } from './work-filter/work-filter-magnet.ts';
import { refreshViewportPointer, watchViewportPointer } from './viewport-pointer.ts';

/** A single control uses the menu's proximity and spring without its rail mechanics. */
export function initializeControlMagnet(control: HTMLElement, options: {
  bounds?: () => Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;
  enabled?: () => boolean;
  inside?: () => boolean;
  stableHover?: boolean;
} = {}) {
  const capability = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const controller = new AbortController();
  const { signal } = controller;
  const tokens = getComputedStyle(control);
  const regularSpeed = Number.parseFloat(tokens.getPropertyValue('--work-filter-magnet-spring-speed')) || 14;
  const insideSpeed = Number.parseFloat(tokens.getPropertyValue('--work-filter-magnet-inside-spring-speed')) || 2;
  const edge = Number.parseFloat(tokens.getPropertyValue('--space-2')) || 8;
  let safe = readSafeAreaInsets();
  window.addEventListener('resize', () => { safe = readSafeAreaInsets(); }, { signal });
  const x: Spring = { value: 0, velocity: 0, target: 0 };
  const y: Spring = { value: 0, velocity: 0, target: 0 };
  let frame = 0, lastTime = 0, pointerInside = false;
  let cachedBounds: Pick<DOMRect,'left'|'right'|'top'|'bottom'> | undefined;
  const remeasure = () => {
    const box = options.bounds?.() ?? control.getBoundingClientRect();
    cachedBounds = {left:box.left-x.value,right:box.right-x.value,top:box.top-y.value,bottom:box.bottom-y.value};
  };
  const write = () => { control.style.translate = `${x.value}px ${y.value}px`; };
  const tick = (time: number) => {
    const dt = Math.min(lastTime ? (time - lastTime) / 1000 : 1 / 60, .064);
    lastTime = time;
    const speed = resolveWorkFilterSpringSpeed(pointerInside, regularSpeed, insideSpeed);
    stepSpring(x, dt, speed); stepSpring(y, dt, speed);
    write();
    frame = x.value === x.target && !x.velocity && y.value === y.target && !y.velocity ? 0 : requestAnimationFrame(tick);
    if (!frame) lastTime = 0;
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };
  const returnHome = (immediate = false) => {
    pointerInside = false;
    x.target = y.target = 0;
    if (immediate) {
      cancelAnimationFrame(frame); frame = lastTime = 0;
      x.value = x.velocity = y.value = y.velocity = 0;
      control.style.removeProperty('translate');
    } else if (x.value || x.velocity || y.value || y.velocity) schedule();
  };
  // Safari's dialog autofocus stays focus-visible after pointer input. Use the
  // same ownership marker as the ring, while genuine keyboard focus stays still.
  const keyboardFocused = () => control.matches(':focus-visible') && !control.hasAttribute('data-case-pointer-focus');
  const unwatch = watchViewportPointer(pointer => {
    if (options.enabled && !options.enabled()) { returnHome(); return; }
    const keyboard = keyboardFocused();
    if (!pointer.active || !capability.matches || keyboard || !control.isConnected || control.closest('[hidden], [inert]')) {
      returnHome(keyboard || !capability.matches);
      return;
    }
    if (options.stableHover && pointer.viewportChanged && cachedBounds) return;
    if (options.stableHover && !cachedBounds) remeasure();
    const rendered = options.stableHover ? cachedBounds! : options.bounds?.() ?? control.getBoundingClientRect();
    const bounds = options.stableHover ? cachedBounds! : { left: rendered.left - x.value, right: rendered.right - x.value, top: rendered.top - y.value, bottom: rendered.bottom - y.value };
    const inside = options.stableHover
      ? pointer.clientX >= bounds.left+x.value && pointer.clientX <= bounds.right+x.value && pointer.clientY >= bounds.top+y.value && pointer.clientY <= bounds.bottom+y.value
      : options.inside?.() ?? (pointer.clientX >= rendered.left && pointer.clientX <= rendered.right && pointer.clientY >= rendered.top && pointer.clientY <= rendered.bottom);
    if (options.stableHover && inside) {
      // Capture the current resting target on entry. The slow inside spring has
      // no leftover pull or transform feedback to chase while the box grows.
      if (!pointerInside) { x.target=x.value; y.target=y.value; x.velocity=y.velocity=0; }
      pointerInside=true;
      return;
    }
    pointerInside=inside;
    const target = calculateMagnet(pointer.clientX, pointer.clientY, bounds);
    const distance = Math.hypot(pointer.clientX - (bounds.left + bounds.right) / 2, pointer.clientY - (bounds.top + bounds.bottom) / 2);
    // A small target lands under the pointer rather than moving past it.
    const limit = Math.min(1, distance / (Math.hypot(target.x, target.y) || 1));
    x.target = Math.max(safe.left + edge - bounds.left, Math.min(target.x * limit, innerWidth - safe.right - edge - bounds.right));
    y.target = Math.max(safe.top + edge - bounds.top, Math.min(target.y * limit, innerHeight - safe.bottom - edge - bounds.bottom));
    if (x.value !== x.target || x.velocity || y.value !== y.target || y.velocity) schedule();
  });
  control.dataset.magnetReady = 'true';
  control.addEventListener('focusin', () => { if (keyboardFocused()) returnHome(true); }, { signal });
  capability.addEventListener('change', () => { returnHome(true); refreshViewportPointer(); }, { signal });
  const destroy = () => {
    returnHome(true);
    unwatch(); controller.abort();
    delete control.dataset.magnetReady;
  };
  window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal });
  refreshViewportPointer();
  return { destroy, remeasure };
}

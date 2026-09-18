export type ViewportPointer = {
  clientX: number;
  clientY: number;
  active: boolean;
  target: Element | null;
  viewportChanged: boolean;
};

const subscribers = new Set<(pointer: ViewportPointer) => void>();
let x = 0, y = 0, known = false, frame = 0;
let stop: (() => void) | undefined;

const notify = (viewportChanged: boolean) => {
  const active = known && !document.hidden;
  const target = active ? document.elementFromPoint(x, y) : null;
  const pointer = { clientX: x, clientY: y, active, target, viewportChanged };
  subscribers.forEach(callback => callback(pointer));
};

/** Re-hit-test the stored viewport position after scrolling or layout changes. */
export function refreshViewportPointer() {
  if (!known || frame || !subscribers.size) return;
  frame = requestAnimationFrame(() => { frame = 0; notify(true); });
}

export function watchViewportPointer(callback: (pointer: ViewportPointer) => void) {
  subscribers.add(callback);
  if (!stop) {
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      known = event.pointerType === 'mouse' && x >= 0 && y >= 0 && x < window.innerWidth && y < window.innerHeight;
      notify(false);
    };
    const leave = () => {
      known = false;
      cancelAnimationFrame(frame);
      frame = 0;
      notify(false);
    };
    const visibility = () => { if (document.hidden) leave(); else refreshViewportPointer(); };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', move, { passive: true });
    window.addEventListener('scroll', refreshViewportPointer, { passive: true, capture: true });
    window.addEventListener('resize', refreshViewportPointer, { passive: true });
    window.addEventListener('blur', leave);
    document.documentElement.addEventListener('pointerleave', leave);
    document.addEventListener('pointercancel', leave);
    document.addEventListener('keydown', leave);
    document.addEventListener('visibilitychange', visibility);
    const resize = new ResizeObserver(refreshViewportPointer);
    if (document.body) resize.observe(document.body);
    stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', move);
      window.removeEventListener('scroll', refreshViewportPointer, true);
      window.removeEventListener('resize', refreshViewportPointer);
      window.removeEventListener('blur', leave);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.removeEventListener('pointercancel', leave);
      document.removeEventListener('keydown', leave);
      document.removeEventListener('visibilitychange', visibility);
      resize.disconnect();
      cancelAnimationFrame(frame);
      frame = 0;
      known = false;
    };
  }
  return () => {
    subscribers.delete(callback);
    if (!subscribers.size) { stop?.(); stop = undefined; }
  };
}

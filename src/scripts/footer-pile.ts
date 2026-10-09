import { refreshViewportPointer, watchViewportPointer, type ViewportPointer } from './viewport-pointer';
import { createWaterfallPaths, waterfallIconSize } from './waterfall-icons';
import type { FooterPile } from './footer-pile-model';
import { pileBleed, pileAbove, pileCursorRadius } from './footer-pile-constants';

export function initializeFooterPile() {
  const field = document.querySelector<HTMLElement>('[data-footer-pile]');
  const canvas = field?.querySelector('canvas');
  const context = canvas?.getContext('2d');
  const footer = field?.closest<HTMLElement>('.footer');
  const layer = field?.parentElement;
  if (!field || !footer || !layer || !canvas || !context || document.documentElement.hasAttribute('data-static')) return;
  const darkSection = document.querySelector<HTMLElement>('.about-details');
  const contact = document.querySelector<HTMLElement>('#contact');
  let paths: Path2D[];
  try { paths = createWaterfallPaths(); } catch { return; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const canUseMouse = () => fine.matches && navigator.maxTouchPoints === 0;
  const pointer = { x: 0, y: 0, active: false };
  let activeTouchId: number | null = null;
  let touchClientX = 0, touchClientY = 0;
  let pile: FooterPile | undefined;
  let Pile: typeof FooterPile | undefined;
  let loading = false, near = false;
  const seed = Math.floor(Math.random() * 0x100000000);
  let ink = '';
  let width = 0, height = 0, ratio = 1, viewLeft = pileBleed, viewRight = pileBleed;
  let above = pileAbove;
  let inView = false, paused = false, disposed = false;
  let frame = 0, last = 0;
  const allowed = () => Boolean(pile) && !reduced.matches && inView && !paused && !document.hidden && !disposed;

  const draw = () => {
    if (!pile) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width + viewLeft + viewRight, height);
    context.lineWidth = 1;
    context.lineCap = 'round'; context.lineJoin = 'round';
    context.strokeStyle = ink;
    let remaining = 0, spilled = 0;
    for (const icon of pile.icons) {
      if (icon.fallen) spilled++;
      if (icon.removed) continue;
      remaining++;
      const c = Math.cos(icon.angle), s = Math.sin(icon.angle);
      const half = waterfallIconSize / 2;
      context.setTransform(c * ratio, s * ratio, -s * ratio, c * ratio,
        (viewLeft + icon.x - half * c + half * s) * ratio,
        (above + icon.y - half * s - half * c) * ratio);
      context.stroke(paths[icon.icon]);
    }
    // Small DOM diagnostics also make the canvas interaction inspectable in QA.
    field.dataset.remaining = String(remaining);
    field.dataset.spilled = String(spilled);
    field.dataset.disturbed = String(pile.disturbed);
    field.dataset.seed = String(seed);
    field.dataset.motion = reduced.matches ? 'static' : pile.sleeping ? 'resting' : 'moving';
  };

  const stop = () => {
    cancelAnimationFrame(frame); frame = 0; last = 0; activeTouchId = null; pointer.active = false; pile?.releasePointer();
  };
  const tick = (now: number) => {
    frame = 0;
    if (!pile || !allowed()) { stop(); return; }
    const changed = pile.advance(last ? (now - last) / 1000 : 1 / 120, pointer);
    last = now;
    if (changed) draw();
    if (!pile.sleeping) frame = requestAnimationFrame(tick);
    else last = 0;
  };
  const wake = () => { if (!frame && allowed()) frame = requestAnimationFrame(tick); };
  const sync = () => { stop(); if (!pile) { ensurePile(); return; } if (!pile.sleeping) wake(); draw(); if (allowed()) refreshViewportPointer(); };
  const resize = () => {
    const nextWidth = field.clientWidth;
    if (!nextWidth) return;
    const rect = field.getBoundingClientRect();
    // The settled pile is small, but an upward sweep can carry icons across the
    // entire Contact chapter. Keep the drawing surface open through the dark edge.
    const darkBottom = darkSection?.getBoundingClientRect().bottom;
    above = darkBottom === undefined ? pileAbove
      : Math.max(pileAbove, Math.ceil(rect.top - darkBottom + pileCursorRadius + waterfallIconSize));
    layer.style.setProperty('--pile-above', `${above}px`);
    const nextViewLeft = Math.max(pileBleed, rect.left);
    const nextViewRight = Math.max(pileBleed, window.innerWidth - rect.right);
    if (Pile && (!pile || (!pile.disturbed && nextWidth !== width))) {
      pile?.destroy();
      pile = new Pile(nextWidth, paths.length, seed, nextViewLeft, nextViewRight);
    }
    else if (pile && (nextWidth !== width || nextViewLeft !== viewLeft || nextViewRight !== viewRight)) {
      pile.resize(nextWidth, nextViewLeft, nextViewRight);
    }
    width = nextWidth;
    viewLeft = nextViewLeft;
    viewRight = nextViewRight;
    height = above + footer.offsetHeight;
    ratio = Math.min(devicePixelRatio || 1, 2);
    const pixelWidth = Math.round((width + viewLeft + viewRight) * ratio);
    const pixelHeight = Math.round(height * ratio);
    // Assigning canvas dimensions clears and reallocates its backing store.
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    canvas.style.left = `${-viewLeft}px`;
    canvas.style.width = `${width + viewLeft + viewRight}px`;
    canvas.style.height = `${height}px`;
    canvas.style.top = `${-above}px`;
    const style = getComputedStyle(field);
    ink = style.getPropertyValue('--footer-icon-ink').trim();
    draw();
    if (!pile) { ensurePile(); return; }
    field.dataset.ready = 'true';
    refreshViewportPointer();
    refreshTouchPosition();
    if (!pile.sleeping) wake();
  };
  const trackPosition = (clientX: number, clientY: number, preserveOutside = false) => {
    const rect = field.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    if (x < -viewLeft || x > width + viewRight || y < -above || y > pileCursorRadius) {
      if (!preserveOutside) leave();
      return false;
    }
    pointer.x = x; pointer.y = y; pointer.active = true;
    field.dataset.pointerX = x.toFixed(2);
    field.dataset.pointerY = y.toFixed(2);
    if (pile?.needsPointerStep(x, y)) wake();
    return true;
  };
  const move = (event: ViewportPointer) => {
    if (activeTouchId !== null) return;
    if (!allowed() || !canUseMouse() || !event.active) { leave(); return; }
    trackPosition(event.clientX, event.clientY);
  };
  const findTouch = (touches: TouchList, id: number) => {
    for (let i = 0; i < touches.length; i++) if (touches[i].identifier === id) return touches[i];
    return null;
  };
  const refreshTouchPosition = () => {
    if (activeTouchId !== null && allowed()) trackPosition(touchClientX, touchClientY);
  };
  const onTouchStart = (event: TouchEvent) => {
    if (activeTouchId !== null || !allowed()) return;
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (!trackPosition(touch.clientX, touch.clientY, true)) continue;
      activeTouchId = touch.identifier;
      touchClientX = touch.clientX;
      touchClientY = touch.clientY;
      break;
    }
  };
  const onTouchMove = (event: TouchEvent) => {
    if (activeTouchId === null) return;
    const touch = findTouch(event.changedTouches, activeTouchId);
    if (!touch) return;
    touchClientX = touch.clientX;
    touchClientY = touch.clientY;
    if (allowed()) trackPosition(touchClientX, touchClientY);
  };
  const onTouchEnd = (event: TouchEvent) => {
    if (activeTouchId === null || !findTouch(event.changedTouches, activeTouchId)) return;
    activeTouchId = null;
    leave();
  };
  const leave = () => { pointer.active = false; pile?.releasePointer(); if (pile && !pile.sleeping) wake(); };
  const onBlur = () => { activeTouchId = null; leave(); };
  const ensurePile = () => {
    if (disposed || !near || !width || Pile || loading) return;
    loading = true;
    void import('./footer-pile-model').then(module => {
      if (disposed) return;
      Pile = module.FooterPile;
      resize(); sync();
    }).catch(() => { loading = false; });
  };
  const approaching = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; if (near) ensurePile(); }, { rootMargin: '300px' });
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });
  const sizing = new ResizeObserver(resize);
  resize();
  visibility.observe(layer);
  approaching.observe(layer);
  sizing.observe(footer);
  sizing.observe(field);
  if (darkSection) sizing.observe(darkSection);
  if (contact) sizing.observe(contact);
  const unwatch = watchViewportPointer(move);
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  window.addEventListener('scroll', refreshTouchPosition, { passive: true, capture: true });
  window.addEventListener('blur', onBlur);
  window.addEventListener('themechange', resize);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  fine.addEventListener('change', sync);
  const destroy = () => {
    disposed = true; stop(); visibility.disconnect(); approaching.disconnect(); sizing.disconnect();
    pile?.destroy();
    unwatch();
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
    window.removeEventListener('scroll', refreshTouchPosition, true);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('themechange', resize);
    document.removeEventListener('visibilitychange', sync);
    reduced.removeEventListener('change', sync); fine.removeEventListener('change', sync);
  };
  if (import.meta.hot) import.meta.hot.dispose(destroy);
  return { setPaused(value: boolean) { if (paused === value) return; paused = value; sync(); }, destroy };
}

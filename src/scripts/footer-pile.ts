import { refreshViewportPointer, watchViewportPointer, type ViewportPointer } from './viewport-pointer';
import { createWaterfallPaths, waterfallIconSize } from './waterfall-icons';
import { FooterPile, pileBleed, pileAbove, pileCursorRadius } from './footer-pile-model';

export function initializeFooterPile() {
  const field = document.querySelector<HTMLElement>('[data-footer-pile]');
  const canvas = field?.querySelector('canvas');
  const context = canvas?.getContext('2d');
  const footer = field?.closest<HTMLElement>('.footer');
  if (!field || !footer || !canvas || !context || document.documentElement.hasAttribute('data-static')) return;
  let paths: Path2D[];
  try { paths = createWaterfallPaths(); } catch { return; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const canInteract = () => fine.matches && navigator.maxTouchPoints === 0 && !reduced.matches;
  const pointer = { x: 0, y: 0, active: false };
  let pile: FooterPile;
  const seed = Math.floor(Math.random() * 0x100000000);
  let ink = '';
  let width = 0, height = 0, ratio = 1, viewLeft = pileBleed, viewRight = pileBleed;
  const above = pileAbove;
  let inView = false, paused = false, disposed = false;
  let frame = 0, last = 0;
  const allowed = () => canInteract() && inView && !paused && !document.hidden && !disposed;

  const draw = () => {
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width + viewLeft + viewRight, height);
    context.lineWidth = 1;
    context.lineCap = 'round'; context.lineJoin = 'round';
    context.strokeStyle = ink;
    for (const icon of pile.icons) {
      if (icon.removed) continue;
      const c = Math.cos(icon.angle), s = Math.sin(icon.angle);
      const half = waterfallIconSize / 2;
      context.setTransform(c * ratio, s * ratio, -s * ratio, c * ratio,
        (viewLeft + icon.x - half * c + half * s) * ratio,
        (above + icon.y - half * s - half * c) * ratio);
      context.stroke(paths[icon.icon]);
    }
    // Small DOM diagnostics also make the canvas interaction inspectable in QA.
    field.dataset.remaining = String(pile.icons.filter(icon => !icon.removed).length);
    field.dataset.spilled = String(pile.icons.filter(icon => icon.fallen).length);
    field.dataset.disturbed = String(pile.disturbed);
    field.dataset.seed = String(seed);
    field.dataset.motion = canInteract() ? pile.sleeping ? 'resting' : 'moving' : 'static';
  };

  const stop = () => {
    cancelAnimationFrame(frame); frame = 0; last = 0; pointer.active = false; pile?.releasePointer();
  };
  const tick = (now: number) => {
    frame = 0;
    if (!allowed()) { stop(); return; }
    const changed = pile.advance(last ? (now - last) / 1000 : 1 / 120, pointer);
    last = now;
    if (changed) draw();
    if (!pile.sleeping) frame = requestAnimationFrame(tick);
    else last = 0;
  };
  const wake = () => { if (!frame && allowed()) frame = requestAnimationFrame(tick); };
  const sync = () => { stop(); if (!pile.sleeping) wake(); draw(); if (allowed()) refreshViewportPointer(); };
  const resize = () => {
    const nextWidth = field.clientWidth;
    if (!nextWidth) return;
    const rect = field.getBoundingClientRect();
    const nextViewLeft = Math.max(pileBleed, rect.left);
    const nextViewRight = Math.max(pileBleed, window.innerWidth - rect.right);
    if (!pile || (!pile.disturbed && nextWidth !== width)) {
      pile?.destroy();
      pile = new FooterPile(nextWidth, paths.length, seed, nextViewLeft, nextViewRight);
    }
    else if (nextWidth !== width || nextViewLeft !== viewLeft || nextViewRight !== viewRight) {
      pile.resize(nextWidth, nextViewLeft, nextViewRight);
    }
    width = nextWidth;
    viewLeft = nextViewLeft;
    viewRight = nextViewRight;
    height = above + footer.offsetHeight;
    ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round((width + viewLeft + viewRight) * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.left = `${-viewLeft}px`;
    canvas.style.width = `${width + viewLeft + viewRight}px`;
    canvas.style.height = `${height}px`;
    canvas.style.top = `${-above}px`;
    const style = getComputedStyle(field);
    ink = style.getPropertyValue('--footer-icon-ink').trim();
    draw();
    field.dataset.ready = 'true';
    refreshViewportPointer();
    if (!pile.sleeping) wake();
  };
  const move = (event: ViewportPointer) => {
    if (!allowed() || !event.active) { leave(); return; }
    const rect = field.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    if (x < -viewLeft || x > width + viewRight || y < -above || y > pileCursorRadius) { leave(); return; }
    pointer.x = x; pointer.y = y; pointer.active = true;
    field.dataset.pointerX = x.toFixed(2);
    field.dataset.pointerY = y.toFixed(2);
    wake();
  };
  const leave = () => { pointer.active = false; pile.releasePointer(); if (!pile.sleeping) wake(); };
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });
  const sizing = new ResizeObserver(resize);
  resize();
  visibility.observe(footer);
  sizing.observe(footer);
  const unwatch = watchViewportPointer(move);
  window.addEventListener('themechange', resize);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  fine.addEventListener('change', sync);
  const destroy = () => {
    disposed = true; stop(); visibility.disconnect(); sizing.disconnect();
    pile.destroy();
    unwatch();
    window.removeEventListener('themechange', resize);
    document.removeEventListener('visibilitychange', sync);
    reduced.removeEventListener('change', sync); fine.removeEventListener('change', sync);
  };
  if (import.meta.hot) import.meta.hot.dispose(destroy);
  return { setPaused(value: boolean) { if (paused === value) return; paused = value; sync(); }, destroy };
}

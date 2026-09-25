import { refreshViewportPointer, watchViewportPointer, type ViewportPointer } from './viewport-pointer';
import { advanceLocalFallClock, catchUpFallClock, pointerRepulsion, repulsionRadius, streamStates, stretchedIconY, trailOpacity } from './waterfall-model';
import { createWaterfallPaths, waterfallIconSize, waterfallIconGap } from './waterfall-icons';
import { WaterfallSymbols } from './waterfall-symbols';
import { accentBlendSteps, accentDurationSeconds, accentProgress, createAccentPalette, trailShadeIndex, updateParticleAccent } from './waterfall-color';

export function initializeWaterfall() {
  const field = document.querySelector<HTMLElement>('[data-waterfall]');
  const canvas = field?.querySelector('canvas');
  const context = canvas?.getContext('2d');
  if (!field || !canvas || !context) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector<HTMLElement>('.hero')!;
  const pitch = waterfallIconSize + waterfallIconGap;
  let icons: Path2D[];
  try { icons = createWaterfallPaths(); } catch { return; }
  const symbols = new WaterfallSymbols(icons.length);
  let ratio = 1;
  let width = 800;
  // Leave room for the maximum 130px cursor push, plus the icon/stroke.
  const horizontalBleed = 160;
  const height = 800;
  let time = 0;
  let symbolTime = 0;
  let last = 0;
  let frame = 0;
  let inView = false;
  let paused = false;
  let suspended = false;
  let disposed = false;
  let loaded = false;
  let startupTimer: ReturnType<typeof setTimeout> | undefined;
  let columns = 0;
  let offset = 0;
  let palette: string[] = [];
  let accentElapsed = 0;
  const pointer = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, strength: 0, active: false };
  let activeTouchId: number | null = null;
  let touchClientX = 0;
  let touchClientY = 0;
  const particles = new Map<number, {
    column: number; row: number; cycle: number; speed: number; elapsed: number; start: number;
    rate: number; shadeIndex: number; dx: number; dy: number; accent: number;
    accentExitFrom: number; accentExitElapsed: number;
  }>();

  const draw = (delta = 0) => {
    const started = import.meta.env.DEV ? performance.now() : 0;
    let drawn = 0;
    let slowed = 0;
    let catchingUp = 0;
    const sample = import.meta.env.DEV && Math.floor(time) !== Number(field.dataset.sampleSecond);
    const visibleSymbols = sample ? new Set<number>() : null;
    let duplicateSymbols = 0;
    let unassigned = 0;
    let accented = 0;
    let maxAccent = 0;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width + horizontalBleed * 2, height);
    context.globalAlpha = 1;
    if (reduced.matches || !icons.length) return; // Blank until motion and icons are ready.
    symbols.beginFrame();
    const attackEase = 1 - Math.exp(-delta * 18);
    const returnEase = 1 - Math.exp(-delta * 6);
    accentElapsed = pointer.active ? Math.min(accentDurationSeconds, accentElapsed + delta) : 0;
    const groupAccent = accentProgress(accentElapsed);
    let currentColor = -1;
    for (let column = 0; column < columns; column++) {
      for (const stream of streamStates(column, time, height)) {
        for (let row = 0; row < Math.min(12, Math.ceil(stream.tail / pitch)); row++) {
          // Full cycle identity lets a locally delayed icon outlive its source drop.
          const id = (stream.cycle * 64 + column) * 16 + row;
          if (particles.has(id)) continue;
          const y = stretchedIconY(stream.elapsed, row, stream.speed, pitch);
          if (y === null || y < -waterfallIconSize / 2 || y > height + waterfallIconSize / 2) continue;
          const shadeStrength = trailOpacity(row * pitch, stream.tail);
          if (shadeStrength < .012) continue;
          particles.set(id, { column, row, cycle: stream.cycle, speed: stream.speed,
            start: time - stream.elapsed,
            elapsed: Math.max(0, stream.elapsed - delta), rate: 1, shadeIndex: trailShadeIndex(shadeStrength), dx: 0, dy: 0,
            accent: 0, accentExitFrom: 0, accentExitElapsed: accentDurationSeconds });
        }
      }
    }
    for (const [id, particle] of particles) {
      if (particle.column >= columns) { particles.delete(id); continue; }
      const x = offset + particle.column * pitch;
      const previousY = stretchedIconY(particle.elapsed, particle.row, particle.speed, pitch);
      const px = x + particle.dx - pointer.x;
      const py = (previousY ?? -20) + particle.dy - pointer.y;
      const affected = pointer.active && px * px + py * py < repulsionRadius * repulsionRadius;
      const referenceElapsed = time - particle.start;
      const lag = Math.max(0, referenceElapsed - delta - particle.elapsed);
      const fall = affected
        ? advanceLocalFallClock(particle.rate, delta, true)
        : catchUpFallClock(particle.rate, delta, lag, 3 + particle.row * .045);
      particle.rate = fall.rate;
      particle.elapsed = Math.min(referenceElapsed, particle.elapsed + fall.elapsed);
      const y = stretchedIconY(particle.elapsed, particle.row, particle.speed, pitch);
      if (y === null) continue;
      // Retain delayed icons until even maximum upward repulsion cannot expose them.
      if (y > height + 140) { particles.delete(id); continue; }
      if (pointer.strength > .01) {
        const push = pointerRepulsion(x, y, pointer.x, pointer.y, id);
        const targetX = push.x * pointer.strength;
        const targetY = push.y * pointer.strength;
        const ease = pointer.active && (targetX * targetX + targetY * targetY > .01) ? attackEase : returnEase;
        particle.dx += (targetX - particle.dx) * ease;
        particle.dy += (targetY - particle.dy) * ease;
      } else {
        particle.dx *= 1 - returnEase;
        particle.dy *= 1 - returnEase;
      }
      // Color follows the displayed position, including displacement and catch-up.
      const colorX = x + particle.dx - pointer.x;
      const colorY = y + particle.dy - pointer.y;
      const insideAccent = pointer.active && colorX * colorX + colorY * colorY < repulsionRadius * repulsionRadius;
      // Color belongs to the falling particle; changing its glyph never resets it.
      updateParticleAccent(particle, insideAccent, groupAccent, delta);
      if (y + particle.dy < -5 || y + particle.dy > height + 5) continue;
      const iconIndex = symbols.iconFor(id, particle.cycle, symbolTime);
      if (iconIndex === undefined) { unassigned++; continue; }
      if (visibleSymbols?.has(iconIndex)) duplicateSymbols++;
      visibleSymbols?.add(iconIndex);
      const colorIndex = Math.round(particle.accent * accentBlendSteps);
      const paletteIndex = particle.shadeIndex * (accentBlendSteps + 1) + colorIndex;
      if (paletteIndex !== currentColor) {
        context.strokeStyle = palette[paletteIndex];
        currentColor = paletteIndex;
      }
      if (sample && colorIndex > 0) accented++;
      if (sample) maxAccent = Math.max(maxAccent, particle.accent);
      context.setTransform(ratio, 0, 0, ratio,
        (horizontalBleed + x + particle.dx - waterfallIconSize / 2) * ratio,
        (y + particle.dy - waterfallIconSize / 2) * ratio);
      context.stroke(icons[iconIndex]);
      drawn++;
      if (particle.rate < .99) slowed++;
      if (particle.rate > 1.01) catchingUp++;
    }
    symbols.endFrame();
    if (sample) {
      field.dataset.sampleSecond = String(Math.floor(time));
      field.dataset.drawnIcons = String(drawn);
      field.dataset.drawMs = (performance.now() - started).toFixed(2);
      field.dataset.slowedIcons = String(slowed);
      field.dataset.catchingUpIcons = String(catchingUp);
      field.dataset.fullSpeedIcons = String(drawn - slowed - catchingUp);
      field.dataset.uniqueIcons = String(visibleSymbols!.size);
      field.dataset.duplicateIcons = String(duplicateSymbols);
      field.dataset.unassignedIcons = String(unassigned);
      field.dataset.iconPoolSize = String(icons.length);
      field.dataset.accentedIcons = String(accented);
      field.dataset.maxAccent = maxAccent.toFixed(3);
      field.dataset.groupAccent = groupAccent.toFixed(3);
    }
  };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const delta = last ? Math.min((now - last) / 1000, .1) : 0;
    last = now;
    time += delta;
    symbolTime += delta;
    const ease = 1 - Math.exp(-delta * 9);
    pointer.x += (pointer.targetX - pointer.x) * ease;
    pointer.y += (pointer.targetY - pointer.y) * ease;
    pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * ease;
    draw(delta);
  };

  const synchronize = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    const running = loaded && icons.length > 0 && inView && !document.hidden && !paused && !suspended && !reduced.matches && !disposed;
    field.dataset.motion = reduced.matches ? 'reduced' : !loaded && !disposed ? 'waiting' : running ? 'running' : 'paused';
    if (reduced.matches) draw();
    if (running) frame = requestAnimationFrame(tick);
    if (running) refreshViewportPointer();
  };

  const resize = () => {
    width = field.clientWidth;
    ratio = Math.min(devicePixelRatio || 1, 1.5);
    field.style.setProperty('--waterfall-bleed', `${horizontalBleed}px`);
    canvas.width = Math.round((width + horizontalBleed * 2) * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineWidth = 1;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    const style = getComputedStyle(field);
    palette = createAccentPalette(style.getPropertyValue('--waterfall-ink').trim(), style.getPropertyValue('--text-primary').trim(), style.getPropertyValue('--canvas').trim());
    columns = Math.floor(width / pitch);
    offset = (width - (columns - 1) * pitch) / 2;
    draw();
    refreshViewportPointer();
    refreshTouchPosition();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(field);
  observer.observe(hero);
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (!inView) pointer.active = false;
    synchronize();
  });
  visibility.observe(field);

  const trackPosition = (clientX: number, clientY: number, snap: boolean, preserveOutside = false) => {
    const rect = field.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const inside = x >= -horizontalBleed && x <= width + horizontalBleed && y >= 0 && y <= height;
    if (!inside) { if (!preserveOutside) pointer.active = false; return false; }
    pointer.active = true;
    if (!pointer.strength || snap) { pointer.x = x; pointer.y = y; }
    pointer.targetX = x;
    pointer.targetY = y;
    field.dataset.pointerX = x.toFixed(2);
    field.dataset.pointerY = y.toFixed(2);
    return true;
  };
  const move = (event: ViewportPointer) => {
    if (activeTouchId !== null) return;
    if (!event.active || !finePointer.matches || paused || suspended || reduced.matches || !inView) { pointer.active = false; return; }
    trackPosition(event.clientX, event.clientY, event.viewportChanged);
  };
  const findTouch = (touches: TouchList, id: number) => {
    for (let i = 0; i < touches.length; i++) if (touches[i].identifier === id) return touches[i];
    return null;
  };
  const endTouch = () => { activeTouchId = null; pointer.active = false; };
  const refreshTouchPosition = () => {
    if (activeTouchId !== null && !paused && !suspended && !reduced.matches && inView) {
      trackPosition(touchClientX, touchClientY, true);
    }
  };
  const onTouchStart = (event: TouchEvent) => {
    if (activeTouchId !== null || paused || suspended || reduced.matches || !inView) return;
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      if (!trackPosition(touch.clientX, touch.clientY, true, true)) continue;
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
    if (!paused && !suspended && !reduced.matches && inView) trackPosition(touchClientX, touchClientY, true);
  };
  const onTouchEnd = (event: TouchEvent) => {
    if (activeTouchId !== null && findTouch(event.changedTouches, activeTouchId)) endTouch();
  };
  const leave = () => { pointer.active = false; };
  const load = () => {
    if (startupTimer !== undefined || loaded || disposed) return;
    startupTimer = setTimeout(() => {
      startupTimer = undefined;
      if (disposed) return;
      loaded = true;
      synchronize();
    }, 2000);
  };
  const unwatch = watchViewportPointer(move);
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onTouchEnd, { passive: true });
  window.addEventListener('touchcancel', onTouchEnd, { passive: true });
  window.addEventListener('scroll', refreshTouchPosition, { passive: true, capture: true });
  window.addEventListener('blur', endTouch);
  window.addEventListener('themechange', resize);
  window.addEventListener('load', load, { once: true });
  const onVisibilityChange = () => { if (document.hidden) endTouch(); synchronize(); };
  document.addEventListener('visibilitychange', onVisibilityChange);
  reduced.addEventListener('change', synchronize);
  finePointer.addEventListener('change', leave);
  resize();
  synchronize();

  if (document.readyState === 'complete') load();

  const destroy = () => {
    disposed = true;
    if (startupTimer !== undefined) clearTimeout(startupTimer);
    synchronize();
    observer.disconnect();
    visibility.disconnect();
    unwatch();
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
    window.removeEventListener('scroll', refreshTouchPosition, true);
    window.removeEventListener('blur', endTouch);
    window.removeEventListener('themechange', resize);
    window.removeEventListener('load', load);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    reduced.removeEventListener('change', synchronize);
    finePointer.removeEventListener('change', leave);
  };
  if (import.meta.hot) import.meta.hot.dispose(destroy);
  return {
    setPaused(value: boolean) { if (paused === value) return; paused = value; if (value) endTouch(); synchronize(); },
    setSuspended(value: boolean) { if (suspended === value) return; suspended = value; if (value) endTouch(); synchronize(); },
    destroy,
  };
}

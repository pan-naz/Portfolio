import { refreshViewportPointer, watchViewportPointer } from '../viewport-pointer.ts';
import { readMotionToken } from '../native-motion.ts';

export type Spring = { value: number; velocity: number; target: number };

const captureDistance = 80;
const maxTravel = 32;

export function resolveWorkFilterSpringSpeed(
  pointerInside: boolean,
  regularSpeed: number,
  insideSpeed: number,
) {
  return pointerInside ? insideSpeed : regularSpeed;
}

export function resolveWorkFilterScrollSpeed(
  quietFor: number,
  quietDelay: number,
  lingerSpeed: number,
  returnSpeed: number,
) {
  return quietFor < quietDelay ? lingerSpeed : returnSpeed;
}

/** Linger only while scrolling outward at a rail edge, never while leaving it. */
export function trackWorkFilterScroll(
  spring: Spring,
  previousTop: number,
  nextTop: number,
  scrollDelta: number,
  limit: number,
  stickyTop: number,
) {
  const travel = previousTop - nextTop;
  // Layout changes and the rail's entrance are not scroll input. Only retain
  // motion in the scroll direction, bounded by the distance actually scrolled.
  if (travel * scrollDelta <= 0 || !Number.isFinite(stickyTop)) return false;
  // Project movement onto the outward side of the centered sticky position.
  // A frame crossing the boundary retains only its actual endpoint travel.
  const outwardTravel = scrollDelta < 0
    ? Math.max(0, previousTop - stickyTop) - Math.max(0, nextTop - stickyTop)
    : Math.max(0, stickyTop - nextTop) - Math.max(0, stickyTop - previousTop);
  if (outwardTravel * scrollDelta <= 0) return false;
  const lag = Math.sign(outwardTravel) * Math.min(Math.abs(outwardTravel), Math.abs(scrollDelta));
  spring.value = Math.max(-limit, Math.min(limit, spring.value + lag));
  return true;
}

export function calculateWorkFilterMagnet(
  pointerX: number,
  pointerY: number,
  bounds: { left: number; right: number; top: number; bottom: number },
) {
  const nearestX = Math.max(bounds.left, Math.min(bounds.right, pointerX));
  const nearestY = Math.max(bounds.top, Math.min(bounds.bottom, pointerY));
  const edgeDistance = Math.hypot(pointerX - nearestX, pointerY - nearestY);
  if (edgeDistance > captureDistance) return { x: 0, y: 0 };
  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = (bounds.top + bounds.bottom) / 2;
  const directionX = pointerX - centerX;
  const directionY = pointerY - centerY;
  const directionLength = Math.hypot(directionX, directionY);
  if (directionLength < .01) return { x: 0, y: 0 };
  const strength = 1 - edgeDistance / captureDistance;
  return {
    x: directionX / directionLength * maxTravel * strength,
    y: directionY / directionLength * maxTravel * strength,
  };
}

export function stepSpring(spring: Spring, seconds: number, speed: number) {
  const delta = spring.value - spring.target;
  const impulse = spring.velocity + speed * delta;
  const decay = Math.exp(-speed * seconds);
  spring.value = spring.target + (delta + impulse * seconds) * decay;
  spring.velocity = (spring.velocity - speed * impulse * seconds) * decay;
  if (Math.abs(spring.value - spring.target) < .01 && Math.abs(spring.velocity) < .01) {
    spring.value = spring.target;
    spring.velocity = 0;
  }
}

export function initializeWorkFilterMagnet() {
  const menu = document.querySelector<HTMLElement>('.work-rail .section-navigation');
  if (!menu || document.documentElement.dataset.workStageLayout !== 'true') return;
  const capability = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const controller = new AbortController();
  const signal = controller.signal;
  const x: Spring = { value: 0, velocity: 0, target: 0 };
  const y: Spring = { value: 0, velocity: 0, target: 0 };
  const followY: Spring = { value: 0, velocity: 0, target: 0 };
  const tokens = getComputedStyle(menu);
  const regularSpringSpeed = Number.parseFloat(tokens.getPropertyValue('--work-filter-magnet-spring-speed')) || 14;
  const insideSpringSpeed = Number.parseFloat(tokens.getPropertyValue('--work-filter-magnet-inside-spring-speed')) || 2;
  const scrollLag = Number.parseFloat(tokens.getPropertyValue('--work-filter-scroll-lag')) || 32;
  const scrollSpringSpeed = Number.parseFloat(tokens.getPropertyValue('--work-filter-scroll-spring-speed')) || 10;
  const scrollReturnSpeed = Number.parseFloat(tokens.getPropertyValue('--work-filter-scroll-return-speed')) || 20;
  const scrollReturnDelay = readMotionToken(tokens, '--delay-work-filter-scroll-return') || 80;
  let stickyTop = Number.parseFloat(tokens.getPropertyValue('top'));
  let paused = false;
  let frame = 0;
  let scrollFrame = 0;
  let pendingScrollDelta = 0;
  let pendingScrollTime = -Infinity;
  let lastTime = 0;
  let pointerInside = false;
  let lastScrollY = window.scrollY;
  let lastScrollTime = -Infinity;
  const restingTop = () => menu.getBoundingClientRect().top - y.value - followY.value;
  let lastRestingTop = restingTop();

  const write = () => {
    menu.style.transform = `translate3d(${x.value}px, ${y.value + followY.value}px, 0)`;
  };
  const tick = (time: number) => {
    const dt = Math.min(lastTime ? (time - lastTime) / 1000 : 1 / 60, .064);
    lastTime = time;
    const magnetSpringSpeed = resolveWorkFilterSpringSpeed(pointerInside, regularSpringSpeed, insideSpringSpeed);
    stepSpring(x, dt, magnetSpringSpeed);
    stepSpring(y, dt, magnetSpringSpeed);
    const followSpeed = resolveWorkFilterScrollSpeed(time - lastScrollTime, scrollReturnDelay, scrollSpringSpeed, scrollReturnSpeed);
    stepSpring(followY, dt, followSpeed);
    write();
    const settled = x.value === x.target && x.velocity === 0
      && y.value === y.target && y.velocity === 0
      && followY.value === followY.target && followY.velocity === 0;
    frame = settled ? 0 : requestAnimationFrame(tick);
    if (!frame) lastTime = 0;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const returnHome = (immediate = false) => {
    if (!immediate && x.target === 0 && y.target === 0
      && x.value === 0 && y.value === 0 && x.velocity === 0 && y.velocity === 0) return;
    x.target = y.target = 0;
    if (immediate) {
      cancelAnimationFrame(frame);
      frame = lastTime = 0;
      x.value = x.velocity = y.value = y.velocity = followY.value = followY.velocity = 0;
      write();
    } else schedule();
  };
  menu.dataset.magnetReady = 'true';
  const unwatch = watchViewportPointer(pointer => {
    if (!pointer.active || !capability.matches || paused || menu.closest('[hidden], [inert]')) {
      pointerInside = false;
      returnHome();
      return;
    }
    const rendered = menu.getBoundingClientRect();
    const inside = pointer.clientX >= rendered.left && pointer.clientX <= rendered.right
      && pointer.clientY >= rendered.top && pointer.clientY <= rendered.bottom;
    pointerInside = inside;
    // Remove the current magnetic translation from the measured rectangle so
    // the attraction calculation always uses the menu's stable resting bounds.
    const left = rendered.left - x.value;
    const right = rendered.right - x.value;
    const top = rendered.top - y.value - followY.value;
    const bottom = rendered.bottom - y.value - followY.value;
    const target = calculateWorkFilterMagnet(pointer.clientX, pointer.clientY, { left, right, top, bottom });
    x.target = target.x;
    y.target = target.y;
    schedule();
  });
  const updateFollow = () => {
    scrollFrame = 0;
    const delta = pendingScrollDelta;
    pendingScrollDelta = 0;
    if (!delta || !capability.matches || paused) return;
    const nextTop = restingTop();
    if (trackWorkFilterScroll(followY, lastRestingTop, nextTop, delta, scrollLag, stickyTop)) {
      lastScrollTime = pendingScrollTime;
    }
    lastRestingTop = nextTop;
    // Compensate before paint; the next frames gently release that offset.
    write();
    schedule();
  };
  const onScroll = () => {
    const scrollY = window.scrollY;
    const delta = scrollY - lastScrollY;
    lastScrollY = scrollY;
    if (!delta || !capability.matches || paused) return;
    pendingScrollTime = performance.now();
    pendingScrollDelta += delta;
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateFollow);
  };
  window.addEventListener('scroll', onScroll, { passive: true, signal });
  const resetCapability = () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = pendingScrollDelta = 0;
    pointerInside = false;
    returnHome(true);
    stickyTop = Number.parseFloat(tokens.getPropertyValue('top'));
    lastRestingTop = restingTop();
    lastScrollY = window.scrollY;
    lastScrollTime = -Infinity;
    refreshViewportPointer();
  };
  capability.addEventListener('change', resetCapability, { signal });
  window.addEventListener('resize', resetCapability, { passive: true, signal });
  const destroy = () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = pendingScrollDelta = 0;
    pointerInside = false;
    returnHome(true);
    unwatch();
    controller.abort();
    delete menu.dataset.magnetReady;
    menu.style.removeProperty('transform');
  };
  window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal });
  return {
    setPaused(value: boolean) {
      if (paused === value) return;
      paused = value;
      if (paused) {
        cancelAnimationFrame(scrollFrame);
        scrollFrame = pendingScrollDelta = 0;
        pointerInside = false;
        returnHome(true);
      }
      else {
        lastRestingTop = restingTop();
        lastScrollY = window.scrollY;
        lastScrollTime = -Infinity;
        refreshViewportPointer();
      }
    },
    destroy,
  };
}

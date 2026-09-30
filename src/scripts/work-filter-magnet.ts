import { refreshViewportPointer, watchViewportPointer } from './viewport-pointer.ts';

type Spring = { value: number; velocity: number; target: number };
type BoundaryState = { top: boolean; bottom: boolean };

const captureDistance = 80;
const maxTravel = 32;

export function resolveWorkFilterSpringSpeed(
  pointerInside: boolean,
  regularSpeed: number,
  insideSpeed: number,
) {
  return pointerInside ? insideSpeed : regularSpeed;
}

export function calculateWorkFilterBoundaryKick(
  scrollDelta: number,
  current: BoundaryState,
  previous: BoundaryState,
) {
  if (scrollDelta < 0 && current.top && previous.top) return -1;
  if (scrollDelta > 0 && current.bottom && previous.bottom) return 1;
  return 0;
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

function stepSpring(spring: Spring, seconds: number, speed: number) {
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
  const boundaryY: Spring = { value: 0, velocity: 0, target: 0 };
  const rail = menu.closest<HTMLElement>('.work-rail');
  const tokens = getComputedStyle(menu);
  const regularSpringSpeed = Number.parseFloat(tokens.getPropertyValue('--work-filter-magnet-spring-speed')) || 14;
  const insideSpringSpeed = Number.parseFloat(tokens.getPropertyValue('--work-filter-magnet-inside-spring-speed')) || 2;
  const overshoot = Number.parseFloat(tokens.getPropertyValue('--work-filter-boundary-overshoot')) || 16;
  const boundarySpringSpeed = Number.parseFloat(tokens.getPropertyValue('--work-filter-boundary-spring-speed')) || 10;
  const boundaryImpulse = overshoot * boundarySpringSpeed * Math.E;
  let paused = false;
  let frame = 0;
  let boundaryFrame = 0;
  let pendingScrollDelta = 0;
  let lastTime = 0;
  let pointerInside = false;
  let lastScrollY = window.scrollY;
  let boundaryState: BoundaryState = { top: false, bottom: false };
  let kickedTop = false;
  let kickedBottom = false;

  const write = () => {
    menu.style.transform = `translate3d(${x.value}px, ${y.value + boundaryY.value}px, 0)`;
  };
  const tick = (time: number) => {
    const dt = Math.min(lastTime ? (time - lastTime) / 1000 : 1 / 60, .064);
    lastTime = time;
    const magnetSpringSpeed = resolveWorkFilterSpringSpeed(pointerInside, regularSpringSpeed, insideSpringSpeed);
    stepSpring(x, dt, magnetSpringSpeed);
    stepSpring(y, dt, magnetSpringSpeed);
    stepSpring(boundaryY, dt, boundarySpringSpeed);
    write();
    const settled = x.value === x.target && x.velocity === 0
      && y.value === y.target && y.velocity === 0
      && boundaryY.value === boundaryY.target && boundaryY.velocity === 0;
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
      x.value = x.velocity = y.value = y.velocity = boundaryY.value = boundaryY.velocity = 0;
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
    const top = rendered.top - y.value - boundaryY.value;
    const bottom = rendered.bottom - y.value - boundaryY.value;
    const target = calculateWorkFilterMagnet(pointer.clientX, pointer.clientY, { left, right, top, bottom });
    x.target = target.x;
    y.target = target.y;
    schedule();
  });
  const readBoundaryState = (): BoundaryState => {
    if (!rail) return { top: false, bottom: false };
    const rendered = menu.getBoundingClientRect();
    const railBounds = rail.getBoundingClientRect();
    const stableTop = rendered.top - y.value - boundaryY.value;
    const stableBottom = rendered.bottom - y.value - boundaryY.value;
    return {
      top: Math.abs(stableTop - railBounds.top) <= 2,
      bottom: Math.abs(stableBottom - railBounds.bottom) <= 2,
    };
  };
  boundaryState = readBoundaryState();
  const updateBoundary = () => {
    boundaryFrame = 0;
    const delta = pendingScrollDelta;
    pendingScrollDelta = 0;
    if (!delta || !capability.matches || paused) return;
    const current = readBoundaryState();
    if (!current.top) kickedTop = false;
    if (!current.bottom) kickedBottom = false;
    const kick = calculateWorkFilterBoundaryKick(delta, current, boundaryState);
    if (kick < 0 && !kickedTop) {
      kickedTop = true;
      boundaryY.value = boundaryY.target = 0;
      boundaryY.velocity = -boundaryImpulse;
      schedule();
    } else if (kick > 0 && !kickedBottom) {
      kickedBottom = true;
      boundaryY.value = boundaryY.target = 0;
      boundaryY.velocity = boundaryImpulse;
      schedule();
    }
    boundaryState = current;
  };
  const onScroll = () => {
    const scrollY = window.scrollY;
    const delta = scrollY - lastScrollY;
    lastScrollY = scrollY;
    if (!delta || !capability.matches || paused) return;
    pendingScrollDelta += delta;
    if (!boundaryFrame) boundaryFrame = requestAnimationFrame(updateBoundary);
  };
  window.addEventListener('scroll', onScroll, { passive: true, signal });
  const resetCapability = () => {
    cancelAnimationFrame(boundaryFrame);
    boundaryFrame = pendingScrollDelta = 0;
    pointerInside = false;
    returnHome(true);
    boundaryState = readBoundaryState();
    kickedTop = kickedBottom = false;
    lastScrollY = window.scrollY;
    refreshViewportPointer();
  };
  capability.addEventListener('change', resetCapability, { signal });
  const destroy = () => {
    cancelAnimationFrame(boundaryFrame);
    boundaryFrame = pendingScrollDelta = 0;
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
        cancelAnimationFrame(boundaryFrame);
        boundaryFrame = pendingScrollDelta = 0;
        pointerInside = false;
        returnHome(true);
      }
      else refreshViewportPointer();
    },
    destroy,
  };
}

import { refreshViewportPointer, watchViewportPointer } from './viewport-pointer.ts';

type Spring = { value: number; velocity: number; target: number };

// Exact critically damped spring: smooth tracking without overshoot at any frame rate.
export function stepTiltSpring(spring: Spring, seconds: number) {
  const omega = 18;
  const delta = spring.value - spring.target;
  const impulse = spring.velocity + omega * delta;
  const decay = Math.exp(-omega * seconds);
  spring.value = spring.target + (delta + impulse * seconds) * decay;
  spring.velocity = (spring.velocity - omega * impulse * seconds) * decay;
  if (Math.abs(spring.value - spring.target) < .01 && Math.abs(spring.velocity) < .01) {
    spring.value = spring.target;
    spring.velocity = 0;
  }
}

export function initializeProjectTilt() {
  const work = document.querySelector<HTMLElement>('#work');
  if (!work) return;
  const capability = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const controller = new AbortController();
  const signal = controller.signal;
  let paused = false;
  let waitForPointerMove = false;
  let lastPointerX = 0, lastPointerY = 0;
  let deferredPointerX = 0, deferredPointerY = 0;
  let frame = 0;
  let lastTime = 0;
  const makeSpring = (): Spring => ({ value: 0, velocity: 0, target: 0 });
  const states = [...work.querySelectorAll<HTMLElement>('.project')].map(card => ({
    card, surface: card.querySelector<HTMLElement>('.project-surface')!,
    rx: makeSpring(), ry: makeSpring(),
    hovered: false,
  }));
  const moving = new Set<(typeof states)[number]>();
  const write = (state: (typeof states)[number]) => {
    state.surface.style.setProperty('--project-rotate-x', `${state.rx.value}deg`);
    state.surface.style.setProperty('--project-rotate-y', `${state.ry.value}deg`);
  };
  const tick = (time: number) => {
    const dt = Math.min(lastTime ? (time - lastTime) / 1000 : 1 / 60, .064);
    lastTime = time;
    for (const state of moving) {
      const springs = [state.rx, state.ry];
      springs.forEach(spring => stepTiltSpring(spring, dt));
      write(state);
      if (springs.every(spring => spring.value === spring.target && spring.velocity === 0)) {
        moving.delete(state);
        if (!state.hovered) state.card.classList.remove('is-tilting');
      }
    }
    frame = moving.size ? requestAnimationFrame(tick) : 0;
    if (!frame) lastTime = 0;
  };
  const schedule = (state: (typeof states)[number]) => {
    moving.add(state);
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = lastTime = 0;
    moving.clear();
    states.forEach(state => {
      state.hovered = false;
      [state.rx, state.ry].forEach(spring => { spring.value = spring.target = spring.velocity = 0; });
      state.card.classList.remove('is-tilting');
      write(state);
    });
  };
  states.forEach(state => { state.card.dataset.tiltReady = 'true'; });
  const unwatch = watchViewportPointer(pointer => {
    const movedSinceClose = pointer.clientX !== deferredPointerX || pointer.clientY !== deferredPointerY;
    lastPointerX = pointer.clientX;
    lastPointerY = pointer.clientY;
    if (waitForPointerMove) {
      if (!pointer.active || pointer.viewportChanged || !movedSinceClose) return;
      waitForPointerMove = false;
    }
    const card = pointer.target?.closest('.project');
    const canFollow = pointer.active && capability.matches && !paused && !work.querySelector('[aria-busy="true"]');
    states.forEach(state => {
      if (canFollow && card === state.card && !card.closest('[inert], [hidden], [aria-hidden="true"]')) {
        // Recompute local coordinates from the stable article on scroll as well as mouse movement.
        const rect = state.card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.max(0, Math.min(rect.width, pointer.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, pointer.clientY - rect.top));
        const angle = parseFloat(getComputedStyle(state.card).getPropertyValue('--project-tilt-angle'));
        state.rx.target = -(y / rect.height - .5) * angle * 2;
        state.ry.target = (x / rect.width - .5) * angle * 2;
        state.hovered = true;
        state.card.classList.add('is-tilting');
        schedule(state);
      } else if (state.hovered) {
        state.hovered = false;
        state.rx.target = state.ry.target = 0;
        schedule(state);
      }
    });
  });
  capability.addEventListener('change', () => { reset(); refreshViewportPointer(); }, { signal });
  work.addEventListener('workfilterchange', reset, { signal });
  const destroy = () => {
    reset();
    unwatch();
    controller.abort();
    states.forEach(state => { delete state.card.dataset.tiltReady; });
  };
  window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal });
  return {
    deferHoverUntilPointerMove() {
      deferredPointerX = lastPointerX;
      deferredPointerY = lastPointerY;
      waitForPointerMove = true;
    },
    setPaused(value: boolean) { if (paused === value) return; paused = value; if (value) reset(); else refreshViewportPointer(); },
    destroy,
  };
}

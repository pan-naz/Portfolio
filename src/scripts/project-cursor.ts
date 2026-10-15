import { readMotionToken } from './native-motion';
import { refreshViewportPointer, watchViewportPointer, type ViewportPointer } from './viewport-pointer';

export function initializeProjectCursor() {
  const cursor = document.querySelector<HTMLElement>('[data-project-cursor]');
  const work = document.querySelector<HTMLElement>('#work');
  if (!cursor || !work) return;
  // Keep viewport coordinates independent of card tilt and section transforms.
  document.body.append(cursor);
  const controller = new AbortController();
  const signal = controller.signal;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const plus = cursor.querySelector('svg');
  let rotation: Animation | undefined;
  let active: HTMLElement | null = null;
  let paused = false;
  let claimed = false;
  let waitForPointerMove = false;
  let lastPointer: { x: number; y: number } | undefined;
  const hide = () => {
    if (claimed) return;
    active?.classList.remove('is-cursor-active');
    active = null;
    cursor.classList.remove('is-visible');
    rotation?.cancel();
    rotation = undefined;
  };
  const follow = (event: ViewportPointer) => {
    const moved = event.active && !event.viewportChanged && (!lastPointer || lastPointer.x !== event.clientX || lastPointer.y !== event.clientY);
    if (event.active) lastPointer = { x: event.clientX, y: event.clientY };
    if (claimed) return;
    if (waitForPointerMove) {
      if (!moved) return;
      waitForPointerMove = false;
    }
    if (!finePointer.matches || paused || !event.active) { hide(); return; }
    const card = event.target instanceof Element ? event.target.closest<HTMLElement>('#work .project') : null;
    if (!card || card.closest('[inert], [hidden], [aria-hidden="true"]')) { hide(); return; }
    if (card !== active) {
      active?.classList.remove('is-cursor-active');
      active = card;
      active.classList.add('is-cursor-active');
      rotation?.cancel();
      if (plus && !reducedMotion.matches) {
        rotation = plus.animate([{ transform: 'rotate(0deg)' }, { transform: `rotate(${readMotionToken(getComputedStyle(cursor), '--rotation-icon-turn')}deg)` }], {
          duration: readMotionToken(getComputedStyle(cursor), '--duration-close-turn'), easing: getComputedStyle(cursor).getPropertyValue('--ease-in-out').trim(), iterations: 1,
        });
      }
    }
    cursor.hidden = false;
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    cursor.classList.add('is-visible');
  };
  const unwatch = watchViewportPointer(follow);
  work.addEventListener('workfilterchange', hide, { signal });
  finePointer.addEventListener('change', () => { hide(); refreshViewportPointer(); }, { signal });
  reducedMotion.addEventListener('change', () => { rotation?.cancel(); rotation = undefined; }, { signal });
  const destroy = () => { hide(); unwatch(); controller.abort(); cursor.remove(); };
  window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal });
  return {
    claim() {
      claimed = true;
      cursor.hidden = false;
      rotation?.cancel();
      rotation = undefined;
      active?.classList.remove('is-cursor-active');
      active = null;
      cursor.classList.add('is-visible', 'is-case-control');
      cursor.removeAttribute('aria-hidden');
      const button = cursor.querySelector('button')!;
      button.tabIndex = 0;
      button.setAttribute('aria-label', 'Close case study');
      return cursor;
    },
    release() {
      // Hide before reparenting so the old fixed close control cannot flash on the page.
      cursor.hidden = true;
      waitForPointerMove = true;
      claimed = false;
      document.body.append(cursor);
      cursor.classList.remove('is-case-control');
      cursor.setAttribute('aria-hidden', 'true');
      const button = cursor.querySelector('button')!;
      button.tabIndex = -1;
      button.setAttribute('aria-label', 'Project cursor');
      cursor.querySelector('svg')?.style.removeProperty('transform');
      hide();
      refreshViewportPointer();
    },
    setPaused(value: boolean) { if (paused === value) return; paused = value; if (value) hide(); else refreshViewportPointer(); }, destroy };
}

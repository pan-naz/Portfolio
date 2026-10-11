import { watchViewportPointer, type ViewportPointer } from './viewport-pointer.ts';

export const tooltipFollowTiming = { timeConstant: 72, maxElapsed: 64 };

export const tooltipFollowStep = (current: number, target: number, elapsed: number) => {
  const progress = 1 - Math.exp(-Math.min(Math.max(elapsed, 0), tooltipFollowTiming.maxElapsed) / tooltipFollowTiming.timeConstant);
  return current + (target - current) * progress;
};

// Clamp the complete, expanded bubble, including while following near an edge.
export const tooltipLocalX = (clientX: number, left: number, width: number, viewport: number) =>
  Math.max(width / 2 + 8, Math.min(viewport - width / 2 - 8, clientX)) - left;

const initTooltips = () => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll<HTMLElement>('[data-tooltip-target]').forEach(card => {
    if (card.dataset.tooltipCursor === 'true') return;

    const tooltip = card.querySelector<HTMLElement>('.tooltip');
    if (!tooltip) return;

    card.dataset.tooltipCursor = 'true';
    let frame = 0;
    let lastFrame = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let positioned = false;
    let tracking = false;

    const writePosition = () => {
      card.style.setProperty('--tooltip-x', `${currentX}px`);
      card.style.setProperty('--tooltip-y', `${currentY}px`);
    };

    const renderPointerPosition = (time: number) => {
      if (!tracking) {
        frame = 0;
        return;
      }

      const elapsed = lastFrame ? Math.min(time - lastFrame, 64) : 16.667;
      lastFrame = time;
      currentX = tooltipFollowStep(currentX, targetX, elapsed);
      currentY = tooltipFollowStep(currentY, targetY, elapsed);
      writePosition();

      if (Math.hypot(targetX - currentX, targetY - currentY) > .1) {
        frame = requestAnimationFrame(renderPointerPosition);
      } else {
        currentX = targetX;
        currentY = targetY;
        writePosition();
        frame = 0;
        lastFrame = 0;
      }
    };

    const followPointer = (event: ViewportPointer) => {

      const cardRect = card.getBoundingClientRect();
      const tooltipHeight = tooltip.offsetHeight;
      targetX = tooltipLocalX(event.clientX, cardRect.left, tooltip.offsetWidth, innerWidth);
      targetY = event.clientY - cardRect.top;
      tracking = true;

      tooltip.dataset.placement = event.clientY < tooltipHeight + 32 ? 'below' : 'above';

      if (!positioned || reducedMotion.matches || event.viewportChanged) {
        currentX = targetX;
        currentY = targetY;
        positioned = true;
        writePosition();
        return;
      }
      if (!frame) frame = requestAnimationFrame(renderPointerPosition);
    };

    const leave = () => {
      card.classList.remove('is-pointer-hovered');
      tracking = false;
      positioned = false;
      lastFrame = 0;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const unwatch = watchViewportPointer(pointer => {
      if (pointer.active && fine.matches && pointer.target?.closest('[data-tooltip-target]') === card && !card.closest('[inert]')) {
        card.classList.add('is-pointer-hovered');
        followPointer(pointer);
      } else leave();
    });
    const positionFocus = () => {
        if (!card.matches(':focus-visible')) return;
        leave();
        const rect = card.getBoundingClientRect();
        const center = rect.left + card.clientLeft + card.clientWidth / 2;
        const clamped = tooltipLocalX(center, rect.left + card.clientLeft, tooltip.offsetWidth, innerWidth);
        card.style.setProperty('--tooltip-x', clamped === card.clientWidth / 2 ? '50%' : `${clamped}px`);
        card.style.setProperty('--tooltip-y', tooltip.dataset.tooltipAnchor === 'top' ? '0px' : '50%');
        tooltip.dataset.placement = 'above';
    };
    card.addEventListener('focusin', () => requestAnimationFrame(positionFocus));
    window.addEventListener('resize', positionFocus);
    window.addEventListener('pagehide', event => {
      if (!event.persisted) { leave(); unwatch(); window.removeEventListener('resize', positionFocus); }
    });
  });
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltips, { once: true });
  } else {
    initTooltips();
  }

  document.addEventListener('astro:page-load', initTooltips);
}

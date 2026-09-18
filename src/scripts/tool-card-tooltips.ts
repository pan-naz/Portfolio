import { watchViewportPointer, type ViewportPointer } from './viewport-pointer.ts';

export const tooltipFollowStep = (current: number, target: number, elapsed: number) => {
  const progress = 1 - Math.exp(-Math.min(Math.max(elapsed, 0), 64) / 72);
  return current + (target - current) * progress;
};

const initToolCardTooltips = () => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll<HTMLElement>('.tool-card').forEach(card => {
    if (card.dataset.tooltipCursor === 'true') return;

    const tooltip = card.querySelector<HTMLElement>('.tool-card-tooltip');
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
      card.style.setProperty('--tool-tooltip-x', `${currentX}px`);
      card.style.setProperty('--tool-tooltip-y', `${currentY}px`);
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
      targetX = event.clientX - cardRect.left;
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
      if (pointer.active && fine.matches && pointer.target?.closest('.tool-card') === card && !card.closest('[inert]')) {
        card.classList.add('is-pointer-hovered');
        followPointer(pointer);
      } else leave();
    });
    window.addEventListener('pagehide', event => { if (!event.persisted) { leave(); unwatch(); } });
    card.addEventListener('focusin', () => {
      requestAnimationFrame(() => {
        if (!card.matches(':focus-visible')) return;
        card.style.setProperty('--tool-tooltip-x', '50%');
        card.style.setProperty('--tool-tooltip-y', '50%');
        tooltip.dataset.placement = 'above';
      });
    });
  });
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToolCardTooltips, { once: true });
  } else {
    initToolCardTooltips();
  }

  document.addEventListener('astro:page-load', initToolCardTooltips);
}

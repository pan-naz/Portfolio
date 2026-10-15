import {readMotionToken} from '../native-motion.ts';
interface Bounds { left: number; top: number; right: number; bottom: number; width: number; }
/** Anchor to the tile, keeping the complete popover inside its grid and viewport. */
export function servicePopoverPosition(tile: Bounds, grid: Bounds, size: { width: number; height: number }, viewport: { width: number; height: number; topInset?: number }) {
  const edge = 16, gap = 12;
  const topEdge = viewport.topInset ?? edge;
  const center = tile.left + tile.width / 2;
  const minLeft = Math.max(grid.left + 8, edge);
  const maxLeft = Math.min(grid.right - size.width - 8, viewport.width - size.width - edge);
  const left = Math.max(minLeft, Math.min(center - size.width / 2, maxLeft));
  const roomBelow = viewport.height - edge - tile.bottom;
  const roomAbove = tile.top - topEdge;
  const below = roomBelow >= size.height + gap || roomBelow >= roomAbove;
  const preferredTop = below ? tile.bottom + gap : tile.top - size.height - gap;
  const top = Math.max(topEdge, Math.min(preferredTop, viewport.height - edge - size.height));
  return { left: left - grid.left, top: top - grid.top, side: below ? 'below' : 'above', arrowX: Math.max(12, Math.min(center - left, size.width - 12)) };
}

class CaseStudyServiceTiles extends HTMLElement {
  private cleanup?: () => void;

  connectedCallback() {
    if (this.cleanup) return;
    const controller = new AbortController();
    const { signal } = controller;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    let tile: HTMLElement | undefined;
    let popover: HTMLElement | undefined;
    let frame = 0;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const cancelHide = () => { if (hideTimer) clearTimeout(hideTimer); hideTimer = undefined; };
    const hide = () => {
      cancelHide();
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      tile?.classList.remove('is-popover-open');
      if (popover) popover.hidden = true;
      tile = popover = undefined;
    };
    const position = () => {
      frame = 0;
      if (!tile || !popover) return;
      const bounds = tile.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= innerHeight) { hide(); return; }
      const close = document.querySelector<HTMLElement>('[aria-label="Close case study"]');
      const topInset = Math.max(16, (close?.getBoundingClientRect().bottom ?? 0) + 16);
      popover.style.setProperty('--service-safe-top', `${topInset}px`);
      const next = servicePopoverPosition(bounds, this.getBoundingClientRect(), { width: popover.offsetWidth, height: popover.offsetHeight }, { width: innerWidth, height: innerHeight, topInset });
      popover.style.left = `${next.left}px`;
      popover.style.top = `${next.top}px`;
      popover.style.setProperty('--service-arrow-x', `${next.arrowX}px`);
      popover.dataset.side = next.side;
    };
    const refresh = () => { if (tile && !frame) frame = requestAnimationFrame(position); };
    const show = (next: HTMLElement) => {
      cancelHide();
      if (tile !== next) hide();
      tile = next;
      popover = this.querySelector<HTMLElement>(`[data-service-popover="${next.dataset.serviceTile}"]`)!;
      popover.hidden = false;
      tile.classList.add('is-popover-open');
      position();
    };
    const interacting = () => Boolean(tile?.matches(':focus-visible') || (fine.matches && (tile?.matches(':hover') || popover?.matches(':hover'))));
    const deferHide = () => {
      cancelHide();
      if (!tile || interacting()) return;
      hideTimer = setTimeout(() => { hideTimer = undefined; if (!interacting()) hide(); }, readMotionToken(getComputedStyle(tile ?? this), '--delay-service-tooltip'));
    };
    this.querySelectorAll<HTMLElement>('[data-service-tile]').forEach(item => {
      item.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse' && fine.matches) show(item); }, { signal });
      item.addEventListener('pointerleave', deferHide, { signal });
      item.addEventListener('focusin', () => { if (item.matches(':focus-visible')) show(item); }, { signal });
      item.addEventListener('focusout', () => { if (tile === item && !interacting()) hide(); }, { signal });
      item.addEventListener('keydown', event => {
        if (event.key === 'Escape' && tile === item) { event.preventDefault(); event.stopPropagation(); hide(); }
      }, { signal });
    });
    this.querySelectorAll<HTMLElement>('[data-service-popover]').forEach(item => {
      item.addEventListener('pointerenter', () => { if (popover === item) cancelHide(); }, { signal });
      item.addEventListener('pointerleave', () => { if (popover === item) deferHide(); }, { signal });
    });
    window.addEventListener('scroll', refresh, { passive: true, capture: true, signal });
    window.addEventListener('resize', refresh, { passive: true, signal });
    document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); }, { signal });
    const resize = new ResizeObserver(refresh);
    resize.observe(this);
    this.cleanup = () => { hide(); if (frame) cancelAnimationFrame(frame); resize.disconnect(); controller.abort(); };
  }

  disconnectedCallback() { this.cleanup?.(); this.cleanup = undefined; }
}

if (typeof customElements !== 'undefined' && !customElements.get('case-study-service-tiles')) {
  customElements.define('case-study-service-tiles', CaseStudyServiceTiles);
}

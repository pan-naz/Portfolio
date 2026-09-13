import { headerItemY, mix, pillGeometry, pillProgress } from './header-morph-model';

export function initializeHeaderMorph() {
  const header = document.querySelector<HTMLElement>('.site-header')!;
  const identity = header.querySelector<HTMLElement>('.identity')!;
  const fullLogo = header.querySelector<HTMLElement>('.header-full-logo')!;
  const compactLogo = header.querySelector<HTMLElement>('.header-compact-logo')!;
  const controls = header.querySelector<HTMLElement>('.header-controls')!;
  const theme = controls.querySelector<HTMLButtonElement>('.theme-toggle')!;
  const menu = controls.querySelector<HTMLButtonElement>('.menu-toggle')!;
  const surface = header.querySelector<HTMLElement>('.header-pill-surface')!;
  const slot = document.querySelector<HTMLElement>('[data-hero-cta]')!;
  const button = slot.querySelector<HTMLAnchorElement>('.button')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px)');
  let metrics: { inset: number; buttonTop: number; buttonX: number; buttonWidth: number; buttonHeight: number;
    logoWidth: number; controlsWidth: number; controlsHeight: number; viewport: number } | undefined;
  let queued = 0;

  function relocate(docked: boolean) {
    if ((button.parentElement === header) === docked) return;
    const focused = document.activeElement === button;
    (docked ? header : slot).append(button);
    button.classList.toggle('header-cta', docked);
    if (!docked) { button.style.removeProperty('transform'); button.style.removeProperty('width'); }
    if (focused) button.focus({ preventScroll: true });
  }
  function render() {
    queued = 0;
    if (!metrics) return;
    const m = metrics;
    const progress = pillProgress(window.scrollY, m.buttonTop, m.inset, reduced.matches);
    const docked = progress > 0;
    header.classList.toggle('is-docking', docked);
    const targetControlsWidth = mobile.matches ? 44 : m.controlsWidth;
    const target = pillGeometry(m.viewport, targetControlsWidth, m.buttonWidth, mobile.matches);
    header.style.setProperty('--pill-progress', String(progress));
    header.dataset.pillProgress = progress.toFixed(3);
    header.dataset.pillTrigger = (m.buttonTop - m.inset).toFixed(1);
    const currentControlsWidth = mix(m.controlsWidth, targetControlsWidth, progress);
    const baseControlsX = m.viewport - m.inset - currentControlsWidth;
    const desiredControlsX = mix(m.viewport - m.inset - m.controlsWidth, target.controlsX, progress);
    controls.style.transform = `translate3d(${desiredControlsX - baseControlsX}px, ${headerItemY(progress, m.inset, m.controlsHeight)}px, 0)`;
    identity.style.transform = `translate3d(${mix(m.inset, target.logoX, progress) - m.inset}px, ${headerItemY(progress, m.inset, 44)}px, 0)`;
    identity.style.width = `${mix(m.logoWidth, target.logoWidth, progress)}px`;
    fullLogo.style.opacity = String(1 - progress);
    compactLogo.style.opacity = String(progress);
    if (mobile.matches && progress > .5 && document.activeElement === theme) menu.focus({ preventScroll: true });
    theme.inert = mobile.matches && progress > .5;
    surface.style.width = `${mix(m.buttonWidth, target.width, progress)}px`;
    surface.style.transform = `translate3d(${mix(m.buttonX, target.left, progress)}px, 0, 0)`;
    surface.style.opacity = String(progress);
    relocate(docked);
    if (docked) {
      button.style.width = `${m.buttonWidth}px`;
      button.style.transform = `translate3d(${mix(m.buttonX, target.buttonX, progress)}px, ${mix(0, (64 - m.buttonHeight) / 2, progress)}px, 0)`;
    }
  }
  function measure() {
    // All layout reads are isolated to resize/font changes, never the scroll loop.
    header.style.setProperty('--pill-progress', '0');
    const slotRect = slot.getBoundingClientRect();
    const width = button.offsetWidth;
    const height = button.offsetHeight;
    slot.style.setProperty('--cta-width', `${width}px`);
    slot.style.setProperty('--cta-height', `${height}px`);
    metrics = {
      inset: parseFloat(getComputedStyle(header).top), buttonTop: slotRect.top + window.scrollY,
      buttonX: slotRect.left, buttonWidth: width, buttonHeight: height,
      logoWidth: fullLogo.offsetWidth, controlsWidth: controls.offsetWidth,
      controlsHeight: controls.offsetHeight, viewport: window.innerWidth,
    };
    render();
  }
  function requestRender() { if (!queued) queued = requestAnimationFrame(render); }
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', measure);
  reduced.addEventListener('change', render);
  mobile.addEventListener('change', measure);
  document.fonts.ready.then(measure);
  const observer = new ResizeObserver(measure);
  observer.observe(document.querySelector('.hero-content')!);
  measure();
  if (import.meta.hot) import.meta.hot.dispose(() => {
    if (queued) cancelAnimationFrame(queued);
    window.removeEventListener('scroll', requestRender);
    window.removeEventListener('resize', measure);
    reduced.removeEventListener('change', render);
    mobile.removeEventListener('change', measure);
    observer.disconnect();
    header.classList.remove('is-docking');
    relocate(false);
  });
}

import { advancePill, advancePillExit, mix, nextPillState, pillDockOffset, pillExitY, pillGeometry, pillLabels, pillReturnViewportBuffer, pillShape } from './header-morph-model';
import { createNativeMotion, readMotionToken, revealEffects } from '../native-motion';

export function initializeHeaderMorph() {
  const header = document.querySelector<HTMLElement>('.site-header')!;
  const identity = header.querySelector<HTMLElement>('.identity')!;
  const fullLogo = header.querySelector<HTMLElement>('.header-full-logo')!;
  const compactLogo = header.querySelector<HTMLElement>('.header-compact-logo')!;
  const controls = header.querySelector<HTMLElement>('.header-controls')!;
  const theme = controls.querySelector<HTMLButtonElement>('.theme-toggle')!;
  const surface = header.querySelector<HTMLElement>('.header-pill-surface')!;
  const slot = document.querySelector<HTMLElement>('[data-hero-cta]')!;
  const hero = slot.closest<HTMLElement>('.hero')!;
  const buttonHome = slot.querySelector<HTMLElement>('.hero-cta-entrance') ?? slot;
  const button = slot.querySelector<HTMLAnchorElement>('.button')!;
  // The frame loop owns placement in both parents. A generic button transform
  // transition can interpolate from the header origin during the DOM handoff.
  button.classList.add('cta-morph-managed');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px)');
  let metrics: { inset: number; buttonTop: number; buttonX: number; buttonWidth: number; buttonHeight: number;
    controlsWidth: number; viewport: number } | undefined;
  let queued = 0, previousTime = 0, previousScroll = window.scrollY, progress = 0;
  let expanded = false, releasing = false, disposed = false;
  let exit = 0;
  let returnMotion: ReturnType<typeof createNativeMotion> | undefined;

  function revealReturnedButton(focused: boolean) {
    buttonHome.classList.add('is-restored');
    returnMotion?.cancel();
    returnMotion = undefined;
    if (disposed || reduced.matches || typeof buttonHome.animate !== 'function' || focused) {
      buttonHome.style.opacity = '1';
      buttonHome.style.transform = 'translateY(0px)';
      return;
    }
    const tokens = getComputedStyle(hero);
    returnMotion = createNativeMotion(revealEffects([buttonHome], {
      duration: readMotionToken(tokens, '--duration-copy-reveal'),
      distance: parseFloat(tokens.getPropertyValue('--distance-text-reveal')),
      easing: tokens.getPropertyValue('--ease-entrance').trim(),
    }), { onComplete: () => { returnMotion = undefined; } });
  }

  function relocate(docked: boolean) {
    if ((button.parentElement === header) === docked) return;
    const focused = document.activeElement === button;
    if (docked) {
      returnMotion?.cancel();
      returnMotion = undefined;
      buttonHome.classList.remove('is-restored');
      buttonHome.style.removeProperty('opacity');
      buttonHome.style.removeProperty('transform');
    }
    (docked ? header : buttonHome).append(button);
    button.classList.toggle('header-cta', docked);
    if (!docked) {
      button.style.removeProperty('transform');
      button.style.removeProperty('width');
      revealReturnedButton(focused);
    }
    if (focused) button.focus({ preventScroll: true });
  }
  function paint() {
    if (!metrics) return;
    const m = metrics;
    const docked = expanded || progress > 0;
    if (docked && button.parentElement !== header) {
      // Re-read the actual source at handoff, after fonts/responsive layout settle.
      m.buttonX = slot.getBoundingClientRect().left;
    }
    header.classList.toggle('is-docking', docked);
    header.style.setProperty('--pill-progress', docked ? '1' : '0');
    header.dataset.pillProgress = progress.toFixed(3);
    header.dataset.pillState = docked ? (!expanded ? 'hiding' : progress === 1 ? 'expanded' : 'expanding') : 'hero';
    header.dataset.pillExit = exit.toFixed(3);
    header.dataset.pillSourceX = m.buttonX.toFixed(2);
    header.dataset.pillTrigger = (m.buttonTop - m.inset).toFixed(1);
    relocate(docked);
    if (!docked) {
      identity.style.cssText = '';
      controls.style.cssText = '';
      fullLogo.style.opacity = '1';
      compactLogo.style.opacity = '0';
      identity.inert = controls.inert = theme.inert = false;
      surface.style.opacity = '0';
      return;
    }
    const shape = pillShape(progress), labels = pillLabels(progress);
    const targetControlsWidth = mobile.matches ? 44 : m.controlsWidth;
    const target = pillGeometry(m.viewport, targetControlsWidth, m.buttonWidth, mobile.matches);
    const width = Math.min(m.viewport - 48, mix(m.buttonWidth, target.width, shape));
    const center = Math.max(width / 2 + 24, Math.min(m.viewport - width / 2 - 24,
      mix(m.buttonX + m.buttonWidth / 2, m.viewport / 2, shape)));
    const left = center - width / 2;
    const paddingLeft = mix(0, target.paddingLeft, shape);
    const paddingRight = mix(0, target.paddingRight, shape);
    // Exit translates the whole capsule upward without shrinking or morphing
    // back. Return the real CTA to its hero slot only once fully offscreen.
    const y = pillDockOffset(progress, m.inset) + pillExitY(exit, m.inset);
    surface.style.width = `${width}px`;
    surface.style.height = `${mix(m.buttonHeight, 64, shape)}px`;
    surface.style.transform = `translate3d(${left}px, ${y}px, 0)`;
    surface.style.opacity = String(Math.min(1, shape * 4));
    button.style.width = `${m.buttonWidth}px`;
    button.style.transform = `translate3d(${left + width - paddingRight - m.buttonWidth}px, ${y + (64 - m.buttonHeight) / 2 * shape}px, 0)`;
    // Reveal within the capsule late; nothing flies in from the header corners.
    const logoX = left + paddingLeft;
    const controlsX = logoX + target.logoWidth + target.logoGap;
    identity.style.transform = `translate3d(${logoX - m.inset}px, ${y + 10}px, 0)`;
    identity.style.width = `${target.logoWidth}px`;
    identity.style.opacity = String(labels);
    fullLogo.style.opacity = '0';
    compactLogo.style.opacity = '1';
    controls.style.transform = `translate3d(${controlsX - (m.viewport - m.inset - targetControlsWidth)}px, ${y + 10}px, 0)`;
    controls.style.opacity = String(labels);
    const hideControls = labels < .1 || !expanded;
    if (hideControls && (identity.contains(document.activeElement) || controls.contains(document.activeElement))) button.focus({ preventScroll: true });
    identity.inert = controls.inert = hideControls;
    theme.inert = mobile.matches;
  }
  function frame(time: number) {
    queued = 0;
    progress = advancePill(progress, expanded, time - previousTime, reduced.matches);
    exit = advancePillExit(exit, expanded, time - previousTime, reduced.matches);
    if (!expanded && exit === 1) progress = 0;
    previousTime = time;
    paint();
    if (expanded ? progress < 1 || exit > 0 : progress > 0) queued = requestAnimationFrame(frame);
  }
  function wake() {
    if (!queued) { previousTime = performance.now(); queued = requestAnimationFrame(frame); }
  }
  function updateTarget() {
    if (!metrics || disposed) return;
    const scroll = window.scrollY;
    const state = nextPillState(
      scroll,
      previousScroll,
      metrics.buttonTop - metrics.inset,
      metrics.inset + metrics.buttonHeight + pillReturnViewportBuffer,
      expanded,
      releasing,
    );
    const changed = state.expanded !== expanded || state.releasing !== releasing;
    if (state.expanded && !expanded && progress === 0) exit = 0;
    previousScroll = scroll;
    expanded = state.expanded;
    releasing = state.releasing;
    // Settled geometry is independent of scroll position. Repainting it on
    // every wheel tick invalidates header styles while the canvas is drawing.
    if (changed || (expanded ? progress < 1 || exit > 0 : progress > 0)) wake();
  }
  function measure() {
    if (disposed) return;
    header.style.setProperty('--pill-progress', '0');
    const slotRect = slot.getBoundingClientRect();
    const width = button.offsetWidth, height = button.offsetHeight;
    slot.style.setProperty('--cta-width', `${width}px`);
    slot.style.setProperty('--cta-height', `${height}px`);
    metrics = {
      inset: parseFloat(getComputedStyle(header).top), buttonTop: slotRect.top + window.scrollY,
      buttonX: slotRect.left, buttonWidth: width, buttonHeight: height,
      controlsWidth: controls.offsetWidth, viewport: window.innerWidth,
    };
    updateTarget();
    paint();
  }
  window.addEventListener('scroll', updateTarget, { passive: true });
  window.addEventListener('resize', measure);
  reduced.addEventListener('change', updateTarget);
  mobile.addEventListener('change', measure);
  document.fonts.ready.then(measure);
  const observer = new ResizeObserver(measure);
  observer.observe(document.querySelector('.hero-content')!);
  measure();
  if (import.meta.hot) import.meta.hot.dispose(() => {
    disposed = true;
    if (queued) cancelAnimationFrame(queued);
    window.removeEventListener('scroll', updateTarget);
    window.removeEventListener('resize', measure);
    reduced.removeEventListener('change', updateTarget);
    mobile.removeEventListener('change', measure);
    observer.disconnect();
    returnMotion?.cancel();
    header.classList.remove('is-docking');
    identity.inert = controls.inert = theme.inert = false;
    relocate(false);
    button.classList.remove('cta-morph-managed');
    buttonHome.classList.remove('is-restored');
    buttonHome.style.removeProperty('opacity');
    buttonHome.style.removeProperty('transform');
  });
}

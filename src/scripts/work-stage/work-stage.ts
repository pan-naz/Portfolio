import { createNativeMotion, readMotionToken, revealEffects } from '../native-motion.ts';
import { sectionRevealEffects } from '../section-reveals';
import { canShiftWorkStage, nextWorkStageExpanded, shouldRevealWorkContent } from './work-stage-model.ts';

interface IntroOptions { duration: number; delay: number; easing: string; }
export interface WorkStageController {
  startIntro(options: IntroOptions): void;
  setPaused(value: boolean): void;
}

const restingTransform = 'translate(var(--hero-visual-gutter), 0px)';
const expandedTransform = 'translate(0px, 0px)';

/**
 * The work background is static in its inset intro position, then owns one
 * interruptible scroll-triggered expansion. Content keeps its final coordinates
 * while the centered filter fades upward independently. Scroll chooses the
 * state; it never scrubs animation progress.
 */
export function initializeWorkStage(): WorkStageController | undefined {
  const section = document.querySelector<HTMLElement>('[data-work-stage]');
  const surface = section?.querySelector<HTMLElement>('[data-work-stage-surface]');
  const panel = section?.querySelector<HTMLElement>('.work-panel');
  const rail = section?.querySelector<HTMLElement>('[data-work-rail]');
  const compactFilter = section?.querySelector<HTMLElement>('.work-compact-filter');
  const heading = section?.querySelector<HTMLElement>('.section-heading');
  const title = heading?.querySelector<HTMLElement>('h2');
  if (!section || !surface || !panel || !rail || !heading || !title) return;
  const index = heading.querySelector<HTMLElement>('.section-index > *');
  const description = heading.querySelector<HTMLElement>('.section-description');
  const content = [...section.querySelectorAll<HTMLElement>('[data-section-item]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tokens = getComputedStyle(section);
  const number = (name: string) => readMotionToken(tokens, name);
  const entranceEase = () => tokens.getPropertyValue('--ease-entrance').trim();
  const stageEase = () => tokens.getPropertyValue('--ease-work-stage').trim();
  const sectionRevealRatio = number('--section-reveal-trigger-viewport-ratio');
  const expandViewportRatio = number('--work-stage-trigger-viewport-ratio');
  const collapseAtScrollY = number('--work-stage-collapse-scroll-y');
  let previewRadius = getComputedStyle(panel).borderRadius;
  let shiftMotion: ReturnType<typeof createNativeMotion> | undefined;
  let railMotion: ReturnType<typeof createNativeMotion> | undefined;
  let headingMotion: ReturnType<typeof createNativeMotion> | undefined;
  let expanded = false;
  let headingRevealed = false;
  let headingResolved = false;
  let paused = document.hidden;
  let scrollFrame = 0;
  const root = document.documentElement;
  const canAnimate = typeof panel.animate === 'function';
  const floatingMotion = () => canAnimate && canShiftWorkStage(root.dataset.workStageLayout === 'true', reduced.matches);
  let preciseDesktop = floatingMotion();
  const revealContent = root.dataset.workPreviewLayout === 'true' && !reduced.matches && canAnimate;

  const touchFilter = root.dataset.workTouchPreview === 'true' ? compactFilter : undefined;
  const headingParts = [index, title, description, ...content, touchFilter].filter((item): item is HTMLElement => Boolean(item));
  const railHiddenTransform = 'translate3d(0px, var(--distance-text-reveal), 0px)';
  const railVisibleTransform = 'translate3d(0px, 0px, 0px)';
  const showHeadingImmediately = () => headingParts.forEach(element => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0px)';
  });
  const syncCompactFilter = () => {
    if (!compactFilter) return;
    const hidden = root.dataset.workTouchPreview === 'true' && revealContent && !headingRevealed && !reduced.matches;
    if (hidden) compactFilter.style.opacity = '0';
    else if (!touchFilter || headingResolved || reduced.matches || !revealContent) {
      compactFilter.style.opacity = '';
      compactFilter.style.transform = '';
    }
    compactFilter.style.pointerEvents = hidden ? 'none' : '';
  };
  const hideHeading = () => {
    headingParts.forEach(element => { element.style.opacity = '0'; });
    syncCompactFilter();
  };
  const settleHeadingAtTop = () => {
    // Only a fresh page has an empty preview. Once visited, retain the completed
    // reveal even when the background returns to its inset position.
    if (!headingRevealed) {
      hideHeading();
      return;
    }
    headingResolved = true;
    headingMotion?.finish();
    showHeadingImmediately();
  };

  const showRailImmediately = () => {
    rail.style.opacity = '1';
    rail.style.transform = railVisibleTransform;
  };
  const finishRail = () => railMotion?.finish();
  const hideRailImmediately = () => {
    rail.style.opacity = '0';
    rail.style.transform = railHiddenTransform;
  };
  const revealRail = () => {
    railMotion?.cancel();
    section.classList.remove('is-work-rail-moving');
    if (getComputedStyle(rail).display === 'none') return;
    if (reduced.matches || typeof rail.animate !== 'function') {
      showRailImmediately();
      return;
    }
    section.classList.add('is-work-rail-moving');
    railMotion = createNativeMotion([{
      element: rail,
      keyframes: [
        { opacity: 0, transform: railHiddenTransform },
        { opacity: 1, transform: railVisibleTransform },
      ],
      duration: number('--duration-title-reveal'),
      easing: entranceEase(),
    }], { paused, onComplete: () => {
      railMotion = undefined;
      section.classList.remove('is-work-rail-moving');
    } });
  };
  const dismissRail = (immediate = false) => {
    railMotion?.cancel();
    section.classList.remove('is-work-rail-moving');
    if (immediate || reduced.matches || typeof rail.animate !== 'function') {
      hideRailImmediately();
      return;
    }
    const style = getComputedStyle(rail);
    rail.style.opacity = style.opacity;
    rail.style.transform = style.transform === 'none' ? railVisibleTransform : style.transform;
    section.classList.add('is-work-rail-moving');
    railMotion = createNativeMotion([{
      element: rail,
      keyframes: [
        { opacity: rail.style.opacity, transform: rail.style.transform },
        { opacity: 0, transform: railHiddenTransform },
      ],
      duration: number('--duration-layout'),
      easing: stageEase(),
    }], { paused, onComplete: () => {
      railMotion = undefined;
      section.classList.remove('is-work-rail-moving');
    } });
  };

  const revealHeading = (stageTop = section.getBoundingClientRect().top) => {
    if (!shouldRevealWorkContent(stageTop, window.scrollY, window.innerHeight * sectionRevealRatio)) return;
    if (headingRevealed) {
      if (headingResolved) showHeadingImmediately();
      return;
    }
    headingRevealed = true;
    syncCompactFilter();
    if (reduced.matches || typeof title.animate !== 'function') {
      showHeadingImmediately();
      return;
    }
    void document.fonts.ready.then(() => {
      if (reduced.matches || headingResolved) return;
      const effects = [
        ...sectionRevealEffects(title, index, description, content),
        // Touch controls start with the heading, using its shared copy recipe.
        ...revealEffects(touchFilter ? [touchFilter] : [], {
          duration: number('--duration-copy-reveal'),
          distance: number('--distance-text-reveal'),
          easing: entranceEase(),
        }),
      ];
      headingMotion = createNativeMotion(effects, { paused });
    });
  };

  const currentTransform = () => {
    const computed = getComputedStyle(panel).transform;
    return computed === 'none' ? panel.style.transform || restingTransform : computed;
  };
  const startShift = (nextExpanded: boolean, current: string, currentRadius: string, onComplete?: () => void) => {
    const target = nextExpanded ? expandedTransform : restingTransform;
    const targetRadius = nextExpanded ? '0px' : previewRadius;
    const radiusKeyframes: Keyframe[] = nextExpanded
      ? [
          { offset: 0, borderRadius: currentRadius },
          { offset: 0.72, borderRadius: currentRadius },
          { offset: 1, borderRadius: targetRadius },
        ]
      : [
          { offset: 0, borderRadius: currentRadius },
          { offset: 0.28, borderRadius: targetRadius },
          { offset: 1, borderRadius: targetRadius },
        ];
    section.classList.add('is-work-shifting');
    shiftMotion = createNativeMotion([
      {
        element: panel,
        keyframes: [{ transform: current }, { transform: target }],
        duration: number('--duration-work-stage'),
        easing: stageEase(),
      },
      {
        element: panel,
        keyframes: radiusKeyframes,
        duration: number('--duration-work-stage'),
        easing: stageEase(),
      },
    ], { paused, onComplete: () => {
      shiftMotion = undefined;
      section.classList.remove('is-work-shifting');
      onComplete?.();
    } });
  };
  const move = (nextExpanded: boolean, immediate = false) => {
    if (!preciseDesktop) return;
    if (expanded === nextExpanded && !immediate) return;
    const current = currentTransform();
    const currentRadius = getComputedStyle(panel).borderRadius;
    expanded = nextExpanded;
    shiftMotion?.cancel();
    shiftMotion = undefined;
    section.classList.remove('is-work-shifting');
    panel.style.transform = current;
    panel.style.borderRadius = currentRadius;
    section.classList.toggle('is-work-expanded', expanded);
    if (!expanded) dismissRail(immediate);
    if (immediate || reduced.matches || typeof panel.animate !== 'function') {
      panel.style.transform = expanded ? expandedTransform : restingTransform;
      panel.style.borderRadius = expanded ? '0px' : previewRadius;
      if (expanded) {
        revealHeading();
        revealRail();
      }
      return;
    }
    startShift(expanded, current, currentRadius, () => {
      if (expanded) {
        revealHeading();
        revealRail();
      }
    });
  };
  const updateFromScroll = () => {
    scrollFrame = 0;
    if (reduced.matches) return;
    const stageTop = section.getBoundingClientRect().top;
    if (window.scrollY <= collapseAtScrollY) settleHeadingAtTop();
    else revealHeading(stageTop);
    const expandAt = window.innerHeight * expandViewportRatio;
    const next = nextWorkStageExpanded(
      stageTop,
      window.scrollY,
      expanded,
      expandAt,
      collapseAtScrollY,
    );
    if (preciseDesktop && next !== expanded) move(next);
  };
  const onScroll = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateFromScroll);
  };

  if (revealContent) {
    section.classList.add('work-content-can-reveal');
    hideHeading();
  } else {
    showHeadingImmediately();
    headingRevealed = true;
  }
  if (preciseDesktop) {
    section.classList.add('work-stage-can-shift');
    panel.style.transform = restingTransform;
    hideRailImmediately();
  } else {
    panel.style.transform = expandedTransform;
    showRailImmediately();
  }

  const syncLayout = () => {
    const next = floatingMotion();
    if (next !== preciseDesktop) {
      shiftMotion?.cancel();
      railMotion?.cancel();
      shiftMotion = railMotion = undefined;
      section.classList.remove('is-work-shifting', 'is-work-rail-moving');
      preciseDesktop = next;
      section.classList.toggle('work-stage-can-shift', next);
      if (next) {
        // Read the new viewport's radius without a stale inline override.
        panel.style.borderRadius = '';
        previewRadius = getComputedStyle(panel).borderRadius;
        const target = nextWorkStageExpanded(section.getBoundingClientRect().top,
          window.scrollY, expanded, window.innerHeight * expandViewportRatio, collapseAtScrollY);
        move(target, true);
        finishRail();
      } else {
        panel.style.transform = expandedTransform;
        panel.style.borderRadius = '0px';
        showRailImmediately();
      }
    } else if (next && !shiftMotion) {
      panel.style.borderRadius = '';
      previewRadius = getComputedStyle(panel).borderRadius;
      panel.style.borderRadius = expanded ? '0px' : previewRadius;
    }
    if (reduced.matches) {
      headingMotion?.finish();
      headingRevealed = true;
      showHeadingImmediately();
    }
    onScroll();
    syncCompactFilter();
  };
  const lifecycle = new AbortController();
  const signal = lifecycle.signal;
  window.addEventListener('scroll', onScroll, { passive: true, signal });
  window.addEventListener('workstagelayoutchange', syncLayout, { signal });
  window.addEventListener('resize', syncLayout, { passive: true, signal });
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    cancelAnimationFrame(scrollFrame);
    shiftMotion?.cancel();
    railMotion?.cancel();
    headingMotion?.cancel();
    lifecycle.abort();
  }, { signal });
  const finishHeading = () => {
    headingResolved = true;
    headingRevealed = true;
    syncCompactFilter();
    headingMotion?.finish();
    showHeadingImmediately();
    move(true, reduced.matches);
  };
  section.addEventListener('focusin', finishHeading, { signal });
  section.addEventListener('workfilterchange', () => {
    if (window.scrollY <= collapseAtScrollY) return;
    finishHeading();
  }, { signal });
  reduced.addEventListener('change', syncLayout, { signal });

  // Returning from a reloaded case resumes an already visited collection.
  // Resolve its entrance before the scroll-restoration paint guard releases.
  if (document.documentElement.dataset.caseReturn === 'true') {
    headingResolved = headingRevealed = true;
    syncCompactFilter();
    showHeadingImmediately();
    move(true, true);
    railMotion?.finish();
  }

  return {
    startIntro() { section.classList.add('is-work-intro-complete'); },
    setPaused(value) {
      paused = value;
      shiftMotion?.setPaused(value);
      railMotion?.setPaused(value);
      headingMotion?.setPaused(value);
    },
  };
}

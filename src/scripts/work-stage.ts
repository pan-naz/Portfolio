import { createNativeMotion, readMotionToken } from './native-motion.ts';
import { sectionRevealEffects } from './section-reveals';
import { canShiftWorkStage, nextWorkStageExpanded } from './work-stage-model.ts';

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
  const previewRadius = getComputedStyle(panel).borderRadius;
  let shiftMotion: ReturnType<typeof createNativeMotion> | undefined;
  let railMotion: ReturnType<typeof createNativeMotion> | undefined;
  let headingMotion: ReturnType<typeof createNativeMotion> | undefined;
  let expanded = false;
  let headingRevealed = false;
  let headingResolved = false;
  let paused = document.hidden;
  let scrollFrame = 0;
  const preciseDesktop = document.documentElement.dataset.workStageMotion === 'true'
    && canShiftWorkStage(
      matchMedia('(hover: hover)').matches,
      matchMedia('(pointer: fine)').matches,
      navigator.maxTouchPoints,
    );

  const headingParts = [index, title, description, ...content].filter((item): item is HTMLElement => Boolean(item));
  const railHiddenTransform = 'translate3d(0px, var(--distance-text-reveal), 0px)';
  const railVisibleTransform = 'translate3d(0px, 0px, 0px)';
  const showHeadingImmediately = () => headingParts.forEach(element => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0px)';
  });
  const hideHeading = () => headingParts.forEach(element => { element.style.opacity = '0'; });

  const showRailImmediately = () => {
    rail.style.opacity = '1';
    rail.style.transform = railVisibleTransform;
  };
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

  const revealHeading = () => {
    if (headingRevealed) return;
    headingRevealed = true;
    if (reduced.matches || typeof title.animate !== 'function') {
      showHeadingImmediately();
      return;
    }
    void document.fonts.ready.then(() => {
      if (reduced.matches || headingResolved) return;
      const effects = sectionRevealEffects(title, index, description, content);
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
    const stageTop = section.getBoundingClientRect().top;
    if (!headingRevealed && stageTop <= window.innerHeight * sectionRevealRatio) revealHeading();
    const expandAt = window.innerHeight * expandViewportRatio;
    const next = nextWorkStageExpanded(
      stageTop,
      window.scrollY,
      expanded,
      expandAt,
      collapseAtScrollY,
    );
    if (next !== expanded) move(next);
  };
  const onScroll = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateFromScroll);
  };

  if (!preciseDesktop || reduced.matches || typeof panel.animate !== 'function') {
    panel.style.transform = expandedTransform;
    showRailImmediately();
    showHeadingImmediately();
    headingRevealed = true;
    return {
      startIntro() {},
      setPaused() {},
    };
  } else {
    section.classList.add('work-stage-can-shift');
    panel.style.transform = restingTransform;
    hideRailImmediately();
    hideHeading();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    onScroll();
    // The compact filter can become a wide-screen rail after resizing.
    if (expanded && !shiftMotion && getComputedStyle(rail).display !== 'none') showRailImmediately();
  }, { passive: true });
  const finishHeading = () => {
    headingResolved = true;
    headingRevealed = true;
    headingMotion?.finish();
    showHeadingImmediately();
    move(true, reduced.matches);
  };
  section.addEventListener('focusin', finishHeading);
  section.addEventListener('workfilterchange', finishHeading);
  reduced.addEventListener('change', () => {
    shiftMotion?.cancel();
    railMotion?.cancel();
    shiftMotion = railMotion = undefined;
    section.classList.remove('is-work-shifting', 'is-work-rail-moving');
    headingMotion?.finish();
    if (reduced.matches) {
      panel.style.transform = expandedTransform;
      panel.style.borderRadius = '0px';
      headingRevealed = true;
      showRailImmediately();
      showHeadingImmediately();
    }
  });

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

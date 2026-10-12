import { createNativeMotion, readMotionToken, revealEffects } from './native-motion.ts';
import { createRoleAnimator, roleRevealEffects } from './hero-role-transition.ts';
import { splitLetters, splitLines } from './text-reveal.ts';
import type { WorkStageController } from './work-stage/work-stage.ts';

export const heroRoles = ['System thinker', 'AI builder', 'Web designer', 'App designer'];

/** All offsets use milliseconds on one browser-native intro clock. */
export function heroIntroTiming(letterCount: number, duration: number, stagger: number,
  entrance: number, copyDuration: number, stageProgress: number) {
  const processStart = 0;
  // A stage hands off at the midpoint of its core reveal. Internal letter/line
  // staggers continue independently and must not postpone the following stage.
  const eyebrowStart = processStart + entrance * stageProgress;
  const titleStart = eyebrowStart + copyDuration * stageProgress;
  const titleEnd = titleStart + duration + Math.max(0, letterCount - 1) * stagger;
  const roleStart = titleStart + duration * stageProgress;
  const copyStart = roleStart + duration * stageProgress;
  const ctaStart = copyStart + copyDuration * stageProgress;
  const tagsStart = processStart;
  return { processStart, eyebrowStart, titleStart, titleEnd, roleStart, copyStart, ctaStart, tagsStart };
}

export function initializeHeroIntro(workStage?: WorkStageController) {
  const hero = document.querySelector<HTMLElement>('.hero');
  const heading = hero?.querySelector<HTMLElement>('[data-hero-heading]');
  if (!hero || !heading) return;
  let resolveFinished!: () => void;
  const finished = new Promise<void>(resolve => { resolveFinished = resolve; });
  let resolveStarted!: () => void;
  const started = new Promise<void>(resolve => { resolveStarted = resolve; });
  const header = document.querySelector<HTMLElement>('.site-header');
  const root = document.documentElement;
  const returningFromCase = root.dataset.caseReturn === 'true';
  const releaseGate = () => { delete root.dataset.homeIntro; resolveStarted(); };
  const permanent = heading.querySelector<HTMLElement>('[data-permanent]')!;
  const cycling = heading.querySelector<HTMLElement>('[data-cycling]')!;
  const paragraph = hero.querySelector<HTMLElement>('.hero-description')!;
  const eyebrow = hero.querySelector<HTMLElement>('.hero-eyebrow')!;
  const cta = hero.querySelector<HTMLElement>('.hero-cta-entrance')!;
  const tags = [...hero.querySelectorAll<HTMLElement>('.skill-tag')];
  const processTags = [...hero.querySelectorAll<HTMLElement>('.process-tags .skill-tag')];
  const rightTags = [...hero.querySelectorAll<HTMLElement>('.skill-marquee .skill-tag')];
  const roots = [permanent, cycling, paragraph, eyebrow, cta, ...tags];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tokens = getComputedStyle(hero);
  const number = (name: string) => readMotionToken(tokens, name);
  const easing = tokens.getPropertyValue('--ease-entrance').trim();
  const distance = number('--distance-text-reveal');
  const titleDistance = number('--distance-title-reveal');
  let intro: ReturnType<typeof createNativeMotion> | undefined;
  let headerIntro: ReturnType<typeof createNativeMotion> | undefined;
  let tagIntro: ReturnType<typeof createNativeMotion> | undefined;
  let roleMotion: ReturnType<typeof createRoleAnimator> | undefined;
  let restoreLines: (() => void) | undefined;
  let paused = document.hidden;
  let introStarted = false;
  let headerFrame = 0;
  let finishHeader = () => {};
  let generation = 0;

  const restoreParagraph = () => {
    restoreLines?.();
    restoreLines = undefined;
  };
  const reset = () => {
    const current = ++generation;
    let contentFinished = false, tagsFinished = false;
    const finishIntro = () => { if (current === generation && contentFinished && tagsFinished) resolveFinished(); };
    if (headerFrame) cancelAnimationFrame(headerFrame);
    headerFrame = 0;
    finishHeader = () => {};
    intro?.cancel();
    headerIntro?.cancel();
    tagIntro?.cancel();
    roleMotion?.destroy();
    intro = undefined;
    headerIntro = undefined;
    tagIntro = undefined;
    roleMotion = undefined;
    introStarted = false;
    restoreParagraph();
    permanent.textContent = 'Product Designer';
    cycling.textContent = heroRoles[0];
    cycling.classList.remove('role-phrases');
    hero.classList.remove('is-tags-ready');
    roots.forEach(element => {
      element.style.removeProperty('opacity');
      element.style.removeProperty('transform');
    });
    header?.style.removeProperty('opacity');
    // No-JS, reduced motion and unsupported browsers retain complete readable copy.
    if (reduced.matches || typeof permanent.animate !== 'function') {
      hero.classList.add('is-tags-ready');
      releaseGate();
      resolveFinished();
      return;
    }
    roots.forEach(element => { element.style.opacity = '0'; });
    let headerDone = !header;
    let introPrepared = false;
    let startWork = () => {};
    const startContent = () => {
      if (current !== generation || !headerDone || !introPrepared || introStarted) return;
      introStarted = true;
      // Every content effect is already installed at its backwards-fill state.
      intro?.setPaused(paused);
      tagIntro?.setPaused(paused);
      roleMotion?.setPaused(paused);
      startWork();
      releaseGate();
      if (returningFromCase) { tagIntro?.finish(); intro?.finish(); }
      if (cta.matches(':has(:focus-visible)')) intro?.finish();
    };
    if (header) {
      finishHeader = () => {
        if (headerDone) return;
        if (headerIntro) headerIntro.finish();
        else {
          headerDone = true;
          header.style.opacity = '1';
          startContent();
        }
      };
      // A native clock started during module evaluation can finish before Chrome
      // paints its first frame. Start on that frame, still with no timed delay.
      headerFrame = requestAnimationFrame(() => {
        headerFrame = 0;
        if (current !== generation || headerDone) return;
        headerIntro = createNativeMotion([{
          element: header, keyframes: [{ opacity: 0 }, { opacity: 1 }],
          duration: number('--duration-layout'), easing: 'linear',
        }], { paused: document.hidden, onComplete: () => {
          headerDone = true;
          startContent();
        } });
        if (returningFromCase || header.matches(':focus-within')) finishHeader();
      });
    }
    void document.fonts.ready.then(() => {
      if (current !== generation || reduced.matches) return;
      const letters = splitLetters(permanent, 'Product Designer');
      cycling.replaceChildren();
      cycling.classList.add('role-phrases');
      const phrases = heroRoles.map(role => {
        const phrase = document.createElement('span');
        phrase.className = 'role-phrase';
        cycling.append(phrase);
        return { phrase, letters: splitLetters(phrase, role) };
      });
      const split = splitLines(paragraph);
      restoreLines = split.restore;
      const roleOptions = {
        hold: number('--duration-role-hold'), exit: number('--duration-role-exit'),
        enter: number('--duration-title-reveal'), stagger: number('--stagger-title-reveal'),
        distance: titleDistance, ease: easing,
      };
      roleMotion = createRoleAnimator(phrases, roleOptions);
      roleMotion.setPaused(true);
      const entrance = number('--duration-entrance');
      const tagStagger = number('--stagger-tag-reveal');
      const timing = heroIntroTiming(letters.length, roleOptions.enter, roleOptions.stagger,
        entrance, number('--duration-copy-reveal'), number('--intro-stage-progress'));
      const copy = { duration: number('--duration-copy-reveal'), distance, easing };
      startWork = () => workStage?.startIntro({ duration: copy.duration, delay: timing.ctaStart, easing });
      tagIntro = createNativeMotion(rightTags.flatMap(tag => revealEffects([tag], {
        duration: entrance, distance, easing,
        delay: timing.tagsStart + Number(tag.style.getPropertyValue('--tag-index')) * tagStagger,
      })), { paused: true, onComplete: () => {
        if (current !== generation) return;
        hero.classList.add('is-tags-ready');
        tagsFinished = true;
        finishIntro();
      } });
      intro = createNativeMotion([
        ...revealEffects(processTags, { duration: entrance, distance, easing, delay: timing.processStart, stagger: tagStagger }),
        ...revealEffects([eyebrow], { ...copy, delay: timing.eyebrowStart }),
        ...revealEffects(letters, {
          duration: roleOptions.enter, stagger: roleOptions.stagger,
          delay: timing.titleStart, distance: titleDistance, easing,
        }),
        ...roleRevealEffects(phrases[0], roleOptions, timing.roleStart),
        ...revealEffects(split.lines, {
          ...copy, delay: timing.copyStart, stagger: number('--stagger-copy-reveal'),
        }),
        ...revealEffects([cta], { ...copy, delay: timing.ctaStart }),
      ], { paused: true, onComplete: () => {
        if (current !== generation) return;
        roleMotion?.startCycling();
        contentFinished = true;
        finishIntro();
      } });
      // Effects already supply backwards-fill states before these containers show.
      [permanent, cycling, paragraph].forEach(element => { element.style.opacity = '1'; });
      introPrepared = true;
      startContent();
    }).catch(() => {
      // Font/animation setup failure degrades to the readable server content.
      if (current !== generation) return;
      headerIntro?.finish(); intro?.cancel(); tagIntro?.cancel(); roleMotion?.destroy();
      restoreParagraph();
      permanent.textContent = 'Product Designer';
      cycling.textContent = heroRoles[0];
      roots.forEach(element => { element.style.opacity = '1'; element.style.removeProperty('transform'); });
      if (header) header.style.opacity = '1';
      releaseGate();
      resolveFinished();
    });
  };
  // Focus finishes the same native group; no separate class or timing workaround.
  cta.addEventListener('focusin', () => { if (cta.matches(':has(:focus-visible)')) intro?.finish(); });
  header?.addEventListener('focusin', () => finishHeader());
  let paragraphWidth = paragraph.clientWidth;
  window.addEventListener('resize', () => {
    const width = paragraph.clientWidth;
    if (width === paragraphWidth) return;
    paragraphWidth = width;
    // Detached line effects are finite and released by the shared group on completion.
    // Other text continues uninterrupted; height-only changes do nothing.
    restoreParagraph();
    paragraph.style.opacity = '1';
  }, { passive: true });
  reduced.addEventListener('change', reset);
  reset();
  root.classList.add('hero-intro-ready');
  return { started, finished, setPaused(value: boolean) {
    paused = value;
    if (introStarted) intro?.setPaused(value);
    // The header remains usable when the hero scrolls away or a menu opens.
    // Only backgrounding the document should suspend the header fade.
    headerIntro?.setPaused(document.hidden);
    if (value && !document.hidden && window.scrollY > 0) finishHeader();
    if (introStarted) {
      tagIntro?.setPaused(value);
      roleMotion?.setPaused(value);
    }
  } };
}

import { createNativeMotion, readMotionToken, revealEffects, parallelRevealEffects, motionEndTime, type MotionEffect } from './native-motion.ts';
import { splitLetters } from './text-reveal.ts';
import { shouldRevealWorkContent } from './work-stage/work-stage-model.ts';

/** One shared order: label, title, description, then section content. */
export function sectionHeadingTiming(titleDuration: number, contentDuration: number, stageProgress: number, hasIndex = true, hasDescription = true) {
  const titleStart = hasIndex ? titleDuration * stageProgress : 0;
  const subtitleStart = titleStart + titleDuration * stageProgress;
  const firstContentStart = subtitleStart + (hasDescription ? contentDuration * stageProgress : 0);
  return { titleStart, subtitleStart, firstContentStart };
}

/** Work's heading recipe, shared by every homepage chapter. Keeps explicit line breaks. */
export function headingRevealEffects(title: HTMLElement, index?: HTMLElement | null, description?: HTMLElement | null): MotionEffect[] {
  const tokens = getComputedStyle(title);
  const number = (name: string) => readMotionToken(tokens, name);
  const duration = number('--duration-title-reveal');
  const timing = sectionHeadingTiming(duration, number('--duration-copy-reveal'), number('--intro-stage-progress'), Boolean(index), Boolean(description));
  const distance = number('--distance-text-reveal');
  const easing = tokens.getPropertyValue('--ease-entrance').trim();
  const lines = title.innerHTML.split(/<br\s*\/?\s*>/i);
  const label = lines.map(line => {
    const span = document.createElement('span');
    span.innerHTML = line;
    return span.textContent?.trim() ?? '';
  }).join(' ');
  const letters: HTMLElement[] = [];
  title.replaceChildren();
  lines.forEach((line, i) => {
    if (i) title.append(document.createElement('br'));
    const span = document.createElement('span');
    span.innerHTML = line;
    const text = span.textContent?.trim() ?? '';
    title.append(span);
    letters.push(...splitLetters(span, text));
    span.setAttribute('aria-hidden', 'true');
  });
  title.setAttribute('aria-label', label);
  title.style.opacity = '1';
  return [
    ...revealEffects(index ? [index] : [], { duration, distance, easing }),
    ...revealEffects(letters, { duration, delay: timing.titleStart, stagger: number('--stagger-title-reveal'), distance: number('--distance-title-reveal'), easing }),
    ...revealEffects(description ? [description] : [], {
      duration: number('--duration-copy-reveal'), delay: timing.subtitleStart, distance, easing,
    }),
  ];
}

export function sectionItemStart(
  itemIndex: number,
  titleDuration: number,
  contentDuration: number,
  stageProgress: number,
  hasDescription = true,
  itemInterval = contentDuration * stageProgress,
  hasIndex = true,
  titleRelativeStart?: number,
) {
  const { titleStart, firstContentStart } = sectionHeadingTiming(titleDuration, contentDuration, stageProgress, hasIndex, hasDescription);
  return (titleRelativeStart === undefined ? firstContentStart : titleStart + titleRelativeStart) + itemIndex * itemInterval;
}

/**
 * Build one top-to-bottom section timeline. The shared default keeps the hero's
 * 50% handoff; chapters may opt into a content duration, interval or start relative
 * to the title without changing the heading and subtitle timing.
 */
export function sectionRevealEffects(
  title: HTMLElement,
  index: HTMLElement | null | undefined,
  description: HTMLElement | null | undefined,
  content: HTMLElement[],
): MotionEffect[] {
  const tokens = getComputedStyle(title);
  const number = (name: string) => readMotionToken(tokens, name);
  const duration = number('--duration-copy-reveal');
  const progress = number('--intro-stage-progress');
  const itemDuration = number('--section-item-reveal-duration') || duration;
  const itemInterval = number('--section-item-reveal-interval') || duration * progress;
  const itemStart = number('--section-item-reveal-start');
  const distance = number('--distance-text-reveal');
  const easing = tokens.getPropertyValue('--ease-entrance').trim();
  const heading = headingRevealEffects(title, index, description);
  let nextStart = sectionItemStart(0, number('--duration-title-reveal'), duration, progress, Boolean(description), itemInterval, Boolean(index), Number.isFinite(itemStart) ? itemStart : undefined);
  const items = content.flatMap(element => {
    const delay = nextStart;
    if (element.hasAttribute('data-title-reveal-row')) {
      const values = [...element.querySelectorAll<HTMLElement>('[data-title-reveal-value]')];
      const letters = values.map(value => splitLetters(value, value.textContent ?? ''));
      // Values own the title rise; keep the row wrapper still, with copy on its
      // existing separate recipe. Native backwards fill hides all waiting parts.
      element.style.opacity = '1';
      element.style.transform = 'none';
      const effects = [
        ...parallelRevealEffects(letters, {
          duration: number('--duration-title-reveal'), delay, stagger: number('--stagger-title-reveal'),
          distance: number('--distance-title-reveal'), easing,
        }),
        ...revealEffects([...element.querySelectorAll<HTMLElement>('[data-reveal-copy]')], {
          duration: itemDuration, delay, distance, easing,
        }),
      ];
      nextStart = motionEndTime(effects);
      return effects;
    }
    nextStart += itemInterval;
    return revealEffects([element], {
      duration: itemDuration,
      delay,
      distance,
      easing,
    });
  });
  return [...heading, ...items];
}

/** One-time entrances; scroll starts each item, then the native clock completes it. */
export function initializeSectionReveals() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const records: { element: HTMLElement; finish: () => void }[] = [];
  const motions: ReturnType<typeof createNativeMotion>[] = [];
  let paused = document.hidden;
  const register = (element: HTMLElement, parts: HTMLElement[], effects: () => MotionEffect[], trigger = element, start = 'top 92%') => {
    if (reduced.matches || typeof element.animate !== 'function') return;
    let started = false;
    let resolved = false;
    let motion: ReturnType<typeof createNativeMotion> | undefined;
    const isWork = element.id === 'work';
    const revealRatio = parseFloat(getComputedStyle(element).getPropertyValue('--section-reveal-trigger-viewport-ratio'));
    parts.forEach(part => { part.style.opacity = '0'; });
    const finish = () => {
      resolved = true;
      window.removeEventListener('scroll', play);
      motion?.finish();
      parts.forEach(part => { part.style.opacity = '1'; part.style.transform = 'none'; });
    };
    const play = () => {
      if (started || resolved) return;
      if (isWork && !shouldRevealWorkContent(trigger.getBoundingClientRect().top, window.scrollY, window.innerHeight * revealRatio)) {
        // Initialization may enter the threshold; retry on real scroll.
        window.addEventListener('scroll', play, { passive: true });
        return;
      }
      window.removeEventListener('scroll', play);
      started = true;
      void document.fonts.ready.then(() => {
        if (resolved) return;
        motion = createNativeMotion(effects(), { paused });
        motions.push(motion);
      });
    };
    // Same one-time top/viewport threshold, without a desktop-only dependency.
    const startRatio = parseFloat(start.split(' ')[1]) / 100;
    let stopped = false;
    const check = () => {
      if (!stopped && trigger.getBoundingClientRect().top <= window.innerHeight * startRatio) { play(); scene.kill(); }
    };
    const scene = { kill() { stopped = true; window.removeEventListener('scroll', check); window.removeEventListener('resize', check); window.removeEventListener('sectionrevealrefresh', check); } };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    window.addEventListener('sectionrevealrefresh', check);
    check();
    if (document.documentElement.dataset.caseReturn === 'true' && trigger.getBoundingClientRect().top < window.innerHeight) {
      finish();
      scene.kill();
    }
    if (element.id === 'work') element.addEventListener('workfilterchange', finish);
    records.push({ element, finish: () => { finish(); scene.kill(); } });
  };
  document.querySelectorAll<HTMLElement>('[data-section-reveal]').forEach(element => {
    // Desktop Work retains its earlier, background-edge trigger and pause lifecycle.
    if (element.closest('.work-content-can-reveal')) return;
    const title = element.querySelector<HTMLElement>('h2');
    if (!title) return;
    const chapter = element.closest<HTMLElement>('.chapter') ?? element;
    const index = element.querySelector<HTMLElement>('.section-index > *, [data-section-index]');
    const description = element.querySelector<HTMLElement>('.section-description, .contact-description');
    const content = [...chapter.querySelectorAll<HTMLElement>('[data-section-item]')];
    register(chapter, [index, title, description, ...content].filter((part): part is HTMLElement => !!part),
      () => sectionRevealEffects(title, index, description, content), chapter,
      `top ${parseFloat(getComputedStyle(element).getPropertyValue('--section-reveal-trigger-viewport-ratio')) * 100}%`);
  });
  document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-section-item])').forEach(element => {
    register(element, [element], () => {
      const tokens = getComputedStyle(element);
      return revealEffects([element], {
        duration: readMotionToken(tokens, '--duration-copy-reveal'),
        distance: parseFloat(tokens.getPropertyValue('--distance-text-reveal')),
        easing: tokens.getPropertyValue('--ease-entrance').trim(),
      });
    });
  });
  document.addEventListener('focusin', event => {
    if (!(event.target instanceof HTMLElement)) return;
    const target = event.target;
    records.forEach(record => {
      if (record.element.contains(target)) record.finish();
    });
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) records.forEach(record => record.finish());
  });
  document.documentElement.classList.add('section-reveals-ready');
  return { setPaused(value: boolean) { paused = value; motions.forEach(motion => motion.setPaused(value)); } };
}

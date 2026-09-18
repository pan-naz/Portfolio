import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createNativeMotion, revealEffects, type MotionEffect } from './native-motion.ts';
import { splitLetters } from './text-reveal.ts';

/** Work's heading recipe, shared by every homepage chapter. Keeps explicit line breaks. */
export function headingRevealEffects(title: HTMLElement, index?: HTMLElement | null, description?: HTMLElement | null): MotionEffect[] {
  const tokens = getComputedStyle(title);
  const number = (name: string) => parseFloat(tokens.getPropertyValue(name));
  const duration = number('--duration-title-reveal');
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
    ...revealEffects(letters, { duration, stagger: number('--stagger-title-reveal'), distance, easing }),
    ...revealEffects(description ? [description] : [], {
      duration: number('--duration-copy-reveal'), delay: duration * number('--intro-stage-progress'), distance, easing,
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
) {
  const subtitleStart = titleDuration * stageProgress;
  const firstContentStart = subtitleStart + (hasDescription ? contentDuration * stageProgress : 0);
  return firstContentStart + itemIndex * itemInterval;
}

/**
 * Build one top-to-bottom section timeline. The shared default keeps the hero's
 * 50% handoff; chapters may opt into a faster content duration and interval while
 * preserving the same heading, subtitle and first-content handoff.
 */
export function sectionRevealEffects(
  title: HTMLElement,
  index: HTMLElement | null | undefined,
  description: HTMLElement | null | undefined,
  content: HTMLElement[],
): MotionEffect[] {
  const tokens = getComputedStyle(title);
  const number = (name: string) => parseFloat(tokens.getPropertyValue(name));
  const duration = number('--duration-copy-reveal');
  const progress = number('--intro-stage-progress');
  const itemDuration = number('--section-item-reveal-duration') || duration;
  const itemInterval = number('--section-item-reveal-interval') || duration * progress;
  const distance = number('--distance-text-reveal');
  const easing = tokens.getPropertyValue('--ease-entrance').trim();
  return [
    ...headingRevealEffects(title, index, description),
    ...content.flatMap((element, itemIndex) => revealEffects([element], {
      duration: itemDuration,
      delay: sectionItemStart(
        itemIndex,
        number('--duration-title-reveal'),
        duration,
        progress,
        Boolean(description),
        itemInterval,
      ),
      distance,
      easing,
    })),
  ];
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
    parts.forEach(part => { part.style.opacity = '0'; });
    const finish = () => {
      resolved = true;
      motion?.finish();
      parts.forEach(part => { part.style.opacity = '1'; part.style.transform = 'none'; });
    };
    const play = () => {
      if (started || resolved) return;
      started = true;
      void document.fonts.ready.then(() => {
        if (resolved) return;
        motion = createNativeMotion(effects(), { paused });
        motions.push(motion);
      });
    };
    const scene = ScrollTrigger.create({ trigger, start, once: true, onEnter: play });
    if (element.id === 'work') element.addEventListener('workfilterchange', finish);
    records.push({ element, finish: () => { finish(); scene.kill(); } });
  };
  document.querySelectorAll<HTMLElement>('[data-section-reveal]').forEach(element => {
    // Desktop Work retains its earlier, background-edge trigger and pause lifecycle.
    if (element.closest('.work-stage-can-shift')) return;
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
        duration: parseFloat(tokens.getPropertyValue('--duration-copy-reveal')),
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

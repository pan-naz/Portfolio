import { workCategories } from '../data/work-categories.ts';
import { arrangeProjectCards } from './work-filter-model.ts';
import { readMotionToken } from './native-motion.ts';

export type WorkFilter = 'selected' | 'websites' | 'misc';
export const matchesWorkFilter = (filter: WorkFilter, category: string) => filter === category;

export function initializeWorkFilter(onChange?: () => void, onReposition?: (top: number) => void) {
  const section = document.querySelector<HTMLElement>('#work');
  const list = section?.querySelector<HTMLElement>('#project-list');
  if (!section || !list) return;
  const roots = [...section.querySelectorAll<HTMLElement>('.section-navigation')];
  const buttons = roots.flatMap(root => [...root.querySelectorAll<HTMLButtonElement>('[data-work-filter]')]);
  const statuses = roots.flatMap(root => [...root.querySelectorAll<HTMLElement>('[data-work-filter-status]')]);
  const collections = [...list.querySelectorAll<HTMLElement>('[data-project-collection]')];
  const heading = section.querySelector<HTMLElement>('.section-heading');
  const label = section.querySelector<HTMLElement>('.section-index .eyebrow');
  const title = section.querySelector<HTMLElement>('#work-title');
  const description = section.querySelector<HTMLElement>('.section-description');
  const rail = section.querySelector<HTMLElement>('[data-work-rail]');
  const surface = section.querySelector<HTMLElement>('[data-work-stage-surface]');
  const cardsIn = (collection: HTMLElement) => [...collection.querySelectorAll<HTMLElement>('.project')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 767px)');
  const tokens = getComputedStyle(list);
  const number = (name: string) => readMotionToken(tokens, name);
  const ease = tokens.getPropertyValue('--ease-entrance').trim();
  const scale = number('--scale-filter');
  const enterDuration = number('--duration-filter-enter');
  const enterTransform = `translateY(${number('--distance-filter-enter')}px) scale(${scale})`;
  let active: WorkFilter = 'selected';
  let generation = 0;
  let motions: Animation[] = [];
  let resizeFrame = 0;
  let destroyed = false;

  const layout = (collection: HTMLElement) => {
    if (!collection.classList.contains('project-collection--bento')) return;
    const cards = cardsIn(collection);
    const columns = small.matches ? 1 : 2;
    const gap = parseFloat(getComputedStyle(collection).gap);
    const width = collection.clientWidth;
    const cardWidth = (width - gap * (columns - 1)) / columns;
    cards.forEach(card => { card.style.width = `${cardWidth}px`; });
    const arranged = arrangeProjectCards(cards.map(card => card.offsetHeight), columns, gap);
    collection.dataset.masonryReady = 'true';
    cards.forEach((card, index) => {
      const position = arranged.positions[index];
      card.style.left = `${position.column * (cardWidth + gap)}px`;
      card.style.top = `${position.top}px`;
    });
    collection.style.height = `${arranged.height}px`;
  };

  const alignRail = () => {
    if (!rail || !surface) return;
    rail.style.top = `${list.getBoundingClientRect().top - surface.getBoundingClientRect().top}px`;
    const nav = rail.querySelector<HTMLElement>('.section-navigation');
    if (nav?.offsetHeight) rail.style.setProperty('--work-filter-half-height', `${nav.offsetHeight / 2}px`);
  };
  const cancelMotions = () => {
    motions.forEach(motion => motion.cancel());
    motions = [];
  };
  const settle = () => {
    cancelMotions();
    heading?.style.removeProperty('height');
    collections.forEach(collection => {
      const shown = collection.dataset.projectCollection === active;
      collection.hidden = !shown;
      collection.inert = !shown;
      collection.classList.remove('is-filter-leaving');
      if (shown) collection.removeAttribute('aria-hidden');
      else collection.setAttribute('aria-hidden', 'true');
      cardsIn(collection).forEach(card => {
        card.style.opacity = '1';
        card.style.transform = 'none';
      });
      if (shown) layout(collection);
    });
    list.style.removeProperty('height');
    list.removeAttribute('aria-busy');
    alignRail();
    onChange?.();
  };

  const select = (filter: WorkFilter) => {
    const target = collections.find(collection => collection.dataset.projectCollection === filter);
    if (!target || filter === active) return;
    // Finish the one-time Work entrance before the independent filter transition.
    section.dispatchEvent(new Event('workfilterchange'));
    const listTop = list.getBoundingClientRect().top;
    // Deep in a long collection, bring the replacement into view without losing focus.
    if (listTop < -window.innerHeight * .5) onReposition?.(window.scrollY + listTop - 112);
    // Capture the rendered layout before changing copy, including an interrupted switch.
    const headingBounds = heading?.getBoundingClientRect();
    const descriptionTop = description && headingBounds
      ? description.getBoundingClientRect().top - headingBounds.top : 0;
    const railTop = rail && surface
      ? rail.getBoundingClientRect().top - surface.getBoundingClientRect().top : 0;
    const height = list.getBoundingClientRect().height;
    const snapshots = new Map<HTMLElement, { opacity: string; transform: string }>();
    collections.filter(collection => !collection.hidden).forEach(collection => {
      cardsIn(collection).forEach(card => {
        const style = getComputedStyle(card);
        snapshots.set(card, { opacity: style.opacity, transform: style.transform });
      });
    });
    const ticket = ++generation;
    cancelMotions();
    heading?.style.removeProperty('height');
    const copy = workCategories[filter];
    if (label) label.textContent = copy.label;
    if (title) {
      title.textContent = copy.title;
      // The initial letter reveal supplies an accessible label; keep it in sync.
      title.setAttribute('aria-label', copy.title);
    }
    if (description) description.textContent = copy.description;
    active = filter;
    list.dataset.activeFilter = active;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.workFilter === active)));
    const count = cardsIn(target).length;
    statuses.forEach(status => { status.textContent = `${count} ${count === 1 ? 'project' : 'projects'} shown`; });
    collections.forEach(collection => {
      if (collection === target) {
        collection.hidden = false;
        collection.inert = false;
        collection.removeAttribute('aria-hidden');
        collection.classList.remove('is-filter-leaving');
      } else if (!collection.hidden) {
        collection.classList.add('is-filter-leaving');
        collection.inert = true;
        collection.setAttribute('aria-hidden', 'true');
      }
    });
    layout(target);
    if (reduced.matches || typeof list.animate !== 'function') { settle(); return; }
    list.setAttribute('aria-busy', 'true');
    const layoutTiming: KeyframeAnimationOptions = {
      duration: number('--duration-filter-layout'), easing: ease, fill: 'both',
    };
    // Measure the new natural height before locking it. The heading, in-flow cards
    // and absolutely positioned rail then travel together on the same clock.
    const nextHeadingBounds = heading?.getBoundingClientRect();
    const nextDescriptionTop = description && nextHeadingBounds
      ? description.getBoundingClientRect().top - nextHeadingBounds.top : 0;
    alignRail();
    if (rail && surface) {
      motions.push(rail.animate([{ top: `${railTop}px` }, { top: rail.style.top }], layoutTiming));
    }
    if (heading && headingBounds && nextHeadingBounds) {
      heading.style.height = `${headingBounds.height}px`;
      motions.push(heading.animate([
        { height: `${headingBounds.height}px` }, { height: `${nextHeadingBounds.height}px` },
      ], layoutTiming));
    }
    for (const element of [label, title, description]) {
      if (element) motions.push(element.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: enterDuration, easing: ease, fill: 'both',
      }));
    }
    if (description) motions.push(description.animate([
      { transform: `translateY(${descriptionTop - nextDescriptionTop}px)` }, { transform: 'translateY(0px)' },
    ], layoutTiming));
    const targetHeight = target.offsetHeight;
    list.style.height = `${height}px`;
    motions.push(list.animate([{ height: `${height}px` }, { height: `${targetHeight}px` }], layoutTiming));
    collections.filter(collection => !collection.hidden).forEach(collection => {
      const entering = collection === target;
      cardsIn(collection).forEach((card, index) => {
        const previous = snapshots.get(card);
        card.style.opacity = '1';
        card.style.transform = 'none';
        motions.push(card.animate([
          previous ?? { opacity: 0, transform: enterTransform },
          { opacity: entering ? 1 : 0, transform: entering ? 'translateY(0px) scale(1)' : `scale(${number('--scale-filter-exit')})` },
        ], {
          duration: entering ? enterDuration : number('--duration-filter-exit'),
          // Masonry places cards in top-to-bottom order, breaking ties left to right.
          // Keep every handoff at 50%, including the final cards in longer collections.
          delay: entering ? number('--delay-filter-enter') + index * enterDuration / 2 : 0,
          easing: entering ? tokens.getPropertyValue('--ease-filter-enter').trim() : 'ease-in', fill: 'both',
        }));
      });
    });
    void Promise.all(motions.map(motion => motion.finished.catch(() => {}))).then(() => {
      if (ticket === generation && !destroyed) settle();
    });
  };

  const click = (event: Event) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-work-filter]') : null;
    if (button && section.contains(button)) select(button.dataset.workFilter as WorkFilter);
  };
  section.addEventListener('click', click);
  const refreshLayout = () => {
    if (resizeFrame || destroyed) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      ++generation;
      if (motions.length) settle();
      else {
        const current = collections.find(collection => collection.dataset.projectCollection === active);
        if (current) layout(current);
        alignRail();
        onChange?.();
      }
    });
  };
  let lastWidth = list.clientWidth;
  const captionHeights = new WeakMap<Element, number>();
  const observer = new ResizeObserver(entries => {
    let changed = list.clientWidth !== lastWidth;
    lastWidth = list.clientWidth;
    for (const entry of entries) {
      if (entry.target === list) continue;
      const previous = captionHeights.get(entry.target);
      const height = entry.contentRect.height;
      captionHeights.set(entry.target, height);
      // Showing a hidden collection is measured synchronously by select().
      if (previous && height && previous !== height) changed = true;
    }
    if (changed) refreshLayout();
  });
  observer.observe(list);
  section.querySelectorAll<HTMLElement>('.project-caption').forEach(caption => observer.observe(caption));
  small.addEventListener('change', refreshLayout);
  reduced.addEventListener('change', refreshLayout);
  void document.fonts.ready.then(refreshLayout);
  alignRail();
  const destroy = () => {
    destroyed = true;
    ++generation;
    cancelMotions();
    heading?.style.removeProperty('height');
    cancelAnimationFrame(resizeFrame);
    observer.disconnect();
    section.removeEventListener('click', click);
    small.removeEventListener('change', refreshLayout);
    reduced.removeEventListener('change', refreshLayout);
    window.removeEventListener('pagehide', destroy);
  };
  window.addEventListener('pagehide', destroy, { once: true });
  return { select, destroy };
}

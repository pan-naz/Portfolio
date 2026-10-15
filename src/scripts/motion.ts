export { easeSectionScroll } from './scroll-policy.ts';
export { initializeSmoothScroll, destroySmoothScroll, scrollToSection, scrollImmediately as repositionWork, pauseScroll, resumeScroll } from './smooth-scroll.ts';

export function initializeMotion() {
  // Font metrics affect the start/end positions of the website reveal scenes.
  const refresh = () => window.dispatchEvent(new Event('sectionrevealrefresh'));
  document.fonts.ready.then(refresh);
  return { refresh };
}

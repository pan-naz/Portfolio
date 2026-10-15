/** Section scroll · the exact Lenis default curve, without approximation. */
export const easeSectionScroll = (t: number) =>
  Math.min(1, 1.001 - 2 ** (-10 * t));

export const scrollPolicy = Object.freeze({
  capability: '(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  lerp: .18, smoothWheel: true, syncTouch: false, anchors: false, autoResize: true,
});

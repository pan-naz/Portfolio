export const pillTravel = 220;
export function pillProgress(scroll: number, buttonTop: number, inset: number, reduced = false) {
  const raw = Math.max(0, Math.min(1, (scroll - (buttonTop - inset)) / pillTravel));
  return reduced ? (raw > 0 ? 1 : 0) : raw * raw * (3 - 2 * raw);
}
export const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
export function pillGeometry(viewport: number, controlsWidth: number, buttonWidth: number, mobile: boolean) {
  const padding = mobile ? 8 : 12;
  const gap = mobile ? 8 : 24;
  const logoWidth = mobile ? 24 : 44;
  const width = padding * 2 + logoWidth + gap * 2 + controlsWidth + buttonWidth;
  const left = (viewport - width) / 2;
  return { left, width, logoWidth, logoX: left + padding, controlsX: left + padding + logoWidth + gap,
    buttonX: left + width - padding - buttonWidth };
}

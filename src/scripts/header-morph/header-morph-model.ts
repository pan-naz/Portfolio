export const pillDuration = 560;
export const pillExitDuration = 240;
export const pillReturnViewportBuffer = 0;
export function nextPillState(
  scroll: number,
  previousScroll: number,
  trigger: number,
  returnLead: number,
  expanded: boolean,
  releasing: boolean,
) {
  const returning = scroll < previousScroll;
  const advancing = scroll > previousScroll;
  if (releasing) {
    if (advancing && scroll >= trigger) return { expanded: true, releasing: false };
    if (scroll < trigger) return { expanded: false, releasing: false };
    return { expanded: false, releasing: true };
  }
  if (expanded && returning && scroll <= trigger + returnLead) {
    return { expanded: false, releasing: true };
  }
  return { expanded: expanded || scroll >= trigger, releasing: false };
}
export function advancePill(progress: number, expanded: boolean, elapsed: number, reduced = false, duration = pillDuration) {
  // Exiting never reverses the capsule's geometry.
  if (!expanded) return progress;
  if (reduced) return 1;
  const step = Math.max(0, elapsed) / duration;
  return Math.min(1, progress + step);
}
export function advancePillExit(exit: number, expanded: boolean, elapsed: number, reduced = false, duration = pillExitDuration) {
  if (reduced) return expanded ? 0 : 1;
  const step = Math.max(0, elapsed) / duration;
  return expanded ? Math.max(0, exit - step) : Math.min(1, exit + step);
}
const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
export const pillShape = (progress: number) => smooth(progress / .9);
export const pillLabels = (progress: number) => smooth((progress - .56) / .4);
export const pillDockOffset = (progress: number, inset: number) => {
  const shape = pillShape(progress);
  return shape === 0 ? 0 : -inset * .5 * shape;
};
export const pillExitY = (exit: number, inset: number) => exit <= 0 ? 0 : -(inset + 64 + 40) * smooth(exit);
export const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
export function pillGeometry(viewport: number, controlsWidth: number, buttonWidth: number) {
  const paddingLeft = 20;
  const paddingRight = 8;
  const logoGap = 12;
  const buttonGap = 12;
  const logoWidth = 44;
  const width = paddingLeft + paddingRight + logoWidth + logoGap + buttonGap + controlsWidth + buttonWidth;
  const left = (viewport - width) / 2;
  return { left, width, logoWidth, paddingLeft, paddingRight, logoGap,
    logoX: left + paddingLeft, controlsX: left + paddingLeft + logoWidth + logoGap,
    buttonX: left + width - paddingRight - buttonWidth };
}

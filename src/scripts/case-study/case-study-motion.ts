import { readMotionToken } from '../native-motion.ts';

/** The controller and static catalog share this token contract. Values live in tokens.css. */
export const caseStudyMotionTokens = [
  { key: 'openDuration', name: '--duration-case-open', label: 'Open and hero travel' },
  { key: 'closeDuration', name: '--duration-case-close', label: 'Close and hero return' },
  { key: 'captionExitDuration', name: '--duration-case-caption-exit', label: 'Card caption fade out' },
  { key: 'captionEnterDuration', name: '--duration-case-caption-enter', label: 'Card caption fade in' },
  { key: 'captionEnterDelay', name: '--delay-case-caption-enter', label: 'Returning caption delay' },
  { key: 'bodyEnterDuration', name: '--duration-case-body-enter', label: 'Case body entrance' },
  { key: 'bodyEnterDelay', name: '--delay-case-body-enter', label: 'Case body delay' },
  { key: 'cornersDuration', name: '--duration-case-corners', label: 'Panel corner finish' },
  { key: 'copyDistance', name: '--distance-case-copy', label: 'Caption and body rise' },
  { key: 'controlRotation', name: '--rotation-case-control', label: 'Opening control rotation' },
] as const;

export const caseStudyPresentationTokens = [
  { name: '--ease-case-travel', label: 'Panel, hero and control easing' },
  { name: '--ease-case-corners', label: 'Corner finish easing' },
  { name: '--case-hero-fit', label: 'Card, traveling and settled hero fit' },
] as const;

export function readCaseStudyMotion(tokens: Pick<CSSStyleDeclaration, 'getPropertyValue'>) {
  const timings = Object.fromEntries(caseStudyMotionTokens.map(({ key, name }) => [key, readMotionToken(tokens, name)])) as Record<(typeof caseStudyMotionTokens)[number]['key'], number>;
  if (Object.values(timings).some(value => !Number.isFinite(value))) throw new Error('Missing shared case-study motion token');
  return {
    ...timings,
    travelEasing: tokens.getPropertyValue('--ease-case-travel').trim(),
    cornersEasing: tokens.getPropertyValue('--ease-case-corners').trim(),
    controlInset: readMotionToken(tokens, '--space-4'),
    controlSize: readMotionToken(tokens, '--control-icon'),
  };
}

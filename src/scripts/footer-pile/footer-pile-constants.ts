import { waterfallIconSize } from '../waterfall/waterfall-constants.ts';

export const pileRadius = waterfallIconSize * .72;
export const pilePitch = pileRadius * 2;
export const pileCursorRadius = 50; // 100px diameter, independent of the hero rain.
export const pilePreviewWidth = 1200;
export const pilePreviewHeight = 120;
export const pileBleed = pileCursorRadius + waterfallIconSize * 2;
export const pileAbove = pilePreviewHeight + pileCursorRadius;
export const pileStep = 1 / 120;
export const pilePreviewSeed = 1827;

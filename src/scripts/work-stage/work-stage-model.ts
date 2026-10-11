export const workStageExpandViewportRatio = 0.02;
export const workStageCollapseScrollY = 1;

export function canShiftWorkStage(floatingLayout: boolean, reducedMotion: boolean) {
  return floatingLayout && !reducedMotion;
}

/**
 * The stage expands only when its visible top edge reaches the viewport top.
 * Once expanded, it stays open until the user returns to the top of the page.
 */
export function nextWorkStageExpanded(stageTop: number, scrollY: number, expanded: boolean,
  expandAt: number, collapseAtScrollY = workStageCollapseScrollY) {
  return expanded ? scrollY > collapseAtScrollY : stageTop <= expandAt;
}

/** An in-view preview at page top must stay empty until scrolling starts. */
export function shouldRevealWorkContent(stageTop: number, scrollY: number, revealAt: number) {
  return scrollY > workStageCollapseScrollY && stageTop <= revealAt;
}

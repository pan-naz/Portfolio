/** Resolve shared CSS inset tokens after env()/calc(), including on orientation changes. */
export function readSafeAreaInsets() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left)';
  document.documentElement.append(probe);
  const style = getComputedStyle(probe);
  const insets = { top: parseFloat(style.paddingTop), right: parseFloat(style.paddingRight), bottom: parseFloat(style.paddingBottom), left: parseFloat(style.paddingLeft) };
  probe.remove();
  return insets;
}

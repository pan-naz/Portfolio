/** Dialog autofocus and return focus must follow input, not browser heuristics. */
export function initializeCaseStudyFocus(target: Document = document) {
  const controller = new AbortController();
  const targets = new Set<HTMLElement>();
  let keyboard = false;
  const mark = (element: HTMLElement) => element.toggleAttribute('data-case-pointer-focus', !keyboard);
  const prepare = (element: HTMLElement) => { targets.add(element); mark(element); };
  const forget = (element: HTMLElement) => {
    element.removeAttribute('data-case-pointer-focus');
    targets.delete(element);
  };
  const options = { capture: true, signal: controller.signal };
  target.addEventListener('pointerdown', () => {
    keyboard = false;
    targets.forEach(mark);
  }, options);
  target.addEventListener('keydown', event => {
    if (event.isComposing || ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(event.key)) return;
    keyboard = true;
    targets.forEach(mark);
  }, options);
  target.addEventListener('focusout', event => {
    const element = event.target as HTMLElement;
    if (targets.has(element)) forget(element);
  }, options);
  const destroy = () => { controller.abort(); targets.forEach(forget); };
  target.defaultView?.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal: controller.signal });
  return {
    prepare,
    focus(element: HTMLElement) { prepare(element); element.focus({ preventScroll: true }); },
    destroy,
  };
}

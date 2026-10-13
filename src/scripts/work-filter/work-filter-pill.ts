import { readSafeAreaInsets } from '../safe-area.ts';

/** A single fixed filter in Work's DOM order, available only while Work is active. */
export function initializeWorkFilterPill() {
  const section = document.querySelector<HTMLElement>('#work');
  const panel = section?.querySelector<HTMLElement>('.work-panel');
  const wrapper = section?.querySelector<HTMLElement>('.work-filter-pill');
  const nav = wrapper?.querySelector<HTMLElement>('.section-navigation');
  if (!section || !panel || !wrapper || !nav) return;
  const root = document.documentElement;
  const events = new AbortController(), { signal } = events;
  let frame = 0, disposed = false, tabEntry = false;
  const compact = () => root.dataset.workStageLayout !== 'true';
  const setVisible = (visible: boolean, keyboard = false) => {
    wrapper.dataset.keyboard = String(keyboard);
    wrapper.dataset.visible = String(visible);
    wrapper.inert = !visible;
    wrapper.setAttribute('aria-hidden', String(!visible));
  };
  const update = () => {
    frame = 0;
    if (disposed) return;
    setVisible(compact() && panel.getBoundingClientRect().top <= 0 && section.getBoundingClientRect().bottom > 0);
  };
  const schedule = () => { if (!disposed && compact() && !frame) frame = requestAnimationFrame(update); };
  const measure = () => {
    if (disposed) return;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (compact()) {
      const maximum = nav.style.maxWidth;
      nav.style.maxWidth = 'none';
      nav.removeAttribute('data-theme-fit');
      const required = nav.getBoundingClientRect().width;
      const margin = parseFloat(getComputedStyle(root).getPropertyValue('--space-4'));
      nav.style.maxWidth = maximum;
      const safe = readSafeAreaInsets();
      nav.dataset.themeFit = String(required <= innerWidth - margin * 2 - safe.left - safe.right);
    }
    update();
  };
  const enterFromKeyboard = () => {
    setVisible(true, true);
    const start = panel.getBoundingClientRect().top;
    if (start > 0) window.scrollBy({ top: Math.ceil(start), behavior: 'instant' });
  };
  // Enable the filter before native Tab chooses the next control. It keeps its
  // genuine place before the cards, without a positive tabindex or focus trap.
  const tab = (event: KeyboardEvent) => {
    tabEntry = false;
    if (event.key !== 'Tab' || event.defaultPrevented || !compact()) return;
    const controls = [...document.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[tabindex]')]
      .filter(node => node.tabIndex >= 0 && !node.closest('[inert],[hidden]') && !node.matches(':disabled') && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
    const index = controls.indexOf(document.activeElement as HTMLElement);
    const next = controls[index + (event.shiftKey ? -1 : 1)];
    if (next && section.contains(next)) { tabEntry = true; enterFromKeyboard(); }
  };
  const focus = (event: FocusEvent) => {
    // Safari also marks dialog return focus as focus-visible. Only a pending
    // native Tab may reposition content; case restoration owns its viewport.
    if (!tabEntry) return;
    tabEntry = false;
    if (!compact() || !(event.target instanceof HTMLElement)) return;
    enterFromKeyboard();
    if (wrapper.contains(event.target)) return;
    const clearance = nav.getBoundingClientRect().bottom + parseFloat(getComputedStyle(root).getPropertyValue('--space-4'));
    const top = event.target.getBoundingClientRect().top;
    if (top < clearance) window.scrollBy({ top: top - clearance, behavior: 'instant' });
  };
  const observer = new ResizeObserver(schedule);
  observer.observe(section);
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', measure, { passive: true, signal });
  window.addEventListener('workstagelayoutchange', measure, { signal });
  window.addEventListener('pageshow', measure, { signal });
  document.addEventListener('keydown', tab, { signal });
  section.addEventListener('focusin', focus, { signal });
  const destroy = () => {
    disposed = true;
    events.abort();
    observer.disconnect();
    if (frame) cancelAnimationFrame(frame);
    setVisible(false);
  };
  window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal });
  void document.fonts.ready.then(measure);
  measure();
  if (import.meta.hot) import.meta.hot.dispose(destroy);
  return { destroy };
}

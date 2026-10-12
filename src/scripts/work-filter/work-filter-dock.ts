/** Dock the existing compact filter inside Work; never move or clone its controls. */
export function initializeWorkFilterDock() {
  const section = document.querySelector<HTMLElement>('#work');
  const anchor = section?.querySelector<HTMLElement>('[data-work-filter-anchor]');
  const wrapper = section?.querySelector<HTMLElement>('.work-compact-filter');
  const nav = wrapper?.querySelector<HTMLElement>('.section-navigation');
  if (!section || !anchor || !wrapper || !nav) return;
  const root = document.documentElement;
  const events = new AbortController();
  const { signal } = events;
  let frame = 0, disposed = false;
  const compactLayout = () => root.dataset.workStageLayout !== 'true';
  const update = () => {
    frame = 0;
    if (disposed) return;
    if (!compactLayout()) { nav.classList.remove('is-filter-docked'); return; }
    const inset = parseFloat(getComputedStyle(root).getPropertyValue('--header-inset')) / 2;
    const docked = anchor.getBoundingClientRect().top <= inset
      && section.getBoundingClientRect().bottom > 0;
    nav.classList.toggle('is-filter-docked', docked);
  };
  const schedule = () => { if (!disposed && compactLayout() && !frame) frame = requestAnimationFrame(update); };
  const measure = () => {
    if (disposed) return;
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    if (compactLayout()) {
      const docked = nav.classList.contains('is-filter-docked');
      const oldMaximum = nav.style.maxWidth;
      nav.classList.add('is-filter-docked');
      nav.removeAttribute('data-theme-fit');
      nav.style.maxWidth = 'none';
      const required = nav.getBoundingClientRect().width;
      const margin = parseFloat(getComputedStyle(root).getPropertyValue('--space-4'));
      nav.style.maxWidth = oldMaximum;
      nav.dataset.themeFit = String(required <= window.innerWidth - margin * 2);
      nav.classList.toggle('is-filter-docked', docked);
    }
    update();
  };
  const observer = new ResizeObserver(schedule);
  observer.observe(section);
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', measure, { passive: true, signal });
  window.addEventListener('workstagelayoutchange', measure, { signal });
  window.addEventListener('pageshow', measure, { signal });
  const destroy = () => {
    disposed = true;
    events.abort();
    observer.disconnect();
    if (frame) cancelAnimationFrame(frame);
    nav.classList.remove('is-filter-docked');
    delete nav.dataset.themeFit;
  };
  window.addEventListener('pagehide', event => { if (!event.persisted) destroy(); }, { signal });
  void document.fonts.ready.then(measure);
  measure();
  if (import.meta.hot) import.meta.hot.dispose(destroy);
  return { destroy };
}

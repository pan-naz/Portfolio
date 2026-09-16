export type WorkFilter = 'selected' | 'websites' | 'misc';

export const matchesWorkFilter = (filter: WorkFilter, category: string) => filter === category;

export function initializeWorkFilter(onChange?: () => void) {
  const root = document.querySelector<HTMLElement>('.section-navigation');
  if (!root) return;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-work-filter]')];
  const projects = [...document.querySelectorAll<HTMLElement>('[data-project-category]')];
  const status = root.querySelector<HTMLElement>('[data-work-filter-status]');

  const select = (filter: WorkFilter) => {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.workFilter === filter)));
    let visible = 0;
    projects.forEach(project => {
      const show = matchesWorkFilter(filter, project.dataset.projectCategory ?? '');
      project.hidden = !show;
      if (show) visible++;
    });
    if (status) status.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'} shown`;
    onChange?.();
  };

  root.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-work-filter]') : null;
    if (!button || !root.contains(button)) return;
    select(button.dataset.workFilter as WorkFilter);
  });
}

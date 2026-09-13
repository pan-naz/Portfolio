export function initializeHeroTyping() {
  const heading = document.querySelector<HTMLElement>('[data-typewriter]');
  if (!heading) return;
  const permanent = heading.querySelector<HTMLElement>('[data-permanent]')!;
  const cycling = heading.querySelector<HTMLElement>('[data-cycling]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const first = 'Product Designer.';
  const roles = ['UX designer', 'Web designer', 'App designer'];
  let timer: ReturnType<typeof setTimeout> | undefined;
  let paused = false;
  let intro = true;
  let deleting = false;
  let count = 0;
  let role = 0;
  let nextDelay = 350;
  const schedule = () => {
    clearTimeout(timer);
    if (!paused && !reduced.matches) timer = setTimeout(step, nextDelay);
  };
  const step = () => {
    if (intro) {
      permanent.textContent = first.slice(0, ++count);
      nextDelay = 75;
      if (count === first.length) {
        intro = false; count = 0; nextDelay = 450;
        heading.classList.remove('is-typing-intro');
      }
    } else if (deleting) {
      cycling.textContent = roles[role].slice(0, --count);
      nextDelay = 48;
      if (count === 0) { deleting = false; role = (role + 1) % roles.length; nextDelay = 250; }
    } else {
      cycling.textContent = roles[role].slice(0, ++count);
      nextDelay = 95;
      if (count === roles[role].length) { deleting = true; nextDelay = 2400; }
    }
    schedule();
  };
  const reset = () => {
    clearTimeout(timer);
    intro = true; deleting = false; count = 0; role = 0; nextDelay = 350;
    permanent.textContent = reduced.matches ? first : '';
    cycling.textContent = reduced.matches ? roles[0] : '';
    heading.classList.toggle('is-typing-intro', !reduced.matches);
    schedule();
  };
  reduced.addEventListener('change', reset);
  reset();
  return { setPaused(value: boolean) { paused = value; schedule(); } };
}

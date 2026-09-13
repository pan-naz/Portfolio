export {};
const root = document.documentElement;
const readTokens = () => {
  const style = getComputedStyle(root);
  document.querySelectorAll<HTMLElement>('[data-token]').forEach(node => {
    node.textContent = style.getPropertyValue(`--${node.dataset.token}`).trim();
  });
};
readTokens();
window.addEventListener('themechange', readTokens);
const drawer = document.querySelector<HTMLDialogElement>('#ds-drawer')!;
const toggle = document.querySelector<HTMLButtonElement>('.ds-menu-toggle')!;
const close = () => { drawer.close(); toggle.setAttribute('aria-expanded','false'); document.body.classList.remove('menu-open'); };
toggle.addEventListener('click', () => { drawer.showModal(); toggle.setAttribute('aria-expanded','true'); document.body.classList.add('menu-open'); });
drawer.querySelector('.ds-menu-close')!.addEventListener('click', close);
drawer.addEventListener('cancel', event => { event.preventDefault(); close(); });
drawer.addEventListener('click', event => { if (event.target === drawer && event.clientX > drawer.getBoundingClientRect().right) close(); });
drawer.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const items = [...drawer.querySelectorAll<HTMLElement>('button, a[href]')];
  const first = items[0], last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
document.querySelectorAll<HTMLAnchorElement>('.ds-navigation a').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  if (drawer.open) close();
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  history.pushState(null,'',link.hash);
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}));
matchMedia('(min-width: 900px)').addEventListener('change', event => { if (event.matches && drawer.open) close(); });
const sections = [...document.querySelectorAll<HTMLElement>('.ds-section')];
const links = [...document.querySelectorAll<HTMLAnchorElement>('.ds-navigation a')];
const update = () => {
  const active = [...sections].reverse().find(section => section.getBoundingClientRect().top <= 160) ?? sections[0];
  links.forEach(link => { if (link.hash === `#${active.id}`) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
};
let pending = false;
window.addEventListener('scroll', () => {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => { update(); pending = false; });
}, { passive: true });
update();

// Each frame enhances readable server-rendered content into keyboard-operable tabs.
document.querySelectorAll<HTMLElement>('[data-example]').forEach(frame => {
  const tabs = [...frame.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const panels = [...frame.querySelectorAll<HTMLElement>('[data-panel]')];
  const activate = (index: number, focus = false) => {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    if (focus) tabs[index].focus();
  };
  panels.forEach((panel, i) => { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', tabs[i].id); panel.tabIndex = 0; });
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      let next: number;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); activate(next, true);
    });
  });
  frame.dataset.ready = 'true';
  frame.querySelector<HTMLElement>('[role="tablist"]')!.hidden = false;
  activate(0);
});

const search = document.querySelector<HTMLDialogElement>('#ds-search')!;
const searchInput = search.querySelector<HTMLInputElement>('input')!;
const results = [...search.querySelectorAll<HTMLAnchorElement>('[data-search-text]')];
const searchStatus = search.querySelector<HTMLElement>('[role="status"]')!;
const searchTrigger = document.querySelector<HTMLButtonElement>('.ds-search-trigger')!;
searchTrigger.hidden = false;
const filter = () => {
  const words = searchInput.value.toLowerCase().trim().split(/\s+/);
  results.forEach(link => { link.hidden = !words.every(word => link.dataset.searchText!.toLowerCase().includes(word)); });
  const count = results.filter(link => !link.hidden).length;
  searchStatus.textContent = count ? `${count} section${count === 1 ? '' : 's'}` : 'No matching sections. Try colors, buttons or motion.';
};
const openSearch = () => { if (drawer.open) close(); if (!search.open) search.showModal(); searchInput.value = ''; filter(); searchInput.focus(); };
searchTrigger.addEventListener('click', openSearch);
search.querySelector('[data-search-close]')!.addEventListener('click', () => search.close());
searchInput.addEventListener('input', filter);
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === 'ArrowDown') {
    const first = results.find(link => !link.hidden);
    if (first) { event.preventDefault(); if (event.key === 'Enter') first.click(); else first.focus(); }
  }
});
results.forEach(link => link.addEventListener('click', event => {
  event.preventDefault(); search.close();
  const section = document.getElementById(link.hash.slice(1));
  if (!section) return;
  history.pushState(null, '', link.hash); section.focus({ preventScroll: true });
  section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}));
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (search.open) search.close(); else openSearch(); }
});

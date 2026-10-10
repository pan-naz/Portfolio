// Native anchors work without JavaScript. This only marks the current section.
const contents = document.querySelector<HTMLDetailsElement>('[data-ds-contents]');
const wide = matchMedia('(min-width: 768px)');
const syncContents = () => { if (contents) contents.open = wide.matches; };
syncContents();
wide.addEventListener('change', syncContents);
document.documentElement.dataset.docNavigationReady = 'true';
const links = [...document.querySelectorAll<HTMLAnchorElement>('.ds-navigation a')];
const mark = (id: string) => links.forEach(link => {
  if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
  else link.removeAttribute('aria-current');
});
links.forEach(link => link.addEventListener('click', () => mark(link.hash.slice(1))));
const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter((section): section is HTMLElement => !!section);
const update = () => {
  const current = [...sections].reverse().find(section => section.getBoundingClientRect().top <= 120) ?? sections[0];
  if (current) mark(current.id);
};
window.addEventListener('scroll', update, { passive: true });
window.addEventListener('hashchange', () => mark(location.hash.slice(1)));
mark(location.hash.slice(1) || 'overview');
// Frozen examples use data attributes rather than adding catalog props to the
// shared components. Their state CSS is generated from the real stylesheet.
for (const wrapper of document.querySelectorAll<HTMLElement>('.ds-state-example[data-state]')) {
  const target = wrapper.querySelector<HTMLElement>('.button, .icon-button, .navigation-item, .text-link');
  if (target) target.dataset.dsPreviewState = wrapper.dataset.state;
}

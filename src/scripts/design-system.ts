// Native anchors work without JavaScript. This only marks the current section.
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
mark(location.hash.slice(1) || 'colors');

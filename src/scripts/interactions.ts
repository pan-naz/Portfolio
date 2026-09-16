import { initializeMotion, pauseScroll, resumeScroll, scrollToSection } from './motion';
import { initializeWaterfall } from './waterfall';
import { initializeHeroIntro } from './hero-intro';
import { initializeHeaderMorph } from './header-morph';
import { initializeWorkFilter } from './work-filter';

document.documentElement.classList.add('enhanced');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile = window.matchMedia('(max-width: 767px)');
const menu = document.querySelector<HTMLDialogElement>('#mobile-menu')!;
const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const page = document.querySelector<HTMLElement>('#page-content')!;
const header = document.querySelector<HTMLElement>('.site-header')!;
const hero = document.querySelector<HTMLElement>('.hero')!;
const waterfall = initializeWaterfall();
const heroIntro = initializeHeroIntro();
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let afterClose: (() => void) | undefined;
let heroInView = true;
const updateHeroMotion = () => {
  const suspended = menu.open || !heroInView || document.hidden;
  hero.classList.toggle('is-motion-paused', suspended);
  heroIntro?.setPaused(suspended);
  waterfall?.setSuspended(menu.open);
};
new IntersectionObserver(entries => {
  heroInView = entries[0].isIntersecting;
  updateHeroMotion();
}).observe(hero);
document.addEventListener('visibilitychange', updateHeroMotion);
const completeClose = () => {
  if (closeTimer) clearTimeout(closeTimer);
  menu.classList.remove('is-closing');
  if (menu.open) menu.close();
  page.inert = false;
  header.inert = false;
  document.body.classList.remove('menu-open');
  resumeScroll();
  updateHeroMotion();
  menuToggle.setAttribute('aria-expanded', 'false');
  const callback = afterClose;
  afterClose = undefined;
  if (callback) callback(); else menuToggle.focus({ preventScroll: true });
};
const closeMenu = (callback?: () => void) => {
  if (!menu.open || menu.classList.contains('is-closing')) return;
  afterClose = callback;
  menu.classList.add('is-closing');
  closeTimer = setTimeout(completeClose, reducedMotion.matches ? 0 : 200);
};
menuToggle.addEventListener('click', () => {
  menu.showModal();
  pauseScroll();
  page.inert = true;
  header.inert = true;
  document.body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  updateHeroMotion();
  menu.querySelector<HTMLButtonElement>('.menu-close')?.focus();
});
menu.querySelector('.menu-close')!.addEventListener('click', () => closeMenu());
menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
menu.addEventListener('click', event => {
  const rect = menu.getBoundingClientRect();
  if (event.target === menu && (event.clientX < rect.left || event.clientX > rect.right)) closeMenu();
});
menu.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const targets = [...menu.querySelectorAll<HTMLElement>('button, a[href]')];
  const first = targets[0], last = targets[targets.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
document.querySelectorAll<HTMLAnchorElement>('a[href]:not(.skip-link)').forEach(link => {
  if (link.pathname !== location.pathname || !link.hash) return;
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    const navigate = () => {
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      scrollToSection(target);
    };
    if (menu.contains(link)) closeMenu(navigate); else navigate();
  });
});
mobile.addEventListener('change', () => { if (!mobile.matches && menu.open) completeClose(); });
const updateHeader = () => {
  const active = [...document.querySelectorAll<HTMLElement>('#work, #about')].reverse().find(section => section.getBoundingClientRect().top < window.innerHeight * .45);
  header.querySelectorAll<HTMLAnchorElement>('nav a').forEach(link => {
    if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};
let scrollTick = false;
window.addEventListener('scroll', () => {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(() => { updateHeader(); scrollTick = false; });
}, { passive: true });
const siteMotion = initializeMotion();
initializeWorkFilter(() => requestAnimationFrame(siteMotion.refresh));
initializeHeaderMorph();
updateHeader();

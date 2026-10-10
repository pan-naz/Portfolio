import { refreshViewportPointer } from './viewport-pointer';
import { initializeMotion, pauseScroll, resumeScroll, scrollToSection, repositionWork } from './motion';
import { initializeWaterfall } from './waterfall/waterfall';
import { initializeFooterPile } from './footer-pile/footer-pile';
import { initializeHeroIntro } from './hero-intro';
import { initializeHeaderMorph } from './header-morph/header-morph';
import { initializeWorkFilter } from './work-filter/work-filter';
import { initializeWorkStage } from './work-stage/work-stage';
import { initializeSectionReveals } from './section-reveals';
import { initializeProjectTilt } from './project-tilt';
import { initializeProjectCursor } from './project-cursor';
import { initializeWorkFilterMagnet } from './work-filter/work-filter-magnet';
import { initializeCaseStudies } from './case-study/case-studies';
import { initializeCaseStudyVideos } from './case-study/case-study-videos';

document.documentElement.classList.add('enhanced');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile = window.matchMedia('(max-width: 767px)');
const menu = document.querySelector<HTMLDialogElement>('#mobile-menu')!;
const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle')!;
const page = document.querySelector<HTMLElement>('#page-content')!;
const header = document.querySelector<HTMLElement>('.site-header')!;
const hero = document.querySelector<HTMLElement>('.hero')!;
const workStage = initializeWorkStage();
const heroIntro = initializeHeroIntro(workStage);
const waterfall = initializeWaterfall();
const footerPile = initializeFooterPile();
void heroIntro?.finished.then(() => footerPile?.prefetchWhenIdle());
const projectTilt = initializeProjectTilt();
const projectCursor = initializeProjectCursor();
const workFilterMagnet = initializeWorkFilterMagnet();
const projectVideos = initializeCaseStudyVideos();
let sectionReveals: ReturnType<typeof initializeSectionReveals> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let afterClose: (() => void) | undefined;
let heroInView = true;
let caseStudyOpen = false;
const updateHeroMotion = () => {
  const suspended = menu.open || caseStudyOpen || !heroInView || document.hidden;
  hero.classList.toggle('is-motion-paused', suspended);
  heroIntro?.setPaused(suspended);
  projectVideos.setPaused(menu.open || caseStudyOpen);
  workStage?.setPaused(menu.open || caseStudyOpen || document.hidden);
  sectionReveals?.setPaused(menu.open || caseStudyOpen || document.hidden);
  waterfall?.setSuspended(menu.open || caseStudyOpen);
  footerPile?.setPaused(menu.open || caseStudyOpen);
  projectTilt?.setPaused(menu.open || caseStudyOpen || document.hidden);
  projectCursor?.setPaused(menu.open || caseStudyOpen || document.hidden);
  workFilterMagnet?.setPaused(menu.open || caseStudyOpen || document.hidden);
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
      // At the top, the wordmark starts a fresh homepage session.
      if (link.hasAttribute('data-home-top') && window.scrollY <= 1) {
        try { sessionStorage.removeItem('portfolio-case-return'); } catch {}
        history.replaceState({ ...history.state, workFilter: 'selected' }, '', `${location.pathname}${location.search}`);
        location.reload();
        return;
      }
      // Scrolling up preserves the selected category and URL.
      if (location.hash !== link.hash && !link.hasAttribute('data-home-top')) history.pushState(null, '', link.hash);
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
sectionReveals = initializeSectionReveals();
const workFilter = initializeWorkFilter(() => { requestAnimationFrame(siteMotion.refresh); refreshViewportPointer(); }, repositionWork);
initializeHeaderMorph();
updateHeader();

initializeCaseStudies(projectCursor, open => {
  if (!open) projectTilt?.deferHoverUntilPointerMove();
  caseStudyOpen = open;
  updateHeroMotion();
}, filter => workFilter?.select(filter));

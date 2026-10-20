import { refreshViewportPointer } from './viewport-pointer';
import { initializeMotion, scrollToSection, repositionWork } from './motion';
import { initializeWaterfall } from './waterfall/waterfall';
import { initializeFooterPile } from './footer-pile/footer-pile';
import { initializeHeroIntro } from './hero-intro';
import { initializeHeaderMorph } from './header-morph/header-morph';
import { initializeWorkFilter, workFilterHash, type WorkFilter } from './work-filter/work-filter';
import { initializeWorkFilterPill } from './work-filter/work-filter-pill';
import { initializeWorkStage } from './work-stage/work-stage';
import { initializeSectionReveals } from './section-reveals';
import { initializeProjectTilt } from './project-tilt';
import { initializeProjectCursor } from './project-cursor';
import { initializeWorkFilterMagnet } from './work-filter/work-filter-magnet';
import { initializeCaseStudies } from './case-study/case-studies';
import { initializeCaseStudyVideos } from './case-study/case-study-videos';
import { initializeWorkMedia } from './work-filter/work-media';

document.documentElement.classList.add('enhanced');
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
if (heroIntro) initializeWorkMedia(heroIntro.started);
let sectionReveals: ReturnType<typeof initializeSectionReveals> | undefined;
let heroInView = true;
let caseStudyOpen = false;
const updateHeroMotion = () => {
  const suspended = caseStudyOpen || !heroInView || document.hidden;
  hero.classList.toggle('is-motion-paused', suspended);
  heroIntro?.setPaused(suspended);
  projectVideos.setPaused(caseStudyOpen);
  workStage?.setPaused(caseStudyOpen || document.hidden);
  sectionReveals?.setPaused(caseStudyOpen || document.hidden);
  waterfall?.setSuspended(caseStudyOpen);
  footerPile?.setPaused(caseStudyOpen);
  projectTilt?.setPaused(caseStudyOpen || document.hidden);
  projectCursor?.setPaused(caseStudyOpen || document.hidden);
  workFilterMagnet?.setPaused(caseStudyOpen || document.hidden);
};
new IntersectionObserver(entries => {
  heroInView = entries[0].isIntersecting;
  updateHeroMotion();
}).observe(hero);
document.addEventListener('visibilitychange', updateHeroMotion);
let clickScrolling = false;
let clickScrollEndY: number | undefined;
let cancelScrollCompletion: (() => void) | undefined;
let clickScrollRevision = 0;
const finishClickScroll = () => {
  clickScrollRevision++;
  clickScrolling = false;
  clickScrollEndY = undefined;
  cancelScrollCompletion?.();
  cancelScrollCompletion = undefined;
};
// A visitor can interrupt a link scroll; subsequent scrolling then owns the URL again.
for (const type of ['wheel', 'touchstart', 'keydown', 'popstate', 'pagehide']) window.addEventListener(type, finishClickScroll, {passive:true});
document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(link => {
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
      // Clicks own their history entry until their existing scroll motion finishes.
      if (location.hash !== link.hash && !link.hasAttribute('data-home-top')) history.pushState(null, '', link.hash);
      finishClickScroll();
      clickScrolling = true;
      const revision = clickScrollRevision;
      cancelScrollCompletion = scrollToSection(target, () => {
        if (revision === clickScrollRevision) {
          finishClickScroll();
          updateHeader();
          // The final queued scroll event still belongs to the click.
          clickScrollEndY = window.scrollY;
        }
      });
    };
    navigate();
  });
});
const activeSection = () => [...document.querySelectorAll<HTMLElement>('#work, #about')].reverse().find(section => section.getBoundingClientRect().top < window.innerHeight * .45);
const updateHeader = (syncUrl = true) => {
  const active = activeSection();
  header.querySelectorAll<HTMLAnchorElement>('nav a').forEach(link => {
    if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (!syncUrl || location.pathname !== '/' || caseStudyOpen || clickScrolling || clickScrollEndY === window.scrollY) return;
  const filter = document.querySelector<HTMLElement>('#project-list')?.dataset.activeFilter as WorkFilter | undefined;
  const hash = active?.id === 'work' ? workFilterHash(filter ?? 'selected') || '#work' : active ? '#about' : '';
  if (location.hash !== hash) history.replaceState(history.state, '', `${location.pathname}${location.search}${hash}`);
};
let scrollTick = false;
window.addEventListener('scroll', () => {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(() => { updateHeader(); scrollTick = false; });
}, { passive: true });
const siteMotion = initializeMotion();
sectionReveals = initializeSectionReveals();
const workFilter = initializeWorkFilter(() => { requestAnimationFrame(siteMotion.refresh); refreshViewportPointer(); }, repositionWork, activeSection);
initializeHeaderMorph();
initializeWorkFilterPill();
updateHeader(false);

// Category hashes share Work's native anchor landing after the filter and fonts settle.
const initialFilterHash = location.hash;
if (['#websites', '#misc'].includes(initialFilterHash) && !document.documentElement.dataset.caseReturn) {
  const landAtWork = () => void document.fonts.ready.then(() => requestAnimationFrame(() => {
    if (location.pathname === '/' && location.hash === initialFilterHash && !caseStudyOpen) {
      document.getElementById('work')?.scrollIntoView({behavior:'instant', block:'start'});
    }
  }));
  if (document.readyState === 'complete') landAtWork();
  else window.addEventListener('load', landAtWork, {once:true});
}

initializeCaseStudies(projectCursor, open => {
  if (!open) projectTilt?.deferHoverUntilPointerMove();
  caseStudyOpen = open;
  updateHeroMotion();
}, filter => workFilter?.select(filter));

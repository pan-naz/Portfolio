import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the actual head bootstrap: a modal reload changes the scroll owner
// from its nested viewport to the document, which native restoration cannot do.
const layout = readFileSync('src/layouts/BaseLayout.astro', 'utf8');
const source = layout.match(/<script is:inline data-scroll-restoration>([\s\S]*?)<\/script>/)?.[1];
assert.ok(source);
function boot({ path = '/case-studies/datagpt/', hash = '', search = '', navigation = 'reload', state = {}, storage = new Map(), storageBlocked = false, top = 0, caseTop, max = Infinity } = {}) {
  const events = new Map(), documentEvents = new Map(), frames = [];
  const root = { dataset: {} };
  const history = { state, scrollRestoration: 'auto', url: path, replaceState(next, _title, url) { this.state = next; if (url) this.url = url; } };
  const location = { pathname: path, search, hash };
  const window = { scrollY: top, scrollTo(options) { this.scrollY = Math.min(max, options.top); assert.equal(options.behavior, 'instant'); } };
  const document = {
    documentElement: root, hidden: false, fonts: { ready: Promise.resolve() },
    querySelector: () => caseTop === undefined ? null : { scrollTop: caseTop },
    addEventListener: (name, callback) => documentEvents.set(name, callback),
  };
  runInNewContext(source, {
    document, window, history, location,
    sessionStorage: {
      getItem(key) { if (storageBlocked) throw new Error('Blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (storageBlocked) throw new Error('Blocked'); storage.set(key, value); },
    },
    performance: { getEntriesByType: () => [{ type: navigation }] },
    addEventListener: (name, callback) => events.set(name, callback),
    requestAnimationFrame: callback => frames.push(callback),
  });
  return {
    root, history, storage, window, document, events, documentEvents, location,
    setMax(value) { max = value; },
    async finish() { events.get('load')?.(); await Promise.resolve(); frames.splice(0).forEach(callback => callback()); },
  };
}

const modal = boot({ path: '/', navigation: 'navigate', top: 2541, caseTop: 700, state: { caseStudy: 'datagpt', other: 'retained' } });
modal.location.pathname = '/case-studies/datagpt/';
modal.events.get('pagehide')();
assert.equal(modal.history.state.portfolioScroll.top, 700, 'Save the visible case viewport, not the paused homepage');
assert.equal(modal.history.state.portfolioScroll.path, '/case-studies/datagpt/');
assert.equal(modal.history.state.caseStudy, 'datagpt');
assert.equal(modal.history.state.other, 'retained');

// Browsers may snapshot the history state before pagehide runs. Exercise that
// ordering with stale history and the final position captured in tab storage.
const reload = boot({ state: { caseStudy: 'datagpt' }, storage: modal.storage, max: 200 });
assert.equal(reload.history.scrollRestoration, 'manual');
assert.equal(reload.root.dataset.scrollRestorePending, 'true');
reload.events.get('DOMContentLoaded')();
assert.equal(reload.window.scrollY, 200, 'Early layout can initially clamp the restored position');
reload.events.get('pagehide')();
assert.equal(JSON.parse(reload.storage.get('portfolio-reload-scroll')).top, 700, 'Another reload during loading retains the intended position');
reload.setMax(Infinity);
await reload.finish();
assert.equal(reload.window.scrollY, 700, 'Restore the exact case position after layout and fonts settle');
assert.equal(reload.root.dataset.scrollRestorePending, undefined, 'Reveal only once the correct position is applied');
assert.equal(reload.history.scrollRestoration, 'auto');

reload.window.scrollY = 1800;
reload.document.hidden = true;
reload.documentEvents.get('visibilitychange')();
assert.equal(reload.history.state.portfolioScroll.top, 1800, 'Standalone cases save their current document position');
const repeat = boot({ storage: reload.storage });
await repeat.finish();
assert.equal(repeat.window.scrollY, 1800, 'Repeated standalone reloads stay at the latest position');

const home = boot({ path: '/', navigation: 'navigate', top: 5830 });
home.events.get('pagehide')();
const homeReload = boot({ path: '/', storage: home.storage });
assert.equal(homeReload.root.dataset.scrollRestorePending, undefined, 'Homepage reload keeps the static Work background visible before fonts and intro scripts finish');
await homeReload.finish();
assert.equal(homeReload.window.scrollY, 0, 'Homepage reloads restart from the top for the intro');
assert.equal(homeReload.history.url, '/', 'The default category has no hash');
assert.equal(homeReload.root.dataset.scrollRestorePending, undefined);
const firstHomeReload = boot({ path: '/', top: 5830 });
assert.equal(firstHomeReload.window.scrollY, 0, 'Homepage reloads reset immediately even without a stored position');
assert.equal(firstHomeReload.root.dataset.scrollRestorePending, undefined, 'A homepage reload without storage also avoids hiding the background');
await firstHomeReload.finish();
assert.equal(firstHomeReload.window.scrollY, 0);
for (const hash of ['#websites', '#misc', '#about', '#unknown', '']) {
  const categoryReload = boot({ path: '/', hash, search: '?campaign=sample', top: 5830 });
  await categoryReload.finish();
  assert.equal(categoryReload.window.scrollY, 0, 'Hash persistence preserves the existing homepage intro reset');
  assert.equal(categoryReload.history.url, `/?campaign=sample${['#websites', '#misc'].includes(hash) ? hash : ''}`, 'Reload preserves category hashes and unrelated query parameters');
}
const freshHome = boot({ path: '/', navigation: 'navigate', top: 5830, storage: home.storage });
assert.equal(freshHome.window.scrollY, 5830, 'A fresh homepage navigation retains native behavior');
assert.equal(freshHome.events.has('load'), false);
const backHome = boot({ path: '/', navigation: 'back_forward', top: 5830, storage: home.storage });
assert.equal(backHome.window.scrollY, 5830, 'Back to the homepage retains native history restoration');

for (const options of [
  { navigation: 'navigate', state: modal.history.state },
  { navigation: 'back_forward', state: modal.history.state },
  { navigation: 'navigate', storage: modal.storage },
  { navigation: 'back_forward', storage: modal.storage },
  { path: '/case-studies/hooko/', state: modal.history.state },
  { path: '/case-studies/hooko/', storage: modal.storage },
  { state: { portfolioScroll: { path: '/case-studies/datagpt/', top: -1 } } },
  { state: { portfolioScroll: { path: '/case-studies/datagpt/', top: NaN } } },
  { state: {} },
]) {
  const visit = boot(options);
  assert.equal(visit.root.dataset.scrollRestorePending, undefined, 'Fresh visits and unrelated history entries do not consume stale positions');
  assert.equal(visit.history.scrollRestoration, 'auto');
  assert.equal(visit.events.has('load'), false);
}
const blockedStorage = boot({ storageBlocked: true, state: modal.history.state });
await blockedStorage.finish();
assert.equal(blockedStorage.window.scrollY, 700, 'History provides a fallback when tab storage is blocked');
blockedStorage.events.get('pagehide')();
const corruptStorage = boot({ storage: new Map([['portfolio-reload-scroll', '{broken']]), state: modal.history.state });
await corruptStorage.finish();
assert.equal(corruptStorage.window.scrollY, 700, 'Malformed storage cannot break reload or hide the page');
assert.ok(!layout.includes('resetToTopOnReload'));
assert.ok(!readFileSync('src/pages/index.astro', 'utf8').includes('resetToTopOnReload'));
assert.ok(readFileSync('src/styles/global.css', 'utf8').includes('html[data-scroll-restore-pending] body { visibility: hidden; }'));
console.log('PASS: case reload continuity, repeated reloads, delayed layout, hidden-tab capture, homepage intro reset and native fresh/history navigation.');

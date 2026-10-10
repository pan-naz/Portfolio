import assert from 'node:assert/strict';
import { initializeCaseStudyNavigation, suspendCaseStudyScrollRestoration } from '../src/scripts/case-study/case-study-navigation.ts';

for (const previous of ['auto', 'manual']) {
  const target = { scrollRestoration: previous };
  const release = suspendCaseStudyScrollRestoration(target);
  assert.equal(target.scrollRestoration, 'manual', 'Native hash/Back restoration cannot move the card during its shared animation');
  release();
  assert.equal(target.scrollRestoration, previous, 'Closing restores the caller’s original restoration policy');
  target.scrollRestoration = 'auto';
  release();
  assert.equal(target.scrollRestoration, 'auto', 'A completed transition cannot release scroll ownership twice');
}

function fixture(filter, saved, storageBlocked = false) {
  const hash = filter === 'selected' ? '#work' : `#${filter}`;
  const defaultHref = `https://portfolio.local/${hash}`;
  const visits = [], storage = new Map();
  const link = new EventTarget();
  let href = defaultHref;
  Object.defineProperty(link, 'href', {
    get: () => href,
    set: value => { href = new URL(value, 'https://portfolio.local').href; },
  });
  globalThis.document = { querySelector: () => link };
  globalThis.window = new EventTarget();
  globalThis.location = new URL('https://portfolio.local/case-studies/example/');
  location.replace = () => assert.fail('Back at an existing home hash must load the homepage rather than trigger another same-document navigation');
  location.reload = () => visits.push(location.href);
  globalThis.history = {
    state: { caseStudy: 'example', portfolioCaseOrigin: saved },
    replaceState(state, _title, url) { this.state = state; location.href = new URL(url, location.href).href; },
  };
  globalThis.sessionStorage = {
    setItem(key, value) { if (storageBlocked) throw new Error('Blocked'); storage.set(key, value); },
  };
  initializeCaseStudyNavigation();
  const click = options => link.dispatchEvent(Object.assign(new Event('click'), {
    button: 0, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...options,
  }));
  return { link, visits, storage, click, defaultHref };
}

for (const filter of ['selected', 'websites', 'misc']) {
  const hash = filter === 'selected' ? '' : `#${filter}`;
  const origin = { url: `/?source=portfolio${hash}`, top: 5830 };
  const f = fixture(filter, origin);
  assert.equal(f.link.href, `https://portfolio.local${origin.url}`, 'Close preserves the original category, query and URL');
  f.click({ ctrlKey: true });
  assert.equal(f.storage.size, 0, 'Opening the return link in another tab must not change this tab’s next navigation');
  f.click();
  assert.deepEqual(JSON.parse(f.storage.get('portfolio-case-return')), origin, 'Close hands off the homepage position separately from the case reading position');

  const back = fixture(filter, origin);
  window.dispatchEvent(new Event('popstate'));
  assert.equal(back.visits.length, 0, 'History changes within a case do not redirect');
  assert.equal(back.storage.size, 0);
  location.pathname = '/';
  window.dispatchEvent(new Event('popstate'));
  assert.deepEqual(back.visits, [back.link.href], 'Back after modal reload replaces the stale case document');
  assert.deepEqual(JSON.parse(back.storage.get('portfolio-case-return')), { ...origin, reload: true }, 'Browser Back uses the same exact return point as Close and identifies its document reload');

  const direct = fixture(filter);
  direct.click();
  assert.equal(direct.link.href, direct.defaultHref, 'Direct case visits retain the existing collection destination');
  assert.equal(direct.storage.size, 0, 'A direct visit has no fabricated homepage position');
}

for (const saved of [
  { url: 'https://elsewhere.local/#websites', top: 5830 },
  { url: '/design-system/', top: 5830 },
  { url: '/#misc', top: -1 },
  { url: '/#misc', top: NaN },
  { url: '/#misc', top: '5830' },
]) {
  const f = fixture('websites', saved);
  f.click();
  assert.equal(f.link.href, f.defaultHref, 'Invalid or unrelated origins cannot override the case destination');
  assert.equal(f.storage.size, 0);
}
const blocked = fixture('misc', { url: '/#misc', top: 5830 }, true);
assert.doesNotThrow(() => blocked.click(), 'Unavailable session storage never prevents closing');
globalThis.document = { querySelector: () => null };
initializeCaseStudyNavigation();
console.log('PASS: Close and Back after a modal reload preserve the origin viewport and category; direct visits, modified clicks and invalid state remain safe.');

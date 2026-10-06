import assert from 'node:assert/strict';
import { initializeCaseStudyNavigation } from '../src/scripts/case-study-navigation.ts';

for (const filter of ['selected', 'websites', 'misc']) {
  const href = filter === 'selected' ? 'https://portfolio.local/#work' : `https://portfolio.local/#${filter}`;
  const visits = [];
  globalThis.document = { querySelector: () => ({ href }) };
  globalThis.window = new EventTarget();
  globalThis.location = { pathname: '/case-studies/example/', replace: url => visits.push(url) };
  initializeCaseStudyNavigation();
  window.dispatchEvent(new Event('popstate'));
  assert.equal(visits.length, 0, 'History changes within a case do not redirect');
  location.pathname = '/';
  window.dispatchEvent(new Event('popstate'));
  assert.deepEqual(visits, [href], 'Back after modal reload loads the homepage at the original collection');
}
globalThis.document = { querySelector: () => null };
initializeCaseStudyNavigation();
console.log('PASS: Back after a modal reload replaces the stale standalone document with the correct homepage collection.');

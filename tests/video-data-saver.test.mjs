import assert from 'node:assert/strict';
import { initializeCaseStudyVideos, setCaseVideoPlaying, preloadCaseVideo } from '../src/scripts/case-study/case-study-videos.ts';
const media = Object.assign(new EventTarget(), { matches: false });
globalThis.matchMedia = () => media;
globalThis.document = Object.assign(new EventTarget(), { hidden: false });
globalThis.window = Object.assign(new EventTarget(), { innerHeight: 900, scrollY: 100 });
globalThis.location = { pathname: '/case-studies/example/' };
const observers = [];
globalThis.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; observers.push(this); }
  observe() {} disconnect() {}
  enter(target, visible = true) { this.callback([{ target, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }]); }
};
globalThis.Image = class { decode() { return Promise.resolve(); } };
const tick = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
class Movie extends EventTarget {
  dataset = {}; readyState = 0; currentTime = 0; loads = 0; plays = 0; paused = true; poster = ''; case = false;
  source = { dataset: { src: '/clip.mp4' }, hasAttribute(name) { return this[name] !== undefined; }, removeAttribute(name) { delete this[name]; } };
  querySelector() { return this.source; }
  querySelectorAll(selector) { return selector === 'source[data-src]' || selector === 'source[src]' && this.source.src ? [this.source] : []; }
  closest(selector) { return this.case && selector.includes('[data-case-content]') ? {} : null; }
  getAttribute(name) { return name === 'poster' && this.poster ? this.poster : null; }
  removeAttribute(name) { if (name === 'poster') this.poster = ''; }
  load() { this.loads++; }
  play() { this.plays++;this.paused = false;this.dispatchEvent(new Event('play'));return Promise.resolve(); }
  pause() { if (!this.paused) { this.paused = true;this.dispatchEvent(new Event('pause')); } }
}
const controllerFor = video => initializeCaseStudyVideos({ querySelectorAll: () => [video] });
for (const policy of [{saveData:true,effectiveType:'4g'},{saveData:false,effectiveType:'2g'},{saveData:false,effectiveType:'slow-2g'}]) {
  const connection = Object.assign(new EventTarget(), policy);
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { connection } });
  const card = new Movie(), home = controllerFor(card), homeIO = observers.at(-1);
  homeIO.enter(card);preloadCaseVideo(card, 'auto');setCaseVideoPlaying(card, true);
  assert.equal(card.source.src, undefined, 'Saving-data cards never attach media, even with stale intent');
  assert.equal(card.plays, 0);
  card.case = true;const popup = controllerFor(card), popupIO = observers.at(-1);popupIO.enter(card);
  assert.equal(card.source.src, undefined, 'Opening does not inherit a stale card play intent');
  setCaseVideoPlaying(card, true);assert.equal(card.source.src, '/clip.mp4');
  popupIO.enter(card, false);const count = card.plays;popup.refresh();assert.equal(card.plays, count);
  popupIO.enter(card);assert.ok(card.plays > count, 'Explicit play still obeys offscreen pause/reentry');
  popup.destroy();card.case = false;home.refresh();assert.equal(card.source.src, undefined, 'Case return cancels the manual download');
  const returnedPlays = card.plays;homeIO.enter(card);assert.equal(card.plays, returnedPlays);home.destroy();
}
const connection = Object.assign(new EventTarget(), {saveData:false,effectiveType:'4g'});
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { connection } });
const active = new Movie(), activeController = controllerFor(active);observers.at(-1).enter(active);
assert.equal(active.source.src, '/clip.mp4');connection.saveData = true;connection.dispatchEvent(new Event('change'));
assert.equal(active.source.src, undefined, 'Enabling saving mid-visit cancels an automatic transfer');activeController.destroy();
const setup = new Movie();setup.case = true;setup.dataset.saverPoster = '/first-frame.jpg';
const setupController = controllerFor(setup);observers.at(-2).enter(setup);await tick();
assert.equal(setup.poster, '/first-frame.jpg');assert.equal(setup.source.src, undefined);
connection.saveData = false;connection.dispatchEvent(new Event('change'));
assert.equal(setup.poster, '', 'Approved fallback is removed when data saving ends');assert.equal(setup.dataset.poster, undefined);
setupController.destroy();
console.log('PASS: save-data/2g/slow-2g, manual case intent, borrowing, cancellation, mode-only fallback and cleanup.');

import assert from 'node:assert/strict';
import { initializeCaseStudyVideos } from '../src/scripts/case-study-videos.ts';

class Events {
  listeners = new Map();
  addEventListener(name, fn) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name).add(fn);
  }
  removeEventListener(name, fn) {
    const listeners = this.listeners.get(name);
    listeners?.delete(fn);
    if (!listeners?.size) this.listeners.delete(name);
  }
  emit(name) { this.listeners.get(name)?.forEach(fn => fn()); }
}
const reduced = Object.assign(new Events(), { matches: false });
globalThis.matchMedia = () => reduced;
globalThis.document = Object.assign(new Events(), { hidden: false });
const observers = [];
globalThis.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; this.observed = []; observers.push(this); }
  observe(video) { this.observed.push(video); }
  disconnect() { this.disconnected = true; }
  enter(video, visible = true) { this.callback([{ target: video, isIntersecting: visible, intersectionRatio: visible ? .5 : 0 }]); }
};
const makeVideo = () => {
  const source = {
    dataset: { src: '/clip.mp4' },
    hasAttribute(name) { return name === 'src' && this.src !== undefined; },
    removeAttribute(name) { delete this[name]; },
  };
  return {
    source, readyState: 0, currentTime: 0, loads: 0, plays: 0, pauses: 0,
    querySelectorAll(selector) { return selector === 'source[data-src]' || source.hasAttribute('src') ? [source] : []; },
    load() { this.loads++; },
    play() { this.plays++; return Promise.resolve(); },
    pause() { this.pauses++; },
  };
};
const hero = makeVideo(), belowFold = makeVideo();
const root = { querySelectorAll: () => [hero, belowFold] };
const controller = initializeCaseStudyVideos(root);
const observer = observers[0];
assert.equal(initializeCaseStudyVideos(root), controller, 'Component scripts share one controller per root');
assert.equal(observers.length, 1);
assert.equal(hero.loads + belowFold.loads, 0, 'Initialization must not request video bytes');
observer.enter(belowFold, false);
assert.equal(belowFold.source.src, undefined, 'Offscreen videos keep only their poster');
observer.enter(hero);
assert.equal(hero.source.src, '/clip.mp4');
assert.equal(hero.loads, 1);
assert.equal(hero.plays, 1);
assert.equal(hero.muted, true);
observer.enter(hero, false);
assert.equal(hero.plays, 1);
assert.ok(hero.pauses > 0);
observer.enter(hero);
assert.equal(hero.loads, 1, 'Re-entering reuses the loaded media');

document.hidden = true;
document.emit('visibilitychange');
const plays = hero.plays;
observer.enter(belowFold);
assert.equal(belowFold.loads, 0, 'A hidden page does not start new downloads');
document.hidden = false;
controller.setPaused(true);
document.emit('visibilitychange');
assert.equal(hero.plays, plays, 'An open menu or case suspends the homepage video');
reduced.matches = true;
controller.setPaused(false);
reduced.emit('change');
assert.equal(belowFold.loads, 0, 'Reduced motion leaves unloaded videos on their poster');
reduced.matches = false;
reduced.emit('change');
assert.equal(belowFold.loads, 1, 'Visible media starts when motion is enabled again');

// The same buffered video travels from its card into the case and back.
controller.setPaused(true);
hero.readyState = 4;
hero.currentTime = 12.25;
const detail = makeVideo();
const caseRoot = { querySelectorAll: () => [hero, detail] };
const caseController = initializeCaseStudyVideos(caseRoot);
const caseObserver = observers.at(-1);
caseController.refresh();
const borrowedPauses = hero.pauses;
const borrowedPlays = hero.plays;
controller.setPaused(true);
observer.enter(hero, false);
assert.equal(hero.pauses, borrowedPauses, 'The paused homepage cannot pause a borrowed hero');
assert.equal(hero.loads, 1, 'Borrowing reuses the already loaded source');
assert.equal(hero.currentTime, 12.25, 'Borrowing preserves the current frame');
assert.ok(borrowedPlays > plays, 'The traveling video resumes through its new owner');
caseObserver.enter(detail);
document.hidden = true;
document.emit('visibilitychange');
assert.ok(hero.pauses > borrowedPauses, 'Borrowed video still pauses when the page is hidden');
document.hidden = false;
document.emit('visibilitychange');
caseController.destroy();
assert.equal(detail.source.src, undefined, 'Closing unloads videos that belong only to the case');
assert.equal(hero.source.src, '/clip.mp4', 'Closing keeps the borrowed hero source for its card');
assert.equal(hero.loads, 1, 'Closing never calls load() on the returning hero');
assert.equal(hero.currentTime, 12.25, 'The returning hero retains its playback position');
const returnedPauses = hero.pauses;
caseObserver.enter(hero, false);
assert.equal(hero.pauses, returnedPauses, 'A stale case observer cannot pause the returned hero');
observer.enter(hero);
controller.setPaused(false);
assert.ok(hero.plays > borrowedPlays, 'The homepage regains control when the case closes');

controller.destroy();
assert.equal(observer.disconnected, true);
assert.equal(reduced.listeners.size + document.listeners.size, 0);
assert.equal(hero.source.src, undefined);
assert.equal(belowFold.source.src, undefined);
assert.equal(hero.loads, 2, 'Closing a case cancels its pending media request');
observer.enter(hero);
assert.equal(hero.source.src, undefined, 'A queued observer callback cannot restart a destroyed video');
assert.notEqual(initializeCaseStudyVideos(root), controller, 'Reopening a case gets a fresh controller');
console.log('PASS: videos request bytes only in view, reuse media, respect visibility and reduced motion, and cancel transfers on close.');

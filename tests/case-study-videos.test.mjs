import assert from 'node:assert/strict';
import { initializeCaseStudyVideos } from '../src/scripts/case-study-videos.ts';

class Events {
  listeners = new Map();
  addEventListener(name, fn) { this.listeners.set(name, fn); }
  removeEventListener(name, fn) { if (this.listeners.get(name) === fn) this.listeners.delete(name); }
  emit(name) { this.listeners.get(name)?.(); }
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

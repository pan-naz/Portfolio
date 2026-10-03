import assert from 'node:assert/strict';
import { initializeWorkFilter } from '../src/scripts/work-filter.ts';

// Exercise the real filter controller with a controllable animation clock.
class FakeElement extends EventTarget {
  constructor(classes = []) {
    super(); this.dataset = {}; this.hidden = false; this.inert = false; this.attrs = new Map(); this.children = [];
    this.style = { removeProperty(name) { delete this[name]; }, setProperty(name, value) { this[name] = value; } };
    const set = new Set(classes);
    this.classList = { contains: name => set.has(name), add: name => set.add(name), remove: name => set.delete(name) };
    this.clientWidth = 1200; this.height = 400; this.animation = null;
  }
  setAttribute(name, value) { this.attrs.set(name, value); }
  removeAttribute(name) { this.attrs.delete(name); }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  querySelectorAll(selector) { return this.selectors?.[selector] ?? []; }
  querySelector(selector) { return this.querySelectorAll(selector)[0]; }
  get offsetHeight() { return parseFloat(this.animation?.sample.height ?? this.style.height) || this.height; }
  getBoundingClientRect() { return { top: 100, height: this.offsetHeight, width: this.clientWidth }; }
  animate(frames, timing) {
    let resolve, reject;
    const animation = {
      frames, timing, sample: frames[0],
      finished: new Promise((yes, no) => { resolve = yes; reject = no; }),
      cancel: () => { if (this.animation === animation) this.animation = null; reject(new Error('cancelled')); },
      finish: () => resolve(),
    };
    this.animation = animation;
    created.push(animation);
    return animation;
  }
}
const created = [];
const section = new FakeElement(), list = new FakeElement(), root = new FakeElement(), status = new FakeElement();
const heading = new FakeElement(), eyebrow = new FakeElement(), description = new FakeElement();
const headingLayout = new FakeElement(), rail = new FakeElement(), surface = new FakeElement();
Object.defineProperty(headingLayout, 'height', { get: () =>
  heading.textContent === 'Some of my work on the web.' ? 140 : heading.textContent === 'A little room to experiment.' ? 220 : 240,
});
list.getBoundingClientRect = () => ({ top: 100 + headingLayout.offsetHeight + 88, height: list.offsetHeight, width: list.clientWidth });
rail.getBoundingClientRect = () => ({ top: 100 + parseFloat(rail.animation?.sample.top ?? rail.style.top ?? '0'), height: rail.height });
description.getBoundingClientRect = () => ({ top: 100 + headingLayout.height - 50 + (parseFloat(description.animation?.sample.transform?.replace('translateY(', '')) || 0) });
rail.selectors = { '.section-navigation': [root] };
const filters = ['selected', 'websites', 'misc'];
const buttons = filters.map(filter => { const b = new FakeElement(); b.dataset.workFilter = filter; return b; });
const collections = filters.map((filter, i) => {
  const c = new FakeElement(i ? ['project-collection--bento'] : []);
  c.dataset.projectCollection = filter; c.hidden = i !== 0;
  c.children = Array.from({ length: [3, 5, 7][i] }, (_, j) => { const card = new FakeElement(); card.height = 360 + j * 45; return card; });
  c.height = 1200;
  c.selectors = { '.project': c.children };
  return c;
});
root.selectors = { '[data-work-filter]': buttons, '[data-work-filter-status]': [status] };
section.selectors = { '.section-heading': [headingLayout], '[data-work-rail]': [rail], '[data-work-stage-surface]': [surface], '#work-title': [heading], '.section-index .eyebrow': [eyebrow], '.section-description': [description], '#project-list': [list], '.section-navigation': [root], '.project-caption': [] };
list.selectors = { '[data-project-collection]': collections };
const small = new EventTarget(), reduced = new EventTarget(); small.matches = false; reduced.matches = false;
const frames = new Map(); let frameId = 0; let refreshes = 0;
globalThis.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
globalThis.cancelAnimationFrame = id => frames.delete(id);
globalThis.matchMedia = query => query.includes('reduced-motion') ? reduced : small;
globalThis.window = new EventTarget(); window.innerHeight = 900; window.scrollY = 0;
globalThis.document = { querySelector: selector => selector === '#work' ? section : null, fonts: { ready: Promise.resolve() } };
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
const tokens = { '--ease-entrance': 'ease-out', '--ease-filter-enter': 'cubic-bezier(.25, .46, .45, 1)', '--scale-filter': '.9', '--scale-filter-exit': '.97', '--distance-filter-enter': '24px', '--duration-filter-layout': '.42s', '--duration-filter-exit': '140ms', '--duration-filter-enter': '.2s', '--delay-filter-enter': '.14s' };
globalThis.getComputedStyle = element => ({
  gap: '24px',
  opacity: element.animation?.sample.opacity ?? element.style.opacity ?? '1',
  transform: element.animation?.sample.transform ?? element.style.transform ?? 'none',
  getPropertyValue: key => tokens[key] ?? '',
});
const controller = initializeWorkFilter(() => refreshes++);
const flush = async () => { await Promise.resolve(); for (const [id, fn] of frames) { frames.delete(id); fn(); } await new Promise(resolve => setImmediate(resolve)); };
await flush();
controller.select('websites');
assert.equal(list.dataset.activeFilter, 'websites');
assert.equal(eyebrow.textContent, '01 / Websites');
assert.equal(heading.textContent, 'Some of my work on the web.');
assert.equal(heading.getAttribute('aria-label'), heading.textContent, 'Visible and accessible category titles agree');
assert.equal(description.textContent, 'Websites, landing pages and the small details that make them feel complete.');
assert.equal(status.textContent, '5 projects shown');
assert.equal(buttons[1].getAttribute('aria-pressed'), 'true');
assert.equal(collections[0].inert, true, 'Outgoing results cannot receive keyboard focus');
assert.equal(collections[0].getAttribute('aria-hidden'), 'true', 'Outgoing results are excluded from assistive technology');
assert.equal(collections[1].hidden, false);
assert.equal(list.getAttribute('aria-busy'), 'true');
assert.deepEqual(headingLayout.animation.frames, [{ height: '240px' }, { height: '140px' }], 'Shorter copy animates from the old heading height, measured before replacing text');
assert.deepEqual(rail.animation.frames, [{ top: '328px' }, { top: '228px' }]);
assert.deepEqual(rail.animation.timing, headingLayout.animation.timing, 'Rail and card origin move with identical timing');
assert.equal(headingLayout.animation.timing.duration, 420);
assert.equal(list.getBoundingClientRect().top - surface.getBoundingClientRect().top, rail.getBoundingClientRect().top - surface.getBoundingClientRect().top, 'No first-frame menu/card jump');
assert.equal(description.animation.frames[0].transform, 'translateY(100px)', 'Subtitle starts at its previous visual position');
const enters = collections[1].children.map(card => card.animation);
assert.ok(enters.every(a => a.frames[0].opacity === 0 && a.frames[0].transform === 'translateY(24px) scale(0.9)' && a.frames[1].opacity === 1));
assert.ok(enters.every(a => a.frames[1].transform === 'translateY(0px) scale(1)' && a.timing.duration === 200));
assert.deepEqual(enters.map(a => a.timing.delay), [140, 240, 340, 440, 540], 'Each card starts halfway through the prior card, after the quick exit');
assert.ok(enters.every(a => a.timing.fill === 'both'), 'Later cards remain hidden throughout their delay');
const first = collections[1].children[0];
first.animation.sample = { opacity: '.43', transform: 'matrix(0.985, 0, 0, 0.985, 0, 0)' };
headingLayout.animation.sample = { height: '185px' };
rail.animation.sample = { top: '273px' };
description.animation.sample = { transform: 'translateY(45px)' };
controller.select('misc');
assert.deepEqual(headingLayout.animation.frames, [{ height: '185px' }, { height: '220px' }], 'A longer title resumes from the interrupted rendered height');
assert.deepEqual(rail.animation.frames, [{ top: '273px' }, { top: '308px' }], 'Interrupted rail travel stays synchronized');
assert.equal(description.animation.frames[0].transform, 'translateY(-35px)');
assert.deepEqual(collections[2].children.map(card => card.animation.timing.delay), [140, 240, 340, 440, 540, 640, 740], 'The seventh card retains its own halfway handoff');
assert.deepEqual(first.animation.frames[0], { opacity: '.43', transform: 'matrix(0.985, 0, 0, 0.985, 0, 0)' }, 'Interrupted cards continue from the actual current visual state');
controller.select('selected');
assert.equal(eyebrow.textContent, '01 / Selected work');
assert.equal(heading.textContent, 'Projects worth a closer look.');
controller.select('websites');
for (const animation of created) animation.finish();
await flush();
assert.equal(list.dataset.activeFilter, 'websites', 'The last click wins over stale animation completion');
assert.deepEqual(collections.map(c => c.hidden), [true, false, true]);
assert.equal(list.getAttribute('aria-busy'), null);
assert.equal(list.style.height, undefined, 'The wrapper releases its animated height when finished');
assert.equal(headingLayout.style.height, undefined, 'Heading returns to intrinsic sizing after the transition');
assert.equal(rail.style.top, '228px', 'Settling retains the same final rail boundary');
assert.ok(collections[1].children.every(c => c.style.opacity === '1' && c.style.transform === 'none'));
const originalPositions = collections[1].children.map(c => c.style.left);
assert.equal(new Set(originalPositions).size, 2);
small.matches = true; small.dispatchEvent(new Event('change')); await flush();
assert.ok(collections[1].children.every(c => c.style.left === '0px'), 'Mobile reflows into a single column');
reduced.matches = true;
const countBeforeReduced = created.length;
controller.select('misc');
assert.equal(created.length, countBeforeReduced, 'Reduced motion does not create scale or height animations');
assert.deepEqual(collections.map(c => c.hidden), [true, true, false]);
assert.equal(status.textContent, '7 projects shown');
assert.equal(eyebrow.textContent, '01 / Misc');
assert.equal(heading.textContent, 'A little room to experiment.');
assert.equal(heading.getAttribute('aria-label'), heading.textContent);
assert.equal(headingLayout.style.height, undefined);
assert.equal(rail.style.top, '308px', 'Reduced motion aligns immediately to the new natural heading');
const refreshBeforeRepeat = refreshes;
controller.select('misc');
assert.equal(refreshes, refreshBeforeRepeat, 'Clicking the current filter is a no-op');
controller.destroy();
assert.equal(frames.size, 0);
console.log('PASS: real filter controller, interruptible scale/opacity, last-click wins, accessible outgoing state, mobile reflow, reduced motion and cleanup.');

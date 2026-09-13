import assert from 'node:assert/strict';
import { initializeHeroTyping } from '../src/scripts/hero-typing.ts';

const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
let now = 0, nextId = 0;
const timers = new Map();
globalThis.setTimeout = (callback, delay) => {
  const id = ++nextId;
  timers.set(id, { callback, at: now + delay });
  return id;
};
globalThis.clearTimeout = id => timers.delete(id);
const permanent = { textContent: 'Product Designer.' };
const cycling = { textContent: 'UX designer' };
const classes = new Set();
const heading = {
  querySelector: selector => selector === '[data-permanent]' ? permanent : cycling,
  classList: { toggle(name, value) { value ? classes.add(name) : classes.delete(name); }, remove(name) { classes.delete(name); } },
};
let onPreference;
const reduced = { matches: false, addEventListener: (_, handler) => { onPreference = handler; } };
globalThis.document = { querySelector: () => heading };
globalThis.matchMedia = () => reduced;
function advance(ms, inspect = () => {}) {
  const end = now + ms;
  for (;;) {
    const pending = [...timers].sort((a,b) => a[1].at - b[1].at)[0];
    if (!pending || pending[1].at > end) break;
    now = pending[1].at;
    timers.delete(pending[0]);
    pending[1].callback();
    inspect();
  }
  now = end;
}
try {
  const typing = initializeHeroTyping();
  assert.equal(permanent.textContent, '');
  assert.equal(cycling.textContent, '');
  advance(1550);
  assert.equal(permanent.textContent, 'Product Designer.');
  assert.equal(cycling.textContent, '', 'Second line waits for the permanent line');
  const completed = [];
  advance(18000, () => {
    assert.equal(permanent.textContent, 'Product Designer.', 'Permanent headline must never be deleted');
    if (['UX designer','Web designer','App designer'].includes(cycling.textContent) && completed.at(-1) !== cycling.textContent) completed.push(cycling.textContent);
  });
  assert.deepEqual(completed.slice(0,4), ['UX designer','Web designer','App designer','UX designer']);
  typing.setPaused(true);
  const pausedText = cycling.textContent;
  advance(60000);
  assert.equal(cycling.textContent, pausedText);
  assert.equal(timers.size, 0, 'Paused typing must not keep waking a timer');
  typing.setPaused(false);
  assert.equal(timers.size, 1);
  reduced.matches = true;
  onPreference();
  assert.equal(permanent.textContent, 'Product Designer.');
  assert.equal(cycling.textContent, 'UX designer');
  assert.equal(timers.size, 0);
  reduced.matches = false;
  onPreference();
  assert.equal(timers.size, 1, 'Preference changes must not create duplicate loops');
  console.log('PASS: intro order, permanent first line, role cycle, idle pause and reduced-motion fallback.');
} finally {
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
}

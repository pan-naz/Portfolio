import assert from 'node:assert/strict';
import { initializeWorkFilterDock } from '../src/scripts/work-filter/work-filter-dock.ts';
let width = 390, anchorTop = 300, bottom = 3000, reads = 0, nextFrame = 0, observers = 0;
const frames = new Map(), classes = new Set();
const nav = {
  dataset: {}, style: { maxWidth: '' },
  classList: { contains: name => classes.has(name), add: name => classes.add(name), remove: name => classes.delete(name), toggle(name, active) { if (active) classes.add(name); else classes.delete(name); } },
  removeAttribute: () => { delete nav.dataset.themeFit; },
  getBoundingClientRect() { reads++; return { width: width <= 380 ? 319.84375 : 344.40625 }; },
};
const wrapper = { querySelector: () => nav };
const section = { querySelector: selector => selector === '[data-work-filter-anchor]' ? { getBoundingClientRect: () => ({ top: anchorTop }) } : wrapper, getBoundingClientRect: () => ({ bottom }) };
globalThis.window = Object.assign(new EventTarget(), { get innerWidth() { return width; } });
// Object.assign snapshots accessors; keep the simulated viewport live.
Object.defineProperty(window, 'innerWidth', { get: () => width });
const root = { dataset: {} };
globalThis.document = { documentElement: root, querySelector: () => section, fonts: { ready: Promise.resolve() } };
globalThis.getComputedStyle = () => ({ getPropertyValue: name => name === '--header-inset' ? '24px' : '16px' });
globalThis.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame; };
globalThis.cancelAnimationFrame = id => frames.delete(id);
globalThis.ResizeObserver = class { observe() { observers++; } disconnect() { observers--; } };
const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); };
const dock = initializeWorkFilterDock(); await Promise.resolve();
assert.equal(classes.has('is-filter-docked'), false, 'Normal bar stays in its place before reaching the inset');
for (width of [320, 351, 352, 360, 390, 820]) {
  window.dispatchEvent(new Event('resize'));
  assert.equal(nav.dataset.themeFit, String(width >= 352), 'Fit uses the real pill width and shared margins');
}
anchorTop = 12; window.dispatchEvent(new Event('scroll')); flush();
assert.ok(classes.has('is-filter-docked'));
bottom = 0; window.dispatchEvent(new Event('scroll')); flush();
assert.ok(!classes.has('is-filter-docked'), 'The pill does not remain after Work');
bottom = 1000; window.dispatchEvent(new Event('scroll')); flush();
assert.ok(classes.has('is-filter-docked'), 'Returning into Work restores the same bar');
anchorTop = 13; window.dispatchEvent(new Event('scroll')); flush();
assert.ok(!classes.has('is-filter-docked'), 'Scrolling above the threshold undocks');
root.dataset.workStageLayout = 'true'; window.dispatchEvent(new Event('workstagelayoutchange'));
const desktopReads = reads;
for (let i = 0; i < 100; i++) window.dispatchEvent(new Event('scroll'));
assert.equal(frames.size, 0); assert.equal(reads, desktopReads, 'Floating desktop does no compact-pill work');
delete root.dataset.workStageLayout; anchorTop = -100;
window.dispatchEvent(new Event('workstagelayoutchange')); assert.ok(classes.has('is-filter-docked'));
window.dispatchEvent(new Event('scroll')); assert.equal(frames.size, 1);
window.dispatchEvent(new Event('resize')); assert.equal(frames.size, 0, 'A resize cancels an already scheduled measurement');
window.dispatchEvent(new Event('scroll')); dock.destroy();
assert.equal(frames.size, 0); assert.equal(observers, 0); assert.ok(!classes.has('is-filter-docked'));
window.dispatchEvent(new Event('scroll')); assert.equal(frames.size, 0, 'Cleanup removes listeners and pending work');
console.log('PASS: exact fit threshold, dock/return/leave, shared desktop flag, idle desktop and complete cleanup');

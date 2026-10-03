import assert from 'node:assert/strict';
import { watchViewportPointer, refreshViewportPointer } from '../src/scripts/viewport-pointer.ts';
const handlers = () => ({ listeners: new Map(), addEventListener(name, fn) { this.listeners.set(name, fn); }, removeEventListener(name) { this.listeners.delete(name); } });
globalThis.window = { ...handlers(), innerWidth: 1200, innerHeight: 800 };
let target = { name: 'first card' }, top = 300;
globalThis.document = { ...handlers(), documentElement: handlers(), hidden: false, elementFromPoint(x, y) { assert.equal(x, 500); assert.equal(y, 400); return target; } };
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
const frames = new Map(); let id = 0;
globalThis.requestAnimationFrame = fn => { frames.set(++id, fn); return id; };
globalThis.cancelAnimationFrame = id => frames.delete(id);
const flush = () => { const jobs = [...frames.values()]; frames.clear(); jobs.forEach(fn => fn()); };
const seen = [];
const off = watchViewportPointer(p => seen.push({ ...p, localY: p.clientY - top }));
window.listeners.get('pointermove')({ pointerType: 'mouse', clientX: 500, clientY: 400 });
assert.equal(seen.at(-1).localY, 100);
// Animated descendants can produce a burst of boundary events without real
// input. Their hover state is re-hit-tested once, after the layout settles.
const beforeBoundary = seen.length;
for (let i = 0; i < 100; i++) {
  window.listeners.get('pointerover')({ pointerType: 'mouse', clientX: 500, clientY: 400 });
  window.listeners.get('pointerout')();
}
assert.equal(seen.length, beforeBoundary, 'Animated boundary events cannot synchronously restart hover effects');
assert.equal(frames.size, 1, 'A boundary-event burst shares one pending hit test');
target = { name: 'stable button' };
flush();
assert.equal(seen.length, beforeBoundary + 1);
assert.equal(seen.at(-1).target.name, 'stable button');
assert.equal(seen.at(-1).viewportChanged, true, 'A stationary boundary event is layout reprojection, not mouse movement');
assert.equal(frames.size, 0, 'Boundary reprojection stops when nothing else changes');
window.listeners.get('pointerout')();
target = { name: 'first card' };
flush();
assert.equal(seen.at(-1).target.name, 'first card', 'Pointer exit also refreshes the newly uncovered target');
// No mouse movement: page content moves beneath the same screen coordinates.
top = 220;
window.listeners.get('scroll')(); window.listeners.get('scroll')();
assert.equal(frames.size, 1, 'Scroll work is coalesced into one frame');
flush();
assert.equal(seen.at(-1).clientY, 400);
assert.equal(seen.at(-1).localY, 180, 'Rain, pile and tilt receive freshly projected local coordinates');
assert.equal(seen.at(-1).viewportChanged, true);
assert.equal(seen.at(-1).active, true, 'Scroll must not deactivate the stationary pointer');
target = { name: 'second card' };
window.listeners.get('scroll')(); flush();
assert.equal(seen.at(-1).target.name, 'second card', 'Hit testing transfers hover to the card scrolled under the cursor');
target = null;
window.listeners.get('scroll')(); flush();
assert.equal(seen.at(-1).target, null, 'Leaving card bounds clears card-specific hover');
assert.equal(frames.size, 0, 'No perpetual polling loop');
document.documentElement.listeners.get('pointerleave')();
assert.equal(seen.at(-1).active, false);
refreshViewportPointer(); assert.equal(frames.size, 0, 'Scrolling cannot resurrect a cursor outside the browser');
window.listeners.get('pointermove')({ pointerType: 'touch', clientX: 500, clientY: 400 });
assert.equal(seen.at(-1).active, false);
const secondOff = watchViewportPointer(() => {});
off(); assert.ok(window.listeners.has('scroll'), 'Shared listeners survive while another consumer is subscribed');
secondOff(); assert.equal(window.listeners.size, 0); assert.equal(frames.size, 0);
console.log('PASS: stationary pointer reprojection, live hover transfer, frame coalescing, outside/touch guards and shared cleanup.');

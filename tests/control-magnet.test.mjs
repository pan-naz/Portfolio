import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { calculateWorkFilterMagnet, stepSpring } from '../src/scripts/work-filter/work-filter-magnet.ts';

class Events {
  listeners = new Map();
  addEventListener(name, callback, options = {}) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name).add(callback);
    options.signal?.addEventListener('abort', () => this.removeEventListener(name, callback), { once: true });
  }
  removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback); }
  emit(name, event = {}) { this.listeners.get(name)?.forEach(callback => callback(event)); }
  get count() { return [...this.listeners.values()].reduce((sum, callbacks) => sum + callbacks.size, 0); }
}
const subscribers = new Set(), frames = new Map();
let sequence = 0, clock = 0;
const capability = Object.assign(new Events(), { matches: true });
globalThis.window = new Events();
globalThis.document = { createElement: () => ({ style: {}, remove() {} }), documentElement: { append() {} } };
let safe = { left: 0, right: 0, top: 0, bottom: 0 };
globalThis.innerWidth = 1200; globalThis.innerHeight = 800;
globalThis.matchMedia = () => capability;
globalThis.getComputedStyle = () => ({ paddingLeft: `${safe.left}px`, paddingRight: `${safe.right}px`, paddingTop: `${safe.top}px`, paddingBottom: `${safe.bottom}px`, getPropertyValue: name => ({ '--work-filter-magnet-spring-speed': '14', '--work-filter-magnet-inside-spring-speed': '2', '--space-2': '8px' }[name] || '') });
globalThis.requestAnimationFrame = callback => { frames.set(++sequence, callback); return sequence; };
globalThis.cancelAnimationFrame = id => frames.delete(id);
globalThis.magnetTestDependencies = {
  calculateMagnet: calculateWorkFilterMagnet, stepSpring,
  resolveWorkFilterSpringSpeed: (inside, regular, slow) => inside ? slow : regular,
  refreshViewportPointer() {},
  watchViewportPointer(callback) { subscribers.add(callback); return () => subscribers.delete(callback); },
};
let runtime = readFileSync('src/scripts/control-magnet.ts', 'utf8')
  .replace("'./safe-area.ts'", JSON.stringify(new URL('../src/scripts/safe-area.ts', import.meta.url).href))
  .replace(/^import .*work-filter-magnet\.ts';$/m, 'const { calculateMagnet, resolveWorkFilterSpringSpeed, stepSpring } = globalThis.magnetTestDependencies;')
  .replace(/^import .*viewport-pointer\.ts';$/m, 'const { refreshViewportPointer, watchViewportPointer } = globalThis.magnetTestDependencies;');
runtime = ts.transpileModule(runtime, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { initializeControlMagnet } = await import(`data:text/javascript;base64,${Buffer.from(runtime).toString('base64')}`);
const control = Object.assign(new Events(), {
  dataset: {}, style: { removeProperty(name) { delete this[name]; } }, isConnected: true, keyboard: false, pointerFocus: false,
  hasAttribute(name) { return name === 'data-case-pointer-focus' && this.pointerFocus; },
  closest: () => null,
  matches() { return this.keyboard; },
  getBoundingClientRect() {
    const [x, y] = (this.style.translate || '0px 0px').split(' ').map(parseFloat);
    return { left: 578 + x, right: 622 + x, top: 16 + y, bottom: 60 + y };
  },
});
const pointer = (x, y, active = true) => subscribers.forEach(callback => callback({ clientX: x, clientY: y, active }));
const settle = () => {
  for (let i = 0; i < 1200 && frames.size; i++) {
    clock += 1000 / 60;
    const jobs = [...frames.values()]; frames.clear(); jobs.forEach(callback => callback(clock));
  }
  assert.equal(frames.size, 0, 'The spring sleeps when settled');
};
let magnet = initializeControlMagnet(control);
pointer(672, 38); settle();
assert.equal(control.style.translate, '12px 0px', 'The button uses the menu\'s exact 80px proximity falloff');
pointer(704, 38); settle();
assert.equal(control.style.translate, '0px 0px', 'Outside the capture range it returns home');
pointer(610, 38);
assert.equal(control.style.translate, '0px 0px', 'Hover retains the original spring rather than attaching directly to the cursor');
settle();
assert.equal(control.style.translate, '10px 0px', 'A single button targets the pointer without overshooting');
for (let i = 0; i < 20; i++) { pointer(610, 38); settle(); }
assert.equal(control.style.translate, '10px 0px', 'Reprojected hover bounds cannot accumulate drift');
pointer(600, 0); settle();
assert.equal(control.getBoundingClientRect().top, 8, 'The target stays inside the viewport at the upper edge');
control.keyboard = true; control.emit('focusin');
assert.equal(control.style.translate, undefined, 'Keyboard focus immediately resets the pointer offset');
pointer(672, 38); assert.equal(frames.size, 0);
control.pointerFocus = true;
pointer(672, 38); settle();
assert.equal(control.style.translate, '12px 0px', 'Safari autofocus marked as pointer-owned still attracts with the original falloff');
control.emit('focusin');
assert.equal(control.style.translate, '12px 0px', 'Pointer-owned native focus-visible cannot reset the spring on focusin');
control.pointerFocus = false;
pointer(672, 38, false);
assert.equal(control.style.translate, undefined, 'Switching to keyboard removes the marker and parks the control immediately');
pointer(672, 38); assert.equal(frames.size, 0, 'Genuine keyboard focus continues to block the magnet');
control.keyboard = false;
pointer(672, 38); settle();
capability.matches = false; capability.emit('change');
assert.equal(control.style.translate, undefined, 'Touch, mobile and reduced-motion modes stay static');
pointer(672, 38); assert.equal(frames.size, 0);
capability.matches = true;
magnet.destroy();
for (let cycle = 0; cycle < 5; cycle++) {
  magnet = initializeControlMagnet(control); pointer(672, 38);
  assert.equal(subscribers.size, 1); assert.equal(frames.size, 1);
  magnet.destroy();
  assert.equal(subscribers.size + frames.size + capability.count + window.count + control.count, 0, 'Repeated case closing cleans up every watcher, listener and frame');
  assert.equal(control.style.translate, undefined);
  assert.equal(control.dataset.magnetReady, undefined);
}
console.log('PASS: shared menu proximity and original floating spring, stable bounds, viewport limits, keyboard/mobile guards and repeated close cleanup.');

// Execute the actual renderer with a recording canvas and deterministic RAF.
// This covers real particle lifetimes, repulsion, catch-up and symbol leases.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';
import { createAccentPalette, accentBlendSteps } from '../src/scripts/waterfall-color.ts';

const modules = new Map();
function compile(path) {
  if (modules.has(path)) return modules.get(path);
  let source = readFileSync(path, 'utf8');
  source = source.replace(/from '(\.\/[^']+)'/g, (_, specifier) => `from '${compile(resolve(dirname(path), specifier + '.ts'))}'`);
  source = source.replaceAll('import.meta.env.DEV', 'true').replaceAll('import.meta.hot', 'undefined');
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  const url = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
  modules.set(path, url);
  return url;
}

let frameSymbols = new Set();
let peak = 0;
let colorSeen = false;
let verifyGroupColor = false;
let verifiedGroupIcons = 0;
let drawX = 0, drawY = 0;
const shades = createAccentPalette('#111111', '#171716', '#FAF8F7');
const grayColors = new Set(shades.filter((_, index) => index % (accentBlendSteps + 1) === 0));
const accentColors = new Set(shades.filter((_, index) => index % (accentBlendSteps + 1) === accentBlendSteps));
const context = {
  setTransform(a, _b, _c, d, e, f) { drawX = e / a - 160 + 5; drawY = f / d + 5; },
  clearRect() { frameSymbols.clear(); },
  stroke(path) {
    assert.equal(this.globalAlpha, 1, 'Every icon is drawn at full opacity, including overlapping icons');
    if (verifyGroupColor && (drawX - 400) ** 2 + (drawY - 400) ** 2 < 220 ** 2) {
      assert.ok(accentColors.has(this.strokeStyle), 'Every symbol inside the settled region uses solid primary-ink shades');
      verifiedGroupIcons++;
    }
    if (!grayColors.has(this.strokeStyle)) colorSeen = true;
    assert.ok(!frameSymbols.has(path), 'Duplicate symbol in a rendered frame');
    frameSymbols.add(path);
  },
};
globalThis.Path2D = class { addPath() {} arc() {} roundRect() {} };
globalThis.DOMMatrix = class { scale() { return this; } };
globalThis.devicePixelRatio = 1.5;
globalThis.getComputedStyle = () => ({ getPropertyValue: name => ({ '--text-primary':'#171716', '--canvas':'#FAF8F7', '--waterfall-ink':'#111111' })[name] });
const events = new Map();
const handlers = {
  addEventListener(name, fn) { events.set(name, fn); },
  removeEventListener(name) { events.delete(name); },
};
globalThis.window = { ...handlers, innerWidth: 1000, innerHeight: 900 };
globalThis.matchMedia = query => ({ matches: query.includes('pointer: fine'), ...handlers });
const canvas = { getContext: () => context };
let fieldTop = 0;
const field = {
  dataset: {}, clientWidth: 800, style: { setProperty() {} },
  querySelector: () => canvas,
  getBoundingClientRect: () => ({ left: 0, top: fieldTop }),
};
const elements = {
  '[data-waterfall]': field, '.hero': { offsetHeight: 728 },
  '#page-content': { style: { setProperty() {} } }, '.site-header': { offsetHeight: 72 },
};
globalThis.document = { readyState: 'complete', hidden: false, elementFromPoint: () => null, ...handlers,
  documentElement: handlers, querySelector: selector => elements[selector] };
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; }
  observe() { this.callback([{ isIntersecting: true }]); }
  disconnect() {}
};
let nextFrame;
globalThis.requestAnimationFrame = callback => { nextFrame = callback; return 1; };
globalThis.cancelAnimationFrame = () => { nextFrame = undefined; };
const { initializeWaterfall } = await import(compile(resolve('src/scripts/waterfall.ts')));
let startupCallback;
let startupDelay;
globalThis.setTimeout = (callback, delay) => { startupCallback = callback; startupDelay = delay; return 1; };
globalThis.clearTimeout = () => { startupCallback = undefined; };
const animation = initializeWaterfall();
assert.ok(animation);
assert.equal(nextFrame, undefined, 'No animation frames during the independent startup delay');
assert.equal(field.dataset.motion, 'waiting');
assert.equal(frameSymbols.size, 0, 'Canvas remains blank during startup delay');
assert.equal(startupDelay, 2000);
const firstTimer = startupCallback;
events.get('load')();
assert.equal(startupCallback, firstTimer, 'Repeated load cannot restart the delay');
startupCallback();
startupCallback = undefined;
for (let frame = 0; frame < 60 * 180; frame++) {
  const second = frame / 60;
  // Long dwell, moving cursor, overscan edges, then full exit and recovery.
  const point = second < 30 ? [-1000, -1000]
    : second < 80 ? [400, 400]
    : second < 130 ? [400 + Math.sin(second) * 440, 400 + Math.cos(second * .6) * 240]
    : second < 155 ? [20, 650] : [-1000, -1000];
  events.get('pointermove')({ pointerType: 'mouse', clientX: point[0], clientY: point[1] });
  assert.ok(nextFrame);
  verifyGroupColor = second > 34 && second < 80;
  nextFrame((frame + 1) * 1000 / 60);
  peak = Math.max(peak, frameSymbols.size);
  assert.equal(field.dataset.duplicateIcons ?? '0', '0');
  assert.equal(field.dataset.unassignedIcons ?? '0', '0', 'Pool must not omit visible icons');
  assert.equal(Number(field.dataset.uniqueIcons ?? 0), Number(field.dataset.drawnIcons ?? 0));
  if (second < 30 || second > 170) assert.equal(Number(field.dataset.accentedIcons ?? 0), 0, 'No residual tint before hover or after recovery');
}
assert.ok(colorSeen, 'Real rendered icons acquire the accent during pointer interaction');
assert.ok(verifiedGroupIcons > 1000, 'Group color verified across many glyph replacements');
assert.ok(peak > 600);
assert.ok(peak < 1044);
events.get('pointermove')({ pointerType: 'mouse', clientX: 400, clientY: 400 });
fieldTop = -120;
events.get('scroll')(); nextFrame(181000);
assert.equal(field.dataset.pointerY, '520.00', 'Rain repulsion reprojects after scrolling without a new mousemove');
assert.equal(field.dataset.pointerX, '400.00');
animation.setPaused(true);
assert.equal(nextFrame, undefined);
animation.destroy();
document.readyState = 'loading';
const pending = initializeWaterfall();
assert.equal(nextFrame, undefined);
assert.equal(startupCallback, undefined, 'Delay waits for page load');
events.get('load')();
assert.equal(startupDelay, 2000);
pending.setSuspended(true);
startupCallback();
startupCallback = undefined;
assert.equal(nextFrame, undefined, 'Startup delay respects an open menu');
pending.setSuspended(false);
assert.ok(nextFrame, 'Rain resumes after menu dismissal');
pending.destroy();
const cancelled = initializeWaterfall();
events.get('load')();
const lateCallback = startupCallback;
cancelled.destroy();
assert.equal(startupCallback, undefined, 'Pending startup timer is cancelled on cleanup');
lateCallback();
assert.equal(nextFrame, undefined, 'Late timer cannot restart a disposed renderer');
console.log(`PASS: 10,800 real-renderer frames; no simultaneous repeats or exhausted pool; peak ${peak} visible icons, including hover and catch-up.`);
console.log('PASS: independent two-second page-load delay, blank canvas, no early RAF, suspension and timer cleanup.');

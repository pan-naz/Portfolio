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
let vectorStrokes = 0, spriteDraws = 0;
const useGPU = process.env.RAIN_GPU === '1';
let textureUploads = 0, instanceDraws = 0, instanceData;
const atlasPaths = [];
const gl = new Proxy({
  getShaderParameter: () => true, getProgramParameter: () => true,
  createShader: () => ({}), createProgram: () => ({}), createTexture: () => ({}),
  createBuffer: () => ({}), createVertexArray: () => ({}), getUniformLocation: () => ({}),
  texImage2D() { textureUploads++; },
  clear() { frameSymbols.clear(); },
  bufferSubData(_target, _offset, data, _start, length) { instanceData = data.slice(0, length); },
  drawArraysInstanced(_mode, _start, vertices, count) {
    instanceDraws++;
    assert.equal(vertices, 6);
    assert.equal(instanceData.length, count * 7);
    context.globalAlpha = 1;
    for (let i = 0; i < count; i++) {
      const at = i * 7;
      drawX = instanceData[at] + 2 - 160 + 5;
      drawY = instanceData[at + 1] + 2 + 5;
      const icon = instanceData[at + 2] + instanceData[at + 3] * 64;
      context.strokeStyle = `rgb(${[4,5,6].map(c => Math.round(instanceData[at + c] * 255)).join(',')})`;
      spriteDraws++;
      context.stroke(atlasPaths[icon]);
    }
  },
}, { get: (obj, key) => obj[key] ?? (() => {}) });
const shades = createAccentPalette('#111111', '#171716', '#FAF8F7');
const grayColors = new Set(shades.filter((_, index) => index % (accentBlendSteps + 1) === 0));
const accentColors = new Set(shades.filter((_, index) => index % (accentBlendSteps + 1) === accentBlendSteps));
const context = {
  setTransform(a, _b, _c, d, e, f) { drawX = e / a - 160 + 5; drawY = f / d + 5; },
  clearRect() { frameSymbols.clear(); },
  drawImage(atlas, sx, sy, _sw, _sh, x, y) {
    const cached = atlas.tiles.get(`${sx}:${sy}`);
    assert.ok(cached, 'Every draw uses an initialized atlas tile');
    drawX = x + 2 - 160 + 5;
    drawY = y + 2 + 5;
    this.strokeStyle = cached.color;
    spriteDraws++;
    this.stroke(cached.path);
  },
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
  addEventListener(name, fn) {
    if (!events.has(name)) events.set(name, new Set());
    events.get(name).add(fn);
  },
  removeEventListener(name, fn) { events.get(name)?.delete(fn); },
};
const fire = (name, event) => { for (const handler of events.get(name) ?? []) handler(event); };
globalThis.window = { ...handlers, innerWidth: 1000, innerHeight: 900 };
globalThis.matchMedia = query => ({ matches: query.includes('pointer: fine'), ...handlers });
let activeCanvas;
const makeCanvas = (gpu = useGPU) => ({ ...handlers, dataset: {},
  getContext: type => type === '2d' ? context : gpu ? gl : null,
  cloneNode() { return makeCanvas(false); },
  replaceWith(replacement) { activeCanvas = replacement; },
});
const canvas = makeCanvas(); activeCanvas = canvas;
let fieldTop = 0;
const field = {
  parentElement: { style: { setProperty() {} } },
  dataset: {}, clientWidth: 800, style: { setProperty() {} },
  querySelector: () => canvas,
  getBoundingClientRect: () => ({ left: 0, top: fieldTop }),
};
const elements = {
  '[data-waterfall]': field, '.hero': { offsetHeight: 800 },
  '#page-content': { style: { setProperty() {} } }, '.site-header': { offsetHeight: 72 },
};
const makeAtlas = () => {
  const tiles = new Map();
  let tileKey;
  return { tiles, getContext: () => ({
    setTransform() {},
    clearRect(x, y) { tileKey = `${x}:${y}`; tiles.delete(tileKey); },
    stroke(path) { vectorStrokes++; if (useGPU) atlasPaths.push(path); tiles.set(tileKey, { path, color: this.strokeStyle }); },
  }) };
};
globalThis.document = { createElement: makeAtlas, readyState: 'complete', hidden: false, elementFromPoint: () => null, ...handlers,
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
assert.equal(canvas.height, 1200, 'Desktop rain matches the 800px hero at 1.5 DPR');
assert.equal(nextFrame, undefined, 'No animation frames during the independent startup delay');
assert.equal(field.dataset.motion, 'waiting');
assert.equal(frameSymbols.size, 0, 'Canvas remains blank during startup delay');
assert.equal(startupDelay, 2000);
const firstTimer = startupCallback;
fire('load');
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
  fire('pointermove', { pointerType: 'mouse', clientX: point[0], clientY: point[1] });
  assert.ok(nextFrame);
  verifyGroupColor = second > 34 && second < 80;
  nextFrame((frame + 1) * 1000 / 60);
  peak = Math.max(peak, frameSymbols.size);
  assert.equal(field.dataset.duplicateIcons ?? '0', '0');
  assert.equal(field.dataset.unassignedIcons ?? '0', '0', 'Pool must not omit visible icons');
  assert.equal(Number(field.dataset.uniqueIcons ?? 0), Number(field.dataset.drawnIcons ?? 0));
  if (second < 30 || second > 170) assert.equal(Number(field.dataset.accentedIcons ?? 0), 0, 'No residual tint before hover or after recovery');
}
assert.ok(vectorStrokes < spriteDraws * .3, `Cache avoids at least 70% of vector strokes (${vectorStrokes}/${spriteDraws})`);
assert.ok(colorSeen, 'Real rendered icons acquire the accent during pointer interaction');
assert.ok(verifiedGroupIcons > 1000, 'Group color verified across many glyph replacements');
assert.ok(peak > 600);
assert.ok(peak < 1044);
const touch = (identifier, clientX, clientY) => ({ identifier, clientX, clientY });
fire('touchstart', { changedTouches: [touch(7, 400, 400)] });
fire('pointermove', { pointerType: 'touch', clientX: 400, clientY: 400 });
fire('touchmove', { changedTouches: [touch(8, 100, 100)] });
assert.equal(field.dataset.pointerX, '400.00', 'Another finger cannot steal the active repulsion field');
fire('touchmove', { changedTouches: [touch(7, 500, 400)] });
assert.equal(field.dataset.pointerX, '500.00', 'The active finger moves the repulsion field');
fieldTop = -120;
fire('scroll');
assert.equal(field.dataset.pointerY, '520.00', 'An active touch stays under the finger as the page scrolls');
fieldTop = 0;
fire('scroll');
for (let frame = 0; frame < 120; frame++) nextFrame(180000 + (frame + 1) * 1000 / 60);
assert.ok(Number(field.dataset.accentedIcons) > 0, 'A touch drag repels and colors nearby icons');
fire('touchend', { changedTouches: [touch(8, 100, 100)] });
fire('touchmove', { changedTouches: [touch(7, 400, 400)] });
assert.equal(field.dataset.pointerX, '400.00', 'The primary touch survives another finger lifting');
fire('touchend', { changedTouches: [touch(7, 400, 400)] });
for (let frame = 0; frame < 180; frame++) nextFrame(182000 + (frame + 1) * 1000 / 60);
assert.equal(Number(field.dataset.accentedIcons), 0, 'Icons settle after the finger lifts');
fire('pointermove', { pointerType: 'mouse', clientX: 400, clientY: 400 });
fieldTop = -120;
fire('scroll'); nextFrame(185017);
assert.equal(field.dataset.pointerY, '520.00', 'Rain repulsion reprojects after scrolling without a new mousemove');
assert.equal(field.dataset.pointerX, '400.00');
elements['.hero'].offsetHeight = 960;
fire('themechange');
assert.equal(canvas.height, 1440, 'Responsive rain follows taller content on smaller layouts');
if (useGPU) {
  assert.equal(textureUploads, 1, 'No texture uploads during animation, hover, theme or same-DPR resize');
  assert.equal(vectorStrokes, atlasPaths.length, 'Every original glyph is rasterized only once');
  assert.ok(instanceDraws < spriteDraws / 100, 'One draw call replaces hundreds of sprite copies per frame');
}
const runningFrame = nextFrame;
fire('visibilitychange');
assert.equal(nextFrame, runningFrame, 'An unchanged visibility notification does not replace the running frame');
if (useGPU) {
  let prevented = false;
  fire('webglcontextlost', { preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(activeCanvas.dataset.renderer, '2d');
  assert.equal(activeCanvas.height, 1440, 'Fallback retains responsive canvas dimensions');
  nextFrame(185034);
  assert.ok(frameSymbols.size > 0, 'Context loss continues the same particles through the 2D fallback');
  assert.equal(field.dataset.motion, 'running');
}
animation.setPaused(true);
assert.equal(nextFrame, undefined);
animation.destroy();
document.readyState = 'loading';
const pending = initializeWaterfall();
assert.equal(nextFrame, undefined);
assert.equal(startupCallback, undefined, 'Delay waits for page load');
fire('load');
assert.equal(startupDelay, 2000);
pending.setSuspended(true);
startupCallback();
startupCallback = undefined;
assert.equal(nextFrame, undefined, 'Startup delay respects an open menu');
pending.setSuspended(false);
assert.ok(nextFrame, 'Rain resumes after menu dismissal');
pending.destroy();
const cancelled = initializeWaterfall();
fire('load');
const lateCallback = startupCallback;
cancelled.destroy();
assert.equal(startupCallback, undefined, 'Pending startup timer is cancelled on cleanup');
lateCallback();
assert.equal(nextFrame, undefined, 'Late timer cannot restart a disposed renderer');
console.log(`PASS: ${useGPU ? 'GPU batch' : '2D fallback'}: ${((1 - vectorStrokes / spriteDraws) * 100).toFixed(1)}% fewer vector strokes; ${textureUploads} texture uploads, ${instanceDraws} batched draws.`);
console.log(`PASS: 10,800 real-renderer frames; no simultaneous repeats or exhausted pool; peak ${peak} visible icons, including hover and catch-up.`);
console.log('PASS: independent two-second page-load delay, blank canvas, no early RAF, suspension and timer cleanup.');
console.log('PASS: a single touch drag repels the rain, ignores other fingers and settles after release.');
if (useGPU) {
  const { createWaterfallRenderer } = await import(compile(resolve('src/scripts/waterfall-renderer.ts')));
  gl.getShaderParameter = () => false;
  const rejectedCanvas = makeCanvas();
  const fallback = createWaterfallRenderer(rejectedCanvas, [new Path2D()]);
  assert.ok(fallback, 'Shader rejection must leave the existing 2D animation available');
  assert.equal(activeCanvas.dataset.renderer, '2d');
  fallback.resize(800, 800, 1.5, shades);
  fallback.begin(); fallback.draw(0, 0, 100, 100); fallback.end(); fallback.destroy();
  console.log('PASS: GPU context loss and shader failure use 2D fallback without resetting simulation.');
}
if (useGPU) {
  const { createWaterfallRenderer } = await import(compile(resolve('src/scripts/waterfall-renderer.ts')));
  const blocked = makeCanvas();
  blocked.getContext = type => { if (type === 'webgl2') throw new Error('GPU blocked'); return context; };
  const fallback = createWaterfallRenderer(blocked, [new Path2D()]);
  assert.ok(fallback);
  assert.equal(blocked.dataset.renderer, '2d');
  fallback.destroy();
  console.log('PASS: blocked GPU context falls back to 2D.');
}

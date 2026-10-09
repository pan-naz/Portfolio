import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const modules = new Map();
function compile(path) {
  if (modules.has(path)) return modules.get(path);
  let source = readFileSync(path, 'utf8');
  source = source.replaceAll('import.meta.hot', 'undefined');
  source = source.replace("from 'matter-js'", `from '${pathToFileURL(resolve('node_modules/matter-js/build/matter.js')).href}'`);
  source = source.replace(/from '(\.\/[^']+)'/g, (_, specifier) => `from '${compile(resolve(dirname(path), specifier.endsWith('.ts') ? specifier : specifier + '.ts'))}'`);
  source = source.replace(/import\('(\.\/[^']+)'\)/g, (_, specifier) => `import('${compile(resolve(dirname(path), specifier.endsWith('.ts') ? specifier : specifier + '.ts'))}')`);
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  const url = `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`;
  modules.set(path, url);
  return url;
}
const { FooterPile, pileRadius, pileCursorRadius } = await import(compile(resolve('src/scripts/footer-pile-model.ts')));
const { waterfallIconManifest } = await import(compile(resolve('src/scripts/waterfall-icon-data.ts')));
const { footerInterfaceIcons } = await import(compile(resolve('src/scripts/footer-interface-icons.ts')));
assert.ok(footerInterfaceIcons.every(index => waterfallIconManifest[index].group === 'User Interface'));
assert.equal(pileCursorRadius * 2, 100, 'The contact circle is 100px in diameter');
const none = { x: 0, y: 0, active: false };
const idle = new FooterPile(1200, waterfallIconManifest.length);
const original = structuredClone(idle.icons);
for (let i = 0; i < 600; i++) idle.advance(1 / 60, none);
assert.deepEqual(idle.icons, original, 'Random deposition settles before the first paint and stays completely still');
assert.equal(idle.needsPointerStep(-50, -500), false, 'A pointer far above the settled icons does not wake physics');
assert.equal(idle.needsPointerStep(idle.icons[0].x, idle.icons[0].y), true, 'Approaching an icon still starts the brush');
assert.equal(new Set(idle.icons.map(icon => icon.icon)).size, idle.icons.length, 'Initial icons are unique');
assert.deepEqual(new FooterPile(1200, waterfallIconManifest.length).icons, original, 'A seed can be replayed for static previews');
assert.notDeepEqual(new FooterPile(1200, waterfallIconManifest.length, 123).icons.map(i => [i.x, i.y, i.icon]), original.map(i => [i.x, i.y, i.icon]), 'A fresh seed changes the outline, positions and identities');
for (const width of [272, 342, 640, 1200]) {
  for (const seed of [1827, 123, 4234]) {
    const pile = new FooterPile(width, waterfallIconManifest.length, seed);
    const minX = Math.min(...pile.icons.map(i => i.x)), maxX = Math.max(...pile.icons.map(i => i.x));
    assert.ok(minX > 0 && maxX < width, 'The initial pile leaves the divider endpoints clear');
    assert.ok(Math.abs((minX + maxX) / 2 - width / 2) < width * .15, 'Uneven shoulders stay near the center');
    assert.ok(Math.min(...pile.icons.map(i => i.y)) > -110, 'The random skyline clears the contact content');
    assert.ok(!pile.icons.some(i => i.fallen || i.removed), 'No icons fall during initial deposition');
    pile.destroy();
  }
}
const entering = new FooterPile(1200, waterfallIconManifest.length);
const beforeEntry = structuredClone(entering.icons);
const target = { x: entering.icons[80].x, y: entering.icons[80].y, active: true };
entering.advance(1 / 60, target);
for (let i = 0; i < entering.icons.length; i++) {
  const distance = Math.hypot(entering.icons[i].x - beforeEntry[i].x, entering.icons[i].y - beforeEntry[i].y);
  assert.ok(distance < 14, 'Deep cursor entry grows into contact instead of teleporting a full circle');
  if (Math.hypot(beforeEntry[i].x - target.x, beforeEntry[i].y - target.y) > 100) assert.ok(distance < .01, 'There is no long-range repulsion');
}
for (let i = 0; i < 1200; i++) entering.advance(1 / 60, target);
assert.ok(Math.min(...entering.icons.filter(i => !i.fallen).map(i => Math.hypot(i.x - target.x, i.y - target.y))) >= pileCursorRadius - 1, 'Icons vacate the solid cursor area');
assert.ok(entering.sleeping, 'A stationary cursor holds its space without an endless animation loop');

function sweep(fps, from, to, seed = 1827, duration = 3) {
  const pile = new FooterPile(800, waterfallIconManifest.length, seed);
  const before = structuredClone(pile.icons);
  let maxStep = 0;
  for (let frame = 0; frame < fps * duration; frame++) {
    const previous = pile.icons.map(icon => [icon.x, icon.y]);
    pile.advance(1 / fps, { x: from + (to - from) * frame / (fps * duration), y: -10, active: true });
    for (let i = 0; i < pile.icons.length; i++) {
      const icon = pile.icons[i];
      if (!icon.fallen) assert.ok(icon.y <= -pileRadius + .01, 'Cursor cannot squeeze icons down through the divider');
      if (!icon.removed && !icon.fallen) maxStep = Math.max(maxStep, Math.hypot(icon.x - previous[i][0], icon.y - previous[i][1]));
    }
  }
  for (let frame = 0; frame < fps * 20; frame++) pile.advance(1 / fps, none);
  assert.deepEqual(pile.icons.map(icon => icon.icon), before.map(i => i.icon), 'Glyphs never change and icons never respawn');
  assert.ok(pile.icons.filter(icon => icon.removed).length > pile.icons.length * .10, 'One normal sweep clears a meaningful group off the endpoint');
  assert.ok(pile.icons.filter((icon, i) => Math.abs(icon.x - before[i].x) > 50).length > pile.icons.length * .65, 'A sweep displaces most icons by at least 50px rather than barely stirring them');
  assert.ok(maxStep < 35, 'Substeps prevent sudden position jumps during a sweep');
  assert.ok(pile.sleeping, 'Physics stops after settling');
  const settled = structuredClone(pile.icons);
  for (let frame = 0; frame < fps * 2; frame++) pile.advance(1 / fps, none);
  assert.deepEqual(pile.icons, settled, 'Displacement persists without resetting');
  return pile;
}
const right = sweep(60, 80, 890);
const left = sweep(60, 720, -90);
sweep(60, 80, 890, 123);
sweep(60, 80, 890, 4234);
assert.ok(right.icons.some(icon => icon.fallen && icon.x > 800));
assert.ok(left.icons.some(icon => icon.fallen && icon.x < 0));
function fixedPointer(fps) {
  const pile = new FooterPile(500, waterfallIconManifest.length);
  for (let f = 0; f < fps * 2; f++) pile.advance(1 / fps, { x: 310, y: -10, active: true });
  for (let f = 0; f < fps * 12; f++) pile.advance(1 / fps, none);
  return pile.icons;
}
const at60 = fixedPointer(60), at120 = fixedPointer(120);
for (let i = 0; i < at60.length; i++) {
  assert.ok(Math.abs(at60[i].x - at120[i].x) < .1 && Math.abs(at60[i].y - at120[i].y) < .1, '60Hz and 120Hz share the same physics');
}
const removed = right.icons.filter(icon => icon.removed).map(icon => icon.id);
right.resize(400);
for (let f = 0; f < 600; f++) right.advance(1 / 60, none);
assert.ok(removed.every(id => right.icons.find(icon => icon.id === id).removed), 'Resizing does not restore cleared icons');
const gutter = new FooterPile(800, waterfallIconManifest.length, 1827, 240, 240);
for (let frame = 0; frame < 180; frame++) {
  gutter.advance(1 / 60, { x: 80 + (900 - 80) * frame / 180, y: -10, active: true });
}
assert.ok(gutter.icons.some(icon => icon.fallen && icon.x > 800 && !icon.removed),
  'Icons remain drawable after leaving the divider while they cross the viewport gutter');
console.log('PASS: random settled interface piles, solid 100px cursor, strong sweeps, no divider penetration, endpoint spills, continuous motion, persistence and fixed-step physics.');

// Exercise the actual browser lifecycle with deterministic pointer/RAF events.
let clock = 0, nextFrame = 0, paintCount = 0, visible;
const frames = new Map(), windowEvents = new Map(), documentEvents = new Map(), windowOptions = new Map();
const addListener = (events, type, fn) => {
  if (!events.has(type)) events.set(type, new Set());
  events.get(type).add(fn);
};
const removeListener = (events, type, fn) => {
  const listeners = events.get(type);
  listeners?.delete(fn);
  if (!listeners?.size) events.delete(type);
};
const fireWindow = (type, event) => { for (const fn of windowEvents.get(type) ?? []) fn(event); };
const colors = new Set();
const context = { setTransform() {}, clearRect() { paintCount++; }, stroke() { colors.add(this.strokeStyle); } };
const canvas = { style: {}, getContext: () => context };
const footer = { offsetHeight: 101 };
let fieldTop = 600, fieldLeft = 100;
const layerStyles = new Map();
const layer = { style: { setProperty: (name, value) => layerStyles.set(name, value) } };
const darkSection = { getBoundingClientRect: () => ({ bottom: fieldTop - 500 }) };
const contact = {};
let observedVisibilityTarget, near;
const field = { dataset: {}, clientWidth: 800, parentElement: layer, closest: () => footer,
  querySelector: () => canvas, getBoundingClientRect: () => ({ left: fieldLeft, right: fieldLeft + field.clientWidth, top: fieldTop }) };
const reduced = { matches: false, addEventListener() {}, removeEventListener() {} };
const fine = { ...reduced, matches: true };
globalThis.document = { hidden: false, elementFromPoint: () => null,
  querySelector: selector => ({ '[data-footer-pile]': field, '.about-details': darkSection, '#contact': contact })[selector] ?? null,
  documentElement: { hasAttribute: () => false, addEventListener() {}, removeEventListener() {} },
  addEventListener: (type, fn) => addListener(documentEvents, type, fn),
  removeEventListener: (type, fn) => removeListener(documentEvents, type, fn) };
globalThis.window = { innerWidth: 1000, innerHeight: 900,
  addEventListener: (type, fn, options) => { addListener(windowEvents, type, fn); windowOptions.set(type, options); },
  removeEventListener: (type, fn) => removeListener(windowEvents, type, fn) };
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { maxTouchPoints: 0 } });
Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => clock } });
globalThis.matchMedia = query => query.includes('reduced-motion') ? reduced : fine;
globalThis.devicePixelRatio = 1;
globalThis.getComputedStyle = () => ({ getPropertyValue: name => ({ '--footer-icon-ink': '#b8b8b8' }[name]) });
globalThis.requestAnimationFrame = fn => { frames.set(++nextFrame, fn); return nextFrame; };
globalThis.cancelAnimationFrame = id => frames.delete(id);
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
globalThis.IntersectionObserver = class { constructor(fn, options) { if (options?.rootMargin) near = fn; else visible = fn; } observe(target) { observedVisibilityTarget = target; } disconnect() {} };
globalThis.DOMMatrix = class { scale() { return this; } };
globalThis.Path2D = class { addPath() {} arc() {} roundRect() {} };
const { initializeFooterPile } = await import(compile(resolve('src/scripts/footer-pile.ts')));
let testRandom = .42;
const realRandom = Math.random;
Math.random = () => testRandom;
const live = initializeFooterPile();
assert.equal(colors.size, 0, 'Offscreen setup does not construct or draw the physics model');
near([{ isIntersecting: true }]);
for (let i = 0; i < 20 && field.dataset.ready !== 'true'; i++) await new Promise(resolve => setImmediate(resolve));
assert.equal(field.dataset.ready, 'true', 'Approaching the footer initializes the same renderer');
const initialSeed = field.dataset.seed;
assert.equal(windowOptions.get('touchmove')?.passive, true, 'Touch brushing leaves native page scrolling enabled');
assert.ok(windowEvents.has('scroll'), 'Scrolling reprojects the stationary pointer; it does not apply a page-bottom impulse');
assert.equal(canvas.style.left, '-100px', 'The canvas begins at the viewport edge instead of clipping at a fixed gutter');
assert.equal(canvas.style.width, '1000px', 'The canvas remains visible across the complete viewport');
assert.equal(layerStyles.get('--pile-above'), '560px', 'The pile layer reaches past the Contact chapter to the dark section');
assert.equal(canvas.style.top, '-560px', 'The canvas has drawing space above the former 170px cutoff');
assert.equal(canvas.style.height, '661px', 'The canvas still reaches the bottom of the footer');
assert.equal(observedVisibilityTarget, layer, 'The expanded pile stays active while its upper drawing area is visible');
assert.deepEqual([...colors], ['#b8b8b8'], 'Every icon uses exactly the same gray ink');
fireWindow('themechange');
assert.equal(field.dataset.seed, initialSeed, 'Theme changes keep the same random pile');
visible([{ isIntersecting: true }]);
assert.equal(frames.size, 0, 'No animation loop while the pile is initially still');
const move = (x, type = 'mouse') => fireWindow('pointermove', { clientX: x + 100, clientY: 590, pointerType: type });
move(-50);
assert.equal(frames.size, 0, 'Scrolling across empty Contact space does not wake the large footer canvas');
move(700, 'touch');
assert.equal(frames.size, 0, 'A touch pointer event alone does not start the brush');
navigator.maxTouchPoints = 1;
move(700);
assert.equal(frames.size, 0, 'Mouse hover stays inactive on a touch-capable laptop');
navigator.maxTouchPoints = 0;
reduced.matches = true;
move(700);
assert.equal(frames.size, 0, 'Reduced motion does not start physics');
reduced.matches = false;
function runFrame() {
  clock += 1000 / 60;
  const pending = [...frames.values()]; frames.clear();
  pending.forEach(fn => fn(clock));
}
move(700);
fieldTop = 650; fireWindow('scroll'); runFrame();
assert.equal(field.dataset.pointerY, '-60.00', 'The brush follows the stationary viewport cursor as the footer moves');
fieldTop = 600; fireWindow('scroll'); runFrame();
move(400); for (let i = 0; i < 20; i++) runFrame();
assert.equal(field.dataset.disturbed, 'true');
live.setPaused(true);
const pausedPaint = paintCount;
move(700); runFrame();
assert.equal(paintCount, pausedPaint, 'Menu suspension pauses input and drawing');
live.setPaused(false);
for (let i = 0; i < 180; i++) { move(80 + i * 4.5); runFrame(); }
visible([{ isIntersecting: false }]);
assert.equal(frames.size, 0, 'Offscreen work has no RAF');
visible([{ isIntersecting: true }]);
for (let i = 0; i < 1200; i++) runFrame();
assert.ok(Number(field.dataset.spilled) > 0, 'Real pointer events spill icons');
assert.equal(frames.size, 0, 'A settled renderer releases its animation loop');
const survivors = field.dataset.remaining;
fireWindow('themechange');
assert.equal(field.dataset.remaining, survivors, 'Theme changes never refill the shelf');
live.destroy();
assert.equal(frames.size, 0);
assert.ok(!windowEvents.has('pointermove'), 'Cleanup removes input listeners');
testRandom = .64;
field.clientWidth = 342;
fieldLeft = 24;
window.innerWidth = 390;
field.dataset = {};
const reloaded = initializeFooterPile();
near([{ isIntersecting: true }]);
for (let i = 0; i < 20 && field.dataset.ready !== 'true'; i++) await new Promise(resolve => setImmediate(resolve));
assert.notEqual(field.dataset.seed, initialSeed, 'Reload selects a new random arrangement');
visible([{ isIntersecting: true }]);
navigator.maxTouchPoints = 1;
const touch = (identifier, x) => ({ identifier, clientX: x + fieldLeft, clientY: 590 });
reduced.matches = true;
fireWindow('touchstart', { changedTouches: [touch(7, 40)] });
assert.equal(frames.size, 0, 'Reduced motion keeps touch brushing static');
reduced.matches = false;
fireWindow('touchstart', { changedTouches: [touch(7, 40)] });
assert.ok(frames.size > 0, 'A finger starts the same live brush on a touch screen');
fireWindow('touchmove', { changedTouches: [touch(8, 300)] });
assert.equal(field.dataset.pointerX, '40.00', 'Another finger cannot move the active brush');
fieldTop = 650;
fireWindow('scroll');
assert.equal(field.dataset.pointerY, '-60.00', 'The brush stays under the finger while the footer scrolls');
fieldTop = 600;
fireWindow('scroll');
for (let i = 0; i < 180; i++) {
  fireWindow('touchmove', { changedTouches: [touch(7, 40 + i * 2)] });
  runFrame();
}
assert.equal(field.dataset.disturbed, 'true', 'Dragging a finger sweeps the real icon physics');
fireWindow('touchend', { changedTouches: [touch(8, 300)] });
fireWindow('touchmove', { changedTouches: [touch(7, 400)] });
assert.equal(field.dataset.pointerX, '400.00', 'The brush survives another finger lifting');
fireWindow('touchend', { changedTouches: [touch(7, 400)] });
for (let i = 0; i < 1200; i++) runFrame();
assert.ok(Number(field.dataset.spilled) > 0, 'A finger sweep can wipe icons beyond the shelf endpoint');
assert.equal(frames.size, 0, 'The touch-driven pile sleeps after settling');
reloaded.destroy();
assert.ok(!windowEvents.has('touchmove'), 'Cleanup removes touch input listeners');
// Real handlers must be safe before any engine exists, including zero-width/background setup.
field.dataset = {}; field.clientWidth = 0;
const hidden = initializeFooterPile(); document.hidden = true;
assert.doesNotThrow(() => { for (const fn of documentEvents.get('visibilitychange') ?? []) fn(); fireWindow('blur'); near([{ isIntersecting: true }]); hidden.setPaused(true); hidden.setPaused(false); });
assert.equal(field.dataset.ready, undefined); hidden.destroy(); document.hidden = false;
field.clientWidth = 342; field.dataset = {};
const pendingRenderer = initializeFooterPile(); near([{ isIntersecting: true }]); pendingRenderer.destroy();
for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve));
assert.equal(field.dataset.ready, undefined, 'A disposed pending loader never constructs or paints a late engine');

// Idle prefetch must never construct/draw early, and all pending callbacks are disposable.
const idleTasks = new Map(); let nextIdle = 0;
window.requestIdleCallback = fn => { idleTasks.set(++nextIdle, fn); return nextIdle; };
window.cancelIdleCallback = id => idleTasks.delete(id);
field.dataset = {}; document.hidden = false;
const beforeIdlePaint = paintCount;
const idleRenderer = initializeFooterPile();
idleRenderer.prefetchWhenIdle(); idleRenderer.prefetchWhenIdle();
assert.equal(idleTasks.size, 1, 'Repeated prefetch requests schedule only one idle callback');
const [idleId, idleCallback] = [...idleTasks][0]; idleTasks.delete(idleId); idleCallback();
for (let i = 0; i < 10; i++) await new Promise(resolve => setImmediate(resolve));
assert.equal(field.dataset.ready, undefined, 'A prefetched constructor does not initialize an offscreen pile');
assert.equal(paintCount, beforeIdlePaint, 'Idle prefetch draws no offscreen pixels');
fireWindow('themechange');
assert.equal(field.dataset.ready, undefined, 'A resize/theme update after prefetch preserves the proximity gate');
near([{ isIntersecting: true }]);
assert.equal(field.dataset.ready, 'true', 'The cached constructor initializes immediately at the original proximity gate');
idleRenderer.destroy();
field.dataset = {};
const cancelledIdle = initializeFooterPile(); cancelledIdle.prefetchWhenIdle();
assert.equal(idleTasks.size, 1); cancelledIdle.destroy();
assert.equal(idleTasks.size, 0, 'Destroy cancels pending native idle callbacks');
const backgroundIdle = initializeFooterPile(); document.hidden = true; backgroundIdle.prefetchWhenIdle();
assert.equal(idleTasks.size, 0, 'Background documents postpone idle prefetch');
document.hidden = false; for (const fn of documentEvents.get('visibilitychange') ?? []) fn();
assert.equal(idleTasks.size, 1, 'Returning to the foreground resumes the requested prefetch');
backgroundIdle.destroy();
assert.equal(idleTasks.size, 0);
delete window.requestIdleCallback;
const idleTimers = new Map(); let nextTimer = 0;
window.setTimeout = (fn, delay) => { idleTimers.set(++nextTimer, { fn, delay }); return nextTimer; };
window.clearTimeout = id => idleTimers.delete(id);
const fallbackIdle = initializeFooterPile(); fallbackIdle.prefetchWhenIdle();
assert.equal(idleTimers.size, 1); assert.equal([...idleTimers.values()][0].delay, 1000);
fallbackIdle.destroy();
assert.equal(idleTimers.size, 0, 'Destroy cancels the fallback timer in browsers without idle callbacks');
console.log('PASS: idle prefetch retains offscreen construction/drawing gates, deduplicates requests, postpones background work and cleans native/fallback callbacks.');

Math.random = realRandom;
console.log('PASS: actual renderer supports identical mouse and touch brush physics, reduced-motion fallback, menu/offscreen pause, idle shutdown, theme persistence and cleanup.');

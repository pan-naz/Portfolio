import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { trackWorkFilterScroll, calculateWorkFilterMagnet, resolveWorkFilterSpringSpeed, resolveWorkFilterScrollSpeed, stepSpring } from '../src/scripts/work-filter-magnet.ts';
import { readMotionToken } from '../src/scripts/native-motion.ts';

const bounds = { left: 100, right: 280, top: 100, bottom: 256 };
const centerX = (bounds.left + bounds.right) / 2;
const centerY = (bounds.top + bounds.bottom) / 2;
const right = calculateWorkFilterMagnet(bounds.right, centerY, bounds);
const left = calculateWorkFilterMagnet(bounds.left, centerY, bounds);
const top = calculateWorkFilterMagnet(centerX, bounds.top, bounds);
const bottom = calculateWorkFilterMagnet(centerX, bounds.bottom, bounds);
const diagonal = calculateWorkFilterMagnet(bounds.right, bounds.bottom, bounds);

assert.ok(right.x > 0 && Math.abs(right.y) < .001, 'pulls right');
assert.ok(left.x < 0 && Math.abs(left.y) < .001, 'pulls left');
assert.ok(top.y < 0 && Math.abs(top.x) < .001, 'pulls upward');
assert.ok(bottom.y > 0 && Math.abs(bottom.x) < .001, 'pulls downward');
assert.ok(diagonal.x > 0 && diagonal.y > 0, 'pulls diagonally in both axes');
assert.ok(Math.abs(Math.hypot(diagonal.x, diagonal.y) - 32) < .001, 'maximum travel is 32px in any direction');
assert.deepEqual(calculateWorkFilterMagnet(bounds.right + 81, centerY, bounds), { x: 0, y: 0 }, 'rests outside the 80px capture range');
assert.equal(resolveWorkFilterSpringSpeed(false, 14, 2), 14, 'uses the regular spring near the menu');
assert.equal(resolveWorkFilterSpringSpeed(true, 14, 2), 2, 'uses the slower spring while the pointer is inside the menu');
assert.equal(resolveWorkFilterScrollSpeed(16, 80, 10, 20), 10, 'Active scrolling keeps the approved gentle linger');
assert.equal(resolveWorkFilterScrollSpeed(79, 80, 10, 20), 10, 'Brief gaps between scroll events do not accelerate the follower');
assert.equal(resolveWorkFilterScrollSpeed(80, 80, 10, 20), 20, 'The menu switches to its faster return after scrolling stops');

for (const direction of [-1, 1]) {
  for (const hz of [60, 120]) {
    const quick = { value: direction * 16, velocity: direction * -100, target: 0 };
    const former = { ...quick };
    for (let i = 1; i <= hz / 2; i++) {
      const speed = resolveWorkFilterScrollSpeed(i * 1000 / hz, 80, 10, 20);
      const previous = quick.value;
      stepSpring(quick, 1 / hz, speed);
      stepSpring(former, 1 / hz, 10);
      assert.ok(direction * quick.value >= 0 && Math.abs(quick.value) <= Math.abs(previous), 'Faster return stays continuous and approaches alignment without a new kick');
    }
    assert.ok(Math.abs(quick.value) < .05, 'Both ends visually land within half a second after scrolling stops');
    assert.ok(Math.abs(quick.value) < Math.abs(former.value) / 10, 'Return after stopping is materially quicker than the former slow spring');
  }
}

for (const direction of [-1, 1]) {
  for (const hz of [60, 120]) {
    const follow = { value: 0, velocity: 0, target: 0 };
    let targetTop = 300, previousRenderedTop = targetTop;
    for (let i = 0; i < hz; i++) {
      const previousTarget = targetTop;
      targetTop -= direction * 12 / hz;
      trackWorkFilterScroll(follow, previousTarget, targetTop, direction * 12 / hz, 32, 300);
      assert.ok(Math.abs(targetTop + follow.value - previousRenderedTop) < .001, 'A slow scroll retains the last rendered position before easing, at either endpoint');
      stepSpring(follow, 1 / hz, 10);
      const renderedTop = targetTop + follow.value;
      assert.ok(direction * (previousRenderedTop - renderedTop) >= 0, 'Slow scroll follows monotonically instead of kicking in the opposite direction');
      assert.ok(Math.abs(renderedTop - previousRenderedTop) < .3, 'Subpixel scrolling never creates a 32px bounce');
      previousRenderedTop = renderedTop;
    }
    const lag = follow.value;
    assert.ok(Math.abs(lag) > 1 && Math.abs(lag) < 3, 'Slow scrolling produces a small proportional linger');
    for (let i = 0; i < hz * 3; i++) stepSpring(follow, 1 / hz, 10);
    assert.equal(follow.value, 0, 'Both endpoint alignments are exact after the scroll settles');
    assert.equal(follow.velocity, 0);
  }
}
const pinned = { value: 0, velocity: 0, target: 0 };
trackWorkFilterScroll(pinned, 300, 300, 1, 32, 300);
assert.deepEqual(pinned, { value: 0, velocity: 0, target: 0 }, 'A stationary centered menu gets no invented scroll movement');
trackWorkFilterScroll(pinned, 300, 500, 1, 32, 300);
assert.equal(pinned.value, 0, 'A layout move opposite the scroll cannot trigger an impulse');
trackWorkFilterScroll(pinned, 500, 100, 1, 32, 300);
assert.equal(pinned.value, 1, 'Unrelated layout changes are limited to actual scroll travel');
trackWorkFilterScroll(pinned, 100, -300, 400, 32, 300);
assert.equal(pinned.value, 32, 'Fast scrolling cannot leave the menu far from its sticky target');

for (const [previousTop, nextTop, delta] of [[400, 399, 1], [200, 201, -1], [301, 300, 1], [299, 300, -1]]) {
  const leaving = { value: 0, velocity: 0, target: 0 };
  assert.equal(trackWorkFilterScroll(leaving, previousTop, nextTop, delta, 32, 300), false);
  assert.deepEqual(leaving, { value: 0, velocity: 0, target: 0 }, 'Scrolling inward from either edge follows native sticky positioning without a bounce');
}
for (const direction of [-1, 1]) {
  const crossing = { value: 0, velocity: 0, target: 0 };
  trackWorkFilterScroll(crossing, 300 + direction, 300 - direction * 2, direction * 3, 32, 300);
  assert.equal(crossing.value, direction * 2, 'Crossing the sticky boundary lingers only for the outward portion');
  const priorLag = { value: direction * 12, velocity: -direction * 40, target: 0 };
  const before = { ...priorLag };
  trackWorkFilterScroll(priorLag, 300 - direction * 2, 300 - direction, -direction, 32, 300);
  assert.deepEqual(priorLag, before, 'Reversing during an endpoint return does not inject an opposite impulse');
}

console.log('PASS: work-filter motion lingers only outward at the two rail edges; inward and centered scrolling stays native, with exact alignment at 60/120Hz.');

// Multiple wheel events between paints share one resting-position measurement.
const events = new Map(), jobs = new Map();
let nextJob = 0, menuReads = 0, clock = 0;
const translationY = () => Number(menu.style.transform.match(/translate3d\([^,]+, ([^p]+)px/)?.[1] ?? 0);
const menu = {
  dataset: {}, style: { transform: '', removeProperty() {} },
  closest: () => null,
  getBoundingClientRect: () => {
    menuReads++;
    const top = Math.min(Math.max(300, 1000 - window.scrollY), 1100 - window.scrollY) + translationY();
    return { left: 100, right: 280, top, bottom: top + 156 };
  },
};
globalThis.document = { documentElement: { dataset: { workStageLayout: 'true' } },
  querySelector: selector => selector === '.work-rail .section-navigation' ? menu : null };
globalThis.window = { scrollY: 1000,
  addEventListener: (name, callback) => events.set(name, callback) };
let capabilityChanged;
const capability = { matches: true, addEventListener: (name, callback) => { if (name === 'change') capabilityChanged = callback; } };
globalThis.matchMedia = () => capability;
globalThis.getComputedStyle = () => ({ getPropertyValue: name => name === 'top' ? '300px' : '' });
globalThis.requestAnimationFrame = callback => { jobs.set(++nextJob, callback); return nextJob; };
globalThis.cancelAnimationFrame = id => jobs.delete(id);
globalThis.refreshViewportPointer = () => {};
globalThis.watchViewportPointer = () => () => {};
globalThis.readMotionToken = readMotionToken;
Object.defineProperty(globalThis, 'performance', { value: { now: () => clock }, configurable: true });
let runtime = readFileSync('src/scripts/work-filter-magnet.ts', 'utf8')
  .replace("import { refreshViewportPointer, watchViewportPointer } from './viewport-pointer.ts';",
    'const { refreshViewportPointer, watchViewportPointer } = globalThis;')
  .replace("import { readMotionToken } from './native-motion.ts';", 'const { readMotionToken } = globalThis;');
runtime = ts.transpileModule(runtime, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { initializeWorkFilterMagnet } = await import(`data:text/javascript;base64,${Buffer.from(runtime).toString('base64')}`);
const controller = initializeWorkFilterMagnet();
assert.equal(menuReads, 1);
for (let i = 0; i < 20; i++) { window.scrollY++; events.get('scroll')(); }
assert.equal(menuReads, 1, 'Scroll events do not force synchronous menu layout');
assert.equal(jobs.size, 1, 'One paint handles the entire scroll burst');
clock += 16.667;
const pending = [...jobs.values()]; jobs.clear(); pending.forEach(callback => callback(clock));
assert.equal(menuReads, 2, 'The untransformed menu position is measured once per frame');
assert.equal(translationY(), 20, 'The first frame preserves the rendered position without a fixed kick');
assert.ok(jobs.size > 0, 'Following the moving sticky target starts a gentle catch-up');
for (let i = 0; i < 200; i++) {
  clock += 16.667;
  const pending = [...jobs.values()]; jobs.clear(); pending.forEach(callback => callback(clock));
}
assert.equal(translationY(), 0, 'The runtime lands exactly on the sticky alignment');
window.scrollY--; events.get('scroll')();
clock += 16.667;
const reverse = [...jobs.values()]; jobs.clear(); reverse.forEach(callback => callback(clock));
assert.equal(translationY(), 0, 'Scrolling up from the bottom does not start another bounce');
controller.setPaused(true);
assert.equal(translationY(), 0, 'Opening a case releases pending scroll-follow offsets');
window.scrollY = 650;
controller.setPaused(false);
window.scrollY--; events.get('scroll')();
clock += 16.667;
const topEdge = [...jobs.values()]; jobs.clear(); topEdge.forEach(callback => callback(clock));
assert.equal(translationY(), -1, 'Scrolling outward at the top retains a proportional one-pixel linger');
for (let i = 0; i < 200; i++) {
  clock += 16.667;
  const pending = [...jobs.values()]; jobs.clear(); pending.forEach(callback => callback(clock));
}
window.scrollY++; events.get('scroll')();
clock += 16.667;
const leavingTop = [...jobs.values()]; jobs.clear(); leavingTop.forEach(callback => callback(clock));
assert.equal(translationY(), 0, 'Scrolling down from the top does not start another bounce');
controller.setPaused(true);
window.scrollY = 750;
controller.setPaused(false);
window.scrollY++; events.get('scroll')();
clock += 16.667;
const center = [...jobs.values()]; jobs.clear(); center.forEach(callback => callback(clock));
assert.equal(translationY(), 0, 'Scrolling through the centered sticky region adds no spring movement');
capability.matches = false;
capabilityChanged();
assert.equal(translationY(), 0, 'Reduced-motion or compact-layout changes immediately restore sticky alignment');
assert.equal(jobs.size, 0, 'Disabling the desktop capability cancels pending follow frames');
window.scrollY--; events.get('scroll')();
assert.equal(jobs.size, 0, 'Native touch/compact/reduced-motion scrolling has no follower');
controller.destroy();

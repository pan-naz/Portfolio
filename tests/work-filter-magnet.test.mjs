import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { calculateWorkFilterBoundaryKick, calculateWorkFilterMagnet, resolveWorkFilterSpringSpeed } from '../src/scripts/work-filter-magnet.ts';

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

const free = { top: false, bottom: false };
const atTop = { top: true, bottom: false };
const atBottom = { top: false, bottom: true };
assert.equal(calculateWorkFilterBoundaryKick(-10, atTop, free), 0, 'reaching the upper boundary does not kick immediately');
assert.equal(calculateWorkFilterBoundaryKick(-10, atTop, atTop), -1, 'continued upward scrolling kicks beyond the upper boundary');
assert.equal(calculateWorkFilterBoundaryKick(10, atBottom, free), 0, 'reaching the lower boundary does not kick immediately');
assert.equal(calculateWorkFilterBoundaryKick(10, atBottom, atBottom), 1, 'continued downward scrolling kicks beyond the lower boundary');
assert.equal(calculateWorkFilterBoundaryKick(10, atTop, atTop), 0, 'scrolling away from the upper boundary cannot kick it');

console.log('PASS: work-filter magnet pulls up to 32px, slows inside the menu and activates boundary motion only on continued endpoint scrolling.');

// Scroll events may arrive several times between paints. They must share one
// sticky-boundary measurement while retaining the same endpoint impulse.
const events = new Map(), jobs = new Map();
let nextJob = 0, menuReads = 0, railReads = 0, clock = 0;
const rail = { getBoundingClientRect: () => { railReads++; return { top: 100, bottom: 500 }; } };
const menu = {
  dataset: {}, style: { transform: '', removeProperty() {} },
  closest: selector => selector === '.work-rail' ? rail : null,
  getBoundingClientRect: () => { menuReads++; return { left: 100, right: 280, top: 100, bottom: 256 }; },
};
globalThis.document = { documentElement: { dataset: { workStageLayout: 'true' } },
  querySelector: selector => selector === '.work-rail .section-navigation' ? menu : null };
globalThis.window = { scrollY: 1000,
  addEventListener: (name, callback) => events.set(name, callback) };
globalThis.matchMedia = () => ({ matches: true, addEventListener() {} });
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
globalThis.requestAnimationFrame = callback => { jobs.set(++nextJob, callback); return nextJob; };
globalThis.cancelAnimationFrame = id => jobs.delete(id);
globalThis.refreshViewportPointer = () => {};
globalThis.watchViewportPointer = () => () => {};
let runtime = readFileSync('src/scripts/work-filter-magnet.ts', 'utf8')
  .replace("import { refreshViewportPointer, watchViewportPointer } from './viewport-pointer.ts';",
    'const { refreshViewportPointer, watchViewportPointer } = globalThis;');
runtime = ts.transpileModule(runtime, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { initializeWorkFilterMagnet } = await import(`data:text/javascript;base64,${Buffer.from(runtime).toString('base64')}`);
const controller = initializeWorkFilterMagnet();
assert.equal(menuReads, 1);
for (let i = 0; i < 20; i++) { window.scrollY--; events.get('scroll')(); }
assert.equal(menuReads, 1, 'Scroll events do not force synchronous menu layout');
assert.equal(railReads, 1, 'Scroll events do not force synchronous rail layout');
assert.equal(jobs.size, 1, 'One paint handles the entire scroll burst');
clock += 16.667;
const pending = [...jobs.values()]; jobs.clear(); pending.forEach(callback => callback(clock));
assert.equal(menuReads, 2, 'The menu boundary is measured once per frame');
assert.equal(railReads, 2, 'The rail boundary is measured once per frame');
assert.ok(jobs.size > 0, 'Continued upward scrolling at the top still starts the boundary spring');
controller.destroy();

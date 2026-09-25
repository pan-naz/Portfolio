import assert from 'node:assert/strict';
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

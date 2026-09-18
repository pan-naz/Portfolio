import assert from 'node:assert/strict';
import { stepTiltSpring } from '../src/scripts/project-tilt.ts';
const run = (hz, target = 6) => {
  const spring = { value: 0, velocity: 0, target };
  let previous = 0;
  for (let i = 0; i < hz; i++) {
    stepTiltSpring(spring, 1 / hz);
    assert.ok(spring.value >= previous && spring.value <= target, 'Rest-to-edge motion never overshoots');
    previous = spring.value;
  }
  return spring;
};
assert.ok(Math.abs(run(60).value - run(120).value) < .001, 'Frame rate does not alter spring motion');
const returning = run(60);
returning.target = 0;
for (let i = 0; i < 240; i++) stepTiltSpring(returning, 1 / 120);
assert.equal(returning.value, 0);
assert.equal(returning.velocity, 0, 'Spring settles exactly so the frame loop can stop');
const interrupted = { value: 2.5, velocity: 8, target: -3 };
for (let i = 0; i < 120; i++) stepTiltSpring(interrupted, 1 / 60);
assert.equal(interrupted.value, -3);
assert.equal(interrupted.velocity, 0);
console.log('PASS: tilt spring has stable frame-rate-independent tracking, return and interrupted direction changes.');

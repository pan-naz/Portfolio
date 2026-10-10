import assert from 'node:assert/strict';
import { advanceLocalFallClock, catchUpFallClock, streamDrops, streamStates, stretchedIconY, trailOpacity } from '../src/scripts/waterfall/waterfall-model.ts';

const reusableDrops = streamDrops(999, 0, 800);
assert.strictEqual(streamDrops(999, 1 / 60, 800), reusableDrops, 'The live renderer reuses each column schedule between frames');

function simulate(fps) {
  const snapshots = [];
  const drops = Array.from({ length: 44 }, () => new Map());
  const previousFrames = Array.from({ length: 44 }, () => []);
  for (let frame = 0; frame <= fps * 120; frame++) {
    const time = frame / fps;
    for (let column = 0; column < 44; column++) {
      const streams = streamStates(column, time, 800);
      assert.ok(streams.length <= 3);
      for (const stream of streams) {
        assert.ok(stream.speed >= 145 && stream.speed < 235);
        const recorded = drops[column].get(stream.cycle);
        if (recorded) assert.equal(recorded.speed, stream.speed, 'A falling drop must not change speed mid-flight');
        else {
          const previous = drops[column].get(stream.cycle - 1);
          if (previous) assert.ok(Math.abs(stream.speed - previous.speed) >= 18);
          drops[column].set(stream.cycle, { speed: stream.speed, start: time - stream.elapsed });
        }
      }
      for (const old of previousFrames[column]) {
        if (streams.some(s => s.cycle === old.cycle)) continue;
        for (let row = 0; row < 12; row++) {
          if (trailOpacity(row * 18, old.tail) < .012) continue;
          const y = stretchedIconY(old.elapsed + 1 / fps, row, old.speed, 18);
          assert.ok(y > 805, 'A slow tail must finish before its slot is reused');
        }
      }
      previousFrames[column] = streams;
      if (frame % fps === 0) snapshots.push(streams);
    }
  }
  for (const column of drops) {
    assert.ok(column.size > 25);
    assert.equal(new Set([...column.values()].map(d => d.speed)).size, column.size);
    const starts = [...column.values()].map(d => d.start);
    const intervals = starts.slice(1).map((start, i) => start - starts[i]);
    assert.ok(Math.max(...intervals) - Math.min(...intervals) > .5, 'Launch spacing must vary per cycle');
  }
  return snapshots;
}

assert.deepEqual(simulate(60), simulate(120), 'Scheduling must be independent of refresh rate');
console.log('PASS: 120 seconds at 60/120Hz; randomized cycles, steady in-flight speeds, variable launches, no premature tail eviction, max three drops per column.');

function hoverClock(fps) {
  let rate = 1;
  let elapsed = 0;
  for (let frame = 0; frame < fps * 2; frame++) {
    const step = advanceLocalFallClock(rate, 1 / fps, true);
    assert.ok(step.rate <= rate && step.rate >= .4);
    assert.ok(step.elapsed > 0);
    rate = step.rate;
    elapsed += step.elapsed;
  }
  assert.ok(Math.abs(rate - .4) < .00003);
  const held = advanceLocalFallClock(rate, 0, false);
  assert.equal(held.rate, rate);
  assert.equal(held.elapsed, 0);
  for (let frame = 0; frame < fps * 2; frame++) {
    const step = advanceLocalFallClock(rate, 1 / fps, false);
    assert.ok(step.rate >= rate && step.rate <= 1);
    rate = step.rate;
    elapsed += step.elapsed;
  }
  assert.ok(Math.abs(rate - 1) < .00003);
  return elapsed;
}
assert.ok(Math.abs(hoverClock(60) - hoverClock(120)) < 1e-10);
assert.deepEqual(advanceLocalFallClock(1, .1, false), { rate: 1, elapsed: .1 });
console.log('PASS: nearby icons slow to 40%, smoothly recover, remain pause-safe; unaffected icons stay at full speed.');

function recovery(fps) {
  let elapsed = 0;
  let rate = 1;
  let peak = 1;
  for (let frame = 0; frame < fps * 8; frame++) {
    const reference = frame / fps;
    const step = frame < fps * 2
      ? advanceLocalFallClock(rate, 1 / fps, true)
      : catchUpFallClock(rate, 1 / fps, Math.max(0, reference - elapsed));
    assert.ok(step.elapsed >= 0, 'Never move backward');
    elapsed += step.elapsed;
    rate = step.rate;
    peak = Math.max(peak, rate);
    assert.ok(elapsed <= (frame + 1) / fps + 1e-10, 'Never overtake original position');
  }
  assert.ok(peak > 1.5, 'Must briefly accelerate above normal speed');
  assert.ok(Math.abs(elapsed - 8) < .00001, 'Must recover lost time, not keep the cluster');
  assert.ok(Math.abs(rate - 1) < .00001);
  return elapsed;
}
assert.ok(Math.abs(recovery(60) - recovery(120)) < 1e-10);
assert.deepEqual(catchUpFallClock(1.8, 0, .5), { rate: 1.8, elapsed: 0 });
assert.deepEqual(catchUpFallClock(1, .1, 0), { rate: 1, elapsed: .1 });
console.log('PASS: delayed icons accelerate, recover original positions without overshoot, settle to normal speed; 60/120Hz equivalent.');

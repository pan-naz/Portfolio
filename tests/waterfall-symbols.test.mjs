import assert from 'node:assert/strict';
import { WaterfallSymbols } from '../src/scripts/waterfall-symbols.ts';
import { streamStates, stretchedIconY, trailOpacity } from '../src/scripts/waterfall-model.ts';
import { waterfallIconNodes, waterfallIconManifest } from '../src/scripts/waterfall-icon-data.ts';

const count = waterfallIconNodes.length;
assert.equal(count, 1044);
assert.equal(new Set(waterfallIconNodes.map(n => JSON.stringify(n.map(shape => JSON.stringify(shape)).sort()))).size, count);
assert.equal(new Set(waterfallIconManifest.map(i => i.name)).size, count);
assert.deepEqual(new Set(waterfallIconManifest.map(i => i.group)), new Set([
  'User Interface', 'Web3 & Blockchain', 'Social Media & Branding', 'Images & Photos',
  'Communication', 'Date & Time', 'Charts & Graphs', 'Alerts & Feedback',
]));

let seed = 7;
const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
let peak = 0;
for (const fps of [60, 120]) {
  const symbols = new WaterfallSymbols(count, random);
  for (let frame = 0; frame < fps * 60; frame++) {
    const time = frame / fps;
    symbols.beginFrame();
    const seen = new Set();
    for (let column = 0; column < 44; column++) {
      for (const stream of streamStates(column, time, 800)) {
        for (let row = 0; row < Math.min(12, Math.ceil(stream.tail / 18)); row++) {
          const y = stretchedIconY(stream.elapsed, row, stream.speed, 18);
          if (y === null || y < -5 || y > 805 || trailOpacity(row * 18, stream.tail) < .012) continue;
          const id = (column * 4 + stream.cycle % 4) * 16 + row;
          const icon = symbols.iconFor(id, stream.cycle, time);
          assert.notEqual(icon, undefined, 'Pool must never omit a visible icon');
          assert.ok(!seen.has(icon), 'Every rendered icon must be unique across the whole field');
          seen.add(icon);
        }
      }
    }
    peak = Math.max(peak, seen.size);
    symbols.endFrame();
  }
}

// Fast asynchronous replacements never immediately repeat; freeze time pauses swaps.
const single = new WaterfallSymbols(count, random);
let previous;
let changedAt = 0;
let swaps = 0;
for (let frame = 0; frame < 1200; frame++) {
  const time = frame / 120;
  single.beginFrame();
  const icon = single.iconFor(1, 0, time);
  if (previous !== undefined && icon !== previous) {
    assert.ok(time - changedAt >= .12 - 1e-9 && time - changedAt <= .249);
    changedAt = time;
    swaps++;
  }
  assert.equal(single.iconFor(1, 0, time), icon);
  single.endFrame();
  previous = icon;
}
assert.ok(swaps > 40);

// Exhaustion fails safely without duplicates, and exited icons return to the pool.
const tiny = new WaterfallSymbols(2, random);
tiny.beginFrame();
const first = tiny.iconFor(1, 0, 0);
const second = tiny.iconFor(2, 0, 0);
assert.notEqual(first, second);
assert.equal(tiny.iconFor(3, 0, 0), undefined);
tiny.endFrame();
tiny.beginFrame();
tiny.iconFor(2, 0, 0);
tiny.endFrame();
tiny.beginFrame();
assert.equal(tiny.iconFor(3, 0, 0), first);
tiny.endFrame();
console.log(`PASS: 60-second simulations at 60/120fps, no duplicate symbols; peak ${peak} icons. ${swaps} swaps in 10 seconds.`);

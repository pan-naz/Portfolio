import assert from 'node:assert/strict';
import { accentBlendSteps, accentProgress, createAccentPalette, maximumTrailStrength, trailShadeIndex, trailShadeSteps, updateParticleAccent } from '../src/scripts/waterfall-color.ts';

assert.equal(accentProgress(0), 0);
assert.equal(accentProgress(1), .5);
assert.equal(accentProgress(2), 1, 'Fully accent after two seconds, not an asymptotic blend');
const fresh = () => ({ accent: 0, accentExitFrom: 0, accentExitElapsed: 2 });
for (const fps of [60,120]) {
  const existing = fresh(), newlyEntered = fresh();
  for (let frame = 0; frame <= 2 * fps; frame++) {
    const group = accentProgress(frame / fps);
    updateParticleAccent(existing, true, group, 1 / fps);
    if (frame >= fps) {
      updateParticleAccent(newlyEntered, true, group, 1 / fps);
      assert.equal(newlyEntered.accent, existing.accent, 'New icons inherit the group color without restarting');
    }
  }
  assert.equal(existing.accent, 1);
  assert.equal(newlyEntered.accent, 1);
  // Glyph replacement is external to this persistent particle state.
  for (let replacement = 0; replacement < 12; replacement++) {
    updateParticleAccent(existing, true, 1, 1 / fps);
    assert.equal(existing.accent, 1, 'Rapid symbol replacement retains full accent');
  }
  updateParticleAccent(existing, false, 0, 0);
  assert.equal(existing.accent, 1, 'Exit starts without a color jump');
  for (let frame = 0; frame < fps; frame++) updateParticleAccent(existing, false, 0, 1 / fps);
  assert.ok(Math.abs(existing.accent - .5) < 1e-12);
  for (let frame = 0; frame < fps; frame++) updateParticleAccent(existing, false, 0, 1 / fps);
  assert.ok(existing.accent < 1e-12, 'Returns fully to gray after two seconds');
}
for (const [ink, background, backgroundRGB, grayLeader, accentLeader] of [
  ['#111111', '#FAF8F7', 'rgb(250,248,247)', 'rgb(175,174,173)', 'rgb(249,203,190)'],
  ['#ddd8d4', '#171716', 'rgb(23,23,22)', 'rgb(86,85,83)', 'rgb(95,50,37)'],
]) {
  const palette = createAccentPalette(ink, '#F86A46', background);
  assert.equal(palette.length, (accentBlendSteps + 1) * (trailShadeSteps + 1));
  assert.ok(palette.every(color => /^rgb\(\d+,\d+,\d+\)$/.test(color)), 'Every shade is opaque RGB');
  assert.ok(palette.slice(0, accentBlendSteps + 1).every(color => color === backgroundRGB), 'All color fades end at the exact theme canvas');
  assert.equal(palette[trailShadeSteps * (accentBlendSteps + 1)], grayLeader);
  assert.equal(palette.at(-1), accentLeader);
}
assert.equal(trailShadeIndex(0), 0);
assert.equal(trailShadeIndex(maximumTrailStrength), trailShadeSteps);
console.log('PASS: synchronized two-second accent, inherited color on entry/replacement, two-second exit at 60/120Hz.');
console.log('PASS: opaque RGB gray/accent steps fade into the exact light/dark canvas.');

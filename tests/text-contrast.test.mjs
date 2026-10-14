import assert from 'node:assert/strict';
import {readSystemTokens} from '../src/data/system-inventory.ts';
import { readFileSync } from 'node:fs';
import { contrastRatio, passesNormalTextAA } from '../scripts/text-contrast.ts';
assert.equal(contrastRatio('#000000', '#ffffff'), 21);
assert.equal(contrastRatio('#64615f', '#64615f'), 1);
assert.equal(passesNormalTextAA(4.4999), false, 'Never round a failing ratio into a pass');
assert.equal(passesNormalTextAA(4.5), true);
assert.throws(() => contrastRatio('transparent', '#ffffff'));
const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const palettes=readSystemTokens(css),{light,dark}=palettes;
const resolve=(palette,key)=>palettes.value(palette,key);
for (const [theme, palette] of Object.entries({ light, dark })) {
  for (const surface of ['color-bg-canvas', 'color-bg-surface', 'color-bg-surface-subtle']) {
    let previous = Infinity;
    for (const role of ['color-text-primary', 'color-text-secondary']) {
      const ratio = contrastRatio(resolve(palette, role), resolve(palette, surface));
      assert.ok(passesNormalTextAA(ratio), `${theme}: ${role} on ${surface} fails at ${ratio}:1`);
      assert.ok(ratio < previous, `${theme}: text hierarchy must progressively soften`);
      previous = ratio;
      console.log(`${theme}: ${role} on ${surface} = ${ratio.toFixed(2)}:1`);
    }
  }
}
assert.equal(light['color-text-secondary'], 'var(--color-ink-64)', 'Canonical secondary maps directly to its unchanged alpha primitive');
assert.equal(resolve(light, 'color-text-secondary'), 'rgb(22 23 21 / 0.64)', 'Light secondary uses the Figma alpha token');
assert.ok(!('color-text-tertiary' in light), 'The catalog-only tertiary role is removed');

assert.equal(contrastRatio('rgb(0 0 0 / 0)', '#ffffff'), 1);
assert.equal(contrastRatio('rgb(0 0 0 / 1)', '#ffffff'), 21);
assert.equal(contrastRatio('rgb(0 0 0 / .5)', '#ffffff'), contrastRatio('rgb(127.5 127.5 127.5)', '#ffffff'));
assert.throws(() => contrastRatio('#000000', 'rgb(255 255 255 / .5)'));
assert.throws(() => contrastRatio('rgb(256 0 0)', '#ffffff'));
assert.throws(() => contrastRatio('rgb(0 0 0 / 2)', '#ffffff'));
assert.equal(resolve(light, 'color-interactive-accent'), '#F25A30');
assert.equal(resolve(dark, 'color-interactive-accent'), '#FF6B42');
assert.equal(resolve(dark, 'color-bg-canvas'), '#161715', 'Dark mode preserves the original main page canvas');
assert.equal(resolve(dark, 'color-bg-surface'), '#222320', 'Dark UI surfaces are lifted above the unchanged Ink canvas');
assert.equal(resolve(dark, 'color-bg-surface-subtle'), '#343432', 'Dark hover and selected fills use Graphite');
assert.equal(resolve(light,'color-bg-surface'),'#FFFFFF','Light-zone controls retain White');
assert.notEqual(resolve(dark,'color-bg-surface'),resolve(light,'color-bg-surface'),'Navigation shares the page surface role');
assert.notEqual(dark['shadow-floating-navigation'], light['shadow-floating-navigation'], 'Floating navigation gains a stronger dark-mode elevation');
for (const [theme, palette] of Object.entries({ light, dark })) {
  assert.ok(
    passesNormalTextAA(contrastRatio(resolve(palette, 'color-text-primary'), resolve(palette, 'color-bg-surface'))),
    `${theme}: floating-navigation text passes AA on its surface`,
  );
}

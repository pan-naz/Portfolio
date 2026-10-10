import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrastRatio, passesNormalTextAA } from '../scripts/text-contrast.ts';
assert.equal(contrastRatio('#000000', '#ffffff'), 21);
assert.equal(contrastRatio('#64615f', '#64615f'), 1);
assert.equal(passesNormalTextAA(4.4999), false, 'Never round a failing ratio into a pass');
assert.equal(passesNormalTextAA(4.5), true);
assert.throws(() => contrastRatio('transparent', '#ffffff'));
const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const tokens = block => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()]));
const light = tokens(css.match(/:root\s*\{([^}]+)\}/)[1]);
const dark = { ...light, ...tokens(css.match(/:root\[data-theme='dark'\][^{]*\{([^}]+)\}/)[1]) };
const resolve = (palette, key) => palette[key].startsWith('var(') ? resolve(palette, palette[key].slice(6, -1)) : palette[key];
for (const [theme, palette] of Object.entries({ light, dark })) {
  for (const surface of ['color-bg-canvas', 'color-bg-surface', 'color-bg-surface-subtle']) {
    let previous = Infinity;
    for (const role of ['color-text-primary', 'color-text-secondary', 'color-text-tertiary']) {
      const ratio = contrastRatio(resolve(palette, role), resolve(palette, surface));
      if (role !== 'color-text-tertiary') assert.ok(passesNormalTextAA(ratio), `${theme}: ${role} on ${surface} fails at ${ratio}:1`);
      assert.ok(ratio < previous, `${theme}: text hierarchy must progressively soften`);
      previous = ratio;
      console.log(`${theme}: ${role} on ${surface} = ${ratio.toFixed(2)}:1`);
    }
  }
}
assert.equal(light['color-text-secondary'], 'var(--color-ink-alpha-64-light)', 'Canonical secondary maps directly to its unchanged alpha primitive');
assert.equal(resolve(light, 'color-text-secondary'), 'rgb(22 23 21 / .64)', 'Light secondary uses the Figma alpha token');
assert.equal(light['color-text-tertiary'], '#A19C98', 'Light tertiary uses the approved value');

assert.equal(contrastRatio('rgb(0 0 0 / 0)', '#ffffff'), 1);
assert.equal(contrastRatio('rgb(0 0 0 / 1)', '#ffffff'), 21);
assert.equal(contrastRatio('rgb(0 0 0 / .5)', '#ffffff'), contrastRatio('rgb(127.5 127.5 127.5)', '#ffffff'));
assert.throws(() => contrastRatio('#000000', 'rgb(255 255 255 / .5)'));
assert.throws(() => contrastRatio('rgb(256 0 0)', '#ffffff'));
assert.throws(() => contrastRatio('rgb(0 0 0 / 2)', '#ffffff'));
assert.equal(resolve(light, 'color-interactive-accent'), '#F25A30');
assert.equal(resolve(dark, 'color-interactive-accent'), '#FF6B42');
assert.equal(resolve(dark, 'color-bg-canvas'), '#161715', 'Dark mode preserves the original main page canvas');
assert.equal(resolve(dark, 'color-bg-surface'), '#0F100E', 'Dark containers use a separate neutral darker than the original canvas');
for (const token of ['color-overlay-text-primary', 'color-overlay-text-primary-hover', 'color-overlay-bg-surface', 'color-overlay-bg-surface-subtle', 'color-overlay-accent', 'color-overlay-text-on-primary', 'color-overlay-focus-ring', 'shadow-overlay']) {
  assert.equal(dark[token], light[token], `${token} keeps the white overlay-control palette in dark mode`);
}
assert.ok(passesNormalTextAA(contrastRatio(resolve(light, 'color-overlay-text-primary'), resolve(light, 'color-overlay-bg-surface'))), 'Overlay-control text passes AA on its white surface');
assert.notEqual(dark['color-navigation-bg-surface'], light['color-navigation-bg-surface'], 'Floating navigation changes to a dark surface in dark mode');
assert.notEqual(dark['shadow-floating-navigation'], light['shadow-floating-navigation'], 'Floating navigation gains a stronger dark-mode elevation');
for (const [theme, palette] of Object.entries({ light, dark })) {
  assert.ok(
    passesNormalTextAA(contrastRatio(resolve(palette, 'color-navigation-text-primary'), resolve(palette, 'color-navigation-bg-surface'))),
    `${theme}: floating-navigation text passes AA on its surface`,
  );
}

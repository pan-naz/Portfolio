import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrastRatio, passesNormalTextAA } from '../src/scripts/text-contrast.ts';
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
  for (const surface of ['canvas', 'surface', 'surface-subtle']) {
    let previous = Infinity;
    for (const role of ['text-primary', 'text-secondary', 'text-tertiary']) {
      const ratio = contrastRatio(resolve(palette, role), resolve(palette, surface));
      if (role !== 'text-tertiary') assert.ok(passesNormalTextAA(ratio), `${theme}: ${role} on ${surface} fails at ${ratio}:1`);
      assert.ok(ratio < previous, `${theme}: text hierarchy must progressively soften`);
      previous = ratio;
      console.log(`${theme}: ${role} on ${surface} = ${ratio.toFixed(2)}:1`);
    }
  }
}
assert.equal(light['text-h2'], 'var(--text-heading)', 'H2 preserves the section-heading scale');
assert.equal(light['text-secondary'], 'var(--muted)', 'Secondary remains mapped to the shared muted role');
assert.equal(light['muted'], 'rgb(22 23 21 / .64)', 'Light secondary uses the Figma alpha token');
assert.equal(light['text-tertiary'], '#A19C98', 'Light tertiary uses the approved value');

assert.equal(contrastRatio('rgb(0 0 0 / 0)', '#ffffff'), 1);
assert.equal(contrastRatio('rgb(0 0 0 / 1)', '#ffffff'), 21);
assert.equal(contrastRatio('rgb(0 0 0 / .5)', '#ffffff'), contrastRatio('rgb(127.5 127.5 127.5)', '#ffffff'));
assert.throws(() => contrastRatio('#000000', 'rgb(255 255 255 / .5)'));
assert.throws(() => contrastRatio('rgb(256 0 0)', '#ffffff'));
assert.throws(() => contrastRatio('rgb(0 0 0 / 2)', '#ffffff'));
assert.equal(light.accent, '#F25A30');
assert.equal(dark.accent, '#FF6B42');
assert.equal(dark.canvas, '#161715', 'Dark mode preserves the original main page canvas');
assert.equal(dark.surface, '#0F100E', 'Dark containers use a separate neutral darker than the original canvas');
for (const token of ['floating-ink', 'floating-ink-hover', 'floating-surface', 'floating-surface-subtle', 'floating-accent', 'floating-on-primary', 'floating-focus-ring', 'shadow-floating-light']) {
  assert.equal(dark[token], light[token], `${token} stays pinned to the Light palette in dark mode`);
}
assert.ok(passesNormalTextAA(contrastRatio(light['floating-ink'], light['floating-surface'])), 'Theme-invariant floating-control text passes AA on its white surface');

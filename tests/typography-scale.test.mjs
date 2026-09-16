import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
const css = read('../src/styles/tokens.css');
const values = ['text-display', 'text-heading'].map(token => {
  const declarations = [...css.matchAll(new RegExp(`--${token}:\\s*([^;]+);`, 'g'))];
  assert.equal(declarations.length, 1, `${token} must not drift through breakpoint overrides`);
  const match = declarations[0][1].match(/^clamp\(([\d.]+)rem, calc\(([\d.]+)rem \+ ([\d.]+)vw\), ([\d.]+)rem\)$/);
  assert.ok(match, `${token} must retain rem bounds and a rem contribution`);
  return match.slice(1).map(Number);
});
const sizesAt = (width, root = 16) => values.map(([min, base, vw, max]) => Math.min(max * root, Math.max(min * root, base * root + vw * width / 100)));
assert.deepEqual(sizesAt(390), [40, 26]);
assert.deepEqual(sizesAt(1728), [88, 56]);
for (const root of [16, 20, 24, 32]) {
  for (let width = 320; width <= 2560; width += 8) {
    const [display, h2] = sizesAt(width, root);
    assert.ok(display / h2 >= 1.2, `Display/heading separation at ${width}px, root ${root}px`);
  }
}
const global = read('../src/styles/global.css');
assert.ok(/\.desktop-nav\s*\{[^}]*gap: var\(--space-3\)/.test(global) && /\.navigation-item\s*\{[^}]*--navigation-item-padding-inline: 12px[^}]*padding: 10px var\(--navigation-item-padding-inline\)/.test(global), 'Horizontal NavLinks use space/12 with shared 12px item padding');
assert.ok(/\.header-controls\s*\{[^}]*gap: var\(--space-3\)/.test(global), 'Horizontal header components use space/12');
assert.ok(/\.mobile-menu nav\s*\{[^}]*gap: 0/.test(global), 'Vertical navigation keeps zero inter-item gap');
assert.ok(/\.text-body-m-strong\s*\{[^}]*font-size: var\(--text-body-m\)[^}]*line-height: 1\.5[^}]*letter-spacing: 0[^}]*font-weight: 600/.test(global), 'Body/M Strong is one shared 16/24 Semibold role');
assert.ok(read('../src/components/Button.astro').includes("'text-body-m-strong'"), 'Pill buttons consume Body/M Strong');
assert.ok(read('../src/components/NavLinks.astro').includes("import NavigationItem from './NavigationItem.astro'"), 'Desktop and floating-pill navigation consume the shared item');
assert.ok(read('../src/components/NavigationItem.astro').includes("'text-body-m-strong'"), 'Shared navigation item consumes Body/M Strong');
assert.ok(read('../src/components/SectionNavigation.astro').includes('section-navigation text-body-m-strong'), 'Left section menu consumes Body/M Strong');
assert.ok(!/\.hero-title\s*\{[^}]*font-size/.test(global), 'Hero uses the shared Display class');
assert.ok(/\.hero-title\s*\{[^}]*text-wrap: wrap/.test(global));
assert.ok(/grid-template-columns: minmax\(0, 1fr\)/.test(global));
assert.ok(read('../src/components/TypewriterHeading.astro').includes('hero-title text-display'));
assert.ok(read('../src/components/TypewriterHeading.astro').includes('type-line type-line--display'), 'Permanent display line uses the shared optical-alignment hook');
assert.ok(/\.type-line--display,\s*\.role-cycle\s*\{[^}]*translateX\(-\.06em\)/.test(global), 'Display and cycling lines share the same responsive optical edge');
assert.ok(read('../src/components/TypewriterHeading.astro').includes('type-line text-h2 role-cycle'), 'Cycling text uses the shared heading size and accent role');
const ds = read('../src/components/DSCatalog.astro');
for (const role of ['text-display', 'text-h2']) assert.ok(ds.includes(`'${role}'`), 'Catalog typography data uses shared type classes');
assert.ok(ds.includes('class={style}'), 'Catalog renders the shared type class from its specimen data');
console.log('PASS: shared 40/26 → 88/56 Figma scale, minimum 20% steps, 320–2560px and 100–200% font preferences.');

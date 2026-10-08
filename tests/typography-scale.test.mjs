import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
const css = read('../src/styles/tokens.css');
const values = ['text-heading-xl', 'text-heading-l'].map(token => {
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
    assert.ok(display / h2 >= 1.2, `Heading/XL and Heading/L separation at ${width}px, root ${root}px`);
  }
}
const global = read('../src/styles/global.css');
assert.match(css, /--line-height-body: 1\.5;/, 'Body line-height retains its exact ratio');
assert.ok(/\.desktop-nav\s*\{[^}]*gap: var\(--space-3\)/.test(global) && /\.navigation-item\s*\{[^}]*--navigation-item-padding-inline: var\(--space-3\)[^}]*padding: 10px var\(--navigation-item-padding-inline\)/.test(global), 'Horizontal NavLinks use space/12 with shared 12px item padding');
assert.ok(/\.header-controls\s*\{[^}]*gap: var\(--space-3\)/.test(global), 'Horizontal header components use space/12');
assert.ok(/\.mobile-menu nav\s*\{[^}]*gap: 0/.test(global), 'Vertical navigation keeps zero inter-item gap');
assert.ok(/body\s*\{[^}]*font-size: var\(--text-body\)[^}]*line-height: var\(--line-height-body\)[^}]*font-weight: 400/.test(global), 'Body/L is the shared 20/30 Regular default');
assert.ok(/\.text-body-l\s*\{[^}]*font-size: var\(--text-body\)[^}]*line-height: var\(--line-height-body\)[^}]*letter-spacing: var\(--letter-spacing-body-l\)[^}]*font-weight: 400/.test(global), 'Body/L is one shared 20/30 Regular role');
assert.ok(/\.text-body-m\s*\{[^}]*font-size: var\(--text-body-m\)[^}]*line-height: var\(--line-height-body\)[^}]*letter-spacing: var\(--letter-spacing-body-m\)[^}]*font-weight: 400/.test(global), 'Body/M is one shared 16/24 Regular role');
assert.ok(/\.text-body-m-strong\s*\{[^}]*font-size: var\(--text-body-m\)[^}]*line-height: var\(--line-height-body\)[^}]*letter-spacing: var\(--letter-spacing-body-m-strong\)[^}]*font-weight: var\(--font-weight-body-m-strong\)/.test(global), 'Body/M Strong is one shared 16/24 Medium role');
assert.ok(/\.text-body-s\s*\{[^}]*font-size: var\(--text-small\)[^}]*line-height: 1\.428571[^}]*letter-spacing: var\(--letter-spacing-body-s\)[^}]*font-weight: 400/.test(global), 'Body/S is one shared 14/20 Regular role');
const button = read('../src/components/Button.astro');
assert.ok(button.includes("size === 'small' ? 'text-body-s' : 'text-body-m-strong'"), 'Buttons consume Body/M Strong at default size and Body/S at small size');
assert.ok(read('../src/components/NavLinks.astro').includes("import NavigationItem from './NavigationItem.astro'"), 'Desktop and floating-pill navigation consume the shared item');
assert.ok(read('../src/components/NavigationItem.astro').includes("'text-body-m-strong'"), 'Shared navigation item consumes Body/M Strong');
const sectionNavigation = read('../src/components/SectionNavigation.astro');
assert.ok(sectionNavigation.includes('section-navigation') && sectionNavigation.includes('text-body-m-strong'), 'Left section menu consumes Body/M Strong');
assert.ok(sectionNavigation.includes('floating-navigation-theme floating-navigation-surface'), 'Left section menu consumes the shared theme-aware floating-navigation treatment');
const experienceRow = read('../src/components/ExperienceRow.astro');
assert.match(experienceRow, /<h3 class="text-body-m-strong">/, 'Experience positions consume Body/M Strong');
assert.match(experienceRow, /experience-summary text-body-m/, 'Experience descriptions consume Body/M');
for (const metadataClass of ['experience-period text-body-s', 'experience-company text-body-s', 'experience-duration text-body-s']) {
  assert.ok(experienceRow.includes(metadataClass), `${metadataClass} consumes Body/S`);
}
assert.ok(read('../src/components/Hero.astro').includes('hero-description text-body-l'), 'Homepage hero copy consumes Body/L');
assert.ok(read('../src/components/ProjectCard.astro').includes('project-outcome text-body-l') && read('../src/components/ProjectCard.astro').includes('project-description text-body-m'), 'Homepage project copy consumes shared Body/L and Body/M roles');
assert.ok(!/\.hero-title\s*\{[^}]*font-size/.test(global), 'Hero uses the shared Heading/XL class');
assert.ok(/\.hero-title\s*\{[^}]*text-wrap: wrap/.test(global));
assert.ok(/grid-template-columns: minmax\(0, 1fr\)/.test(global));
assert.ok(read('../src/components/TypewriterHeading.astro').includes('hero-title text-heading-xl'));
assert.ok(read('../src/components/TypewriterHeading.astro').includes('type-line type-line--display'), 'Permanent display line uses the shared optical-alignment hook');
assert.ok(/\.type-line--display,\s*\.role-cycle\s*\{[^}]*translateX\(-\.06em\)/.test(global), 'Display and cycling lines share the same responsive optical edge');
assert.ok(read('../src/components/TypewriterHeading.astro').includes('type-line text-heading-l role-cycle'), 'Cycling text uses the shared heading size and accent role');
const ds = read('../src/components/DSCatalog.astro');
for (const role of ['text-heading-xl', 'text-heading-l', 'text-body-l', 'text-body-m', 'text-body-m-strong', 'text-body-s']) assert.ok(ds.includes(`'${role}'`), 'Catalog typography data uses shared type classes');
assert.ok(!ds.includes('Body/S Strong') && !global.includes('text-body-s-strong'), 'Retired Body/S Strong naming cannot drift back into the shared system');
assert.ok(ds.includes('class={style}'), 'Catalog renders the shared type class from its specimen data');
console.log('PASS: shared 40/26 → 88/56 Figma scale, minimum 20% steps, 320–2560px and 100–200% font preferences.');

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const styles = path.join(root, 'src/styles');
const projectFiles = fs.readdirSync(styles).filter(name => name.endsWith('-case-study.css') || name === 'hooko-artwork.css');

test('every project stylesheet owns its brand styles in the higher cascade layer', () => {
  assert.equal(projectFiles.length, 19);
  for (const name of projectFiles) {
    const css = fs.readFileSync(path.join(styles, name), 'utf8');
    assert.match(css, /^\/\* Project-only: .+ brand styles, not part of the design system \*\/\n@layer system, project;\n@layer project \{/);
    assert.match(css, /\n}\n$/);
    assert.doesNotMatch(css, /@layer system\s*\{/);
  }
});

test('shared styles declare layer order before rules, including component scoped styles', () => {
  for (const name of fs.readdirSync(styles).filter(name => name.endsWith('.css') && !projectFiles.includes(name))) {
    const css = fs.readFileSync(path.join(styles, name), 'utf8');
    assert.ok(css.startsWith('@layer system, project;\n'), name);
    if (name === 'fonts.css') assert.equal([...css.matchAll(/@import[^;]+layer\(system\);/g)].length, 2);
    else assert.match(css, /@layer system \{/);
  }
  for (const name of fs.readdirSync(path.join(root, 'src/components')).filter(name => name.endsWith('.astro'))) {
    const source = fs.readFileSync(path.join(root, 'src/components', name), 'utf8');
    for (const [, css] of source.matchAll(/<style>([\s\S]*?)<\/style>/g)) assert.match(css, /^\n@layer system, project;\n@layer system \{/);
  }
});

test('home popup and standalone pages use the same complete project stylesheet set', () => {
  const home = fs.readFileSync(path.join(root, 'src/components/CaseStudyLayer.astro'), 'utf8');
  const direct = fs.readFileSync(path.join(root, 'src/components/StandaloneCaseStyles.astro'), 'utf8');
  for (const name of projectFiles) {
    assert.ok(home.includes(`../styles/${name}'`), name);
    assert.ok(direct.includes(`../styles/${name}?inline'`), name);
  }
  const catalog = fs.readFileSync(path.join(root, 'src/components/DSCatalog.astro'), 'utf8');
  assert.match(catalog, /import tokenCSS from '\.\.\/styles\/tokens\.css\?raw'/);
  assert.doesNotMatch(catalog, /import .+ from ['"][^'"]+(?:-case-study|hooko-artwork)\.css\?raw/);
});

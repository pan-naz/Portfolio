import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateNavigationExamples } from '../scripts/validate-design-system.mjs';
const preview = readFileSync(new URL('../src/components/DSPreview.astro', import.meta.url), 'utf8');
const controller = readFileSync(new URL('../src/scripts/design-system.ts', import.meta.url), 'utf8');
assert.deepEqual(validateNavigationExamples(preview, controller), []);
for (const example of ['nav-top-logo', 'nav-compact-theme', 'nav-docked-filter', 'nav-small-filter']) {
  assert.ok(validateNavigationExamples(preview.replace(`data-ds-example="${example}"`, ''), controller).length, `Missing ${example} fails`);
}
assert.ok(validateNavigationExamples(preview.replaceAll('<ThemeToggle', '<IconButton'), controller).length, 'Reject a local copy of the theme control');
assert.ok(validateNavigationExamples(preview.replaceAll('<SectionNavigation compact theme', '<div'), controller).length, 'Reject a drawn filter copy');
assert.ok(validateNavigationExamples(preview, controller.replace('phoneFilterFont', 'inventedSize')).length, 'Require source-derived phone typography');
assert.ok(validateNavigationExamples(preview, `${controller}\nitem.style.fontSize='14px';`).length, 'Reject a private literal font size');
console.log('PASS: actual header/pill variants, shared theme/filter compositions and source-derived small typography');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateNavigationExamples, validateWorkPill } from '../scripts/validate-design-system.mjs';
const preview = readFileSync(new URL('../src/components/DSPreview.astro', import.meta.url), 'utf8');
const controller = readFileSync(new URL('../src/scripts/design-system.ts', import.meta.url), 'utf8');
assert.deepEqual(validateNavigationExamples(preview, controller), []);
for (const example of ['nav-top-logo', 'nav-compact-theme', 'nav-work-pill', 'nav-small-filter']) {
  assert.ok(validateNavigationExamples(preview.replace(`data-ds-example="${example}"`, ''), controller).length, `Missing ${example} fails`);
}
assert.ok(validateNavigationExamples(preview.replaceAll('<ThemeToggle', '<IconButton'), controller).length, 'Reject a local copy of the theme control');
assert.ok(validateNavigationExamples(preview.replaceAll('<SectionNavigation compact theme pill', '<div'), controller).length, 'Reject a drawn filter copy');
assert.ok(validateNavigationExamples(preview, controller.replace('data-small-work-type', 'inventedSize')).length, 'Require source-derived phone typography');
assert.ok(validateNavigationExamples(preview, `${controller}\nitem.style.fontSize='14px';`).length, 'Reject a private literal font size');
console.log('PASS: actual header/pill variants, shared theme/filter compositions and source-derived small typography');
const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const parts = [read('src/components/WorkSection.astro'), read('src/scripts/work-filter/work-filter-pill.ts'), read('src/styles/global.css'), read('src/data/system-presentation.ts')];
assert.deepEqual(validateWorkPill(...parts), []);
for (const obsolete of ['work-compact-filter', 'work-filter-anchor', 'is-filter-docked']) assert.ok(validateWorkPill(parts[0] + obsolete, ...parts.slice(1)).length);
assert.ok(validateWorkPill(parts[0], parts[1].replace('wrapper.inert = !visible', ''), ...parts.slice(2)).length);
assert.ok(validateWorkPill(...parts.slice(0, 3), parts[3].replace("token:'duration-header-enter'", '')).length);

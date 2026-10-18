import assert from 'node:assert/strict';
import fs from 'node:fs';
import {icons} from '../src/data/icons.ts';
import {iconGroups,decorativeIconCount,decorativeIcons} from '../src/data/system-icons.ts';
import {waterfallIconNodes} from '../src/scripts/waterfall/waterfall-icon-data.ts';
import {validateUIIconStrokes,validateProjectIconSizes,validateIcons,validateIconGroups,validateIconStyles,validateRenderedIcons} from '../scripts/validate-icons.mjs';
assert.deepEqual(validateIcons(),[]);
assert(validateIconGroups(iconGroups.slice(1)).length,'Missing icon group fails');
assert(validateIconGroups([...iconGroups,iconGroups[0]]).length,'Duplicate icon ownership fails');
assert(validateIconGroups([...iconGroups,{icons:['invented']}]).length,'Unknown icon fails');
assert.equal(icons.close.nodes,icons.plus.nodes,'Close shares the actual Plus geometry');
assert.equal(icons.equals.weight,'strong');
assert.equal(decorativeIconCount,waterfallIconNodes.length);
assert.equal(decorativeIcons.length,40);
for(const icon of decorativeIcons)assert(waterfallIconNodes.includes(icon.nodes),'Decorative specimens borrow source nodes');
for(const css of ['.icon {width:20px}', '.icon--close {transform:rotate(45deg)}','.arrow path{stroke-width:2}'])assert(validateIconStyles(css).length,'Typed icon geometry fails');
assert.deepEqual(validateIconStyles('.icon {width:var(--icon-size);stroke-width:var(--icon-stroke-regular)}'),[]);
const html=fs.readFileSync('dist/design-system/index.html','utf8');
assert.deepEqual(validateRenderedIcons(html),[]);
assert(validateRenderedIcons(html.replace('data-ds-icon="close"','data-ds-icon="plus"')).length,'Rendered omissions/duplicates fail');
console.log('Icons: exclusive ownership, shared Close geometry, source library and token-only metrics verified.');

for(const css of [
 '@layer project {.art{width:calc(var(--icon-size) * 4 / 3)}}',
 '@layer project {.art{--prize:var(--icon-size-compact);--alias:var(--prize);height:var(--alias)}}',
])assert(validateProjectIconSizes(css).length,'Project artwork cannot derive interface icon size');
assert.deepEqual(validateProjectIconSizes('@layer project {.art{--pc-prize:32px;width:var(--pc-prize)}}'),[]);
assert.deepEqual(validateProjectIconSizes('@layer system {.case-study-decision-card__icon svg{width:var(--icon-size)}}'),[],'Shared UI keeps interface sizing');

assert.deepEqual(validateUIIconStrokes('.icon {stroke-width:var(--icon-stroke-regular)} .text-link .arrow path {stroke-width:var(--icon-stroke-strong)}'),[]);
for(const css of ['.icon {stroke-width:2}','.arrow path {stroke-width:var(--icon-stroke-other)}','.icon {stroke-width:var(--other, 1.5)}'])assert(validateUIIconStrokes(css).length,'A third/raw interface stroke cannot bypass the two-role guard');

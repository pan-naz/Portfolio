import assert from 'node:assert/strict';
import { overviewHiddenComponents, visibleComponents } from '../src/data/ds-components.ts';
import { componentPurposes } from '../src/data/system-documentation.ts';
import { validateOverviewHiddenEntries } from '../scripts/validate-design-system.mjs';
const names=overviewHiddenComponents.map(item=>item.title), keys=overviewHiddenComponents.map(item=>item.documentedHidden);
assert.deepEqual(names,['Before and after','Decision card','Media','Project filter','Project identity','Project tags','Steps','Theme switch','Tool card','Wordmark']);
assert.equal(visibleComponents.length,10);
for(const item of overviewHiddenComponents)assert.equal(item.description,componentPurposes[item.file]);
assert.deepEqual(validateOverviewHiddenEntries(keys),[]);
assert.ok(validateOverviewHiddenEntries(keys.slice(1)).length,'Missing hidden entry fails');
assert.ok(validateOverviewHiddenEntries([...keys,keys[0]]).length,'Duplicated hidden entry fails');
assert.ok(validateOverviewHiddenEntries([...keys,'icon']).length,'Icon foundation is not repeated as hidden');
// Promotion to a visible page removes its informational note automatically.
assert.deepEqual(validateOverviewHiddenEntries(keys.slice(1),keys.slice(1)),[]);
console.log('PASS: Overview follows manifest and purposes, retains ten pages, and rejects missing/duplicate/extra hidden notes.');

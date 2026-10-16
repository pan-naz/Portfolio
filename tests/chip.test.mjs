import assert from'node:assert/strict';
import {validateChip}from'../scripts/validate-chip.mjs';
import {chipCards,chipUsage,chipProps,chipTokenGroups}from'../src/data/system-chip.ts';
import {buildSystemInventory}from'../src/data/system-inventory.ts';
import {missingUsageNames}from'../scripts/validate-button.mjs';
assert.deepEqual(validateChip(),[]);
assert.deepEqual(chipCards.map(c=>c.labels),[['Accessibility','Design systems','Wireframing'],['Product design','Design system','Mobile UX'],['Context','Clarity','I won']]);
const model=buildSystemInventory().components.find(c=>c.name==='Chip');
assert.deepEqual(chipProps(model).map(p=>[p.name,p.type,p.default]),[['label','string','Required'],['index','number','0'],['variant',"'default' | 'raised' | 'accent'","'default'"]]);
assert.deepEqual(missingUsageNames(chipUsage()),[]);
assert(missingUsageNames(chipUsage().replace('index={0}','index={undefinedIndex}')).length);
const tokens=chipTokenGroups().flatMap(g=>g.names);assert(tokens.includes('--shadow-small')&&tokens.includes('--stagger-tag-reveal'));assert(!tokens.includes('--color-orange'));

for(const name of ['--space-1','--space-3','--radius-full','--color-border-default'])assert(tokens.includes(name),'Base Chip token must be documented: '+name);

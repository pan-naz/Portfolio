import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSystemInventory } from '../src/data/system-inventory.ts';
import { componentStyleSpecs } from '../src/data/system-specs.ts';
const button=buildSystemInventory().components.find(item=>item.name==='Button');
const rows=componentStyleSpecs(button);
assert.ok(rows.some(row=>row.selector.includes('.button--small')&&row.property==='min-height'&&row.value==='36px'), 'Literal small size must be documented along with tokens');
assert.ok(rows.some(row=>row.value.includes('var(--control-height)')), 'Shared dimensions retain their source token');
assert.ok(rows.every(row=>!row.location.includes('-case-study.css')), 'Project brand sheets cannot contribute UI specifications');
const root=mkdtempSync(join(tmpdir(),'folio-ds-specs-'));
try {
 mkdirSync(join(root,'src/styles'),{recursive:true});
 writeFileSync(join(root,'src/styles/global.css'),'.button { min-height: 48px; }');
 writeFileSync(join(root,'src/styles/brand.css'),'/* Project-only: Fixture brand styles, not part of the design system */\n.button { min-height: 999px; }');
 assert.deepEqual(componentStyleSpecs(button,root).map(row=>row.value),['48px']);
} finally {rmSync(root,{recursive:true,force:true});}
console.log('Size specs include shared literals and exclude project-owned declarations.');

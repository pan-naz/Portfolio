import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { componentPresentation } from '../src/data/system-presentation.ts';

// Exercise the live catalog's computed-style reader, not the retired CSS table.
const source = readFileSync('src/scripts/design-system.ts', 'utf8');
const ast = ts.createSourceFile('design-system.ts', source, ts.ScriptTarget.Latest, true);
const declarations = ast.statements.filter(ts.isVariableStatement).flatMap(statement => [...statement.declarationList.declarations]);
const needed = ['hex', 'readable', 'refreshValues'].map(name => {
  const declaration = declarations.find(declaration => declaration.name.getText(ast) === name);
  assert.ok(declaration, `Live catalog reader ${name} exists`);
  return `const ${declaration.getText(ast)};`;
});
const rows = componentPresentation.TimelineRow.columns.flatMap(column => column.rows).filter(row => row.selector);
const nodes = rows.map(row => ({ dataset: { dsMeasure: row.selector, properties: row.properties }, textContent: '' }));
const large = { values: { 'font-size': '15.666px', 'font-weight': '500' } };
const small = { values: { 'font-size': '14px' } };
const samples = new Map([['.ds-specimens .experience-row [data-ds-heading]', large], ['.ds-specimens .experience-summary', small], ['.ds-specimens .experience-period', small]]);
const queries = [];
const view = {
  hidden: false,
  append() {},
  querySelectorAll(selector) { return selector === '[data-ds-measure]' ? nodes : []; },
  querySelector(selector) { queries.push(selector); return samples.get(selector); },
};
const context = vm.createContext({
  views: [view],
  document: { createElement: () => ({ style: {}, remove() {} }), querySelector: () => { throw Error('Specs must read their own specimen, never unrelated project artwork'); } },
  getComputedStyle: sample => ({ getPropertyValue: property => sample.values[property] || '' }),
});
vm.runInContext(ts.transpileModule(needed.join('\n') + '\nglobalThis.refresh = refreshValues;', { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context);
context.refresh();
assert.deepEqual(nodes.map(node => node.textContent), ['15.67px · Medium', '14px', '14px']);
assert.deepEqual(queries, [...samples.keys()], 'Spec sizes are read within the active component view');
large.values['font-size'] = '18px'; small.values['font-size'] = '13.333px';
context.refresh();
assert.deepEqual(nodes.map(node => node.textContent), ['18px · Medium', '13.33px', '13.33px'], 'Responsive/theme refresh reads current values, not a frozen table');
const catalog = readFileSync('dist/design-system/index.html', 'utf8');
for (const row of rows) assert.ok(catalog.includes(`data-ds-measure="${row.selector}" data-properties="${row.properties}"`), 'The compiled catalog connects its specs to the live reader');
console.log('Live catalog specs read scoped computed sizes, named weights and responsive updates from their actual specimens.');

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {documentationContract, documentationSections, validateDocumentationStructure} from '../scripts/documentation-contract.mjs';

for (const [file, required] of Object.entries(documentationContract)) {
  const path = resolve(import.meta.dirname, '../..', file);
  test(`${file}: standalone deployment does not require workspace documents`, () => {
    assert.deepEqual(validateDocumentationStructure(file, undefined), []);
  });
  // Synthetic documents keep the negative fixtures active in deployment checkouts too.
  const fixture = '# Document\n\n' + required.map(path => {
    const parts = path.split(' / ');
    return `${'#'.repeat(parts.length + 1)} ${parts.at(-1)}\n\nCurrent rule.\n`;
  }).join('\n');
  test(`${file}: required structure and ordinary prose changes`, () => {
    assert.deepEqual(validateDocumentationStructure(file, fixture), []);
    assert.deepEqual(validateDocumentationStructure(file, fixture.replaceAll('Current rule.', 'Updated current implementation rules.')), []);
    if (existsSync(path)) assert.deepEqual(validateDocumentationStructure(file, readFileSync(path, 'utf8')), []);
  });
  for (const section of required) test(`${file}: rejects missing ${section}`, () => {
    const parsed = documentationSections(fixture).find(item => item.path === section);
    const lines = fixture.split('\n');
    lines[parsed.line] = `${'#'.repeat(parsed.level)} Removed required section`;
    assert.ok(validateDocumentationStructure(file, lines.join('\n')).some(error => error.includes(section)));
  });
  test(`${file}: rejects empty and duplicate required sections`, () => {
    const first = required[0], heading = `## ${first}`;
    assert.ok(validateDocumentationStructure(file, fixture.replace(`${heading}\n\nCurrent rule.`, heading)).length);
    assert.ok(validateDocumentationStructure(file, `${fixture}\n${heading}\n\nDuplicate.\n`).length);
  });
}

test('section boundaries respect hierarchy and ignore fenced code headings', () => {
  const sections = documentationSections('# Doc\n## Parent\nRules.\n### Child\nDetails.\n```md\n## False section\n```\n### Next\nMore.\n## End\nDone.');
  assert.deepEqual(sections.map(item => item.path), ['Doc', 'Parent', 'Parent / Child', 'Parent / Next', 'End']);
  assert.ok(sections[2].body.includes('Details.'));
  assert.ok(!sections[2].body.includes('More.'));
  assert.ok(sections[1].body.includes('More.'));
});

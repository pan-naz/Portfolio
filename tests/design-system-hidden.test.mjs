import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {validateHiddenDocumentation} from '../scripts/validate-design-system.mjs';
import {hiddenDocumentation} from '../scripts/system-hidden-docs.ts';
const doc=existsSync('../docs/design-system.md')?readFileSync('../docs/design-system.md','utf8'):undefined;
assert.deepEqual(validateHiddenDocumentation(hiddenDocumentation,doc),[]);
assert.deepEqual(validateHiddenDocumentation(hiddenDocumentation),[],'Deployment does not require external docs');
assert.ok(validateHiddenDocumentation(hiddenDocumentation.slice(1),doc).length);
if(doc) assert.ok(validateHiddenDocumentation(hiddenDocumentation,doc.replace('### Wordmark','### Removed wordmark')).length);
if(doc) assert.deepEqual(validateHiddenDocumentation(hiddenDocumentation,doc.replace('### Writing','### Writing\nUpdated guidance.')),[],'Documentation edits do not require a code change');
console.log('Hidden documentation guard rejects missing records and sections without pinning document wording.');

const fixture=hiddenDocumentation.map(({section})=>`### ${section}\nDocumented, hidden. Current rules.\n`).join('\n');
assert.deepEqual(validateHiddenDocumentation(hiddenDocumentation,fixture),[]);
for(const {section} of hiddenDocumentation){
 const heading=`### ${section}\n`;
 assert.deepEqual(validateHiddenDocumentation(hiddenDocumentation,fixture.replace(heading,`### Missing ${section}\n`)),[`Missing hidden documentation: ${section}`]);
 assert.deepEqual(validateHiddenDocumentation(hiddenDocumentation,fixture.replace(heading+'Documented, hidden.',heading+'Current public rules.')),[`Missing hidden documentation: ${section}`]);
 assert.ok(validateHiddenDocumentation([...hiddenDocumentation,{section}],fixture).includes(`Missing hidden documentation: ${section}`));
}

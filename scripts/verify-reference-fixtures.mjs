import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const archive = path.resolve(import.meta.dirname, '../../reference-research');
if (!fs.existsSync(archive)) console.log('SKIP: optional local reference-research archive is absent; committed fixture tests remain self-contained.');
else {
  const records = JSON.parse(fs.readFileSync(new URL('../tests/fixtures/original-media.json', import.meta.url)));
  for (const [key, record] of Object.entries(records.media)) {
    const hash = createHash('sha256'); let size = 0;
    for (const source of record.sources) { const bytes = fs.readFileSync(path.join(archive, source)); hash.update(bytes); size += bytes.length; }
    assert.equal(size, record.size, key); assert.equal(hash.digest('hex'), record.sha256, key);
  }
  for (const [key, record] of Object.entries(records.documents)) {
    const bytes = fs.readFileSync(path.join(archive, key));
    assert.equal(bytes.length, record.size, key);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, key);
  }
  console.log(`PASS: ${Object.keys(records.media).length} original fingerprints and ${Object.keys(records.documents).length} source JSON fingerprints reverified against the local archive.`);
}

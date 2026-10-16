import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateHeroFrame } from '../scripts/validate-hero-frame.mjs';

const root = path.resolve(import.meta.dirname, '..');
assert.deepEqual(validateHeroFrame(root), []);
// Reject the original mismatch and interrupted-return colour jumps.
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hero-frame-'));
try {
  for (const file of ['src/styles/tokens.css', 'src/styles/global.css', 'src/scripts/case-study/case-studies.ts']) {
    fs.mkdirSync(path.dirname(path.join(fixture, file)), { recursive: true });
    fs.copyFileSync(path.join(root, file), path.join(fixture, file));
  }
  const cssFile = path.join(fixture, 'src/styles/global.css'), css = fs.readFileSync(cssFile, 'utf8');
  fs.writeFileSync(cssFile, css.replace('border: 4px solid var(--color-media-frame);', 'border: 4px solid var(--color-bg-canvas);'));
  assert.ok(validateHeroFrame(fixture).length, 'Canvas-only border regression fails');
  fs.writeFileSync(cssFile, css);
  const file = path.join(fixture, 'src/scripts/case-study/case-studies.ts');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('borderColor: getComputedStyle(artwork ?? hero).borderTopColor', 'borderColor: frameColor(hero)'));
  assert.ok(validateHeroFrame(fixture).length, 'Interrupted travel must use its painted starting colour');
} finally { fs.rmSync(fixture, { recursive: true, force: true }); }
console.log('PASS: shared hero-frame colour, fixed-Light cards and continuous open/close endpoints.');

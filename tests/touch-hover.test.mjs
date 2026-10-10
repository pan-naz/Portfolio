import assert from 'node:assert/strict';
import {unguardedHoverRules,validateHoverSource} from '../scripts/validate-hover.mjs';
assert.deepEqual(validateHoverSource(),[]);
assert.equal(unguardedHoverRules('.button:hover {color:red}').length,1);
assert.equal(unguardedHoverRules('@media (hover: hover){.button:hover{color:red}}').length,1);
assert.deepEqual(unguardedHoverRules('@media (hover: hover) and (pointer: fine){.button:hover{color:red}}'),[]);
assert.deepEqual(unguardedHoverRules('.button:focus-visible,.button:active {color:red}'),[]);
console.log('Touch hover guard requires both fine pointer and hover capability, while retaining focus and press states.');

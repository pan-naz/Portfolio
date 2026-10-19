import assert from 'node:assert/strict';
import {validateDecisionCard} from '../scripts/validate-decision-card.mjs';
import {arrangeProjectCards} from '../src/scripts/work-filter/work-filter-model.ts';
assert.deepEqual(validateDecisionCard(),[]);
const heights=[320,296,260,285,270,250],packed=arrangeProjectCards(heights,2,24,'alternate');
assert.deepEqual(packed.positions.map(p=>p.column),[0,1,0,1,0,1]);
for(let i=2;i<heights.length;i++)assert.equal(packed.positions[i].top-packed.positions[i-2].top-heights[i-2],24);
assert.deepEqual(arrangeProjectCards(heights,2,24).positions.map(p=>p.column),[0,1,1,0,1,0]);
console.log('Genuine Decision examples/API, natural tokens, and shared alternating masonry verified.');

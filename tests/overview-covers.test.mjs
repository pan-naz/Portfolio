import assert from 'node:assert/strict';import fs from 'node:fs';import {validateOverviewCovers,validateOverviewManifest} from '../scripts/validate-overview-covers.mjs';
const directory='public/design-system/covers/',manifest=JSON.parse(fs.readFileSync(directory+'manifest.json')),read=name=>fs.readFileSync(directory+name);
assert.deepEqual(validateOverviewCovers(),[]);
assert(validateOverviewManifest({...manifest,covers:manifest.covers.slice(1)},read).length,'A missing theme image fails');
assert(validateOverviewManifest({...manifest,covers:[...manifest.covers.slice(1),manifest.covers[1]]},read).length,'Duplicate covers fail');
assert(validateOverviewManifest({...manifest,scale:1},read).length,'Covers must be 2x');
assert(validateOverviewManifest(manifest,()=>Buffer.from('stale')).length,'Changed or corrupt assets fail');
assert(validateOverviewManifest({...manifest,covers:manifest.covers.map(c=>({...c,width:304}))},read).length,'Wrong raster geometry fails');
console.log('PASS: 26 recorded 2x decorative covers, CSS theme selection, no runtime cover modes or fitting; missing, duplicate, stale and wrong-size assets fail.');

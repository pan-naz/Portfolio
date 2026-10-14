import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateCatalogNavigation} from '../scripts/validate-design-system.mjs';
const read=file=>readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
const inputs=[{BaseLayout:read('layouts/BaseLayout.astro'),DSLayout:read('layouts/DSLayout.astro')},read('components/DSNavigation.astro'),read('scripts/design-system.ts'),read('styles/design-system.css')];
assert.deepEqual(validateCatalogNavigation(...inputs),[]);
for(const [index,from,to] of [[1,'<NavigationItem label={label}','<a label={link.label}'],[1,'aria-label="Design system sections"',''],[2,"phone.matches&&requested==='dashboard'?'color':requested","requested"],[2,'workstagelayoutchange','otherchange'],[2,'focusin','otherfocus'],[3,"html[data-work-stage-layout='true'] .ds-sidebar","html .ds-sidebar"]]) {
 const altered=[...inputs];altered[index]=inputs[index].replace(from,to);assert(validateCatalogNavigation(...altered).length,`Reject missing navigation contract: ${from}`);
}
assert(validateCatalogNavigation({...inputs[0],DSLayout:inputs[0].DSLayout.replace('layout-capabilities.js?raw','second-layout.js?raw')},...inputs.slice(1)).length);
console.log('PASS: shared initializer, real NavigationItem links, phone default, active/focus scrolling and layout contract.');

import assert from 'node:assert/strict';import fs from 'node:fs';import {validateTitleAlignment} from '../scripts/validate-title-alignment.mjs';
assert.deepEqual(validateTitleAlignment(),[]);
const heading=fs.readFileSync('src/components/SectionHeading.astro','utf8');
assert(heading.includes("layout === 'columns' && 'title-align-line'"));
assert(heading.includes("Astro.slots.has('index') ? 'title-align-control' : 'title-align-text'"));
for(const name of ['YellowLeaf','PetCare','GutsulMade','IndexLawFirm','DesignCup','Square','Cravus','PromShyna','TeamSternfit','Recording']){const source=fs.readFileSync(`src/components/${name}CaseStudy.astro`,'utf8');assert(source.includes('title-pair')&&source.includes('<AlignedChapterCopy>'),name+' split copy must use the shared primitive');}
assert(fs.readFileSync('src/components/PromShynaCaseStudy.astro','utf8').includes('promshyna-rail title-align-line'));

assert(fs.readFileSync('src/styles/promshyna-case-study.css','utf8').includes('.promshyna-rail > .title-align-control { z-index: var(--layer-content);'));

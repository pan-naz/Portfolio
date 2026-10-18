import assert from 'node:assert/strict';import fs from 'node:fs';
import {statisticExamples,statisticNumber} from '../src/data/system-statistic.ts';
import {testingMetrics,solutionMetric} from '../src/data/voximplant-case-study.ts';
import {researchMetrics} from '../src/data/datagpt-case-study.ts';
import {sectionHeadingExamples} from '../src/data/system-section-heading.ts';
import {impactHeading,experienceHeading,hookoProblemHeading} from '../src/data/section-copy.ts';
assert.equal(statisticExamples.case,testingMetrics[3]);assert.equal(statisticExamples.bare,researchMetrics[0]);assert.equal(statisticNumber,solutionMetric);
assert.equal(sectionHeadingExamples.columns,impactHeading);assert.equal(sectionHeadingExamples.action,experienceHeading);assert.equal(sectionHeadingExamples.stacked,hookoProblemHeading);
const read=file=>fs.readFileSync(file,'utf8');
assert(!('gsap' in JSON.parse(read('package.json')).dependencies));
assert(read('src/components/VoximplantCaseStudy.astro').includes('metric-grid metric-grid--four'));
assert(read('src/components/DSStatistics.astro').includes('metric-grid metric-grid--four'));
assert(!read('src/components/DSStatistics.astro').includes('statisticProbeCss'));
for(const file of ['geometry-exceptions.json','radius-language-exceptions.json','system-guidelines.ts','system-hidden-docs.ts','typography-exclusions.ts']){assert(fs.existsSync('scripts/'+file));assert(!fs.existsSync('src/data/'+file));}
assert(fs.existsSync('scripts/static-preview.css'));assert(fs.existsSync('src/scripts/layout-capabilities.js'));
console.log('PASS: website/catalog share copy and metric layout; check-only fixtures stay outside delivered source; GSAP is absent.');

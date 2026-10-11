import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projects,collectionProjects} from '../src/data/portfolio.ts';

const routes=['index.html','404.html',...[...projects,...collectionProjects].map(p=>`case-studies/${p.id}/index.html`)];
let controls=0;
for(const route of routes){
 const html=readFileSync(new URL(`../dist/${route}`,import.meta.url),'utf8');
 assert.ok(!html.includes('class="skip-link"'),`${route}: website pages follow the approved logo-first/no-skip-link contract`);
 for(const match of html.matchAll(/<(a|button|input|select|textarea)\b([^>]*)>/g)){
  const [,tag,attributes]=match;
  if(tag==='a'&&!/\bhref=/.test(attributes))continue;
  const indexes=[...attributes.matchAll(/\btabindex="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(indexes.length,1,`${route}: ${tag} must declare its native-order index exactly once`);
  assert.ok(indexes[0]==='0'||(indexes[0]==='-1'&&attributes.includes('aria-label="Project cursor"')),`${route}: unexpected tab index ${indexes[0]}`);
  controls++;
 }
}
const home=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const first=home.match(/<(a|button|input|select|textarea)\b[^>]*>/)?.[0];
assert.ok(first.includes('data-home-top')&&first.includes('tabindex="0"'),'The first website control is the real header home logo');
assert.ok(home.includes('tabindex="-1" class="icon-button floating-control-theme floating-control-surface"')||/<button\b(?=[^>]*aria-label="Project cursor")(?=[^>]*tabindex="-1")[^>]*>/.test(home),'The decorative project cursor stays outside the Tab order');
console.log(`PASS: ${controls} native controls on ${routes.length} website routes use natural Tab order; the logo is first and explicit negative overrides remain.`);

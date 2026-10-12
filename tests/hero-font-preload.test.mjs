import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const html=fs.readFileSync('dist/index.html','utf8');
const links=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>m[0]).filter(tag=>/rel="preload"/.test(tag)&&/as="font"/.test(tag));
assert.equal(links.length,2,'Preload exactly the two hero families');
const css=fs.readdirSync('dist/_astro').filter(n=>n.endsWith('.css')).map(n=>fs.readFileSync(path.join('dist/_astro',n),'utf8')).join('\n');
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for(const family of ['urbanist','funnel-display']){
 const tag=links.find(tag=>tag.includes(`${family}-latin-wght-normal.`));assert.ok(tag);
 assert.match(tag,/type="font\/woff2"/);assert.match(tag,/\bcrossorigin(?:="(?:anonymous)?")?(?:\s|\/?>)/);
 const href=tag.match(/href="([^"]+)"/)[1];assert.ok(href.startsWith('/_astro/'));assert.ok(css.includes(path.basename(href)),'CSS and preload share the same compiled font URL');
 assert.equal(digest(`dist${href}`),digest(`node_modules/@fontsource-variable/${family}/files/${family}-latin-wght-normal.woff2`),'Preload the original built normal variable Latin WOFF2');
}
console.log('PASS: exactly two same-byte built hero fonts, anonymous CORS and matching CSS URLs.');

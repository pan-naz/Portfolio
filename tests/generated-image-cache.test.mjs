import assert from 'node:assert/strict';
import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));
const generated=config.headers.filter(rule=>rule.source.startsWith('/generated/images/'));
assert.equal(generated.length,1);
assert.deepEqual(generated[0].headers,[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]);
const matches=new RegExp(`^${generated[0].source}$`);
const files=fs.readdirSync('public/generated/images').filter(file=>/\.(?:avif|webp)$/.test(file));
assert.ok(files.length>0);
for(const file of files){assert.match(file,/^[a-f0-9]{16}-[0-9]+\.(avif|webp)$/,'Only content-hashed candidates get the immutable policy');assert.ok(matches.test(`/generated/images/${file}`),file);}
for(const url of ['/generated/images/manifest.json','/projects/example.jpg','/_astro/font.woff2','/favicon.svg','/robots.txt'])assert.equal(matches.test(url),false,url);
assert.deepEqual(config.headers.filter(rule=>rule!==generated[0]),[
 {source:'/(.*)',headers:[
  {key:'X-Content-Type-Options',value:'nosniff'},
  {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
  {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  {key:'Content-Security-Policy',value:"frame-ancestors 'self'"},
 ]},
 {source:'/projects/(.*)',headers:[{key:'Cache-Control',value:'public, max-age=3600, must-revalidate'}]},
],'All previous security and project caching rules stay unchanged');
console.log(`PASS: ${files.length} hashed images match; manifest and unrelated paths excluded; previous rules unchanged.`);

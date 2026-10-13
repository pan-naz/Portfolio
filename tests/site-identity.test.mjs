import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { profile, projects, collectionProjects, cvUrl } from '../src/data/portfolio.ts';
import { siteTitle, indexingEnabled } from '../src/data/site-config.ts';

const filesUnder = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? filesUnder(resolve(directory, entry.name)) : [resolve(directory, entry.name)]);
const decode = value => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)]));
const names = /Nazarii|Nazariy|Pankiv/i;
const sharingDescription = 'Product designer in SaaS, UX research and design systems. Lead Product Designer at DataGPT, previously at Voximplant.';
const searchDescription = 'Nazarii Pankiv, product designer in SaaS, UX research and design systems. Lead Product Designer at DataGPT, previously at Voximplant.';
const expectedLinks = ['https://www.linkedin.com/in/nazariypankiv/', 'https://www.behance.net/NazariyPankiv', 'https://dribbble.com/NazariyPankiv'];
assert.equal(siteTitle, 'naz');
assert.equal(indexingEnabled, false);
assert.deepEqual(profile.sameAs, expectedLinks);
assert.equal(profile.linkedin, profile.sameAs[0]);
const pageTitles = new Map([['index.html', siteTitle], ['design-system/index.html', 'Design system'], ['404.html', 'Page not found'], ...[...projects, ...collectionProjects].map(project => [`case-studies/${project.id}/index.html`, project.title])]);
const pages = filesUnder('dist').filter(file => file.endsWith('.html'));
assert.equal(pages.length, 23);
for (const page of pages) {
  const route = relative(resolve('dist'), page);
  const home = route === 'index.html';
  const html = readFileSync(page, 'utf8');
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
  assert.equal(title, pageTitles.get(route), `${route}: preserve the approved page title`);
  assert.ok(!names.test(title), `${route}: names never appear in tab titles`);
  const metadata = [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => ({ tag, ...attrs(tag) }));
  const meta = key => metadata.find(item => (item.name || item.property) === key);
  assert.equal(meta('og:title')?.content, title);
  if (meta('og:image')) assert.equal(meta('og:image:alt')?.content, title);
  assert.equal(meta('robots')?.content, 'noindex, nofollow');
  for (const item of metadata.filter(item => /^(og:|twitter:)/.test(item.name || item.property || ''))) {
    assert.ok(!names.test(item.content || ''), `${route}: personal names cannot leak into ${item.name || item.property}`);
  }
  const scripts = [...html.matchAll(/<script\b(?=[^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, home ? 1 : 0, `${route}: one home-only JSON-LD graph`);
  let remainder = html;
  if (home) {
    assert.equal(meta('description')?.content, searchDescription);
    assert.equal(meta('og:description')?.content, sharingDescription);
    const siteUrl = attrs(html.match(/<link\b(?=[^>]*rel="canonical")[^>]*>/)?.[0] || '').href;
    assert.equal(siteUrl, 'https://naz.wtf/');
    assert.deepEqual(JSON.parse(scripts[0][1]), {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebSite', name: siteTitle, alternateName: profile.brand, url: siteUrl },
        { '@type': 'Person', name: profile.name, alternateName: ['Nazariy Pankiv', 'Nazar Pankiv'], jobTitle: profile.title, url: siteUrl, sameAs: profile.sameAs },
      ],
    });
    remainder = remainder.replace(scripts[0][0], '').replace(meta('description').tag, '');
    const footer = remainder.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];
    const caption = footer?.match(/<p>© \d{4} Nazarii Pankiv<\/p>/)?.[0];
    assert.ok(caption, 'The one visible name is the approved footer caption');
    assert.equal((footer.match(/Nazarii Pankiv/g) || []).length, 1);
    remainder = remainder.replace(caption, '');
  }
  // Exempt only the exact approved destinations, never visible labels or arbitrary attributes.
  remainder = remainder.replaceAll(`href="${profile.linkedin}"`, '').replaceAll(`href="${cvUrl}"`, '').replaceAll(`download="${cvUrl.slice(1)}"`, '');
  assert.ok(!names.test(remainder), `${route}: personal names occur outside the permitted locations`);
  assert.ok(!/Head of Design|Design Lead/i.test(html), `${route}: incorrect job titles must not ship`);
}
for (const file of filesUnder('dist/_astro').filter(file => /\.(?:js|css)$/.test(file))) {
  const text = readFileSync(file, 'utf8').replaceAll(profile.linkedin, '').replaceAll(cvUrl, '');
  assert.ok(!names.test(text), `${relative(resolve('dist'), file)}: names must not leak into client assets`);
  assert.ok(!/Head of Design|Design Lead/i.test(text));
}
console.log('PASS: 23 built pages keep project titles, naz home metadata, the exact home-only JSON-LD graph, permitted name locations and noindex.');

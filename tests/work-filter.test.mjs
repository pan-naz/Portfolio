import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initialWorkFilter, matchesWorkFilter, workFilterHash } from '../src/scripts/work-filter.ts';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
assert.equal(matchesWorkFilter('selected', 'selected'), true);
assert.equal(matchesWorkFilter('selected', 'websites'), false);
assert.equal(matchesWorkFilter('selected', 'misc'), false);
assert.equal(matchesWorkFilter('websites', 'websites'), true);
assert.equal(matchesWorkFilter('websites', 'misc'), false);
assert.equal(matchesWorkFilter('misc', 'misc'), true);
for (const filter of ['selected', 'websites', 'misc']) {
  const hash = workFilterHash(filter);
  assert.equal(hash, filter === 'selected' ? '' : `#${filter}`);
  assert.equal(initialWorkFilter(hash), filter, 'The URL hash determines the initial category');
}
for (const hash of ['#other', '#__proto__', '#constructor', '#work', '#about', '#selected', '#Websites', '', null, 12]) {
  assert.equal(initialWorkFilter(hash), 'selected', 'Unknown or empty hashes use Selected work');
}
const filter = read('../src/components/SectionNavigation.astro');
const links = read('../src/components/NavLinks.astro');
const item = read('../src/components/NavigationItem.astro');
for (const label of ['Selected work', 'Websites', 'Misc']) assert.ok(filter.includes(label));
assert.ok(filter.includes('controls="project-list"') && filter.includes('pressed={index === 0}'));
assert.ok(filter.includes("import NavigationItem from './NavigationItem.astro'"));
assert.ok(links.includes("import NavigationItem from './NavigationItem.astro'"));
assert.ok(item.includes('navigation-item-indicator') && item.includes('navigation-item-label') && item.includes('aria-pressed'));
const css = read('../src/styles/global.css');
const tokens = read('../src/styles/tokens.css');
assert.ok(/\.navigation-item-indicator\s*\{[^}]*width: 6px[^}]*height: 6px/.test(css));
assert.ok(/\.navigation-item\s*\{[^}]*--navigation-item-shift: 12px/.test(css));
assert.ok(/\.navigation-item-indicator\s*\{[^}]*opacity: 0[^}]*translate3d\(-6px,-50%,0\) scale\(0\)/.test(css));
assert.ok(/\.navigation-item-indicator\s*\{[^}]*transform-origin: 50% 50%[^}]*var\(--duration-navigation\)/.test(css));
assert.ok(tokens.includes('--duration-navigation: 420ms'));
assert.ok(/\.navigation-item-indicator\s*\{[^}]*var\(--duration-navigation\) var\(--ease-entrance\)/.test(css));
assert.ok(/\[aria-current\][^}]*\[aria-pressed='true'\][^{]*\.navigation-item-indicator\s*\{[^}]*opacity: 1[^}]*translate3d\(0,-50%,0\) scale\(1\)/.test(css));
assert.ok(/\.navigation-item\s*\{[^}]*--navigation-item-padding-inline: var\(--space-3\)[^}]*padding: 10px var\(--navigation-item-padding-inline\)/.test(css));
assert.ok(tokens.includes('--space-3: 12px;'), 'The navigation padding alias preserves its exact 12px value');
assert.ok(!/\[aria-current\][^}]*\[aria-pressed='true'\][^{]*\{[^}]*padding-inline-end/.test(css));
assert.ok(!/\[aria-current\][^{]*\{[^}]*background:/.test(css));
console.log('PASS: real project filters, pressed semantics, live status and one shared push-dot navigation item.');

const { arrangeProjectCards } = await import('../src/scripts/work-filter-model.ts');
const { projects, collectionProjects } = await import('../src/data/portfolio.ts');
const allProjects = [...projects, ...collectionProjects];
assert.equal(projects.length, 3);
assert.deepEqual(collectionProjects.filter(p => p.category === 'websites').map(p => p.id), ['gutsul-made', 'peak-hotel', 'yellow-leaf', 'index-law-firm', 'blaustrom', 'promshyna', 'cravus', 'team-sternfit'], 'Team Sternfit follows Cravus while the earlier Websites retain their order');
assert.deepEqual(collectionProjects.filter(p => p.category === 'misc').map(p => p.id), ['pet-care', 'telegram-file-picker', 'square', 'kitchen-chatbot', 'design-cup', 'voximplant-ivr', 'offf-conference', 'professions-in-digital', 'quit-university'], 'Picker Concept stays second and Quit University follows Professions in Misc');
assert.equal(new Set(allProjects.map(p => p.id)).size, 20, 'All three collections have distinct project identities');
assert.ok(allProjects.every(p => !('placeholder' in p) && !p.image.startsWith('/projects/concepts/')), 'No fictional project or stock placeholder remains');
const heights = [400, 550, 500, 460, 620, 330, 580];
for (const columns of [1, 2]) {
  const packed = arrangeProjectCards(heights, columns, 24);
  const bottoms = Array(columns).fill(0);
  packed.positions.forEach(({ column, top }, i) => {
    assert.equal(top, bottoms[column], 'Each card follows the prior card with an exact gap');
    assert.equal(top, Math.min(...bottoms), 'The next card occupies the shortest available column');
    bottoms[column] = top + heights[i] + 24;
    if (i) assert.ok(top >= packed.positions[i - 1].top, 'Visual reading order follows source order');
  });
  assert.equal(packed.height, Math.max(...bottoms) - 24, 'Collection ends exactly at the lowest card');
}
assert.deepEqual(arrangeProjectCards([], 2, 24), { positions: [], height: 0 });
console.log('PASS: three distinct real-project collections, nine original Misc projects, natural-height masonry, responsive source order and precise last-card bounds.');

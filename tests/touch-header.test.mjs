import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateNoMobileMenu } from '../scripts/validate-design-system.mjs';
const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
assert.deepEqual(validateNoMobileMenu({ header: '<header />' }, { sun: {} }), []);
for (const obsolete of ['menu-toggle', 'mobile-menu', 'menu-close', 'menu-open', 'backdrop-menu', 'drawer-in', 'drawer-out', 'Open navigation']) {
  assert.ok(validateNoMobileMenu({ header: obsolete }, {}).length, `Reject reintroduced ${obsolete}`);
}
assert.ok(validateNoMobileMenu({}, { menu: {} }).length, 'Reject the unused menu icon');
const header = read('src/components/SiteHeader.astro');
assert.ok(header.includes('<NavLinks showDS={false}') && header.includes('<ThemeToggle') && header.includes('naz.wtf — home'));
const contact = read('src/components/ContactSection.astro');
for (const destination of ['mailto:${profile.email}', 'href={cvUrl}', 'href={profile.linkedin}']) assert.ok(contact.includes(destination), 'Contact retains every destination');
const morph = read('src/scripts/header-morph/header-morph.ts');
assert.ok(morph.includes('navigation.hidden = hideLinks') && morph.includes('controls.offsetWidth') && morph.includes('document.fonts.ready.then(measure)'), 'Fit uses real font-ready controls');
assert.ok(!morph.includes('mobile.matches') && !morph.includes('(max-width: 767px)'), 'No touch-only morph geometry remains');
console.log('PASS: menu removal, preserved destinations, shared floating condition and measured normal-header fit');

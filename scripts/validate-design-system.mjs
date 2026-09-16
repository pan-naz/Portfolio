import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const source = read('src/data/ds-components.ts');
const registry = JSON.parse(source.slice(source.indexOf('['), source.lastIndexOf(']') + 1));
const catalog = read('src/components/DSCatalog.astro');
const sections = new Set([...catalog.matchAll(/<(?:section|DSExample)\s+id="([^"]+)"/g)].map(match => match[1]));
function filesUnder(directory) {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap(entry => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}
const websitePages = filesUnder('src/pages').filter(path => path.endsWith('.astro') && !path.startsWith('src/pages/design-system'));
function validatePage(path, source) {
  // Routes compose components. Only unstyled page wrappers and script wiring live here.
  const markup = source.replace(/^---[\s\S]*?---/, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const errors = [];
  for (const match of markup.matchAll(/<([a-z][\w-]*)\b([^>]*?)>/g)) {
    if (!['div', 'main'].includes(match[1]) || /\b(?:class(?::list)?|style)\s*=/.test(match[2])) {
      errors.push(`Page must compose shared components: ${path} contains inline <${match[1]}> design.`);
    }
  }
  return errors;
}
function componentsReachableFrom(entry, seen = new Set()) {
  const path = resolve(root, entry);
  if (seen.has(path)) return seen;
  seen.add(path);
  for (const match of readFileSync(path, 'utf8').matchAll(/import\s+[\s\S]*?from\s+['"]([^'"]+\.astro)['"]/g)) {
    componentsReachableFrom(resolve(dirname(path), match[1]), seen);
  }
  return seen;
}
const website = new Set(websitePages.flatMap(path => [...componentsReachableFrom(path)]));
// Website previews currently embed the homepage. A component on a different route
// needs a direct specimen until that route has its own live preview.
const livePreview = componentsReachableFrom('src/pages/design-system/preview.astro');
const specimens = componentsReachableFrom('src/pages/design-system.astro');
function validate(entries, consumers = website) {
  const errors = [];
  const names = new Set();
  for (const item of entries) {
    if (names.has(item.name)) errors.push(`Duplicate component: ${item.name}`);
    names.add(item.name);
    const path = resolve(root, `src/components/${item.name}.astro`);
    if (!existsSync(path)) errors.push(`Missing component: ${item.name}`);
    if (!consumers.has(path)) errors.push(`Unused shared component: ${item.name}`);
    if (!sections.has(item.section)) errors.push(`Missing documentation section: ${item.name} → ${item.section}`);
    if (!['direct', 'website'].includes(item.preview)) errors.push(`Unknown preview kind: ${item.name}`);
    if (!(item.preview === 'direct' ? specimens : livePreview).has(path)) errors.push(`Preview does not render ${item.name}`);
  }
  for (const path of filesUnder('src/components')) {
    // Explicit catalog infrastructure; a DS prefix is not a registration escape hatch.
    if (!path.endsWith('.astro') || ['DSNavigation', 'DSExample', 'DSSitePreview', 'DSCatalog'].some(name => path === `src/components/${name}.astro`)) continue;
    const name = path.replace('src/components/', '').replace(/\.astro$/, '');
    if (!names.has(name)) errors.push(`Undocumented shared component: ${name}.astro`);
  }
  for (const path of websitePages) errors.push(...validatePage(path, read(path)));
  if (/<(?:button|a)\b[^>]*\bclass=["'][^"']*\b(?:button|icon-button)\b/.test(catalog)) errors.push('Catalog must import shared controls instead of copying their markup.');
  if (!catalog.includes('<DSSitePreview')) errors.push('The actual website preview is missing.');
  const previewSource = read('src/components/DSSitePreview.astro');
  if (!/<iframe\b[^>]*src="\/design-system\/preview\/"/.test(previewSource)) errors.push('Website preview must load the static shared composition.');
  if (!previewSource.includes('sandbox="allow-same-origin"')) errors.push('Static preview must block scripts.');
  const previewPage = read('src/pages/design-system/preview.astro');
  if (!previewPage.includes('<PortfolioPage') || previewPage.includes('<script')) errors.push('Static preview must share PortfolioPage and load no scripts.');
  if (!read('src/pages/index.astro').includes('<PortfolioPage')) errors.push('Homepage must use the same PortfolioPage as the static preview.');
  if (read('src/layouts/DSLayout.astro').includes('<script')) errors.push('Static DS layout must not load website scripts.');
  for (const path of ['src/pages/design-system.astro', 'src/pages/design-system/preview.astro']) errors.push(...validatePage(path, read(path)));
  const navigation = read('src/data/design-system.ts');
  for (const [,id] of navigation.matchAll(/\['([\w-]+)',\s*'[^']+'\]/g)) {
    if (!sections.has(id)) errors.push(`Navigation target missing: ${id}`);
  }
  const css = read('src/styles/design-system.css');
  for (const match of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
    const selector = match[1].trim();
    if (!selector.includes('.ds-')) continue;
    // Frozen interaction state specimens are deliberately explicit, inert examples.
    if (selector.includes('.ds-state-example')) continue;
    if (/\.(?:button|wordmark|arrow|nav-link|desktop-nav|skill-tag|project(?:-[\w-]+)?|placeholder-[\w-]+|theme-toggle|icon-button|hero(?:-[\w-]+)?)\b/.test(selector)) {
      errors.push(`Catalog CSS overrides a shared component: ${selector}`);
    }
  }
  return errors;
}
const errors = validate(registry);
if (process.argv.includes('--self-test')) {
  const missing = validate(registry.filter(item => item.name !== 'Button'));
  const broken = validate(registry.map(item => item.name === 'Button' ? { ...item, section: 'missing-section' } : item));
  const withoutButton = new Set(website);
  withoutButton.delete(resolve(root, 'src/components/Button.astro'));
  const unused = validate(registry, withoutButton);
  if (!missing.some(error => error.includes('Undocumented shared component: Button')) || !broken.some(error => error.includes('Missing documentation section: Button')) || !unused.some(error => error.includes('Unused shared component: Button'))) {
    throw new Error('Design-system guard failed to reject broken fixtures.');
  }
  for (const markup of ['<section>New section</section>', '<a href="/">Action</a>', '<div class="new-card">Card</div>', '<style>main { color: red }</style>']) {
    if (!validatePage('src/pages/work/example.astro', markup).length) throw new Error(`Page guard accepted inline design: ${markup}`);
  }
  if (validatePage('src/pages/work/example.astro', '---\nconst text = "<button>";\n---\n<main id="main"><WorkSection /></main><script>const text = "<button>";</script>').length) throw new Error('Page guard rejected valid composition.');
  console.log('Design-system guard self-test passed (unused components, missing registration, broken anchors and inline route designs rejected).');
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Design-system contract verified: ${registry.length} shared components used by the website, actual previews, stable section targets, no catalog style forks.`);

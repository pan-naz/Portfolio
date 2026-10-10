import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { icons } from '../src/data/icons.ts';
import { buildSystemInventory } from '../src/data/system-inventory.ts';
import { componentVariants } from '../src/data/system-variants.ts';
import { componentManifest, isReusableComponent } from '../src/data/system-components.ts';
import { dsComponents as registry } from '../src/data/ds-components.ts';
import { dsGroups } from '../src/data/design-system.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const catalog = read('src/components/DSCatalog.astro');
const sections = new Set(dsGroups.flatMap(group => group.links.map(([id]) => id)));
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
function selectorUses(source, selector, declaration) {
  return [...source.matchAll(/([^{}]+)\{([^{}]*)\}/g)].some(([, selectors, body]) =>
    selectors.split(',').map(value => value.trim()).includes(selector) && body.includes(declaration)
  );
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
export function validateComponentClassification(files, used, manifest, shown) {
  const failures = [];
  const kinds = ['reusable-ui', 'page-section', 'case-study', 'internal-helper'];
  for (const file of files) {
    const entries = manifest.filter(item => item.file === file);
    if (entries.length !== 1) failures.push(`Unclassified or duplicate component: ${file}`);
    else if (!kinds.includes(entries[0].kind)) failures.push(`Invalid component kind: ${file}`);
  }
  for (const item of manifest) {
    if (!files.includes(item.file)) failures.push(`Stale classification: ${item.file}`);
    if (item.kind === 'reusable-ui' && (!used.includes(item.file) || !shown.includes(item.file))) failures.push(`Missing or unused reusable UI: ${item.file}`);
  }
  for (const file of shown) if (!used.includes(file) || !manifest.some(item => item.file === file && item.kind === 'reusable-ui')) failures.push(`Non-reusable component shown: ${file}`);
  return failures;
}
const specimens = componentsReachableFrom('src/pages/design-system.astro');
function validate(entries) {
  const errors = [];
  const names = new Set();
  for (const item of entries) {
    if (names.has(item.name)) errors.push(`Duplicate component: ${item.name}`);
    names.add(item.name);
    const path = resolve(root, `src/components/${item.name}.astro`);
    if (!existsSync(path)) errors.push(`Missing component: ${item.name}`);
    if (!sections.has(item.section)) errors.push(`Missing documentation section: ${item.name} → ${item.section}`);
    if (!['direct', 'documentation'].includes(item.preview)) errors.push(`Unknown preview kind: ${item.name}`);
    if (item.preview === 'direct' && !specimens.has(path)) errors.push(`Catalog does not render ${item.name}`);
  }
  for (const path of websitePages) errors.push(...validatePage(path, read(path)));
  if (/<(?:button|a)\b[^>]*\bclass=["'][^"']*\b(?:button|icon-button)\b/.test(catalog)) errors.push('Catalog must import shared controls instead of copying their markup.');
  const layout = read('src/layouts/DSLayout.astro');
  const modules = [...layout.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(([, body]) => body.trim());
  if (modules.length !== 1 || modules[0] !== "import '../scripts/theme';") errors.push('Catalog layout may load only the shared theme controller.');
  if (/scripts\/(?:home|hero|footer|work|case-study)/.test(layout)) errors.push('Catalog must not load website animation controllers.');
  errors.push(...validatePage('src/pages/design-system.astro', read('src/pages/design-system.astro')));
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
  const tokens = read('src/styles/tokens.css');
  if (!/--font-weight-heading:\s*500\s*;/.test(tokens)) errors.push('Shared Heading/M weight token must resolve to 500.');
  if (!/--font-weight-body-m-strong:\s*500\s*;/.test(tokens)) errors.push('Shared Body/M Strong weight token must resolve to 500.');
  if (!/--font-weight-heading-large:\s*400\s*;/.test(tokens)) errors.push('Shared large-heading weight token must resolve to 400.');
  if (!/--font-weight-label-m:\s*500\s*;/.test(tokens)) errors.push('Shared Label/M weight token must resolve to 500.');
  const headingWeight = 'font-weight: var(--font-weight-heading)';
  const linkedSelectors = [
    ['src/styles/global.css', '.wordmark'],
    ['src/styles/global.css', '.project-identity'],
  ];
  for (const [path, selector] of linkedSelectors) {
    if (!selectorUses(read(path), selector, headingWeight)) errors.push(`${selector} must consume --font-weight-heading in ${path}.`);
  }
  const largeHeadingWeight = 'font-weight: var(--font-weight-heading-large)';
  const largeHeadingSelectors = [
    ['src/styles/global.css', '.text-heading-xl'],
    ['src/styles/global.css', '.text-heading-l'],
    ['src/styles/global.css', '.stat-value'],
    ['src/styles/case-study-narrative.css', '.case-study-heading'],
    ['src/styles/voximplant-case-study.css', '.vox-solution-stats strong'],
  ];
  for (const [path, selector] of largeHeadingSelectors) {
    if (!selectorUses(read(path), selector, largeHeadingWeight)) errors.push(`${selector} must consume --font-weight-heading-large in ${path}.`);
  }
  const labelWeight = 'font-weight: var(--font-weight-label-m)';
  const labelSelectors = [
    ['src/styles/global.css', '.eyebrow'],
    ['src/styles/global.css', '.hero-eyebrow'],
    ['src/styles/case-study-narrative.css', '.case-study-eyebrow'],
  ];
  for (const [path, selector] of labelSelectors) {
    if (!selectorUses(read(path), selector, labelWeight)) errors.push(`${selector} must consume --font-weight-label-m in ${path}.`);
  }
  return errors;
}
const errors = validate(registry);
errors.push(...validateComponentClassification(filesUnder('src/components').filter(file => file.endsWith('.astro')), [...new Set(websitePages.flatMap(page => [...componentsReachableFrom(page)]))].map(file => file.slice(root.length + 1)), componentManifest, registry.map(item => item.file)));
const inventory = buildSystemInventory(root);
export function validateVariantCoverage(model, documented) {
  const used = model.components.filter(component => isReusableComponent(component.file)).flatMap(component => componentVariants(component).map(variant => `${component.name}:${variant}`));
  return [...used.filter(value => !documented.includes(value)).map(value => `Undocumented website variant: ${value}`), ...documented.filter(value => !used.includes(value)).map(value => `Catalog-only variant: ${value}`)];
}
export function validateInventoryCoverage(model, documentedComponents, documentedTokens, documentedIcons, tokenSource, catalogSource) {
  const failures = [];
  for (const name of model.unusedTokens || []) failures.push(`Unused system token: ${name}`);
  const literalValues = (text) => [...text.matchAll(/#[\da-f]{3,8}\b|rgba?\([^)]*\)/gi)].map(([value]) => value.toLowerCase().replace(/^#([\da-f])([\da-f])([\da-f])$/, '#$1$1$2$2$3$3'));
  const literals = literalValues(tokenSource + catalogSource);
  for (const value of model.projectValues || []) if (literals.includes(value)) failures.push(`Project-only literal entered the system: ${value}`);
  for (const value of model.projectBackgroundImages || []) if (tokenSource.includes(value) || catalogSource.includes(value)) failures.push(`Project-only image entered the system: ${value}`);
  const exact = (used, documented, kind) => {
    for (const value of used) if (!documented.includes(value)) failures.push(`Undocumented website ${kind}: ${value}`);
    for (const value of documented) if (!used.includes(value)) failures.push(`Catalog-only ${kind}: ${value}`);
  };
  exact(model.components.filter(component => isReusableComponent(component.file)).map(component => component.file), documentedComponents, 'component');
  exact(model.tokens.map(token => token.name), documentedTokens, 'token');
  exact(model.iconNames, documentedIcons, 'icon');
  for (const name of model.privateNames) if (tokenSource.includes(`--${name}:`) || catalogSource.includes(`var(--${name})`)) failures.push(`Project-only value entered the system: --${name}`);
  for (const font of model.projectFonts) if (tokenSource.includes(font) || catalogSource.includes(font)) failures.push(`Project-only font entered the system: ${font}`);
  if (!/DSCoverage|DSFoundations|data-ds-component=/.test(catalogSource)) failures.push('Catalog must render the complete source-derived token/component inventory.');
  return failures;
}
errors.push(...validateInventoryCoverage(inventory, registry.map(item => item.file), inventory.tokens.map(token => token.name), inventory.iconNames, read('src/styles/tokens.css'), catalog));
for (const name of Object.keys(icons)) if (!inventory.iconNames.includes(name)) errors.push(`Unused system icon: ${name}`);
if (read('src/layouts/DSLayout.astro').includes('hooko-artwork.css')) errors.push('Project artwork styles must not be imported by the catalog layout.');
if (process.argv.includes('--self-test')) {
  for (const kind of ['component', 'token', 'icon']) {
    const components = registry.map(item => item.file), tokens = inventory.tokens.map(token => token.name), icons = [...inventory.iconNames];
    if (kind === 'component') components.push('src/components/CatalogOnlyFixture.astro');
    if (kind === 'token') tokens.push('catalog-only-fixture');
    if (kind === 'icon') icons.push('catalog-only-fixture');
    if (!validateInventoryCoverage(inventory, components, tokens, icons, read('src/styles/tokens.css'), catalog).some(error => error.includes(`Catalog-only ${kind}`))) throw Error(`Usage guard accepted an unused ${kind}`);
  }
  if (!validateInventoryCoverage(inventory, [], [], [], read('src/styles/tokens.css'), catalog).some(error => error.includes('Undocumented website token'))) throw Error('Usage guard accepted missing documentation');
  if (!validateInventoryCoverage(inventory, registry.map(item => item.file), inventory.tokens.map(token => token.name), inventory.iconNames, read('src/styles/tokens.css') + `\n--${inventory.privateNames[0]}: red;`, catalog).some(error => error.includes('Project-only value'))) throw Error('Usage guard accepted a project-only token');
  const missing = validate([...registry, { name: 'MissingFixture', section: 'buttons', preview: 'direct', description: '' }]);
  const broken = validate(registry.map(item => item.name === 'Button' ? { ...item, section: 'missing-section' } : item));
  if (!missing.some(error => error.includes('Missing component: MissingFixture')) || !broken.some(error => error.includes('Missing documentation section: Button'))) {
    throw new Error('Design-system guard failed to reject broken fixtures.');
  }
  for (const markup of ['<section>New section</section>', '<a href="/">Action</a>', '<div class="new-card">Card</div>', '<style>main { color: red }</style>']) {
    if (!validatePage('src/pages/work/example.astro', markup).length) throw new Error(`Page guard accepted inline design: ${markup}`);
  }
  if (validatePage('src/pages/work/example.astro', '---\nconst text = "<button>";\n---\n<main id="main"><WorkSection /></main><script>const text = "<button>";</script>').length) throw new Error('Page guard rejected valid composition.');
  console.log('Design-system guard self-test passed (missing components, broken anchors and inline route designs rejected).');
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Design-system contract verified: ${registry.length} website components documented from source with stable section targets and no catalog style forks.`);

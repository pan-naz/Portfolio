import {validateNativeTooltipSources} from './validate-native-tooltips.mjs';
import {validateStatistic} from './validate-statistic.mjs';
import {validateHeroFrame} from './validate-hero-frame.mjs';
import {validateSectionHeading} from './validate-section-heading.mjs';
import {validateProjectCard} from './validate-project-card.mjs';
import {validateNavigationCatalog} from './validate-navigation-catalog.mjs';
import {validateChip} from './validate-chip.mjs';
import {validateSystemCleanup} from './validate-system-cleanup.mjs';
import {validateButtonCatalog} from './validate-button.mjs';
import {validateIcons} from './validate-icons.mjs';
import {validateMotionContract} from './validate-motion.mjs';
import {validateFoundationCodeContract} from './validate-foundation-code.mjs';
import {validateRadiusContract} from './validate-radius-language.mjs';
import {validateSpaceShape} from './validate-space-shape.mjs';
import {validateTypographySystem,validateStaticTypography,validateCatalogTypographyLayout} from './validate-typography.mjs';
import {typographyCssExclusions} from '../src/data/typography-exclusions.ts';
import {validateColors} from './validate-colors.mjs';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateHoverSource, validateLogoWave } from './validate-hover.mjs';
import { hiddenDocumentation } from '../src/data/system-hidden-docs.ts';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { icons } from '../src/data/icons.ts';
import { buildSystemInventory } from '../src/data/system-inventory.ts';
import { componentVariants } from '../src/data/system-variants.ts';
import { componentManifest, isReusableComponent } from '../src/data/system-components.ts';
import { dsComponents as registry, visibleComponents, catalogComponents, overviewHiddenComponents } from '../src/data/ds-components.ts';
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
  const errors = [...validateHeroFrame(root),...validateSectionHeading(root),];
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
const hiddenSections = {
 'Logo':'Wordmark','CaseStudyComparison':'Before and after','CaseStudyDecisionCard':'Decision card','CaseStudySteps':'Steps','CaseStudyMedia':'Media','ToolCard':'Tool card','ProjectIdentity':'Project identity','ProjectTags':'Project tags','SectionNavigation':'Project filter','ThemeToggle':'Theme switch','Icon':'Icon',
};
const hiddenKeys = Object.fromEntries(Object.entries(hiddenSections).map(([file,title])=>['src/components/'+file+'.astro',title.toLowerCase().replaceAll(' ','-')]));
const expectedVisible = ['Button','Chip','NavigationItem','ProjectCard','SectionHeading','Stat','TimelineRow','Tooltip'];
export function validateComponentClassification(files, used, manifest, shown) {
  const failures = [];
  const kinds = ['reusable-ui', 'page-section', 'case-study', 'internal-helper'];
  for (const file of files) {
    const entries = manifest.filter(item => item.file === file);
    if (entries.length !== 1) failures.push(`Unclassified or duplicate component: ${file}`);
    else if (!kinds.includes(entries[0].kind)) failures.push(`Invalid component kind: ${file}`);
  }
  for (const item of manifest) {
    if(item.documentedHidden && (hiddenKeys[item.file]!==item.documentedHidden)) failures.push(`Unauthorized hidden component: ${item.file}`);
    if (!files.includes(item.file)) failures.push(`Stale classification: ${item.file}`);
    if (item.kind === 'reusable-ui' && (!used.includes(item.file) || (!shown.includes(item.file) && !item.documentedHidden))) failures.push(`Missing or unused reusable UI: ${item.file}`);
  }
  for (const file of shown) if (!used.includes(file) || !manifest.some(item => item.file === file && item.kind === 'reusable-ui')) failures.push(`Non-reusable component shown: ${file}`);
  return failures;
}
const specimens = componentsReachableFrom('src/pages/design-system.astro');
export function validateNoMobileMenu(sources, iconRegistry) {
  const errors = [];
  for (const [file, source] of Object.entries(sources)) {
    if (/menu-toggle|mobile-menu|menu-close|menu-open|backdrop-menu|drawer-(?:in|out)|Open navigation/.test(source)) errors.push(`Removed mobile navigation remains in ${file}`);
  }
  if ('menu' in iconRegistry) errors.push('Removed menu icon must not remain in the system registry.');
  return errors;
}
export function validateNavigationExamples(specimen, controller) {
 const errors=[];
 for(const tag of ['SiteHeader','SectionNavigation','Button'])if(!specimen.includes('<'+tag))errors.push('Navigation must compose '+tag);
 if(!specimen.includes('<SectionNavigation compact theme pill'))errors.push('Navigation needs the real Work pill.');
 if(!controller.includes('pillGeometry('))errors.push('Floating specimen must use the website header model.');
 if(/\.style\.(?:fontSize|fontWeight|fontFamily|lineHeight|letterSpacing)\s*=/.test(controller))errors.push('Catalog must not invent typography.');
 return errors;
}
export function validateWorkPill(work, controller, css, presentation) {
  const errors = [];
  if (/work-compact-filter|work-filter-anchor|is-filter-docked/.test(work + controller + css + presentation)) errors.push('Work must have only the floating pill, without a former bar or docking reservation.');
  if (!work.includes('<SectionNavigation compact theme pill') || !work.includes('inert aria-hidden="true"')) errors.push('Work pill must render the real filter and start inaccessible while hidden.');
  if (!controller.includes('wrapper.inert = !visible') || !controller.includes("setAttribute('aria-hidden'") || !controller.includes("document.addEventListener('keydown', tab")) errors.push('Work pill must preserve hidden and native keyboard access.');
  for (const token of ['duration-header-enter', 'duration-header-exit', 'ease-header-pill']) if (!css.includes(`var(--${token})`) || !presentation.includes(`var(--${token})`)) errors.push(`Work pill and Navigation specs must share --${token}.`);
  return errors;
}
export function validateCatalogNavigation(layouts, navigation, controller, css) {
  const failures=[];
  for(const [name,source] of Object.entries(layouts)) {
    if(!source.includes("import layoutCapabilitiesSource from '../scripts/layout-capabilities.js?raw';") || !source.includes('<script is:inline set:html={layoutCapabilitiesSource} />')) failures.push(`${name} must render the shared prepaint layout initializer.`);
    if(source.includes('updateWorkLayout')) failures.push(`${name} duplicates the layout condition.`);
  }
  if(!navigation.includes("import NavigationItem from './NavigationItem.astro'") || !navigation.includes('<NavigationItem label={label}') || !navigation.includes('<NavigationItem label="Overview"')) failures.push('Catalog navigation must use NavigationItem for every page link.');
  if(/<(?:details|summary|a)[\s>]/.test(navigation.replace(/<a[^>]*class="ds-home"[^>]*>/,''))) failures.push('Catalog navigation must not retain a disclosure or private page links.');
  if(!navigation.includes('aria-label="Design system sections"')) failures.push('Catalog navigation requires an accessible name.');
  if(!css.includes("html[data-work-stage-layout='true'] .ds-sidebar") || /(?:min-width:1100px|data-ds-contents)/.test(controller+css+navigation)) failures.push('Catalog layout must use the home layout flag, without the old sidebar breakpoint.');
  if(!css.includes("@media(max-width:767px) { .ds-navigation [data-ds-dashboard-link] { display:none; } }") || !controller.includes("phone.matches&&requested==='dashboard'?'color':requested")) failures.push('Phone catalog must hide Overview and default to Color.');
  for(const hook of ['workstagelayoutchange','focusin','ArrowRight','ArrowLeft','Home','End','revealNavigationLink','updateNavigationEdges']) if(!controller.includes(hook)) failures.push(`Catalog navigation missing ${hook}.`);
  if(!controller.includes("link.setAttribute('aria-current','page')") || !controller.includes('scrollImmediately(')) failures.push('Catalog selection and reduced-motion scrolling must remain accessible.');
  if(/\.ds-navigation[^{}]*a[^{}]*\{[^{}]*(?:background|border-radius)/.test(css)) failures.push('Catalog links must not have a private active pill.');
  return failures;
}
function validate(entries) {
  const errors = [];
  const menuFiles = ['src/components/SiteHeader.astro', 'src/components/NavLinks.astro', 'src/components/NavigationItem.astro', 'src/components/DSPreview.astro', 'src/components/DSDashboard.astro', 'src/scripts/interactions.ts', 'src/scripts/motion.ts', 'src/scripts/scroll-engine.ts', 'src/styles/global.css', 'src/styles/tokens.css'];
  errors.push(...validateNoMobileMenu(Object.fromEntries(menuFiles.map(file => [file, read(file)])), icons));
  const names = new Set();
  for (const item of entries) {
    if (names.has(item.name)) errors.push(`Duplicate component: ${item.name}`);
    names.add(item.name);
    const path = resolve(root, `src/components/${item.name}.astro`);
    if (!existsSync(path)) errors.push(`Missing component: ${item.name}`);
    if (!item.documentedHidden && !sections.has(item.section)) errors.push(`Missing documentation section: ${item.name} → ${item.section}`);
    if (!['direct', 'documentation'].includes(item.preview)) errors.push(`Unknown preview kind: ${item.name}`);
    if (item.preview === 'direct' && !specimens.has(path)) errors.push(`Catalog does not render ${item.name}`);
  }
  for (const path of websitePages) errors.push(...validatePage(path, read(path)));
  if (/<(?:button|a)\b[^>]*\bclass=["'][^"']*\b(?:button|icon-button)\b/.test(catalog)) errors.push('Catalog must import shared controls instead of copying their markup.');
  const layout = read('src/layouts/DSLayout.astro');
  const modules = [...layout.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(([, body]) => body.trim());
  if (modules.length || !layout.includes('<SiteRuntime />') || !read('src/components/SiteRuntime.astro').includes('installSharedScrolling();')) errors.push('Every layout must use the shared theme/scroll lifecycle.');
  if (/scripts\/(?:home|hero|footer|work|case-study)/.test(layout)) errors.push('Catalog must not load website animation controllers.');
  errors.push(...validatePage('src/pages/design-system.astro', read('src/pages/design-system.astro')));
  const navigation = read('src/data/design-system.ts');
  for (const [,id] of navigation.matchAll(/\['([\w-]+)',\s*'[^']+'\]/g)) {
    if (!sections.has(id)) errors.push(`Navigation target missing: ${id}`);
  }
  const footer = read('src/components/SiteFooter.astro');
  if (/Tooltip|data-tooltip-target|aria-labelledby/.test(footer)) errors.push('Footer icon link must have only its accessible label, without a tooltip.');
  if (!/label="Design system"/.test(footer)) errors.push('Footer icon link must retain its accessible name.');
  const preview = read('src/components/DSPreview.astro');
  errors.push(...validateNavigationExamples(read('src/components/DSNavigationSpecimen.astro'), read('src/scripts/design-system-navigation.ts')));
  if (/tooltip-link|<Tooltip/.test(preview) || !/data-ds-example="tooltip-tool"[\s\S]*?<ToolCard/.test(preview)) errors.push('Tooltip catalog must use the real tool-card specimen only.');
  if (/tooltipAnchor|data-tooltip-anchor/.test(read('src/scripts/tooltip.ts') + read('src/components/Tooltip.astro'))) errors.push('Tooltip must not retain footer-only anchor positioning.');
  const css = read('src/styles/design-system.css');
  const capabilities=read('src/scripts/layout-capabilities.js');
  if(!capabilities.includes("const catalog = root.hasAttribute('data-catalog');") || !capabilities.includes('!catalog && (precise || homeWork)') || !capabilities.includes('!catalog && floating && !motion.matches')) errors.push('Catalog must consume the shared layout decision without home preview/motion flags that clip specimens.');
  errors.push(...validateCatalogNavigation({BaseLayout:read('src/layouts/BaseLayout.astro'),DSLayout:layout},read('src/components/DSNavigation.astro'),read('src/scripts/design-system.ts'),css));
  errors.push(...validateWorkPill(read('src/components/WorkSection.astro'), read('src/scripts/work-filter/work-filter-pill.ts'), read('src/styles/global.css'), read('src/styles/global.css')));
  for (const match of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
    const selector = match[1].trim();
    if (!selector.includes('.ds-')) continue;
    // Frozen interaction state specimens are deliberately explicit, inert examples.
    if (selector.includes('.ds-state-example') || selector.startsWith('.theme-toggle-group .ds-control')) continue;
    if (/\.(?:button|wordmark|arrow|nav-link|desktop-nav|skill-tag|project(?:-[\w-]+)?|placeholder-[\w-]+|theme-toggle|icon-button|hero(?:-[\w-]+)?)\b/.test(selector)) {
      errors.push(`Catalog CSS overrides a shared component: ${selector}`);
    }
  }
  const tokens = read('src/styles/tokens.css');
  errors.push(...validateTypographySystem(tokens, read('src/styles/typography.css'), read('src/components/DSFoundations.astro')));
  errors.push(...validateCatalogTypographyLayout(read('src/styles/design-system.css'), read('src/components/DSFoundations.astro'), read('src/components/ThemeToggle.astro')));
  errors.push(...validateStaticTypography(Object.fromEntries(filesUnder('src/styles').filter(file=>file.endsWith('.css')).map(file=>[file,read(file)])),typographyCssExclusions));
  return errors;
}
export function validateHiddenDocumentation(records, text) {
  const failures=[];
  for(const section of ['Accessibility','Writing',...Object.values(hiddenSections)]){
    const entries=records.filter(record=>record.section===section);
    if(entries.length!==1 || !/^[a-f0-9]{64}$/.test(entries[0]?.sha256||'') || entries[0]?.characters<100){ failures.push(`Missing hidden documentation: ${section}`); continue; }
    if(text!==undefined){
      // Use the next section boundary rather than the end-of-line multiline dollar.
      const start=text.indexOf('## '+section+'\n'), next=text.indexOf('\n## ',start+4);
      const value=start<0?'':text.slice(start,next<0?undefined:next).trim();
      if(!value || !/Documented, hidden\./.test(value) || createHash('sha256').update(value).digest('hex')!==entries[0].sha256)failures.push(`Stale or missing hidden documentation: ${section}`);
    }
  }
  return failures;
}
const errors = [...validateNativeTooltipSources(root),...validateStatistic(root),...validateProjectCard(root),...validateNavigationCatalog(root),...validateChip(root),...validateSystemCleanup(root),...validateButtonCatalog(root),...validateIcons(root),...validateMotionContract(root),...validate(registry),...validateColors(),...validateSpaceShape(root),...validateRadiusContract(),...validateFoundationCodeContract(root)];
errors.push(...validateLogoWave(read('src/styles/global.css'), read('src/components/Logo.astro'), read('src/styles/tokens.css'), filesUnder('src/scripts').filter(file=>file.endsWith('.ts')&&file!=='src/scripts/design-system-motion.ts').map(read).join('\n')));
if(JSON.stringify(visibleComponents.map(item=>item.name).sort())!==JSON.stringify([...expectedVisible].sort()))errors.push('Visible catalog must contain exactly the approved eight pages');
for(const [file,key] of Object.entries(hiddenKeys))if(componentManifest.find(item=>item.file===file)?.documentedHidden!==key)errors.push('Missing documented-hidden classification: '+file);
errors.push(...validateHoverSource(root));
const externalDocs=resolve(root,'../docs/design-system.md');
errors.push(...validateHiddenDocumentation(hiddenDocumentation,existsSync(externalDocs)?readFileSync(externalDocs,'utf8'):undefined));
errors.push(...validateComponentClassification(filesUnder('src/components').filter(file => /\.(astro|tsx|jsx|ts|js|vue|svelte)$/.test(file)), [...new Set(websitePages.flatMap(page => [...componentsReachableFrom(page)]))].map(file => file.slice(root.length + 1)), componentManifest, catalogComponents.map(item => item.file)));
const inventory = buildSystemInventory(root);
for (const entry of registry) if (!inventory.components.some(component => component.file === entry.file && component.usages.length)) errors.push(`Reusable UI has no rendered website consumer: ${entry.file}`);
/** Overview notes are informational; they cannot become extra visible pages. */
export function validateOverviewHiddenEntries(entries, expected = overviewHiddenComponents.map(item => item.documentedHidden)) {
  return [...expected.filter(key => entries.filter(entry => entry === key).length !== 1).map(key => `Missing or duplicate Overview hidden entry: ${key}`), ...entries.filter(key => !expected.includes(key)).map(key => `Unexpected Overview hidden entry: ${key}`)];
}
const overview = read('src/components/DSDashboard.astro');
if (!overview.includes('overviewHiddenComponents.map') || !overview.includes('item.description')) errors.push('Overview exclusions must use manifest entries and existing purpose sentences.');
if (!read('src/components/DSNavigation.astro').includes('<NavigationItem label="Overview" href="/design-system/" data-ds-dashboard-link')) errors.push('Overview must use the existing dashboard navigation path.');
export function validateRenderedComponentNames(names, expected) {
  return [...names.filter(name => !expected.includes(name)).map(name => `Non-reusable rendered component: ${name}`), ...expected.filter(name => !names.includes(name)).map(name => `Missing rendered reusable UI: ${name}`)];
}
export function validateVariantCoverage(model, documented) {
  const used = model.components.filter(component => isReusableComponent(component.file) && !componentManifest.find(item=>item.file===component.file)?.documentedHidden).flatMap(component => componentVariants(component).map(variant => `${component.name}:${variant}`));
  return [...used.filter(value => !documented.includes(value)).map(value => `Undocumented website variant: ${value}`), ...documented.filter(value => !used.includes(value)).map(value => `Catalog-only variant: ${value}`)];
}
export function validateInventoryCoverage(model, documentedComponents, documentedTokens, documentedIcons, tokenSource, catalogSource) {
  const failures = [];
  for (const name of model.unusedTokens || []) failures.push(`Unused system token: ${name}`);
  const literalValues = (text) => [...text.matchAll(/#[\da-f]{3,8}\b|rgba?\([^)]*\)/gi)].map(([value]) => value.toLowerCase().replace(/^#([\da-f])([\da-f])([\da-f])$/, '#$1$1$2$2$3$3'));
  // Genuine project-logo artwork in inert card templates is not a system colour role.
  // Tokens, catalog styles, text and SVGs outside those source-backed templates remain checked.
  const roleSource=catalogSource.replace(/<template\b[^>]*data-project-template="(?:full|compact|default|hover|focus)"[^>]*>[\s\S]*?<\/template>/g,template=>template.replace(/<svg\b(?=[^>]*data-svg-src="[^"]+")[^>]*>[\s\S]*?<\/svg>/g,''));
  const literals = literalValues(tokenSource + roleSource);
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

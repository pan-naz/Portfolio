import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sectionHeadingTiming, sectionItemStart } from '../src/scripts/section-reveals.ts';
import { tooltipFollowStep } from '../src/scripts/tooltip.ts';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const sectionReveals = read('../src/scripts/section-reveals.ts');
const workStage = read('../src/scripts/work-stage/work-stage.ts');
const motion = read('../src/scripts/motion.ts');
const card = read('../src/components/ProjectCard.astro');
const impact = read('../src/components/ImpactSection.astro');
const stat = read('../src/components/Stat.astro');
const footer = read('../src/components/SiteFooter.astro');
const about = read('../src/components/AboutSection.astro');
const tools = read('../src/components/ToolsSection.astro');
const toolCard = read('../src/components/ToolCard.astro');
const tooltipMarkup = read('../src/components/Tooltip.astro');
const tooltipCss = read('../src/styles/tooltip.css');
const toolTooltips = read('../src/scripts/tooltip.ts');
const layout = read('../src/layouts/BaseLayout.astro');
const css = read('../src/styles/global.css');

assert.deepEqual(sectionHeadingTiming(900, 900, .5), { titleStart: 450, subtitleStart: 900, firstContentStart: 1350 }, 'Label leads the title, description and content');
assert.deepEqual(sectionHeadingTiming(900, 900, .5, false, false), { titleStart: 0, subtitleStart: 450, firstContentStart: 450 }, 'Missing label and description do not leave empty stages');
assert.equal(sectionItemStart(0, 900, 900, .5), 1350, 'First content starts halfway through the subtitle');
assert.equal(sectionItemStart(1, 900, 900, .5), 1800, 'Second content starts halfway through the first item');
assert.equal(sectionItemStart(2, 900, 900, .5), 2250, 'Third content continues the hero cadence');
assert.equal(sectionItemStart(2, 900, 900, .5, true, 160), 1670, 'Experience rows can use a faster interval without changing the first row handoff');
assert.ok(card.includes('data-project-reveal={!compact || undefined} data-section-item={!compact || undefined}'), 'Selected cards reveal as complete section items; filtered cards use their independent shuffle');
assert.ok(
  !css.includes('--color-bg-surface: var(--color-bg-surface)') &&
    read('../src/styles/tokens.css').replace(/\s+/g,' ').includes('--color-bg-surface: var(--color-charcoal);') &&
    read('../src/styles/tokens.css').replace(/\s+/g,' ').includes('--color-charcoal: #222320;'),
  'Project-card chrome follows the shared theme palette with the approved raised surface'
);
assert.ok(
  /<(?:img|ResponsiveImage)\b[^>]*\ssrc=\{project\.image\}/.test(card) &&
    !css.includes('.project-media img { filter:') &&
    !css.includes('.project-media img { opacity:'),
  'Project artwork keeps its source and visual treatment in both themes'
);
assert.ok(
  layout.includes("const dark = saved === 'dark';") &&
    !layout.includes("prefers-color-scheme: dark"),
  'A first visit starts in Light mode regardless of the browser or OS preference'
);
assert.ok(
  !read('../src/scripts/theme.ts').includes('prefers-color-scheme') &&
    read('../src/scripts/theme.ts').includes("syncTheme(saved === 'dark')"),
  'Only a saved manual choice can restore Dark mode'
);
assert.ok(impact.includes('class="impact-group" aria-label={`${project.title} results`} data-section-item data-title-reveal-row'), 'Each Impact project row stays on the shared section timeline');
assert.ok(impact.includes('<Stat {...metric} revealValue />') && stat.includes('reveal={revealValue}'), 'Impact numbers opt into the shared title glyph reveal');
assert.ok(!impact.includes('<h3 data-section-item>') && !stat.includes('data-section-item'), 'Identity and metric copy remain grouped by project row');
assert.ok(sectionReveals.includes("querySelectorAll<HTMLElement>('[data-section-item]')"));
assert.ok(sectionReveals.includes('sectionRevealEffects(title, index, description, content)'), 'Touch and compact layouts use one section timeline');
assert.ok(sectionReveals.includes("number('--section-item-reveal-duration') || duration") && sectionReveals.includes("number('--section-item-reveal-interval') || duration * progress") && css.includes('--section-item-reveal-duration: var(--duration-about-reveal); --section-item-reveal-interval: var(--stagger-about-reveal);'), 'Experience rows use the faster 620ms/160ms reveal cadence');
assert.ok(sectionReveals.includes('shouldRevealWorkContent(trigger.getBoundingClientRect().top, window.scrollY, window.innerHeight * revealRatio)') && sectionReveals.includes("window.removeEventListener('scroll', play)"), 'Touch Work defers initial viewport entry until scroll and cleans up the retry listener');
assert.ok(workStage.includes('sectionRevealEffects(title, index, description, content)'), 'Desktop Work uses the same ordered timeline');
assert.ok(!motion.includes("querySelectorAll<HTMLElement>('article[data-project-reveal]')") && !motion.includes('scrub: projectScrub'), 'Retired independent card triggers cannot reorder the section timeline');
assert.ok(layout.includes("document.documentElement.dataset.sectionRevealMotion = 'true'"));
assert.ok(sectionReveals.includes("getPropertyValue('--section-reveal-trigger-viewport-ratio')") && read('../src/styles/tokens.css').replace(/\s+/g,' ').includes('--section-reveal-trigger-viewport-ratio: .9'), 'Every chapter uses the shared 90% viewport trigger');
assert.ok(css.includes(":is([data-section-item], [data-reveal]) { opacity: 0; }"), 'All later content is hidden before its scheduled animation begins');
assert.ok(!footer.includes('data-reveal'), 'Footer metadata and the design-system link render immediately without an entrance');
assert.ok(about.includes('<ToolsSection />') && tools.includes('class="tools-section" aria-labelledby="tools-title" data-section-item'), 'The complete tools section follows the experience rows as one timeline item');
assert.ok(!toolCard.includes('data-section-item'), 'Tool cards stay together rather than animating separately');
assert.ok(toolCard.includes('role="group" tabindex="0"') && tooltipMarkup.includes('role="tooltip"'), 'Every tool card exposes its name on hover and keyboard focus without pretending to be a link or button');
assert.ok(css.includes('.tool-card.is-pointer-hovered .svg-asset { transform: scale(var(--scale-tool-icon)); }') && tooltipCss.includes('[data-tooltip-target]:focus-visible .tooltip'), 'Tool hover and focus enlarge the mark and reveal the tooltip');
assert.ok(tooltipMarkup.includes('tooltip text-body-m'), 'Tool names use the Body/M type style');
const simulateTooltipFollow = fps => Array.from({ length: fps / 2 }).reduce(position => tooltipFollowStep(position, 100, 1000 / fps), 0);
assert.ok(Math.abs(simulateTooltipFollow(60) - simulateTooltipFollow(120)) < .001 && simulateTooltipFollow(60) > 99, 'Tooltip follow is smooth and frame-rate independent at 60/120Hz');
assert.ok(toolTooltips.includes('watchViewportPointer(pointer =>') && toolTooltips.includes('tooltipFollowStep(currentX, targetX, elapsed)') && toolTooltips.includes('requestAnimationFrame(renderPointerPosition)'), 'The tooltip glides toward the latest pointer position on animation frames');
assert.ok(toolTooltips.includes('tooltipLocalX(event.clientX, cardRect.left, tooltip.offsetWidth, innerWidth)') && toolTooltips.includes('event.clientY - cardRect.top') && tooltipCss.includes('.tooltip { --tooltip-scale: var(--scale-tooltip-start); position: absolute;'), 'The cursor tooltip uses local coordinates clamped only at viewport edges and a perceptible collapsed scale');
assert.ok(toolTooltips.includes("tooltip.dataset.placement = event.clientY < tooltipHeight + 32 ? 'below' : 'above'"), 'The cursor tooltip flips below near the viewport top edge instead of clipping');
assert.ok(tooltipCss.includes('--tooltip-scale: 1; opacity: 1;') && tooltipCss.includes('transition: opacity var(--duration-tooltip-opacity) var(--ease-entrance), transform var(--duration-tooltip-scale) var(--ease-entrance);'), 'Tooltip entrance and exit use only opacity and scale');
assert.ok(toolTooltips.includes("if (!card.matches(':focus-visible')) return;"), 'Pointer focus cannot pull the cursor tooltip back to the keyboard-only centered anchor');
assert.ok(sectionReveals.includes("document.addEventListener('focusin'") && sectionReveals.includes('record.finish()'), 'Keyboard focus resolves the complete waiting section');
assert.ok(sectionReveals.includes("reduced.addEventListener('change'") && sectionReveals.includes('records.forEach(record => record.finish())'), 'Reduced motion resolves every waiting section');
assert.ok(!sectionReveals.includes('.project-caption') && !sectionReveals.includes('.project-media'), 'Project captions and media never animate out of order inside a card');
console.log('PASS: section content follows ordered chapter timelines, with the approved faster Experience row cadence.');

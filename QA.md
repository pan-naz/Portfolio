# Homepage review — 11 September 2026

## Dark-mode surface hierarchy and fixed Light floating controls — 17 September 2026

- Preserved the original #161715 Dark page canvas and introduced #0F100E for sheets and contained section surfaces. Work, Experience, the mobile drawer, chips, and DS dark containers use the darker role; ProjectCard chrome reuses the lighter global #161715 black with #222320 raised chips. Project artwork, logos, crop, dimensions, opacity and filters remain unchanged.
- Removed browser/OS color-scheme adaptation. A first visit always starts in Light; only a saved manual ThemeToggle choice restores Dark, and clearing that choice returns to Light.
- Added shared floating-control tokens that retain the Light palette in both themes: #FFFFFF surface, #161715 ink, #F25A30 accent, Light hover color, focus ring, and 0 8px 24px / 10% shadow. The docked header pill and SectionNavigation both consume these shared roles; the undocked header still follows the page theme.
- Updated the design-system Color readouts, Dark-mode description, surface-hierarchy sample, Navigation notes, component registry descriptions, and direct floating-pill/filter specimens. The DS specimens compose the real NavLinks, NavigationItem, ThemeToggle, Button, Logo, and SectionNavigation implementations.
- Browser comparison at 1728px confirms Light and Dark both resolve the pill/filter to white, near-black text, and the same orange accent. Dark resolves the unchanged page to rgb(22,23,21) and both Work/Experience containers to rgb(15,16,14). The DS resolves the same values and shows the darker nested surface visibly.
- `pnpm check`, `pnpm build`, all 13 test files, contrast validation, design-system/static-catalog guards, and `git diff --check` pass. Browser console review reports no warnings or errors.

## Tool tooltip scale visibility — 17 September 2026

- Increased the tooltip's collapsed scale from 94% to 82%, keeping the existing 440ms transform easing and 320ms opacity transition. It now visibly scales up on appearance and back down on disappearance while remaining anchored toward the cursor.
- Browser verification confirmed all four tooltips rest at opacity 0 / scale .82, reach opacity 1 / scale 1 on keyboard focus, and return to opacity 0 / scale .82 after focus leaves. The same CSS state powers precise-pointer hover.
- `pnpm check`, `pnpm build`, the focused motion test, and `git diff --check` pass. The browser console reports no warnings or errors. The design-system catalog is unchanged.

# Faster Experience row cadence — 17 September 2026

- Kept the section trigger, heading/subtitle cadence, and first-row start unchanged. Reduced only the Experience content items from 900ms reveals beginning 450ms apart to 620ms reveals beginning 160ms apart; the 8px rise and shared easing remain.
- Seven experience rows and the final Tools block stay in DOM order and remain hidden until their own delay begins. Work, Impact, and Contact keep their established timing.
- Browser/source comparison confirms the resting layout is unchanged. Timing contracts confirm row starts at 900ms, 1060ms, 1220ms, 1380ms, 1540ms, 1700ms, and 1860ms, with Tools starting at 2020ms.
- `pnpm check`, `pnpm build`, all 13 test files, and `git diff --check` pass. The browser console reports no warnings or errors. The design-system catalog is intentionally unchanged per the current project workflow.

## Cursor-following tool tooltip refinement — 17 September 2026

- Reworked every Tools card tooltip into a white rounded floating surface with a soft menu-style shadow and the shared Body/M typography (16/24, regular). The tooltip uses exact unclamped cursor coordinates relative to the hovered card, allowing it to extend outside the card without inheriting a viewport offset from the animated section. It flips below the pointer near the viewport's top edge.
- Smoothed the mark scale to 520ms and the tooltip fade/scale to 320/440ms with the shared entrance easing. Pointer coordinates now use a frame-rate-independent 72ms follow curve, producing a gentle floating catch-up without changing the fixed cursor gap. Appearance and disappearance change only opacity and scale. Keyboard focus keeps an equivalent stable centered tooltip; pointer-acquired focus no longer pulls the tooltip away from the cursor.
- Live browser review confirmed the resting tooltip at `rgb(255,255,255)`, `16px/24px`, weight 400, 999px radius and `0 12px 32px / 14%` shadow. The pointer anchor is calculated from the live card rectangle without boundary clamping, so the label can cross the edge while remaining 14px from the cursor. The icon resolved to the 1.08 scale. No console warnings or errors were captured.
- `pnpm check`, `pnpm build`, all 13 test files and `git diff --check` pass. The design system was intentionally left unchanged per the user's instruction to update it only when requested.

## Design-system Website section removed — 17 September 2026

- Removed the Website navigation entry, complete in-context section, embedded portfolio iframe, connected-component list and `/design-system/preview/` route.
- The catalog now documents only explicitly selected direct specimens. Its registry and guard no longer require every website component or website change to be mirrored in the design system.
- Project guidance now records the user's rule: update the design system only when explicitly requested.
- Browser review at 390×844 confirms the mobile index now contains Foundations, Components and Modes with no Website entry; the removed section is absent from the DOM and the console has no warnings or errors. `pnpm check`, `pnpm build`, all 13 test files and `git diff --check` pass.

## Footer side-clip removal — 17 September 2026

- Replaced the footer pile's fixed 70px side drawing/removal bounds with the measured left and right viewport gutters. The canvas now spans the full screen width on desktop, the cursor remains active through the gutters, and icons remain drawable after leaving either divider endpoint until they fully cross the screen edge.
- Added model coverage for a fallen icon remaining present inside a wide viewport gutter and renderer coverage requiring a 1000px canvas for an 800px divider with 100px side gutters.
- Live review at 1280px confirmed the 1152px divider field expands to a canvas from -6px through 1286px, covering both viewport edges while the document remains exactly 1280px wide. The pile stayed resting and undisturbed before input, and the browser reported no warnings or errors.
- All 13 test files pass. `pnpm check` reports 80 files with zero errors, warnings or hints; `pnpm build`, design-system/static-preview guards and contrast checks pass.

## Bottom-edge hop reverted — 17 September 2026

- Removed the page-bottom scroll listener and collective pile impulse. Reaching the bottom, leaving it and returning now leave the settled pile unchanged; the only live footer physics are the approved 100px mouse sweep and natural settling.
- Kept the footer metadata row and Design system link free of an entrance animation. Touch and reduced-motion contexts remain static, and the random pile still changes only on reload.
- Live preview verification reached the exact document bottom twice. Both times the pile remained `disturbed=false` and `motion=resting`, with no bottom-jump state present. The footer had no reveal attribute and the browser reported no warnings or errors.
- All 13 test files pass. `pnpm check` reports 80 files with zero errors, warnings or hints; `pnpm build`, design-system/static-preview guards, contrast checks and `git diff --check` pass. Website behavior, the shared catalog specimen, registry, `MOTION.md` and `DESIGN.md` agree.

## Direct 100px sweep, uniform gray and reload variation — 17 September 2026

- Replaced the footer's weak 220px force field with an invisible solid circle measuring 100px in diameter. It grows into initial contact over approximately 120ms and then sweeps through fixed physics substeps. Reduced contact friction makes a normal stroke clearly displace the icons. Limited upward launch during fast strokes, and added a shelf constraint that resolves compressed contacts sideways instead of allowing penetration through the divider.
- Every icon uses the same `--footer-icon-ink` value: #b8b8b8 in Light and #747474 in Dark. Both theme swatch sets document the token. Removed individual shade variation from the canvas and SVG fallback.
- A fresh page seed randomizes icon choices, angles, positions and the uneven skyline. Deposition settles before the initial paint. Theme changes and resizing preserve the seed; once disturbed, surviving icons retain their displacement. Script-free specimens use a fixed seed from the same shared generator.
- Browser-reviewed different reload arrangements and a complete desktop sweep: 154 icons became 99 survivors with 55 spilled over the endpoint, then the animation returned to resting. A prior sweep cleared 48 icons. Both reloads changed the seed and visible arrangement; glyphs and colors stayed fixed during interaction.
- At 390px the shared static specimen has 10px icons, one computed gray value, a hidden canvas, and no document overflow. The shape stays compact above the divider. Touch-capable hardware and reduced-motion behavior remain covered by the actual renderer harness rather than viewport resizing.
- Expanded regression checks require a normal sweep to move over 65% of the icons at least 50px, clear over 10% off an endpoint, keep every on-shelf body above the line, avoid abrupt position jumps and settle. Checks cover multiple random seeds, both directions, stationary cursor clearance, local wake-up, 60/120Hz equivalence, per-reload randomness, uniform canvas ink, state persistence and lifecycle cleanup.
- Final verification: all 13 test files pass, with the footer tests repeated after the final API typing adjustment. `pnpm check` reports 80 files and zero errors, warnings or hints; `pnpm build`, design-system/static-preview guards, contrast checks and `git diff --check` pass. The live website, actual shared specimen, both theme swatches, registry and documentation agree. The inspected browser reported no errors or warnings; temporary viewport changes were reset.

## Centered interface mound and physics refinement — 17 September 2026

- Replaced the full-width composition with a centered half-ellipse, at most 480px wide and 106px high. Icons come only from the rain's User Interface category and retain their 10px size, 1px stroke and fixed identities. This supersedes the earlier pile composition below.
- Replaced abrupt manual collision correction with Matter.js 0.20.0: fixed 120Hz simulation, local sleeping, contact friction, low restitution and bounded cursor acceleration. The 220px field now eases on entry/release and filters pointer travel. Its center has no random direction or positional impulse. Added the dependency's MIT license to public/licenses/.
- Browser-reviewed the live and shared static footer at 1280px and 390px. Both compositions are centered and match; all glyphs retain their size and the viewport does not overflow. The live mound starts with 213 icons on desktop and 54 at 390px. Sweeps disturb only the nearby area, and the pile settles without restoring its original positions. The script-free preview keeps its canvas disabled and the SVG decoration aria-hidden.
- The 768px review caught insufficient space below contact buttons for the taller mound. Reserved 128px above the divider on desktop and a responsive 80–128px on mobile; shared catalog notes and DESIGN.md document this spacing.
- All 13 test files pass. The expanded physics tests cover interface-only selection, rounded/centered geometry, sub-pixel cursor entry, continuous bounded movement, unaffected distant icons, both endpoint spills, shelf contact, persistent displacement, 60/120Hz agreement, local settling and cleanup. The renderer harness verifies touch/reduced-motion static behavior, pointer input, pause/resume and theme persistence; browser viewport resizing alone does not emulate touch hardware.
- Final browser review confirms the corrected 128px tablet clearance and quiet dark-theme palette, with no captured errors or warnings. Website, actual shared design-system preview, registry and documentation agree. `pnpm check` reports 80 files with no errors, warnings or hints; `pnpm build`, structural/static catalog guards, contrast checks and `git diff --check` pass.

## Footer icon pile — 17 September 2026

- Extended `SiteFooter` with a still, irregular pile directly above its divider. Reuses the hero rain's paths, 10px size, 1px stroke, quiet theme palette and 220px pointer radius. No new dependency or changes to hero rain behavior.
- Browser-checked the 1280px layout in both themes and the 390px layout: icons retain their size, the pile fits above the divider, footer links remain usable, and document width equals viewport width. The drawing area clips at the viewport while allowing spills beyond either divider endpoint.
- Swept both endpoints in the browser. The initial 244 icons at 1280px reduced to 242 after each respective sweep, with two spilled icons; the pile then returned to its resting state. Theme changes preserved the altered state; reload restored the pile. At 390px, the initial pile contains 68 icons without changing their size.
- Model tests cover a motionless initial state, the exact 220px boundary, downward collision with the shelf, both endpoints, persistent displacement, sleep after settling, 60/120Hz agreement and resize without refill. The actual renderer is also exercised with synthetic mouse/touch events, touch-capable hardware, reduced motion, menu and offscreen suspension, idle RAF shutdown, theme changes and cleanup. Touch and reduced-motion behavior were tested through this renderer harness; browser viewport resizing alone does not emulate touch hardware.
- Manually compared the shared script-free design-system preview with the live footer. Its same SVG heap remains visible, 10px, aria-hidden and pointer-transparent, with its canvas disabled. Registry, in-context notes, `MOTION.md` and `DESIGN.md` describe the implemented behavior.
- Final verification: `pnpm check` reports 79 files with zero errors, warnings or hints; all 13 test files pass; `pnpm build`, design-system and static-catalog guards, contrast validation and `git diff --check` pass.

## Theme-toggle half rotation — 17 September 2026

- Restored the simple sun SVG (one circle and one ray path) and kept the simple one-path moon SVG; both remain 24×24 with 1.5px strokes inside the shared 44×44 `IconButton`.
- Browser-verified both Light and Dark modes at `http://127.0.0.1:4322`: precise-pointer hover resolves the shared glyph wrapper to the 180-degree transform matrix over a smooth 600ms ease-in-out for both icons. The control box does not move or resize.
- Removed the sun-only burst keyframes, ray geometry, click replay JavaScript and obsolete duration token. Reduced motion keeps the glyph still.
- The `/design-system/` route renders two instances of the same component at 44×44 and correctly disables their transitions in the static catalog.
- `pnpm check`, all 12 test files, `pnpm build`, the design-system contract, contrast checks and static-catalog validation pass.

## GitHub handoff verification — 16 September 2026

- `pnpm check`: 70 files, zero errors, warnings or hints. `pnpm build`: all three routes generated; shared static-preview validation passes. All 10 test files pass.
- Source-reviewed website, design-system specimens and documentation together for shared page composition, navigation/filter states, current hero roles, staged native motion, responsive rules and accessibility fallbacks. Corrected stale README details and the navigation registry spacing description. No new browser review was performed for this handoff; earlier visual evidence below remains historical.

Status: local review build complete; real portfolio content intentionally pending at the user's request. Not a public-launch-ready portfolio yet.

## Profile copy update — 12 September 2026

The user's `../Html → Body.pdf` supplied the profile facts. Its About and Experience sections were checked as rendered images as well as extracted text. Original copy now replaces the generic hero, approach and biography; six experience rows are populated with the displayed titles, companies and dates. The display name is Nazarii Pankiv, matching the profile rather than the earlier assumption. The contact action uses the user's LinkedIn URL; no email or current availability is invented.

- Build succeeds and Astro check reports 9 files, 0 errors, warnings or hints.
- Desktop hero and biography/experience visually checked at 1440px; experience and contact checked at 390px; hero checked at 320px. No horizontal document overflow at these widths.
- Experience retains the established three-column desktop / single-column mobile treatment. Heading hierarchy is section h2, Experience h3, individual roles h4.
- LinkedIn destination equals the URL supplied by the user. Its external login state was not altered.
- Styles changed only to preserve existing role typography under the corrected h4 semantics. Motion scripts, logo, color tokens and project presentation are unchanged.
- Project slots remain pending. The PDF's truncated older project entries and social activity were not treated as complete case studies. Private profile analytics and other people's content were excluded, and the source PDF is not in public assets.

The earlier pending-biography/title/experience notes below describe the initial build and are superseded by this update. Final copy approval and actual featured project material remain outstanding.

## Motion update — Genie Studio reference

Implemented the explicitly requested staged intro, desktop wheel smoothing and scroll-triggered movement. The root DESIGN.md motion guidance and README now record this approved extension. Details and reference evidence are in `MOTION.md`.

Verified after this update:

- Production build passes; Astro check reports 9 files, 0 errors, 0 warnings and 0 hints.
- Intro begins with the intended 48px headline translation and zero opacity, then finishes at full opacity with temporary transforms removed. No separate loading screen is used.
- Pressing Tab immediately after reload completes headline, description and logo entrances and focuses the visible skip link.
- Desktop wheel input activates `lenis-smooth`; scrolling settles back to the idle `lenis` state. Project media changes from scale 0.965 / translateY 56px to its natural scale/position. Captions become fully opaque when reached.
- Desktop Work navigation updates #work, focuses that section and stops at approximately 104px from the viewport top. Fixed a duplicate offset after verifying that Lenis already reads CSS scroll-padding.
- Resizing to 390px removes Lenis. Mobile Work navigation focuses #work and stops at approximately 88px from the top.
- Mobile menu opens, Close receives focus, Work closes/navigates, and Escape restores focus to Menu. Page inertness is removed on close.
- No horizontal overflow at the retested 320, 390 and 1440px widths. No browser errors or warnings in the inspected preview.
- `qa/motion-intro.png` captures the early intro frame; `qa/motion-work.png` captures the desktop Work destination. Static captures supplement the live scroll checks; they do not demonstrate timing by themselves.

Reduced-motion removal of Lenis, entrances and panel transforms was source-reviewed, not system-emulated: this browser session exposes viewport controls but no reduced-motion emulation. Real-device touch feel and cross-browser timing remain for the publication pass. All previous pending-content and accessibility qualifications below still apply.

## Source of truth

`../DESIGN.md`, the approved Astro/TypeScript/CSS/GSAP stack, and the latest request for a rotating dark naz.wtf mark. The mark is an explicitly requested exception to the document's default no-looping-decoration rule. Yash Sonwaney's homepage informed the broad content sequence only; no personal claims, project data, branding or media were copied.

## Verified

- Static production build succeeds: one homepage, local stylesheet/script/font assets and favicon.
- Astro diagnostics: 8 files, 0 errors, 0 warnings, 0 hints.
- Built HTML's local script, stylesheet and favicon references resolve; anchor destinations resolve.
- No browser errors observed in the inspected preview.
- 320, 390, 768, 1024 and 1440px viewport widths: document width equals viewport width, no horizontal overflow.
- Mobile uses one project column; 768px and above use a full-width lead and two secondary columns.
- Hero uses Urbanist Variable and the specified 128px desktop / 48–56px mobile range.
- Desktop first project media begins about 985px from document top at 1440 × 900; at 320 × 740 it begins about 1047px down. Both are within two viewport heights.
- Logo pause changes its animation state to paused. Resume control is wired to restore it.
- Mobile drawer opens; the page is inert; Close receives focus. Shift+Tab from Close wraps to the final Contact link.
- Selecting Work in the drawer closes it, changes the fragment to #work, scrolls to that section and focuses it.
- Escape closes the drawer, removes page inertness and restores focus to Menu.
- Desktop quick navigation appears after the hero; the original navigation becomes inert.
- Desktop narrative changes word colors with scroll while holding the heading position: scrolling from 3005px to 3140px preserved its top at about 286px and advanced the final-word color from #AAAAAA toward white.
- Narrative pinning is absent on mobile/tablet and at the tested short 1024 × 600 viewport.
- Fixed an initial stagger issue that left later words white before their turn; every word is now initialized gray before the timeline.
- Temporary viewport override removed after testing; local preview tab retained for the user.

## Source-reviewed, not fully browser-emulated

- System reduced-motion handling: CSS disables rotation/transforms and smooth scrolling; GSAP media conditions revert entrance and narrative effects. A system-level reduced-motion toggle was not changed during this review.
- JavaScript-disabled fallback: page content is generated as HTML; the rotating animation and its control require the enhancement class; a noscript section navigation is included. A separate JavaScript-disabled browser session was not run.
- Rem-based typography and natural-height content are present; a dedicated 200% text-only enlargement pass remains to be done with final content.
- Full assistive-technology and cross-browser validation remains for the publication pass.

## Intentional pending content

The user answered “later” for project details, professional title and email. Three explicitly marked project slots remain. No project-detail links, fake email destination, made-up experience rows or testimonial carousel are shown. Update `src/data/portfolio.ts` with actual content and images, review original draft copy and the assumed name spelling, then repeat the relevant visual checks. The draft retains `noindex, nofollow` until a future approved launch.

Hover-image popovers are not included because there are no additional real project rows or project preview images yet. The main project presentation does not depend on hover.

## Captures

- [Desktop homepage](qa/desktop-home.png)
- [Mobile homepage](qa/mobile-home.png)
- [Mobile navigation](qa/mobile-menu.png)
- [Desktop scroll passage](qa/desktop-scroll.png)

The Sites skill informed the local setup, preview and build checks. Refero informed the reference lock and visual comparison against DESIGN.md. No unapproved generated imagery or public deployment was introduced.

## Shared DS component contract · 13 September 2026

- All 22 public components registered, with direct specimens or the actual homepage preview. Homepage composes extracted sections; shared SectionHeading and ExperienceRow preserve the existing hierarchy and content.
- Build guard self-test rejects missing Button registration and an invalid documentation anchor. The guard also caught and removed a real catalog-only mobile button override during this change.
- Browser propagation proof: temporarily changed `--control-height` from 48px to 52px in tokens.css. Both the homepage button and DS specimen computed 52px through HMR, without editing either page. Restored the token and confirmed both returned to 48px.
- At 1280px the homepage renders all six experience rows, the mobile trigger is hidden and the page has no horizontal overflow. At 390px both homepage and DS have no horizontal overflow.
- Shared mobile navigation opens with Work/About/CV, closes on Escape and restores focus to Open navigation. Dark theme is synchronized across the catalog, its embedded homepage and a separate homepage tab using the native storage event.
- All eight existing test files pass (header morph, hero typing, text contrast, typography scale, waterfall colors, renderer, symbols and timing). No captured homepage console errors.
- Static publication still requires building and deploying; automatic source propagation during development does not imply automatic deployment. DS-only sidebar/search/frame styling is intentionally separate from website components.

## Unused DS component cleanup · 13 September 2026

- Traced homepage imports recursively: Feedback was the only public component without a website consumer. Removed its implementation, stylesheet, semantic color families, examples and navigation entries. All 21 remaining public components are used by the website.
- Build validation now rejects unused public components. Its self-test verifies this failure alongside missing registration and broken documentation targets.
- Astro check passes with zero errors, warnings or hints; production build passes.

## Website and DS alignment review · 13 September 2026

- Reviewed website composition and all 21 public components. Extended structural validation from the homepage to every Astro website route and nested component folder. Routes now reject inline controls, sections, styled wrappers and style elements. Public components require website usage, registration and a real preview.
- Replaced copied DS browse/close control markup with Button and IconButton. Removed catalog-specific sizing from the browse button. Button now forwards ARIA, data and native button attributes; the DS documents this contract.
- Guard self-tests reject unused components, missing registration, broken anchors and inline designs on nested routes, while accepting component composition. Astro check has zero errors, warnings or hints; production build passes.
- Browser verified search open/close and mobile drawer open/close at 390px. Browse control exposes aria-expanded, returns focus after closing, uses the shared 48px height and causes no horizontal overflow. Viewport override reset afterward.
- Structural checks cannot judge design intent or stale explanatory prose: future design changes must review variants, tokens, interactions and DS documentation in the same task, as recorded in AGENTS.md.

## Text role contrast review · 13 September 2026

Primary and secondary pass WCAG AA normal text on supported solid surfaces in both themes. Tertiary is intentionally lighter (`#A19C98` in light theme) and reserved for supplementary metadata, decorative labels or large text. Browser verified the live DS matrix, computed website colors and theme synchronization. Contrast tests now run in check and build; both pass. Evidence and scope: [text contrast review](qa/text-contrast-review/REVIEW.md).

### User-selected accent restoration

Restored the hero’s 0 → 1 to shared --accent with font-weight 700 as explicitly requested. Website and DS use the same treatment. The preceding primary-color correction is superseded; its screenshot remains historical evidence. Contrast enforcement still covers all 18 text-role/surface pairs, with the accent statistic documented separately as a known design exception.

### Clearer secondary / tertiary hierarchy

Light secondary is now #6E6B68 and tertiary #A19C98; dark tertiary remains #9E9996 and secondary #C0B9B5. Browser verified current DS values and guidance. Primary/secondary contrast remains enforced; tertiary usage is restricted to supplementary or large text. Shared tokens propagate to website labels and DS together. Check and build pass. The preceding palette measurements are historical.

## Single CTA return behavior · 13 September 2026

- Removed the temporary cloned hero CTA. The page now contains one shared “Get in touch” button in both hero and pill states.
- On upward scroll, the pill starts its 320ms exit while the reserved hero slot is still 200px above the viewport. The exit stays latched during the return scroll, preventing the pill from reappearing before the normal trigger is crossed; reversing direction can restore it smoothly.
- Live browser verification found exactly one contact button while docked and after return. After the pill completed its exit, that same element was restored to the hero wrapper at its settled position. No runtime warnings or errors were recorded.
- The header motion model test, design-system contract, contrast checks, Astro diagnostics and production build all pass.
# Hero blur reveal · 15 September 2026

- Replaced typing/deletion with the approved Pitch-inspired letter blur-and-rise, removed skew/cursor, and added real line-by-line paragraph reveals.
- Live browser checked at 1280×720 and 390×844: no horizontal overflow, stable CTA position during setup, paragraph restored to original flowing markup after intro, one stable screen-reader H1.
- Sampled initial title state: opacity 0, blur 10px, translateY 10px. Confirmed three measured desktop paragraph lines and five mobile lines, and only one visible role at rest.
- Scrolled hero offscreen and checked two separate snapshots: role remained frozen with is-motion-paused. No browser console errors captured.
- Motion tokens and DS motion rows/registry agree with the website implementation; DS live preview still renders the real homepage.
- `pnpm check`: 0 errors, 0 warnings. `pnpm build`: successful. All 8 test files pass, including the new intro contract regression test. Reduced-motion reset and focus escape paths reviewed in source; OS reduced-motion was not toggled during this browser pass.


## Figma migration — 15 September 2026

Source: user-supplied `figma-ds.svg` (85:161) and `figma-home.svg` (67:15). The website and live DS use the same 24 registered components. Current copy and design decisions are in `COPY.md` and `../DESIGN.md`; older QA entries describe superseded builds.

- `pnpm check`: 62 files, zero errors/warnings/hints. DS structural guard and contrast validation pass.
- `pnpm build`: both `/` and `/design-system/` generated successfully with all local artwork and CV.
- `node --test tests/*.test.mjs`: all nine test files pass, including 10,800 real waterfall-renderer frames, 60/120Hz timing, header docking/return, role-cycle pause/resume and responsive typography.
- Animation baseline: twelve retained script files are byte-for-byte unchanged. hero-intro.ts changes only the first role string; replacing that string back reproduces the saved hash. interactions.ts loses only the approved ApproachSection animation and related imports. Contrast-related script changes are separate. Evidence: `../reference-research/figma-migration/animation-verification.json`.
- Browser desktop 1728px: no horizontal overflow. Section starts/heights match Figma to subpixel rounding: Hero 0/800; Work 800/2624; Impact 3520/588; Experience 4204/1026; Contact 5350/330. Total document height rounds to 5877px versus the 5876px export.
- Visually reviewed desktop hero, work cards, docking header, timeline, mobile hero/cards, dark tablet metrics and the DS project-card specimen. All three original media assets load. The SVG's flattened waterfall is not used.
- Responsive browser checks: website widths 320, 390, 768 and 1728px have no horizontal page overflow. Mobile headings fit their 272px content width at 320px. Tablet metrics keep three 197px columns at 768px. Catalog widths 390, 768 and 1280px have no horizontal page overflow.
- Mobile navigation: opens with focus on Close navigation; Work selection closes the drawer, updates #work and focuses the section. Escape completes the existing exit animation, closes the dialog, removes inert from page/header and restores focus to Open navigation.
- Theme verification: dark sheets resolve to #222320, pinned project cards to #FAF8F7 with #161715 text. Live catalog contrast readouts work for both themes and the alpha-muted token. The minimum tested primary/secondary normal-text contrast is 5.08:1. Decorative tertiary and accent exceptions remain documented rather than being represented as universal AA compliance.
- Shared control measurement: large buttons with/without arrows are 48px; footer/experience small buttons are 36px. Live catalog anchors resolve, and no browser errors/warnings were recorded during the reviewed views.
- CV: source, public file and generated production file have identical SHA256 hashes. The Hooko destination was verified against Apple's listing. Case-study URLs were not supplied; cards deliberately have no fabricated links.
- Manual website/DS/documentation agreement: token mappings, card anatomy, chip variants, button sizes, timeline structure, stats, theme rules, responsive adaptations and retained motion agree. No speculative quote/logo-wall components were added and no Figma writeback or public deployment was performed.

## Figma process-label alignment — 15 September 2026

- Updated the shared plain `SkillTag` treatment from tertiary gray with a bold first letter to Figma Label/S: Urbanist Medium 500, 12/16, uniform weight, primary ink `#161715`.
- The homepage, design-system Tags specimen, component registry and `DESIGN.md` now describe and render the same treatment.
- Browser measurements at 1728 × 800 match the source values exactly. Focused evidence and findings are recorded in `design-qa.md` and `qa/figma-label-*.jpg`.
- `pnpm check`, `pnpm build` and all nine test files pass. Existing animation sources were not changed.

## Static Figma design-system rebuild — 16 September 2026

- Rebuilt the catalog as the Figma specimen sheet: foundations, used components, dark examples and a static website composition. Thirteen native anchor links replace the former sidebar/search/tab system. Mobile anchors wrap above the sheet.
- `PortfolioPage` is consumed by both the website and the static preview. Production validation proves identical page body markup after stripping scripts, no scripts in the preview, a script-blocking iframe sandbox, and no static CSS in the public website bundle.
- All 25 registered shared components have actual website consumers and specimens. Website/DS/documentation agreement reviewed for typography, palette, button sizes, tag variants, card anatomy, timeline rows, theme roles and responsive behavior. Project marks now consume the Figma 12px radius token; unused Raised elevation was removed.
- Browser verified desktop color/type/component/dark sheets, mobile color and timeline, all 13 anchor targets, iframe section navigation, and no horizontal overflow at 320, 390, 768, 1024, 1440 and 1728px. Both themes use shared color values. Static preview has no scripts or CSS animation, and shows one complete skills list.
- Every website motion and theme script is byte-for-byte unchanged from task start. Public website still initializes its normal animation script and skills loop. The catalog does not load or modify user theme preferences.
- `pnpm check` passes with zero diagnostics; `pnpm build` passes including the new static-catalog verification; all nine test files and DS guard self-tests pass. Final findings and reference decisions: `design-qa.md`.

## Shared homepage scroll entrances — 17 September 2026

- `pnpm check` and `pnpm build` pass, including shared-component alignment, contrast and static-catalog validation. Project-card and Work-stage regression checks pass.
- Browser verified the current homepage on desktop (1280×720) and mobile (390×844). All four headings wait before scrolling, then use the shared letter reveal. Contact preserves its explicit line break and accessible name. No horizontal overflow at 390px; no browser warnings/errors recorded.
- Reviewed focus completion, reduced-motion preference changes, menu/background pause handling and no-JavaScript fallback in implementation. Static catalog still imports actual website components and renders fully visible without website scripts.
- Website, shared registry, catalog specimen notes, `MOTION.md` and `DESIGN.md` agree on timing, triggers, responsive behavior and accessibility. Work background geometry remains unchanged.

## Ordered section timelines — 17 September 2026

- Replaced independent section-content triggers with one ordered timeline per chapter. The shared chapter trigger now fires when the chapter top reaches 90% of the viewport. The index/title starts first, subtitle at 450ms, first content at 900ms, then every complete content block at 450ms intervals.
- Work cards, complete Impact project rows (identity plus all three metrics), Experience rows, and Contact actions/social links follow DOM/visual order. Head-time CSS hides every future block until its scheduled stage begins; card captions and artwork remain one surface.
- Exact 900/450/1350/1800ms handoffs are covered by the section motion regression check. Keyboard focus and reduced-motion changes resolve the whole waiting section; the mobile-menu and hidden-tab pause lifecycle remains shared.
- Browser verified at 390×844 that completed Impact items are visible while every later Experience row remains hidden before Experience reaches its trigger. Experience and Contact then resolve in their declared order, Contact keeps its explicit line break, the page has no horizontal overflow, and the console has no warnings or errors.
- Browser verified the shared trigger token resolves to `.9`: at a 720px viewport the trigger line is 648px from the top, and untouched later chapters remain hidden before crossing it.
- Browser verified Impact exposes exactly two reveal items. Each `.impact-group` contains one project identity and three stats; identities and stats have no nested reveal markers, so each row moves as one unit. The shared component, catalog notes, registry, `MOTION.md` and `DESIGN.md` describe the same grouping.

## Work filter project bounds — 17 September 2026

- Moved the project filter’s 78px half-height correction from `transform: translateY(-50%)` into its sticky `top`. The 366px rail start remains aligned to the first card, so upward release no longer pulls the visible menu above that line.
- Browser measured the shared three-item filter at 156px. In the 720px review viewport, the rebuilt CSS resolves its sticky top to 282px with no transform, keeping the filter center at 360px. The filter remains hidden below the existing 1640px breakpoint.
- Extended the rail to the Work section bottom instead of the dark sheet bottom. Browser measurement confirms the Work surface and last project end at the same coordinate and the rail resolves to `bottom: 0`; added projects therefore extend the lower release boundary automatically.
- `pnpm check`, `pnpm build` and all 12 test files pass. Website CSS, the shared component registry, catalog notes, `MOTION.md` and `DESIGN.md` document the same sticky and release geometry.


## Work collections and filter transitions — 17 September 2026

- Selected work retains its three original full-width cards. Websites contains five separate fictional concepts; Misc contains seven, each with local WebP photography, varied captions/tags and a visible Concept project label.
- Browser verified 1728px two-column masonry with natural card heights, 768px two-column cards with stacked captions, and 390px/320px one-column layouts. No horizontal overflow at these widths; all three filters remain available.
- Rapid Websites → Misc → Selected work → Websites clicks resolve to the final choice with exactly one accessible collection. Original Selected work cards return to 1200px width at 1728px. The seven-card and five-card collections remain separate.
- Desktop menu is visible after resizing from mobile/tablet, starts alongside the first card, and its lower rail boundary matches the tallest final card within 0.3px. Dark cards use #161715, floating filters remain white, and photo filters are none. Light theme and the normal viewport were restored after review.
- The actual filter-controller harness verifies interruptible scale/opacity transitions, preserved intermediate state, last-click-wins behavior, outgoing inert/aria-hidden state, mobile reflow and instantaneous reduced-motion changes. Reduced motion was verified in the harness, not by changing the operating-system preference.
- `pnpm check`: 83 files, zero errors/warnings/hints. `pnpm build`: successful. All 14 test files pass. No browser warnings or errors recorded.
- Updated approved design decisions in ../DESIGN.md. No design-system catalog, registry or examples were changed for this feature.


## Filter entrances at halfway intervals — 17 September 2026

- Updated incoming cards to 90–100% scale, 24px upward travel and 0–100% opacity over 400ms, with each visual-order card starting 200ms later. Outgoing cards finish their 140ms exit first. All seven Misc cards have distinct delays.
- Fixed CSS time-unit parsing: production can emit `.4s` instead of `400ms`; both now produce 400ms in the animation API. The controller regression test uses mixed second/millisecond units.
- Browser captured the first card mid-entrance while the remaining six were still transparent at scale .9 and translateY 24px, then verified all seven fully visible and the busy state cleared. No console warnings/errors.
- Focused filter tests, `pnpm check` (83 files, zero diagnostics), `pnpm build`, and diff whitespace checks pass. DS unchanged.


## Whole-card tilt and spotlight — 18 September 2026

- Adapted the supplied Tilt/Spotlight example in the existing Astro card: whole-card 3° cursor tilt, 1000px perspective, critically damped return and a 248px white spotlight. No image zoom, scale or additional packages.
- Browser verified pointer tracking across opposite sides of a Website card, spotlight placement on a dark Misc card, full-width Selected work tilt without horizontal overflow, and exit settling to exactly 0° with spotlight opacity 0. All 15 cards initialize; switching categories clears the old card’s state. Light theme was restored. No console warnings/errors.
- Fine-pointer and reduced-motion capability guards, menu/hidden-tab suspension, filter/resize/scroll reset and abortable listener cleanup reviewed in source. No OS preference was changed.
- Spring tests verify 60/120Hz equivalence, no rest-to-edge overshoot, exact settling and interrupted direction changes. Filter tests continue to pass. `pnpm check`: 85 files, no diagnostics. `pnpm build` and whitespace checks pass. DS unchanged.


## Stationary pointer across page scrolling — 18 September 2026

- Root causes: card tilt/cursor explicitly reset on scroll; rain, footer brush and tooltips only received mousemove coordinates; redundant pause setters cleared active rain/brush state. Replaced independent pointer listeners with one shared viewport tracker and current hit testing.
- Browser: a stationary plus cursor stayed centered at (450,570) while the first card moved upward by 180px, then transferred from Fieldwork to Forma without moving the cursor. Only the newly hovered card retained tilt.
- Browser: rain local Y changed from 300 to 480 when its field moved up 180px, preserving viewport (640,300). Footer brush local Y changed from −29.23 to −101.23 while retaining viewport (640,590). Tool tooltip remained visible and anchored at (200,370) as its card moved from Y301.59 to Y244.09.
- New regression test covers scroll coalescing, local reprojection, live target changes, outside-browser/touch guards, no idle loop and reference-counted cleanup. Actual rain and footer renderer tests now scroll the field under a stationary pointer and verify the updated local positions. All 16 test files pass.
- `pnpm check`: 88 files, zero diagnostics. `pnpm build` passes. No browser warnings/errors. DS unchanged.

## Case-study expansion and sample pages — 2026-09-18

- Implemented all 15 card links and standalone case-study routes using the same content component; each has individual sample copy and three images with valid local assets.
- Browser checks at 1280×720: Selected and Websites cards expand into full-screen case studies, shareable URL updates, close control at x=640/y=54, background scroll stays fixed while the case-study scroller moves, close restores the original scroll and filter, browser Back/Forward opens/closes correctly.
- Browser checks at 390×844: direct case-study layout has no horizontal overflow, three images load, modal close control is centered at x=195/y=46. Native dialog plus explicit Tab wrap supports keyboard access; Escape closes.
- Sample stories are labeled as draft/concept material; original project metrics and assets remain intact.
- Final validation: `pnpm check` reports 95 files with zero errors, warnings or hints; `pnpm build` generates all 17 routes successfully. Full 17-test suite passed; affected route/filter/hero checks also pass after the final native-link and scroll-pause refinements. Browser console reports no warnings or errors.
- Dark-mode check: case canvas remains #161715 and close control stays white. Keyboard Page Down scrolls only the case content. Interrupting expansion with Escape restores card visibility, releases the scroll lock and preserves the Misc filter. Preview returned to Light mode.

### Case-study hover and corner timing refinement

- Close control rotates 180° once per hover over 350ms ease-in-out, matching the card plus. White floating background stays unchanged; reduced motion skips the turn. Same treatment on standalone pages.
- Browser measurement: opening panel retained 40px radius while its width was 1161.9px, settled to 0px only at full screen, and closing immediately restored 40px while width was 1249.1px. Hover reported the 350ms half-turn animation and #fff background.
- `pnpm check`: zero errors/warnings/hints. `pnpm build`: successful.

### Close control cleanup

- Reverse flight now fades the control to zero; it is hidden before dialog close/reparent and remains hidden until actual pointer movement.
- Browser verified two open/close cycles: closed dialog, zero controls labelled Close case study, cursor `hidden=true` / `display:none`. Scrolling with the pointer left at the close position keeps it hidden. Moving onto a card restores the normal plus with no close rotation remaining.
- `pnpm check` and `pnpm build` pass.

### Stationary close fade and CTA docking fix

- Case-study dismissal fades the close control at its existing viewport transform; no reverse position/rotation flight. Browser confirmed the same x=618/y=32 button bounds during dismissal, followed by a hidden control after the dialog closes.
- Reproduced CTA entry at x=24.9 despite the hero source at x=64. Removed the generic transform transition for the managed CTA across both parents; refreshed source X immediately before docking.
- Repeated fresh-load browser checks after the fix showed first docking positions x=68.45 / x=71.50 from source x=64, with computed transforms matching the frame loop's inline transforms. Returning to the hero restored x=64 exactly. Managed CTA transition is background-color only in both parents.
- Header motion, hero intro and case-study tests pass. `pnpm check` reports zero diagnostics; `pnpm build` passes. No browser console warnings/errors.

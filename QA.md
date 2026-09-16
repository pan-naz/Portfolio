# Homepage review — 11 September 2026

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

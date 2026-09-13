# Homepage review — 11 September 2026

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

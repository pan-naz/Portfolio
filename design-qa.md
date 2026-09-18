# Design QA — dark surfaces and fixed Light floating controls · 17 September 2026

## Reference lock

- Primary reference: the existing Light-mode floating header pill and Work filter.
- Preserve: white surface, near-black ink, orange state dot/arrow, 24px/full radii, Light floating shadow, and shared NavigationItem spacing/state motion.
- Dark hierarchy: preserve the original #161715 page canvas and use #0F100E for sheets and contained surfaces.
- Keep Light: floating controls. Keep theme-aware: project-card chrome, undocked header, page text, sheets, chips, buttons, mobile drawer, and content surfaces. Keep intact: project artwork, logos, crop and dimensions.

## Website comparison

The homepage was reviewed at 1728 × 1000 in matching Work-section states. Light and Dark computed the header pill and filter to the same #FFFFFF surface, #161715 text and #F25A30 accent. The Dark screenshot keeps those controls visually identical while the page behind them remains the original #161715 and the Work sheet resolves to the darker #0F100E. Experience’s sheet resolves to the same #0F100E role. Project-card chrome now reuses the global #161715 black with light text and #222320 raised chips; the original image source, crop, opacity and filter remain unchanged.

## Design-system comparison

The Dark-mode catalog now shows the #161715 → #0F100E nesting directly and renders static floating-pill, project-filter and ProjectCard specimens from the actual shared components. Computed values match the website exactly. The palette lists both fixed Light floating-control tokens in both modes, while component notes explain their role and the ProjectCard note records the unchanged artwork treatment.

## Required fidelity and findings

- Component geometry, typography, motion, responsive behavior, and project artwork are unchanged; only ProjectCard color roles follow the active theme.
- Primary and secondary text remain AA-compliant on canvas, surface, and subtle-surface roles. Floating ink on white also passes AA.
- No horizontal layout change or catalog-only component style fork was introduced.
- No actionable P0, P1, or P2 mismatch remains.

**final result: passed**

---

# Design QA — faster Experience row cadence · 17 September 2026

## Comparison target

- Source: `/var/folders/tw/d092mts90jv8t060bfds48cm0000gn/T/codex-clipboard-3c3e282f-db55-4320-9ab2-76781dc4dd30.png`
- Implementation: `http://127.0.0.1:4322/#about`
- State: desktop, light page with the dark Experience sheet at rest

## Full-view comparison

The source and implementation were reviewed together. The section geometry, typography, row dividers, alignment, spacing, and final resting state are unchanged; this revision adjusts motion timing only.

## Motion comparison

- The title, subtitle, trigger point, and first-row start retain the shared page cadence.
- Each Experience content item now reveals over 620ms and the next item begins 160ms later. The previous values were 900ms and 450ms.
- The existing 8px rise and easing remain, so the rows overlap smoothly instead of snapping into place.
- The seven rows and Tools block finish in about 2.64s from the chapter start, down from about 4.95s.

## Required fidelity and result

- DOM order, pre-delay hiding, reduced-motion behavior, and the focus completion path remain intact.
- Work, Impact, and Contact retain their current animation timing.
- No design-system catalog files were changed.
- Result: passed source comparison, automated checks, build, and motion timing tests.

# Design QA — cursor-following tool tooltip · 17 September 2026

## Comparison target

- **Source visual truth path:** `/var/folders/tw/d092mts90jv8t060bfds48cm0000gn/T/codex-clipboard-b3ea0941-bcb1-4387-9295-246659c253be.png`
- **Implementation URL:** `http://127.0.0.1:4322/#about`
- **Implementation screenshot path:** inline Codex in-app browser capture in this task; the selected browser does not expose a persistent filesystem path for its screenshot bytes.
- **Viewport:** 1528 × 900 CSS pixels, DPR 1.
- **State:** light page theme, dark Experience sheet, precise-pointer hover on Claude Code.

## Full-view comparison evidence

The supplied floating-menu crop and the browser-rendered tooltip were emitted together in one comparison input. The implementation carries the reference's white surface, generous rounded silhouette, dark Urbanist text and soft ambient shadow into a compact cursor label without changing the tool-card geometry.

## Focused comparison evidence

The tooltip computed as white, 999px radius, 16/24 regular Body/M text, dark `rgb(22,23,21)` ink and a `0 12px 32px` shadow at 14% opacity. Its live local x/y anchors are calculated directly from the cursor and card rectangle without clamping, preventing animated section transforms from creating a viewport offset. The near-top placement flips below the cursor, and pointer focus does not reset it to the keyboard anchor. The mark resolves to scale 1.08 with a 520ms gentle ease.

## Required fidelity surfaces

- **Typography:** Body/M is exactly 16px, 24px line height and weight 400.
- **Shape and elevation:** White pill surface and soft menu-like shadow follow the supplied rounded floating panel.
- **Motion:** Icon scaling uses 520ms. The tooltip follows the cursor through a frame-rate-independent 72ms curve; its 320ms opacity and 440ms 82–100% scale are the only appearance/disappearance properties. The stronger collapsed scale makes both entrance and exit visibly read as scale plus opacity.
- **Pointer relationship:** The label follows exact unclamped card-local cursor coordinates with one animation-frame write and changes vertical placement only near the viewport's top edge.
- **Accessibility:** Each informational card remains keyboard focusable and exposes the same tool name through `aria-labelledby`; reduced motion keeps the label and focus outline while removing scale motion.

## Findings

- The browser pass caught pointer-acquired focus resetting the tooltip to the keyboard-centered anchor after a drag. The focus handler now applies only to `:focus-visible`, preserving cursor attachment for mouse input.
- No remaining P0, P1 or P2 mismatch. Console review returned no warnings or errors.

## Comparison history

- First pass: rounded white surface, Body/M styling and smoother motion matched the request; pointer testing exposed the focus reset.
- Final pass: pointer movement eases toward the latest anchor without a center jump, while keyboard focus retains the stable fallback. A left-edge hover placed the tooltip at x=28px beyond the card's x=64px boundary, confirming the card no longer constrains it.

**final result: passed**

---

# Design QA — Website catalog section removal · 17 September 2026

## Comparison target

- **Source visual truth path:** `/var/folders/tw/d092mts90jv8t060bfds48cm0000gn/T/codex-clipboard-d6c21929-595c-4543-a06e-004df227d34d.png`
- **Implementation URL:** `http://127.0.0.1:4322/design-system/`
- **Implementation screenshot path:** inline Codex in-app browser capture in this task; the selected browser does not expose a persistent filesystem path for its screenshot bytes.
- **Viewport:** 390 × 844 CSS pixels, DPR 1.
- **State:** light theme, design-system route at the top, no interaction active.

## Full-view comparison evidence

The source crop and the browser-rendered mobile catalog were emitted together in one comparison input. The source identifies the `Website` navigation item to remove. The implementation shows Foundations, Components and Modes followed directly by the Color section, with no Website entry. A browser DOM check returned `hasWebsiteLink: false` and `hasWebsiteSection: false`.

## Focused comparison evidence

The requested change concerns a single navigation item and its destination section, both clearly visible in the combined mobile comparison. A second crop was unnecessary. Production output also contains no `website-components` id, `/design-system/preview/` URL or iframe, and the removed preview route is absent.

## Required fidelity surfaces

- **Fonts and typography:** Existing Urbanist catalog typography is unchanged.
- **Spacing and layout rhythm:** Removing the entry closes the navigation list naturally; Modes and Dark mode remain aligned with the existing two-column mobile index.
- **Colors and visual tokens:** No token or palette changes.
- **Image and asset fidelity:** No visible source assets were replaced or redrawn.
- **Copy and content:** The Website label, section copy, embedded page and connection list are removed; all remaining catalog labels are unchanged.

## Findings

- No actionable P0, P1 or P2 mismatch remains.
- Console review returned no warnings or errors.

## Comparison history

- First pass: the source and implementation comparison found the requested Website item and section fully absent, so no visual repair iteration was required.

## Implementation checklist

- [x] Remove Website navigation item.
- [x] Remove Website section and embedded preview.
- [x] Remove the preview route and obsolete catalog CSS.
- [x] Decouple website changes from design-system registration and documentation.
- [x] Verify mobile layout, production output, checks, build and tests.

**final result: passed**

---

# Design QA — static Figma catalog rebuild · 16 September 2026

## Reference lock

Primary source: `../figma-ds.svg`, Figma node 85:161. Finished component content and composition: `../figma-home.svg`, node 67:15. Reference renders are in `../reference-research/figma-migration/`.

| Decision | Source | Implementation |
| --- | --- | --- |
| Specimen-sheet layout, heading scale, neutral canvas | Figma DS | 1200px desktop column; numbered headings; Urbanist; hairline specimen divisions |
| Color and typography | Shared Figma tokens | Six semantic colors in both modes; type specimens use the shared scale; readouts extracted from token CSS |
| Simple left anchors | User approval | 13 used destinations; native links; instantaneous active indicator; wrapping mobile index |
| Static DS | User approval | Script-free shared-page preview, sandboxed iframe, isolated static stylesheet |
| Used content only | User approval + website consumers | Eight component specimen groups and shared-page composition; unused placeholders, search, tabs and governance sections removed |
| Final card composition and metric color | Finished Figma homepage | Actual ProjectCard and Stat imports, original assets; no catalog-specific visual overrides |
| Mobile | Existing website contract; no mobile Figma supplied | 24px gutters, wrapping labels, stacked rows and palettes |

## Rendered verification

- **Source truth:** supplied SVGs and their foundation, typography, component and dark-mode crops.
- **Implementation evidence:** in-app browser screenshots captured in this task from `http://127.0.0.1:4322/design-system/`: full desktop Color and Typography views, Button/Logo specimens, dark section, mobile Color and Timeline, and static website Work preview.
- **Viewport/state:** desktop 1728×1080, 1440×900; mobile 390×844. Additional overflow checks at 320, 768 and 1024px. Both color modes are displayed together.
- **Layout:** no horizontal page overflow at 320, 390, 768, 1024, 1440 or 1728px. At 1728px the main specimen column starts at x=264 and is 1200px wide.
- **Navigation:** all 13 anchors resolve. Clicking Button lands its section at 32px and marks exactly one current link. Static iframe section links navigate the actual shared composition.
- **Components:** website and DS primary buttons compute 48px height, Urbanist 600 and 999px radius. Small specimens compute 36px. Dark samples resolve to ink #FAF8F7, background #161715, surface #222320 and accent #FF6B42.
- **Motion:** iframe contains zero scripts, its skill track has animation `none`, duplicate skills are hidden and the mask is removed. Catalog controls compute zero transition duration. Public website still computes `skills-up`, retains its animation entry script and never receives the static-mode attribute or stylesheet.
- **Connection:** 25 public components have website consumers, registry entries and direct/shared-page specimens. A production check compares website and preview body markup for equality after removing scripts.
- **Build:** `pnpm check` reports 67 files with zero errors/warnings/hints. `pnpm build` passes, including static-catalog isolation validation. All nine test files and the DS guard self-test pass.
- **Motion preservation:** SHA1 comparison against the beginning of this task confirms only `src/scripts/design-system.ts` changed. Every website animation and theme script is unchanged.

## Findings and scope

Resolved: stale catalog sections and links, animated website embed, duplicated documentation chrome, unused Raised elevation, and the project mark's hardcoded 8px radius (now the shared Figma 12px token). The old typography test's source-file assumption was updated to follow DSCatalog; its responsive-scale assertions remain intact.

The DS is a responsive implementation of the supplied sheet, with the user-approved navigation and content reduction. Generic Figma placeholder examples are replaced with actual website content. The website retains its previously approved motion and responsive adaptations. No public deployment or Figma writeback was performed.

No unresolved P0, P1 or P2 findings in the rebuilt catalog.

**final result: passed**

---

# Historical QA — process-label font and color

- **Source visual truth:** `../figma-home.svg`, Figma homepage node 67:15; focused render at `qa/figma-label-source.jpg`.
- **Implementation screenshot:** `qa/figma-label-font-color-after.jpg`, captured from the local homepage in the Codex in-app browser.
- **Viewport:** 1728 × 800 CSS pixels.
- **Density:** source SVG rendered at 1 source pixel per CSS pixel; implementation screenshot captured from the same 1728px browser viewport. The browser screenshot service encodes focused crops as JPEG, so computed browser values are included below as the definitive type and color check.
- **State:** light theme, homepage hero at its initial scroll position. The label group is static; the active hero role and waterfall frame do not affect it.

## Full-view comparison

The rendered 1728px homepage was compared with the supplied Figma homepage. The label group remains in the existing hero process column and the rest of the hero composition is unchanged. No animation source was modified.

## Focused comparison

| Property | Figma source | Implementation |
| --- | --- | --- |
| Family | Urbanist | `Urbanist Variable`, Urbanist fallback stack |
| Style | Label/S | Label/S |
| Size | 12px | 12px |
| Weight | 500 | 500 |
| Line height | 16px | 16px |
| Color | primary ink `#161715` | `rgb(22, 23, 21)` / `#161715` |
| Letter weight | uniform | uniform |

The same computed values were verified in the shared Tags specimen at `/design-system/#tags`.

## Findings

- **Resolved:** The previous implementation used tertiary `#A19C98` and a 700-weight first letter. `SkillTag` now renders the full process label at weight 500 in primary ink.
- **P1:** None remaining.
- **P2:** None remaining.
- **P3:** None remaining.

**final result: passed**


## Work collections — 17 September 2026

Source: user-supplied two-column Work example, existing shared ProjectCard, and the reference lock in ../reference-research/work-filter/README.md.

Visual review at 1728px confirms rounded cards, split identity/copy captions, full-width photo slots, independent column heights and the original sidebar menu. The 768px adaptation stacks caption content within each column; 390px and 320px use a single column and compact filter. Both themes preserve the existing surface hierarchy and unchanged photographs.

Resolved during review: the desktop rail previously remained invisible after resizing from a compact viewport. It now reveals immediately when returning to desktop after the Work expansion. Browser measurements confirm the lower rail follows the longest column rather than the shorter one.

Filter animation uses whole-card scale and opacity, a short stagger and a 420ms container-height transition. Automated controller checks cover interrupted transitions and reduced motion; browser interaction confirms final selection, focus, counts and cleanup. No unresolved layout or interaction findings in the reviewed states. DS updates were outside this request.

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

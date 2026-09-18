# naz.wtf portfolio

Responsive Astro portfolio with a separately maintained static design-system catalog. The approved visual source is `../DESIGN.md`, based on the user-supplied `../figma-ds.svg` and `../figma-home.svg`.

## Run

Use Node.js 22.12+ and pnpm.

```sh
pnpm install
pnpm dev
pnpm check
pnpm build
node --test tests/*.test.mjs
```

Run commands inside this folder. Astro prints the local preview URL. The site remains unpublished and retains its draft `noindex, nofollow` metadata.

## Content and assets

`src/data/portfolio.ts` contains project cards, six impact metrics, seven experience rows and contact destinations transcribed from the approved homepage export. See `COPY.md` for provenance. Project images and original marks live in `public/projects/`; responsive WebP versions preserve the supplied artwork. The supplied CV is served from `/nazarii-pankiv-cv.pdf`.

Project-card destinations are optional: add `href` only when a real case-study destination is ready. Cards currently present the full approved content without a fabricated case-study link. The project rail filters Selected work, Websites and Misc; the latter two currently have no projects.

The extraction script and reference renders are in `../reference-research/figma-migration/`. No flattened homepage screenshot is used as website content. The waterfall remains the existing live canvas animation.

## Shared design system

`src/data/ds-components.ts` registers only the components currently documented through direct catalog specimens. The website and `/design-system/` share `src/styles/tokens.css`, while `PortfolioPage.astro` composes only the homepage. `src/data/design-system.ts` supplies the 12 catalog anchors; `src/data/navigation.ts` supplies website links.

The catalog follows the Figma specimen sheet: color, typography, space and shape, selected component specimens and dark-mode examples. The Website section, embedded portfolio preview, search, tabs and animated demos are removed. The mobile anchor index wraps above the sheet. Color readouts are extracted from the shared token CSS at build time. Scoped dark tokens render both modes together; component visual styles are never redefined by catalog CSS.

The design system is maintained independently and changes only when the user explicitly requests a DS update. Website work does not require a catalog registration or documentation edit. Routes still compose components rather than containing page-specific designs, and documentation styles use the `ds-` prefix so they do not fork component styles.

## Motion and responsive behavior

The hero uses native staged reveals and cycles through System thinker, AI builder, Web designer and App designer. Stages begin at 450ms intervals over 900ms core reveals; the header is visible immediately and the waterfall starts after its independent two-second delay. Skills loop, header docking, project reveals, theme toggle and drawer behavior remain active. Shared navigation items use an accent dot and label shift for hover, focus and active states. The retired “A way of thinking” section and its dedicated animation were removed. Reduced motion reveals content immediately and suppresses decorative motion.

`static-preview.css` is loaded only by `DSLayout`. It disables animation, transitions, smooth scrolling and moving hover treatments in catalog specimens. The catalog never initializes website motion or persists a theme choice. The normal website continues to use `BaseLayout` and its existing scripts.

No mobile Figma design was provided. The implementation adapts desktop with stacked card headers, metrics and timeline rows, wrapping labels, 24px gutters and the existing accessible drawer. Desktop content is centered at 1200px; the hero keeps the supplied frame’s wider inset. Dark sheets use surface and project cards remain pinned to Light, as specified by the DS.

## Validation

`pnpm check` and `pnpm build` run the catalog specimen guard and foreground/background contrast checks. The guard validates only components intentionally documented in the DS; it does not require every website component to appear there. `node --test tests/*.test.mjs` covers typography, contrast and animation behavior. Primary and secondary text pass 4.5:1 on the supported surfaces; the contrast utility composites Figma’s alpha-muted colors before calculating ratios. Accent and decorative tertiary uses require their own size/context checks and are not covered by a blanket accessibility claim.

When design-system work is explicitly requested, review its examples and documentation in both themes with keyboard, responsive and reduced-motion checks. See `QA.md` for the latest verification.

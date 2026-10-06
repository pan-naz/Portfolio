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

For phones and tablets on the same Wi-Fi, run `pnpm build` then `pnpm preview:lan` and open the Network URL printed by Astro. Keep the Mac awake and the server running. Rebuild after changes. Use this preview server for video byte-range requests; Python's basic `http.server` sends the whole video even when a browser asks for a small chunk. Videos load and play only when visible, and keep their posters with reduced motion enabled.

## Content and assets

`src/data/portfolio.ts` contains project cards, six impact metrics, seven experience rows and contact destinations transcribed from the approved homepage export. See `COPY.md` for provenance. Project images and original marks live in `public/projects/`; responsive WebP versions preserve the supplied artwork. The supplied CV is served from `/nazarii-pankiv-cv.pdf`.

Project-card destinations are optional: add `href` only when a real case-study destination is ready. Cards currently present the full approved content without a fabricated case-study link. The project rail filters Selected work, Websites and Misc; the latter two currently have no projects.

The extraction script and reference renders are in `../reference-research/figma-migration/`. No flattened homepage screenshot is used as website content. The waterfall remains the existing live canvas animation.

Standalone icons and logos are genuine SVG vectors. `Icon` renders the shared geometry from `src/data/icons.ts`; `IconButton`, `Arrow`, theme controls, media controls and footer previews consume it. `SvgAsset` renders project, tool, competitor and persona assets as inline SVG, preserving each source viewBox and namespacing gradients, filters and clips for repeated instances. Use these components instead of copying SVG markup or loading logos through image tags. `Logo` uses outlined Funnel Display geometry from the shared heading tokens from `src/data/wordmark.ts`; regenerate it through `../reference-research/svg-audit/generate-wordmark.py` when the font or heading tokens change (FontTools and Brotli are generation-only dependencies). Original raster marks are archived in that audit folder. Photos, product screenshots and recordings keep their original media formats; the rain/footer canvas effects render Lucide SVG geometry.

## Shared design system

`src/data/ds-components.ts` registers only the components currently documented through direct catalog specimens. The website and `/design-system/` share `src/styles/tokens.css`, while `PortfolioPage.astro` composes only the homepage. `src/data/design-system.ts` supplies the catalog anchors; `src/data/navigation.ts` supplies website links.

`src/styles/fonts.css`, imported by the shared global stylesheet, serves Funnel Display Variable for headings and Label/M, and Urbanist Variable for body copy, Label/S and controls. Every heading consumer uses `--font-heading`. Heading/XL and Heading/L consume `--font-weight-heading-large` at 400, while Heading/M consumes `--font-weight-heading` at 500, Body/M Strong consumes `--font-weight-body-m-strong` at 500, and Label/M consumes `--font-weight-label-m` at 500. Heading/XL and Heading/L use −3.64px and −2.64px letter spacing; existing sizes and line heights are preserved.

The catalog follows the Figma specimen sheet: color, typography, space and shape, selected component specimens and dark-mode examples. The Website section, embedded portfolio preview, search, tabs and animated demos are removed. The mobile anchor index wraps above the sheet. Color readouts are extracted from the shared token CSS at build time. Scoped dark tokens render both modes together; component visual styles are never redefined by catalog CSS.

The design system is maintained independently and changes only when the user explicitly requests a DS update. Website work does not require a catalog registration or documentation edit. Routes still compose components rather than containing page-specific designs, and documentation styles use the `ds-` prefix so they do not fork component styles.

## Motion and responsive behavior

The hero uses native staged reveals and cycles through System thinker, AI builder, Web designer and App designer. Stages begin at 450ms intervals over 900ms core reveals; the header is visible immediately and the waterfall starts after its independent two-second delay. Skills loop, header docking, project reveals, theme toggle and drawer behavior remain active. Shared navigation items use an accent dot and label shift for hover, focus and active states. The retired “A way of thinking” section and its dedicated animation were removed. Reduced motion reveals content immediately and suppresses decorative motion.

`static-preview.css` is loaded only by `DSLayout`. It disables animation, transitions, smooth scrolling and moving hover treatments in catalog specimens. The catalog never initializes website motion or persists a theme choice. The normal website continues to use `BaseLayout` and its existing scripts.

No mobile Figma design was provided. The implementation adapts desktop with stacked card headers, metrics and timeline rows, wrapping labels, 24px gutters and the existing accessible drawer. Desktop content is centered at 1200px; the hero keeps the supplied frame’s wider inset. Dark sheets use surface and project cards remain pinned to Light, as specified by the DS.

## Validation

`pnpm check` and `pnpm build` run the catalog specimen guard, foreground/background contrast checks and `pnpm validate:svg`. The SVG guard checks standalone mark references, shared component ownership, public/persona vector contents and animated SVG geometry; it rejects raster logos, bitmap SVG wrappers and character-based control icons. The catalog guard validates only components intentionally documented in the DS; it does not require every website component to appear there. `node --test tests/*.test.mjs` covers typography, contrast and animation behavior. Primary and secondary text pass 4.5:1 on the supported surfaces; the contrast utility composites Figma’s alpha-muted colors before calculating ratios. Accent and decorative tertiary uses require their own size/context checks and are not covered by a blanket accessibility claim.

When design-system work is explicitly requested, review its examples and documentation in both themes with keyboard, responsive and reduced-motion checks. See `QA.md` for the latest verification.

# naz.wtf portfolio

Static Astro portfolio. Runtime source is in `src/`, build validators and the responsive-image generator are in `scripts/`, and delivered media/assets are in `public/`. The workspace visual source of truth remains `../DESIGN.md`.

## Run and preview

Use Node.js 24.x (the configured Vercel major) and pnpm. Run commands in this folder:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm typecheck
pnpm build
pnpm preview --port 4337
```

For a device on the same Wi-Fi, use `pnpm preview:lan` after building and open Astro's printed Network URL. Keep the computer and preview running, and rebuild after changes. Astro preview supports video byte-range requests.

## Validation

`pnpm check` and `pnpm build` run the design-system, text-contrast and SVG guards. The build also validates the isolated static catalog. TypeCheck runs Astro diagnostics and TypeScript without emitting files.

```sh
node --test tests/*.test.mjs
RAIN_GPU=1 node --test tests/waterfall-renderer.test.mjs
```

The test suite covers case-study media, genuine SVG geometry, typography and interactive/rendering behavior. Original-byte fixture tests also use the workspace's sibling `reference-research/` archive; keep that archive available when running the full suite locally. Browser comparison tools and their own dependencies live outside this repository in the workspace tools folder.

Website routes compose shared components. The portfolio and separately maintained `/design-system/` catalog share `src/styles/tokens.css`. Catalog changes require an explicit design-system request. Standalone icons/logos use shared `Icon`, `SvgAsset` and `Logo`; project website links use shared `TextLink`.

CSS declares `@layer system, project;`: shared tokens and component rules use `system`; case-specific styles use the higher `project` layer. Project-only colours, backgrounds and specimen fonts stay in each project's scoped variables and are excluded from design-system tokens and consolidation. Browser comparisons also require all 20 home popups to match their direct-page backgrounds in both themes at 375 and 1440.

## Design-system maintenance

The catalog follows Overview → Foundations → Components → Patterns → Guidelines. Every component uses Purpose → Anatomy → Variants → States → Usage → Accessibility → Tokens → Code, with implementation paths collapsed. One shared ThemeToggle controls all specimens.

`src/data/system-inventory.ts` reads the actual website import graph, tokens, component inputs and usages. Text styles, responsive values, contrast ratios and frozen CSS states are read from their source modules. Add purpose and usage guidance in `system-documentation.ts` when a real website consumer introduces a component; do not add catalog-only items.

The design-system guard rejects missing or unused components/tokens/icons/variants and project-only values or fonts. The production catalog check compares rendered control variants with all non-catalog routes. `pnpm check`, `pnpm build`, `pnpm typecheck` and the tests are required. For a catalog change, run the workspace browser gate with `--catalog-overhaul`: 88 unchanged website captures, 80 exact popup/direct background pairs, runtime checks, and six catalog captures at 375/768/1440 in both themes. Keep original media and the indexing flag unchanged.

## Generated images

`pnpm build` generates ignored `public/generated/images/` with the Sharp dependency supplied by Astro. `scripts/responsive-image-policy.json` lists eligible static sources and exclusions. PNG sources receive lossless WebP; other eligible static raster sources receive quality-88 WebP/AVIF. A format is served only when every candidate is no heavier than the original. Posters, animated media and videos remain excluded; the native-alpha/shadow exceptions stay explicit. Original assets are preserved as fallbacks. A fresh dev checkout works with originals before generation. No runtime image optimizer is used.

## Pre-launch indexing

The production origin is `https://naz.wtf`. All pages retain `noindex, nofollow` through `indexingEnabled = false` in `src/data/site-config.ts`. Change that flag only when launch is approved, then rebuild. Robots allows crawling and lists the generated sitemap. Static sharing JPGs live in `public/og/`; home and the catalog use `home.jpg`. `vercel.json` contains the approved response headers.

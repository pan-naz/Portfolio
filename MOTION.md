# Current homepage section motion — 17 September 2026

`DESIGN.md` is the current visual and motion contract. `section-reveals.ts` gives each homepage chapter one ordered native timeline. The index and title start together, the subtitle starts at 450ms and the first content block at 900ms. Work, Impact and Contact continue at 450ms intervals with the hero’s 900ms, 8px-rise recipe. Experience keeps the same heading/subtitle handoff and first-row start, then uses a faster 160ms row interval with a smooth 620ms fade-and-rise. Title glyphs retain their 35ms internal stagger. Each chapter starts when its top reaches 90% of the viewport, and desktop Work applies the same threshold to its visible sheet edge. Touch keeps the full-width static Work background and receives the same ordered timeline.

Work cards, complete Impact project rows (identity plus all three metrics), Experience rows followed by the complete Tools I use block, and Contact actions/social links are timeline items in DOM and visual order. Experience's seven rows and final Tools block share the tighter 620ms/160ms cadence; the four tool cards still enter together as one final item. All future items remain hidden until their delay begins, so content below cannot appear under the active entrance. The desktop project filter remains centered while sticky; its half-height is included in the sticky top rather than a transform, so upward release aligns its visible top edge with the first project card. Its rail spans through the Work section bottom, so downward release aligns its bottom edge with the last project card even when the project count changes. Footer metadata and the Design system link render immediately without an entrance. Hero intro, Work background and navigation motion retain their existing recipes.

Each tool card reveals its name in a rounded white Body/M tooltip that uses the pointer's unclamped local coordinates, so the label can extend beyond the card. A frame-rate-independent 72ms follow curve makes it float smoothly toward the latest cursor position while preserving the constant 14px offset. It switches below the pointer only near the viewport's top edge. Appearance and disappearance animate opacity over 320ms and visibly scale between 82% and 100% over 440ms, anchored toward the cursor. Keyboard focus places the same tooltip at a stable card-centered anchor. The source-vector mark scales to 108% over 520ms. Reduced motion removes the cursor interpolation, transitions and icon scale while preserving the tooltip and visible focus outline.

The native lifecycle pauses in hidden tabs and while the mobile menu is open. Focus and reduced motion finish waiting entrances immediately. Explicit Contact line breaks and accessible heading names survive glyph splitting. The separately maintained catalog keeps only its explicitly requested component specimens static.

The theme toggle uses simple 24px sun and moon SVGs. Either visible glyph rotates 180 degrees over a 600ms ease-in-out on precise-pointer hover, then returns with the same timing. The icon stays inside the existing 44px control; reduced motion and the static catalog keep the resting glyph still.

The footer divider holds a random, uneven pile of fixed 10px interface icons. A fresh page seed changes the silhouette, icon selection, positions and angles on reload; initial deposition is settled before the first canvas paint. The composition stays near the center and leaves the divider endpoints clear. All glyphs share the `--footer-icon-ink` token (#b8b8b8 Light / #747474 Dark), with 1px strokes and no per-icon shade or opacity variation. The pointer uses an invisible solid 100px-diameter circle (50px radius), independent of the hero rain's 220px field. It grows into first contact over approximately 120ms, then follows the mouse directly with bounded substeps, transferring movement through collisions rather than a weak distance force. Matter.js runs the interaction at a fixed 120Hz with local sleeping, friction and low restitution. A shelf constraint resolves compressed cursor contacts sideways so icons cannot be pushed through the divider. A stationary cursor holds its space and the RAF stops after settling; leaving releases the circle. Icons fall only beyond the full divider's endpoints and never refill before reload. The live drawing and pointer bounds extend through both content gutters to the viewport edges, so falling icons remain visible across that space and are removed only after fully leaving the screen. Theme changes and resize preserve the seed and displaced state. Touch and reduced-motion devices show a fresh static arrangement. Physics pauses offscreen, in hidden tabs and behind the mobile menu. The decoration is aria-hidden and never intercepts links. Implementation uses the [Matter.js engine](https://brm.io/matter-js/docs/classes/Engine.html), [body positioning](https://brm.io/matter-js/docs/classes/Body.html) and [sleeping](https://brm.io/matter-js/docs/classes/Sleeping.html) APIs.

---

Historical direction below predates the approved Figma migration and the current motion contract.

# Motion direction — Genie Studio adaptation

Scope: homepage animation only. The existing DESIGN.md layout, typography, colors, original copy and honest project placeholders are unchanged. This implements the user's three requested additions, not a clone of the reference.

## Reference evidence

Reviewed the [Genie Studio homepage](https://geniestudio.app/) and its publicly delivered animation module on 11 September 2026. Browser scrolling showed the transition from the hero into the pinned illustrated narrative. The public module confirms Lenis, GSAP and ScrollTrigger; exact timing observations below come from that module, not estimates from static screenshots.

- Intro: the hero itself appears in stages; no separate blocking splash was observed. Heading lines use a 32px rise, 2s duration and 80ms stagger after a 200ms timeline delay. Description and CTA overlap rather than waiting for every heading line to finish.
- Scrolling: Lenis smooths scroll input; ScrollTrigger coordinates the scenes.
- Movement: some elements have timed reveals, while others follow scroll progress. A tilted product mockup straightens and scales into place; illustrated narratives use pinning, translation and text reveals. These are distinct techniques, not one fade applied to the entire page.

## Portfolio adaptation

| Request | Implemented behavior | Boundary |
|---|---|---|
| First-screen intro | Overlapping headline, copy, CTA and circle entrance; approximately 1.5s overall | No loader, no copied illustrations, no blocked scrolling; finish immediately on interaction |
| Smooth scroll | Lenis 0.1 interpolation on desktop fine-pointer input; GSAP ticker integration | Native touch; no smoothing on small screens or reduced motion; no section snapping |
| Elements appearing on scroll | Headings and captions rise/fade with short staggered groups | Run once; readable immediately without JavaScript; keyboard focus completes reveals |
| Elements moving with scroll | Desktop project panels settle from 56px down and 0.965 scale to their natural position, with 0.55s catch-up | No new long pins; mobile gets a 22px timed reveal instead |

The existing short dark text-emphasis scene remains the sole pinned narrative. The existing rotating naz.wtf circle retains its pause/resume control. Menu timings and the visual component system are unchanged.

Implementation: `src/scripts/motion.ts` owns intro, entrances, panel movement and Lenis lifecycle; `interactions.ts` connects menu/anchor interactions and maintains the existing narrative and navigation behavior. GSAP media contexts remove active effects when reduced-motion preferences change. Lenis ticker callbacks are removed when its media condition stops matching.

The Refero motion guidance informed hierarchy, interruptibility and reduced-motion fallbacks. Sites informed the local preview/build verification; nothing was published.

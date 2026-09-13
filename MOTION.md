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

# naz.wtf portfolio

Local-only responsive Astro homepage. The visual source of truth is `../DESIGN.md`.

## Run

Use Node.js 22.12+ (a supported even-numbered release) and pnpm.

```sh
pnpm install
pnpm dev
pnpm build
```

The Astro development URL is printed when starting the server. This project has not been published. The draft includes `noindex, nofollow`; review and remove it before a future public launch.

## Add your content

Edit `src/data/portfolio.ts`: name, professional title, original introduction, biography, contact email, projects and experience. Put approved project images in `public/projects/` and reference them as `/projects/filename.webp`. Set `pending: false` only when the project content is real. Project links render only for non-pending entries with a destination. No contact email, company, client, metric or testimonial has been invented.

The three initial project slots are intentional placeholders, authorized while the user gathers the content. Replace their media, titles and descriptions. The homepage copy and six experience entries now use the user's LinkedIn PDF, reviewed on 12 September 2026. The displayed name follows that profile's spelling, Nazarii Pankiv. See `COPY.md` for the source and editorial decisions. No email is provided; the contact action links to the supplied LinkedIn profile.

## Design and reference decisions

- `../DESIGN.md`: gray canvas, Urbanist, heavy editorial headings, fine rules, rounded media, restrained shadows and orange accent.
- Yash Sonwaney's homepage: broad sequence of introduction, work and personal/experience information. No wording, assets, logos, project data, biography or testimonial text was reused. Category filters and testimonial carousel were omitted because no corresponding user content exists yet.
- The user-requested rotating circular `naz.wtf` mark is an explicit exception to the design system's default ban on decorative loops. It has a pause control and stops for reduced motion.
- Astro generates the static document. TypeScript handles interactions; GSAP/ScrollTrigger handles entrances and the short desktop scroll-emphasis sequence. Lenis provides user-requested desktop wheel smoothing. No React, CMS or database.
- Genie Studio is a motion-only reference for the staged hero entrance, smooth scroll and project-media settling. No illustrations, branding, text or source code were copied. See `MOTION.md` for the reference-to-implementation mapping.

## Behavior

- Semantic anchor navigation, preserved URL fragments and destination focus. Lenis smooths desktop wheel input on fine-pointer screens; touch and small screens keep native scrolling. Reduced motion disables smoothing and entrances.
- A roughly 1.5-second overlapping hero intro, interrupted immediately by scrolling, touch or keyboard focus. Deep links and restored scroll positions skip it.
- Staggered heading/caption reveals and scroll-linked desktop project panels; mobile panels use short one-time entrances.
- Compact desktop navigation after the hero; native modal navigation drawer on mobile with Escape, focus containment and restoration.
- Pause/resume logo rotation; system reduced-motion preference also respected.
- One 160svh desktop narrative with a 100svh sticky viewport. Natural flow on mobile, short viewports, reduced motion or when enlarged text cannot fit.
- All meaningful content renders without JavaScript. No fake case-study buttons or dead email links.

Production readiness depends on the user's featured projects, approval of the rewritten copy, and a final contact/launch review. Profile, title and visible experience entries are populated; case studies remain pending. Visual and interaction validation is recorded in `QA.md` after review.

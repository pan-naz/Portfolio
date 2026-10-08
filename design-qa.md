# Full-controller hover preview QA — 8 October 2026

Final result: **passed**.

Source truth: the user’s request to let the preview move beyond slider width, the shared controller, updated reference lock and DESIGN.md. This changes the shared CaseStudyMedia structure, player positioning and preview CSS; all seven controllers inherit it.

## Verified layout and behavior

The tooltip is an absolute child of the complete controller rather than the seek wrapper. It follows the hovered timeline point and clamps only at controller edges. Preferred 200px previews no longer shrink to the seek width; Hooko retains its 80px portrait preview. The visible 8px gap above the pill is unchanged. Layout offsets avoid mixing transformed screen dimensions with layout coordinates, and visible previews reflow on window resize.

- Telegram desktop: at the beginning, the preview reaches x=80, the controller’s left edge, while the seek field begins at x=136. At the end, the 200px preview reaches x=1167, beyond the seek field’s x=1066.59375 endpoint and still within the controller’s x=1200 edge.
- Resizing that open endpoint preview from 1280px to 320px correctly keeps its 200px width and realigns it to x=88–288, ending at the controller edge. The seek field ends at x=232. At the beginning, the preview starts at x=32, also the controller edge. No horizontal page overflow.
- Hooko: its 80px portrait preview ends at the controller’s x=368 edge instead of the seek field’s x=356 edge. Timestamp and original frame remain correct.
- DataGPT actual pointer hover: preview reaches x=1200, the controller edge, while the slider ends at x=1110.59375. Its 1:23 thumbnail appears while paused playback stays at 0.508054s, so hovering does not seek. No sound toggle appears.
- Saved desktop/mobile/portrait captures and runtime bounds. `preview-controller-bounds-detail.png` is a focused crop of the actual DataGPT hover capture, showing the preview extending over the timer to the pill edge. Reviewed screenshots show no clipping or misplaced frames.

Hover previews, keyboard seeking, compact fixed timer slots, universal looping, manual Pause/Play and Telegram-only audio remain shared. Original recordings and thumbnail sheets are unchanged. No design-system catalog edits. No unresolved P0/P1/P2 findings.

## Validation

`pnpm check` and `pnpm build` pass: 168 files, no diagnostics, 17 routes; shared design-system, contrast, SVG and static-catalog guards pass. Case-study coverage passes for all 15 projects and all seven shared controllers, with native loops and original preview mappings. Shared video lifecycle/Pause/Play/sound regressions and `git diff --check` pass.


Picker Concept metadata correction verified: the live standalone title/page title is “Picker Concept”, with Android / Interaction design / Principle / After Effects. Existing metadata checks confirm the same name and tags on the Misc card and opened template. Captured `reference-research/telegram-file-picker/approved-picker-name-tags.png`. Required check/build and all bundled guards pass again; no diagnostics.


Kitchen Chatbot attribution link verified: the exact “Vic Bell’s Blink Bot” phrase is one anchor to the original Dribbble shot, with the period outside. It inherits 16px/400 body text, remains inline and underlined, and has no arrow. Its external target/rel attributes follow shared TextLink. Desktop/320px captures show no horizontal overflow. The original destination was verified via its public page. Required check/build, SVG/static guards, case metadata tests and diff checks pass; original credit copy remains exact. Evidence: `reference-research/kitchen-chatbot/mascot-credit-linked-detail.png`.

Approved Misc ordering verified: Pet Care, Picker Concept, SQUARE, Kitchen Chatbot. The live collection renders Picker Concept second beside Pet Care on desktop. Captured `reference-research/telegram-file-picker/approved-misc-second-position.png`. The existing order check, required check/build and all bundled guards pass with no diagnostics.

Design Cup addition verified against the supplied artifact: five source story sections, eleven byte-identical original artwork files, original SVG, exact copy and role. Misc now contains five projects, with Picker Concept still second and Design Cup last. Desktop/tablet/390px/320px and both themes pass; shared open/close and play-once image reentry verified. No horizontal overflow or browser warnings. Source evidence and final screenshots are in `reference-research/design-cup/`; full findings in its `design-qa.md`. Required check/build and focused metadata/image/video checks pass: 172 files, zero diagnostics, 18 routes, 51 genuine SVG assets.

Shared case-study motion correction passed: contained card/travel/hero fit, live-image handoff and modal-owned viewport return fix Design Cup’s opening/closing jump. All timings, fades, corner/control motion and hero fit now consume shared tokens across all cases, documented by thirteen rows in the static Motion catalog. Desktop/390px frame sampling, early Escape, a padded Gutsul hero and looping Picker video passed; catalog desktop/mobile has no overflow. Required check/build, production token checks, node-identity, navigation/reload and existing case/media checks pass with 175 files and zero diagnostics. Evidence: `reference-research/shared-case-study-motion/design-qa.md`.
# Voximplant IVR — 8 October 2026

Added the sixth Misc case from the supplied artifact, preserving exact copy and five original assets. Reused shared overview, media, live hero handoff and motion tokens. Desktop and phone QA verifies source ratios, reading order, loaded artwork, no overflow and stable closing scroll position. Required check/build, all 17 case metadata/media checks, six-project Misc order and shared motion/image/navigation tests pass. Evidence and source manifests live in `../reference-research/voximplant-ivr/`.
# Floating Work menu scroll correction — 8 October 2026

Replaced the fixed 32px endpoint impulse with a continuous proportional follower of the existing sticky position. Slow scroll lingers gently; both upper and lower stops settle exactly against the card bounds. Desktop browser measurements confirm 493.296875px top alignment and 294.296875px bottom alignment, smooth reverse input and no errors. Shared pointer magnetism, touch/compact/reduced-motion behavior and category layout remain intact. Motion regression tests, filter/stage/pointer tests, required check/build and all guards pass. Evidence is in `../reference-research/work-filter-follow/`.
# Quicker floating-menu return — 8 October 2026

Kept the current scroll linger at speed 10 and added a shared speed-20 return after 80ms without scrolling. The transition retains position and velocity. Both endpoints approach alignment continuously and land within a fraction of a pixel in about half a second in browser QA; exact final alignment is preserved. Regression tests cover 60/120Hz response, unchanged active linger, pause/reduced-motion cleanup and no endpoint kick. Required check/build and existing filter/stage tests pass. Evidence: `../reference-research/work-filter-follow/quicker-return-*`.
# OFFF Conference — 8 October 2026

Added seventh in Misc from the supplied artifact with exact source copy, native hero and restored original full recording. Reused CaseStudyMedia's silent shared controller, generated its original-frame hover sheet and retained common loop/Pause behavior. Desktop and phone QA confirms playback, keyboard seeking, controller-wide preview bounds, no sound button or overflow, shared live-hero handoff and stable return scroll position. Required check/build, all 18 case metadata/media checks, eight shared controller previews and video/filter/artwork regressions pass. Evidence: `../reference-research/offf-conference/`.
# Professions in Digital — 8 October 2026

Added eighth in Misc with the exact reference copy, original recordings and genuine SVG. It shares RecordingCaseStudy with OFFF and the existing silent video controller with original-frame hover previews. A shared source-pixel crop preserves the reference's clean 1426×884 visible frame across card, traveling hero, settled hero and player. Desktop/phone playback, seeking, looping, preview bounds, crop continuity, stable return and OFFF regression pass. Required check/build and all 19 case metadata/media, nine controller mapping and relevant lifecycle tests pass. Evidence: `../reference-research/professions-in-digital/`.

# Quit University — 8 October 2026

Added ninth in Misc after Professions with exact source title, disciplines, introduction and Full scroll chapter. Original hero, still and graduation-cap SVG are unchanged; the two full-recording byte chunks are joined without reencoding. Existing RecordingCaseStudy, source-pixel clipping, silent controller and case animations are shared. Desktop/mobile playback, Pause, seeking, end looping, controller-wide original-frame previews, no audio button/overflow, crop continuity and exact return to Misc pass. Required check/build, all 20 case metadata/media and ten controller mappings, filter, video lifecycle, artwork/navigation and endpoint-only menu regressions pass. Evidence: `../reference-research/quit-university/`.

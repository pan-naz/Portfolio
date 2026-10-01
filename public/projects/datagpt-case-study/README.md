# DataGPT case-study assets

Source: `case studies/Datagpt/DataGPT — case study final.pdf` in the project root.

Most images are extracted from the supplied PDF. `discovery-research.png`, `competitor-mapping.png`, `prototypes.png`, `pure-chat.png`, `chat-data-navigator.png`, and `design-system.png` are original images supplied later by the user; all retain their native dimensions and transparency. `data-setup.mp4` and `pilot-video.mp4` are the supplied original videos for the no-code setup and pilot-launch sections.

Asset paths, dimensions and alternative text are defined in `src/data/datagpt-case-study.ts`. `before.png` and `after.png` are the supplied 2400 × 1464 comparison images. Their transparent corners retain their native shape, with the shared Floating shadow applied by `CaseStudyComparison`.

`pilot-poster.jpg` is the pilot video's first frame. `pilot-preview.jpg` contains 116 thumbnails sampled at one-second intervals in an 8-column, 15-row sheet (240 × 124 cells). The pilot's shared player loads this sheet on the first seek-preview interaction instead of decoding a second video.

`llm-instructions.mp4` is the supplied 1348 × 812 recording for the LLM instructions section; `llm-instructions-poster.jpg` is its first frame. It uses the shared floating media treatment without player controls.

`website.mp4` is the supplied 3840 × 2160 website recording. `website-poster.jpg` is a resized frame from that video. The shared case-study media component preserves its native 16:9 ratio and only loads it when visible.

`hero-poster.jpg` is a frame from `hero-datagpt.mp4` at its native 1728 × 1116 ratio, shared by the homepage card and opened case hero.

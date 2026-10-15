/** Explicit, reviewed typography exceptions; never exclude a whole case study. */
export const typographyExclusions={
 "developer-code":{"classes":["ds-code-label"],"reason":"Developer code comments and source-file labels, never prose."},
 "svg-artwork":{"tag":"svg","reason":"Text drawn inside the supplied Hooko architecture artwork."},
  "project-font-specimen": {
    "classes": [
      "blaustrom-open-sans",
      "cravus-titillium",
      "gutsul-type",
      "index-lato",
      "peak-type-display",
      "peak-type-sample",
      "yellow-oswald",
      "yellow-raleway"
    ],
    "reason": "Original client-font artwork. Captions and narrative remain in the text system."
  },
  "product-service-tiles": {
    "tag": "CASE-STUDY-SERVICE-TILES",
    "classes": [
      "case-study-service-demo"
    ],
    "reason": "Original Index product UI, including its popovers."
  },
  "product-avatar": {
    "classes": [
      "dg-avatar"
    ],
    "reason": "Original DataGPT persona initials."
  },
  "product-badge": {
    "classes": [
      "dg-badge"
    ],
    "reason": "Original DataGPT product-model label."
  },
  "decorative-quote": {
    "classes": [
      "dg-quote-decoration"
    ],
    "reason": "Original aria-hidden absolute quotation mark."
  }
} as const;

export const typographyCssExclusions=[
  { file: "src/styles/global.css", selector: ".impact-company-cap", reason: "Zero leading only for an empty font-metric alignment wrapper; the nested ProjectIdentity retains its canonical Heading/M role." },
  {
    "file": "src/styles/blaustrom-case-study.css",
    "selector": ".blaustrom-palette code",
    "reason": "Existing developer code treatment; the empty Code grid uses the same font so its 60ch column minimum measures the actual code. No prose is excluded."
  },
  {
    "file": "src/styles/blaustrom-case-study.css",
    "selector": ".blaustrom-open-sans",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/blaustrom-case-study.css",
    "selector": ".blaustrom-open-sans.blaustrom-light, .blaustrom-open-sans .blaustrom-light",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/blaustrom-case-study.css",
    "selector": ".blaustrom-open-sans.blaustrom-bold, .blaustrom-open-sans .blaustrom-bold",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/blaustrom-case-study.css",
    "selector": ".blaustrom-case .blaustrom-type-heading",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-demo",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-tile h4",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-tile p",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-stat small",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-stat strong",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-quote blockquote",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-quote cite",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-popover h4",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-popover p",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-popover ul",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-tile h4",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-stat strong",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/case-study-service-tiles.css",
    "selector": ".case-study-service-quote blockquote",
    "reason": "Original Index service-tile product UI."
  },
  {
    "file": "src/styles/cravus-case-study.css",
    "selector": ".cravus-palette code",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/cravus-case-study.css",
    "selector": ".cravus-titillium",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/cravus-case-study.css",
    "selector": ".cravus-s40",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/cravus-case-study.css",
    "selector": ".cravus-s26",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/cravus-case-study.css",
    "selector": ".cravus-s18",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/cravus-case-study.css",
    "selector": ".cravus-s14",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/datagpt-case-study.css",
    "selector": ".dg-badge",
    "reason": "Original DataGPT product badge or persona avatar."
  },
  {
    "file": "src/styles/datagpt-case-study.css",
    "selector": ".dg-avatar",
    "reason": "Original DataGPT product badge or persona avatar."
  },
  {
    "file": "src/styles/datagpt-case-study.css",
    "selector": ".dg-testimonials .dg-quote-decoration",
    "reason": "Original aria-hidden decorative quotation mark."
  },
  {
    "file": "src/styles/design-cup-case-study.css",
    "selector": ".dc-palette code",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/design-system.css",
    "selector": ".ds-main code,.ds-main pre,.ds-code-columns",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/design-system.css",
    "selector": ".ds-code-label",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/gutsul-made-case-study.css",
    "selector": ".gutsul-type",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/gutsul-made-case-study.css",
    "selector": ".gutsul-case .gutsul-type b",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/gutsul-made-case-study.css",
    "selector": ".gutsul-palette code",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/index-law-firm-case-study.css",
    "selector": ".index-lato",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/index-law-firm-case-study.css",
    "selector": ".index-palette code",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/index-law-firm-case-study.css",
    "selector": ".index-display-sample",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/index-law-firm-case-study.css",
    "selector": ".index-body-sample",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/index-law-firm-case-study.css",
    "selector": ".index-caps-sample",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/index-law-firm-case-study.css",
    "selector": ".index-caps-sample",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/peak-hotel-case-study.css",
    "selector": ".peak-color-label code",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/peak-hotel-case-study.css",
    "selector": ".peak-type-display",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/peak-hotel-case-study.css",
    "selector": ".peak-case .peak-type-sample",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/peak-hotel-case-study.css",
    "selector": ".peak-playfair-italic",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/peak-hotel-case-study.css",
    "selector": ".peak-playfair-bold",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/peak-hotel-case-study.css",
    "selector": ".peak-lato-regular",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/peak-hotel-case-study.css",
    "selector": ".peak-lato-black",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/pet-care-case-study.css",
    "selector": ".pc-palette code",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/promshyna-case-study.css",
    "selector": ".promshyna-palette code",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/team-sternfit-case-study.css",
    "selector": ".sternfit-palette code",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/yellow-leaf-case-study.css",
    "selector": ".yellow-colour-label code",
    "reason": "Existing developer/project colour code treatment; no prose is excluded."
  },
  {
    "file": "src/styles/yellow-leaf-case-study.css",
    "selector": ".yellow-type-display",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/yellow-leaf-case-study.css",
    "selector": ".yellow-case .yellow-type-sample",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/yellow-leaf-case-study.css",
    "selector": ".yellow-oswald",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/yellow-leaf-case-study.css",
    "selector": ".yellow-raleway",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/yellow-leaf-case-study.css",
    "selector": ".yellow-type-bold",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  },
  {
    "file": "src/styles/yellow-leaf-case-study.css",
    "selector": ".yellow-type-medium",
    "reason": "Original client-font specimen; only marked sample text is excluded."
  }
] as const;

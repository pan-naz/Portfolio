// Shared website components, rendered by the static catalog.
export const dsComponents = [
  {
    "name": "Logo",
    "section": "project-identity",
    "preview": "direct",
    "description": "Wordmark and compact mark"
  },
  {
    "name": "Button",
    "section": "buttons",
    "preview": "direct",
    "description": "Primary and secondary pill actions use shared Body/M Strong labels at 16/24, with 2-unit arrow strokes"
  },
  {
    "name": "IconButton",
    "section": "navigation",
    "preview": "direct",
    "description": "Named icon-only actions"
  },
  {
    "name": "Arrow",
    "section": "buttons",
    "preview": "direct",
    "description": "Directional icons"
  },
  {
    "name": "ThemeToggle",
    "section": "navigation",
    "preview": "direct",
    "description": "Theme control"
  },
  {
    "name": "SkillTag",
    "section": "tags",
    "preview": "direct",
    "description": "Skill tags and plain Label/S process labels in primary ink"
  },
  {
    "name": "ProjectCard",
    "section": "cards",
    "preview": "direct",
    "description": "Project media and captions"
  },
  {
    "name": "SiteHeader",
    "section": "navigation",
    "preview": "website",
    "description": "Header is fully visible on page load; only its existing scroll-driven CTA docking and mobile drawer animate. Static in this catalog."
  },
  {
    "name": "NavLinks",
    "section": "navigation",
    "preview": "website",
    "description": "Shared desktop and mobile destinations; the floating pill uses the compact ‘naz’ wordmark and labels use Body/M Strong at 16/24 Semibold in primary ink with 12px horizontal navigation gaps and no vertical mobile-menu item gap"
  },
  {
    "name": "NavigationItem",
    "section": "navigation",
    "preview": "website",
    "description": "One background-free link/button treatment for the top bar, floating pill and work filter: shared 12px padding, centered 6px dot with gentle 420ms move/fade/scale motion and a 12px label push"
  },
  {
    "name": "Hero",
    "section": "website-components",
    "preview": "website",
    "description": "Native intro: both label groups together, greeting/title/role/copy/CTA. The header remains static and fully visible. Each animated stage starts halfway through the prior 900ms core reveal; internal glyph/line staggers never postpone it. Rain has its own 2s page-load delay. Reduced motion shows content immediately. Static in this catalog."
  },
  {
    "name": "TypewriterHeading",
    "section": "website-components",
    "preview": "website",
    "description": "Shared native text reveal; display and H2 role lines use the same responsive optical edge. Primary roles hold 1s and fade out in 450ms, without a cursor or vertical exit"
  },
  {
    "name": "HeroWaterfall",
    "section": "website-components",
    "preview": "website",
    "description": "Decorative canvas backdrop; independent 2s delay after page load, unrelated to text or tag completion. Pauses offscreen, in background tabs, and with the menu open."
  },
  {
    "name": "SkillMarquee",
    "section": "website-components",
    "preview": "website",
    "description": "Skills reveal top-to-bottom across both loop copies, then scroll continuously; duplicate content is hidden from assistive technology. Static in this catalog."
  },
  {
    "name": "SectionHeading",
    "section": "section-heading",
    "preview": "direct",
    "description": "Reusable section title and supporting content"
  },
  {
    "name": "WorkSection",
    "section": "website-components",
    "preview": "website",
    "description": "Work section and project grid"
  },
  {
    "name": "AboutSection",
    "section": "website-components",
    "preview": "website",
    "description": "Biography and career composition"
  },
  {
    "name": "ExperienceList",
    "section": "timeline",
    "preview": "direct",
    "description": "Career list and empty-data behavior"
  },
  {
    "name": "ExperienceRow",
    "section": "timeline",
    "preview": "direct",
    "description": "Role, company and period"
  },
  {
    "name": "ContactSection",
    "section": "website-components",
    "preview": "website",
    "description": "Contact invitation and destination"
  },
  {
    "name": "SiteFooter",
    "section": "website-components",
    "preview": "website",
    "description": "Footer, brand and catalog link"
  },
  {
    "name": "ProjectIdentity",
    "section": "project-identity",
    "preview": "direct",
    "description": "Original project mark and name"
  },
  {
    "name": "SectionNavigation",
    "section": "navigation",
    "preview": "website",
    "description": "Project-category filter for Selected work, Websites and Misc; composes NavigationItem with accessible pressed state and live result count"
  },
  {
    "name": "Stat",
    "section": "stats",
    "preview": "direct",
    "description": "Impact value, label and contextual note"
  },
  {
    "name": "ImpactSection",
    "section": "website-components",
    "preview": "website",
    "description": "Project-associated results in two metric rows"
  },
  {
    "name": "PortfolioPage",
    "section": "website-components",
    "preview": "website",
    "description": "One shared page composition for the website and its static catalog preview"
  }
] as const;

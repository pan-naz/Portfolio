import type { SourceComponent } from './system-inventory';

// Documentation is attached to real source files. Display names, props, values,
// usages and token references are read from those files by system-inventory.ts.
export const componentPurposes: Record<string, string> = {
  'src/components/AboutSection.astro': 'Shows career experience and a link to the CV.',
  'src/components/Arrow.astro': 'Shows direction beside a link or between steps.',
  'src/components/Button.astro': 'Makes a main action or a supporting destination easy to find.',
  'src/components/CaseStudyBand.astro': 'Groups a chapter across the full page width.',
  'src/components/CaseStudyComparison.astro': 'Lets a reader switch between before and after images.',
  'src/components/CaseStudyDecisionCard.astro': 'Pairs a design decision with its explanation or image.',
  'src/components/CaseStudyGuides.astro': 'Adds alignment guides around case-study artwork.',
  'src/components/CaseStudyMarker.astro': 'Marks a point or step in an illustration.',
  'src/components/CaseStudyMedia.astro': 'Shows an image or a video with the shared media treatment.',
  'src/components/CaseStudyOverview.astro': 'Introduces a project, its summary, role and team.',
  'src/components/CaseStudyPalette.astro': 'Lists a project palette without defining system colours.',
  'src/components/CaseStudyServiceTiles.astro': 'Shows services with details that open on request.',
  'src/components/CaseStudySpecimen.astro': 'Labels an example of a project’s original identity.',
  'src/components/CaseStudySteps.astro': 'Shows a sequence as numbered steps.',
  'src/components/Chip.astro': 'Labels a skill, discipline, step or result.',
  'src/components/ContactSection.astro': 'Offers contact details and the CV.',
  'src/components/ExperienceList.astro': 'Groups career entries in their supplied order.',
  'src/components/Hero.astro': 'Introduces the designer and the main contact action.',
  'src/components/HeroWaterfall.astro': 'Adds decorative icon rain behind the introduction.',
  'src/components/Icon.astro': 'Renders the shared interface symbols.',
  'src/components/IconButton.astro': 'Provides an action or destination represented by an icon.',
  'src/components/ImpactSection.astro': 'Groups project results with their context.',
  'src/components/Logo.astro': 'Identifies the portfolio with its wordmark or compact mark.',
  'src/components/MetricValue.astro': 'Shows a result using the shared heading style.',
  'src/components/NavLinks.astro': 'Groups the website’s main destinations.',
  'src/components/NavigationItem.astro': 'Provides a navigation link or work-filter choice.',
  'src/components/NotFoundPage.astro': 'Explains a missing page and offers a way back.',
  'src/components/ProjectCard.astro': 'Introduces a project and opens its case study.',
  'src/components/ProjectIdentity.astro': 'Pairs a project name with an optional mark.',
  'src/components/ProjectTags.astro': 'Groups a project’s discipline chips.',
  'src/components/ResponsiveImage.astro': 'Selects a suitable image size while retaining the original fallback.',
  'src/components/SectionHeading.astro': 'Introduces a section with a title and optional supporting text.',
  'src/components/SectionNavigation.astro': 'Lets readers choose a work category.',
  'src/components/SiteFooter.astro': 'Ends the page with portfolio details and decorative icons.',
  'src/components/SiteHeader.astro': 'Provides the wordmark, navigation and theme control.',
  'src/components/SkillMarquee.astro': 'Shows the supplied skill labels in a repeating row.',
  'src/components/Stat.astro': 'Pairs a result with its label and note.',
  'src/components/SvgAsset.astro': 'Renders an original vector as genuine SVG geometry.',
  'src/components/TextLink.astro': 'Provides an inline or compact text destination.',
  'src/components/ThemeToggle.astro': 'Switches the page between Light and Dark.',
  'src/components/TimelineRow.astro': 'Shows the dates, role, company, summary and duration of an experience entry.',
  'src/components/ToolCard.astro': 'Identifies a tool and reveals its name on hover or focus.',
  'src/components/ToolsSection.astro': 'Groups the tools used in the design work.',
  'src/components/TypewriterHeading.astro': 'Shows the introduction’s changing role line.',
  'src/components/WorkSection.astro': 'Groups work categories and project cards.',
};

const usageNotes: Record<string, [string,string,string]> = {
  "AboutSection": [
    "Use for the career section on the home page.",
    "For a single career entry, use TimelineRow.",
    "Keep the section heading and the CV link in reading order."
  ],
  "Arrow": [
    "Use beside a destination or between sequential steps.",
    "For an icon-only action, use IconButton.",
    "Keep the direction decorative; the link text names the destination."
  ],
  "Button": [
    "Use when one action needs emphasis.",
    "For navigation within a sentence, use TextLink.",
    "Use a clear visible label. Keep keyboard focus and the shared target area."
  ],
  "CaseStudyBand": [
    "Use for a full-width case-study chapter.",
    "For a single image or recording, use CaseStudyMedia.",
    "Keep the chapter heading and content in source order."
  ],
  "CaseStudyComparison": [
    "Use when readers need to compare before and after.",
    "For a single image, use CaseStudyMedia.",
    "Preserve the named buttons, selected state and both image alternatives."
  ],
  "CaseStudyDecisionCard": [
    "Use to explain one design decision.",
    "For a sequence of decisions, use CaseStudySteps.",
    "Keep the explanation available as text and label any meaningful image."
  ],
  "CaseStudyGuides": [
    "Use for alignment guides around project artwork.",
    "For interface icons, use Icon.",
    "Keep the guides decorative; the artwork supplies its own alternative."
  ],
  "CaseStudyMarker": [
    "Use to identify a point in an illustration.",
    "For a full sequence, use CaseStudySteps.",
    "Keep the point label readable and connected to its explanation."
  ],
  "CaseStudyMedia": [
    "Use for case-study images and recordings.",
    "For before-and-after interaction, use CaseStudyComparison.",
    "Keep image alternatives, video names, keyboard controls and reduced-motion stills."
  ],
  "CaseStudyOverview": [
    "Use to introduce a case study and its credits.",
    "For a project in the home collection, use ProjectCard.",
    "Keep the title, summary and credits in reading order; name the website destination."
  ],
  "CaseStudyPalette": [
    "Use inside a case study to describe that project’s palette.",
    "For portfolio interface colours, use the Color foundation.",
    "Keep colour labels available as text; colour alone does not identify an item."
  ],
  "CaseStudyServiceTiles": [
    "Use for services with details readers can expand.",
    "For static decisions, use CaseStudyDecisionCard.",
    "Keep native disclosure controls and their names; details must work with a keyboard."
  ],
  "CaseStudySpecimen": [
    "Use to caption original project identity examples.",
    "For portfolio text styles, use the Typography foundation.",
    "Keep captions with their artwork and provide meaningful alternatives."
  ],
  "CaseStudySteps": [
    "Use for an ordered design process.",
    "For a single decision, use CaseStudyDecisionCard.",
    "Keep step order and labels available without animation."
  ],
  "Chip": [
    "Use for a short, non-interactive label.",
    "For an action or destination, use Button or TextLink.",
    "Keep the label as text; chips do not behave as buttons."
  ],
  "ContactSection": [
    "Use for the home page’s contact ending.",
    "For a link inside other content, use TextLink.",
    "Keep email, LinkedIn and CV destinations clearly named."
  ],
  "ExperienceList": [
    "Use for the supplied career timeline.",
    "For one entry, use TimelineRow.",
    "Preserve list semantics and the supplied entry order."
  ],
  "Hero": [
    "Use for the home introduction.",
    "For a case-study introduction, use CaseStudyOverview.",
    "Keep the introduction readable without animation and the main action keyboard accessible."
  ],
  "HeroWaterfall": [
    "Use for the home introduction’s decorative icon rain.",
    "For an interface symbol, use Icon.",
    "Keep the canvas hidden from assistive technology and stop it for reduced motion."
  ],
  "Icon": [
    "Use for the shared interface symbols.",
    "For an original project or tool vector, use SvgAsset.",
    "Hide decorative symbols. A meaningful symbol needs a label from its control."
  ],
  "IconButton": [
    "Use for a familiar action when space is limited.",
    "For an unfamiliar action, use Button with a visible label.",
    "Supply an accessible name and preserve focus and the shared target area."
  ],
  "ImpactSection": [
    "Use to group project results on the home page.",
    "For one result, use Stat.",
    "Keep each result’s label and supporting note with its value."
  ],
  "Logo": [
    "Use to identify the portfolio.",
    "For a project mark, use SvgAsset with ProjectIdentity.",
    "Keep the mark’s accessible name and the home link’s destination."
  ],
  "MetricValue": [
    "Use for the numeric part of a result.",
    "For a result with its label and note, use Stat.",
    "Keep the value connected to its label and context."
  ],
  "NavLinks": [
    "Use for the website’s main destinations.",
    "For work categories, use SectionNavigation.",
    "Keep navigation semantics, destination names and keyboard focus."
  ],
  "NavigationItem": [
    "Use for a navigation destination or filter choice.",
    "For a destination inside text, use TextLink.",
    "Use a link for a destination and a button for a filter; preserve the selected state."
  ],
  "NotFoundPage": [
    "Use for a missing route.",
    "For a project introduction, use CaseStudyOverview.",
    "Keep the main heading and the named return link."
  ],
  "ProjectCard": [
    "Use for a project in the home work collection.",
    "For the complete story, use CaseStudyOverview and case-study chapters.",
    "Keep the project name on its link, media alternatives and focus return after closing."
  ],
  "ProjectIdentity": [
    "Use to pair a project name with its mark.",
    "For the portfolio’s own identity, use Logo.",
    "Keep the name as text and avoid repeating it in decorative mark alternatives."
  ],
  "ProjectTags": [
    "Use for a project’s group of discipline labels.",
    "For one short label, use Chip.",
    "Preserve label order and keep the labels non-interactive."
  ],
  "ResponsiveImage": [
    "Use to select an image candidate without changing the original.",
    "For a complete case-study media frame or video, use CaseStudyMedia.",
    "Preserve alternatives and dimensions; keep the original fallback available."
  ],
  "SectionHeading": [
    "Use to introduce a home section.",
    "For the home introduction’s rotating line, use TypewriterHeading.",
    "Keep the semantic heading and text order when words reveal."
  ],
  "SectionNavigation": [
    "Use to choose a work category.",
    "For the website’s main destinations, use NavLinks.",
    "Keep named filter buttons, selected state and the announced result count."
  ],
  "SiteFooter": [
    "Use to end the portfolio page.",
    "For contact actions, use ContactSection.",
    "Keep the footer details readable; the icon pile is decorative and respects reduced motion."
  ],
  "SiteHeader": [
    "Use for the portfolio’s main navigation.",
    "For an isolated group of destinations, use NavLinks.",
    "Preserve navigation landmarks, theme control and mobile-menu focus return."
  ],
  "SkillMarquee": [
    "Use for the supplied repeating skill labels.",
    "For a project’s discipline labels, use ProjectTags.",
    "Keep one readable sequence and hide repeated copies; reduced motion stops repetition."
  ],
  "Stat": [
    "Use for a result with a label and note.",
    "For only the numeric text style, use MetricValue.",
    "Keep the value, label and supporting note together."
  ],
  "SvgAsset": [
    "Use for genuine project, tool or illustration vectors.",
    "For a shared interface symbol, use Icon.",
    "Give meaningful artwork an alternative; hide decorative vectors."
  ],
  "TextLink": [
    "Use for a destination within text or a compact group of links.",
    "For a main action, use Button.",
    "Name the destination. Keep focus visible and preserve external-link protection."
  ],
  "ThemeToggle": [
    "Use for the website’s Light and Dark preference.",
    "For unrelated actions, use Button or IconButton.",
    "Keep its accessible name aligned with the next theme and support keyboard activation."
  ],
  "TimelineRow": [
    "Use for one supplied career entry.",
    "For the complete timeline, use ExperienceList.",
    "Keep dates, role, company and summary in source order."
  ],
  "ToolCard": [
    "Use to identify a tool in the home tools section.",
    "For an interface action, use IconButton.",
    "Keep the tool name accessible and show the same name on hover and keyboard focus."
  ],
  "ToolsSection": [
    "Use for the supplied tool collection.",
    "For one tool, use ToolCard.",
    "Keep the section heading, tool names and source order."
  ],
  "TypewriterHeading": [
    "Use for the home introduction’s rotating role line.",
    "For a normal section title, use SectionHeading.",
    "Keep a readable role available without animation; preserve reduced-motion behavior."
  ],
  "WorkSection": [
    "Use for the home project collection and categories.",
    "For one project, use ProjectCard.",
    "Keep filter names, source order, announced results and card focus."
  ]
};

export function documentationFor(component: SourceComponent) {
  const purpose = componentPurposes[component.file];
  const notes = usageNotes[component.name];
  if (!purpose || !notes) throw Error(`Undocumented website component: ${component.file}`);
  return { purpose, useWhen: notes[0], avoidWhen: notes[1], accessibility: notes[2] };
}

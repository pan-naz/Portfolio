// Draft editorial samples. Real-project facts come from portfolio.ts; the process
// paragraphs are proposed narratives to review, not claims of completed research.
export interface CaseStudySample { context: string; direction: string; detail: string; related?: string[]; }
export const caseStudySamples: Record<string, CaseStudySample> = {
  voximplant: {
    context: 'A contact center brings together people, conversations and operational rules. This case study focuses on making those moving parts understandable in a visual, no-code builder.',
    direction: 'The sample narrative follows an outbound campaign from setup to contact import. Each step should explain what is needed, show the current state and give the operator a clear next action.',
    detail: 'Use the campaign builder and database-upload screens to discuss hierarchy, validation and guidance. Add the original design decisions and supporting research here when the full case study is ready.',
  },
  datagpt: {
    context: 'DataGPT brings conversational questions and business data into the same product. The existing work describes a B2B product taken from zero to one, with an AI analyst at the center of the experience.',
    direction: 'The sample story explores the relationship between a question, a chart and its explanation. Keep the answer easy to scan while allowing people to inspect the information behind it.',
    detail: 'The interface provides a starting point for discussing chart hierarchy, conversation layout and dense information. Replace this draft with the actual tradeoffs, iterations and evidence from the project.',
  },
  hooko: {
    context: 'Hooko analyzes short-form videos and gives creators actionable feedback. This project brings product design and development together in an app shipped independently to the App Store.',
    direction: 'The sample narrative moves from a video to an analysis, then to a next step. A score is most useful when its explanation helps a creator decide what to improve.',
    detail: 'Use the existing mobile screens to explain how feedback is grouped, how priorities are communicated and how the experience fits a small screen. Add the actual iterations and launch learnings to complete the story.',
  },
  afterlight: {
    context: 'Afterlight is a photography-led identity study about noticing ordinary light. It explores how a small visual system can support images without overshadowing them.',
    direction: 'Build the mood through framing, contrast and a restrained typographic voice. Let image sequences carry the story instead of adding more decorative elements.',
    detail: 'The sample applications move between an opening image, a close detail and a supporting composition. Together they suggest how the identity could work across an editorial series.', related: ['soft-focus', 'still-life'],
  },
  'still-life': {
    context: 'Still Life Club is a visual scrapbook concept for everyday objects. It collects small compositions and observations rather than presenting a conventional product catalog.',
    direction: 'Use color, cropping and repeated shapes to connect otherwise different subjects. Short captions give each image a point of view without turning the collection into a long essay.',
    detail: 'The sample sequence explores a lead composition followed by quieter details. A flexible grid would allow new observations to join the collection over time.', related: ['soft-focus', 'slow-sunday'],
  },
  'soft-focus': {
    context: 'Soft Focus explores photographic moods for a fictional creative studio. The concept centers on a gentle visual voice that still gives the work a clear identity.',
    direction: 'Balance open space with close observation. Photography supplies the color, while simple typography and consistent spacing tie the applications together.',
    detail: 'The sample image set suggests how a studio could present inspiration, experiments and finished work in the same family. The system should remain recognizable as the subjects change.', related: ['still-life', 'afterlight'],
  },
  'slow-sunday': {
    context: 'Slow Sunday is an identity and packaging concept for everyday rituals. It asks how a small collection of objects might encourage a more considered pace.',
    direction: 'Focus on tactile qualities, clear labels and calm compositions. The concept uses ordinary moments as its subject rather than relying on a complicated brand story.',
    detail: 'These sample references establish a mood for packaging and printed pieces. Final applications would need product-specific dimensions, materials and production details.', related: ['still-life', 'open-water'],
  },
  'desk-notes': {
    context: 'Desk Notes imagines a lightweight workspace for notes, references and unfinished ideas. The concept gives early thinking a place before it needs to become a polished document.',
    direction: 'Keep capture quick and organization gradual. Notes could begin as fragments, then become easier to connect as a project takes shape.',
    detail: 'The sample flow moves from a new thought to a small collection of related material. Search, recent items and clear empty states would help people return to an idea later.', related: ['drift', 'afterlight'],
  },
  drift: {
    context: 'Drift Radio is a music-discovery concept organized around moods. It explores a listening experience that starts with how an afternoon feels rather than a genre label.',
    direction: 'Let a small set of mood choices lead into listening. Cover imagery provides atmosphere, while playback controls stay familiar and easy to reach.',
    detail: 'The sample story follows choosing a mood, starting a session and finding something worth saving. A quiet interface leaves room for the music.', related: ['desk-notes', 'soft-focus'],
  },
  'open-water': {
    context: 'Open Water is a poster-series concept about the meeting of land and sea. The study looks at rhythm, distance and the space around a subject.',
    direction: 'Use the coastline as a starting point for composition. Shifts in scale and cropping create related pieces without making every poster identical.',
    detail: 'The sample sequence places a broad view alongside supporting landscape imagery. Final posters could explore how typography sits within those different amounts of open space.', related: ['afterlight', 'soft-focus'],
  },
};

const asset = (name: string) => `/projects/datagpt-case-study/${name}.webp`;
const screenshot = (name: string, width: number, height: number, alt: string, presentation: 'framed' | 'bare' = 'framed') => ({ src: asset(name), width, height, alt, kind: 'image' as const, presentation });
export const dataGPTMedia = {
  hero: screenshot('hero', 2000, 1107, 'DataGPT logo on a dark dotted background.'),
  heroVideo: { src: '/projects/datagpt-case-study/hero-datagpt.mp4', width: 1728, height: 1116, poster: '/projects/datagpt-case-study/hero-poster.jpg' },
  research: { src: '/projects/datagpt-case-study/discovery-research.png', width: 2496, height: 1872, alt: 'Stakeholder interview notes, research findings, and a detailed data analyst persona.', kind: 'image' as const, presentation: 'bare' as const },
  competitors: { src: '/projects/datagpt-case-study/competitor-mapping.png', width: 2354, height: 972, alt: 'Comparison of ThoughtSpot, Power BI and Copilot, ChatGPT plug-ins, and SQL wrappers across query comprehension, depth, data limits, and trust.', kind: 'image' as const, presentation: 'bare' as const },
  prototypes: { src: '/projects/datagpt-case-study/prototypes.png', width: 2496, height: 1424, alt: 'DataGPT prototype flows, schema screens, and information architecture.', kind: 'image' as const, presentation: 'bare' as const },
  chat: { src: '/projects/datagpt-case-study/pure-chat.png', width: 2400, height: 2990, alt: 'DataGPT chat with a written analysis, charts, source dates, and suggested follow-up questions.', kind: 'image' as const, presentation: 'bare' as const },
  navigator: { src: '/projects/datagpt-case-study/chat-data-navigator.png', width: 2400, height: 1552, alt: 'Chat and Data Navigator side by side with comparison periods and metric exploration.', kind: 'image' as const, presentation: 'bare' as const },
  setup: { src: '/projects/datagpt-case-study/data-setup.mp4', width: 1920, height: 1124, alt: 'DataGPT no-code setup flow for data connections and schema configuration.', kind: 'video' as const, controls: true },
  system: { src: '/projects/datagpt-case-study/design-system.png', width: 2496, height: 1920, alt: 'DataGPT input states, buttons, callouts, icons, and analytical charts.', kind: 'image' as const, presentation: 'bare' as const },
  pilot: { src: '/projects/datagpt-case-study/pilot-video.mp4', width: 1720, height: 884, alt: 'Pilot version of DataGPT showing a gaming analytics conversation and metric cards.', kind: 'video' as const, controls: true, poster: '/projects/datagpt-case-study/pilot-poster.jpg' },
  instructions: { src: '/projects/datagpt-case-study/llm-instructions.mp4', width: 1348, height: 812, alt: 'DataGPT schema management used to configure business logic and definitions.', kind: 'video' as const, presentation: 'floating' as const, strokeWidth: 8 as const, controls: true, poster: '/projects/datagpt-case-study/llm-instructions-poster.jpg' },
  after: { src: '/projects/datagpt-case-study/after.png', width: 2400, height: 1464, alt: 'After: persistent date presets and filter chips above Chat and Data Navigator.' },
  before: { src: '/projects/datagpt-case-study/before.png', width: 2400, height: 1464, alt: 'Before: date controls confined to the Data Navigator while chat lacks visible context.' },
  website: { src: '/projects/datagpt-case-study/website.mp4', width: 3840, height: 2160, alt: 'DataGPT marketing website with a conversational product demo.', kind: 'video' as const, presentation: 'shadow' as const, controls: true, poster: '/projects/datagpt-case-study/website-poster.jpg' },
};
export const dataGPTPersonas = [
  { title: 'Executive', group: 'Asks questions every day', description: 'VP or C-level. Owns revenue and growth targets. Lives in meetings and Slack.', question: 'Why did revenue drop last week?', need: 'The cause, not a chart, and before the next meeting.', frustration: "Dashboards show what happened. The why goes into the data team's queue." },
  { title: 'Growth or marketing manager', group: 'Asks questions every day', description: 'Runs campaigns and channels. Compares periods and segments several times a week.', question: 'Which channel drove signups this month?', need: 'Quick comparisons by period, channel and segment, without learning a BI tool.', frustration: 'Dozens of reports to piece together and a queue for anything custom.' },
  { title: 'Data analyst', group: 'Asks questions every day', description: 'Mid-size SaaS company. SQL, BigQuery, Tableau, Python. Spends 40–50% of their time on repetitive reporting.', question: 'Show retention by segment for last quarter.', need: 'Fewer repetitive pulls and consistent metrics across teams.', frustration: 'Constant Slack requests. Rigid BI tools. Every team defines KPIs differently.' },
  { title: 'Data engineer', group: 'Makes the answers possible', description: 'Owns the warehouse: BigQuery, Snowflake or Databricks. Maintains pipelines and data models.', question: 'What does "conversion" mean to the AI?', need: 'Connect sources and define tables, metrics and dimensions without custom code, and control refresh schedules.', frustration: 'Every new business question means a new model or dashboard to build and maintain.' },
];
export const researchOutcomes = [
  ['Lag time', 'Insights arrived days late. By the time a dashboard was built, the question had changed.'],
  ['Accessibility', 'Only BI experts could drill deeper. Business users felt locked out and sent ad hoc requests instead.'],
  ['Context switching', 'People pieced a story together from dozens of reports instead of simply asking "Why did X happen?"'],
];
export const competitors = [
  ['ThoughtSpot', 'An early pioneer in natural language search for data. Great at connecting to various data sources, but NL Q&A yields only single charts and requires pseudo-code-like queries. Users often have to iterate question by question, without deeper “why” analysis.', '/projects/datagpt-case-study/logos/thoughtspot.svg'],
  ['Power BI + Copilot', 'A powerful BI suite with new AI features, yet its natural language Q&A felt limited. It often misunderstood nuances (synonyms, time phrases) and struggled with multi-step questions. The heavy interface (PowerQuery, DAX formulas) meant a steep learning curve for non-analysts.', '/projects/datagpt-case-study/logos/copilot.svg'],
  ['ChatGPT Plug-ins & SQL Bots', 'Dozens of text-to-SQL startups promised to translate questions to SQL. In reality, none could handle enterprise-scale data or complexity – they’d break on big data volumes, or return only basic facts. Hallucinations (made-up answers) were a serious risk.', '/projects/datagpt-case-study/logos/openai.svg'],
];
export const competitorOutcomes = [
  ['Comprehension without depth', 'Most tools could parse a question but returned "what happened" charts. Nobody went on to "why" and "what next" in the same conversation.'],
  ['Depth without accessibility', 'The powerful options needed modelled datasets, DAX or SQL. They were built for analysts, not the people waiting on them.'],
  ['Trust was the open gap', 'Black-box answers and hallucinations were the main objection. Showing the source of every answer became a design requirement, not a nice-to-have.'],
];
export const models = [
  { title: 'Pure chat', label: 'Model A', body: 'Ask in natural language and get a written summary with charts. Fast and approachable, for non-technical users.', quote: '“Where is this data coming from?” “How do I verify this?”', outcome: 'Simple but not trustworthy.' },
  { title: 'Data Navigator', label: 'Model B', body: 'A structured environment: pick metrics, filters and dimensions to build a query. Full control and full transparency.', quote: '“Safe but rigid.”', outcome: 'Good for precise queries, too slow for ad hoc exploration.' },
  { title: 'Chat + Data Navigator', label: 'Shipped', body: 'One screen, two ways. Type "Why did revenue drop on Friday?", or click Revenue and then Friday in the navigator, whichever feels easier.', quote: 'Easy to start, and still able to answer open-ended questions.', outcome: '' },
];
export const features = [
  { title: 'A conversation with a data analyst who knows business', body: 'User asks a question and DataGPT replies with a short written answer, a table and charts. Every answer states its date range and comparison period. Suggested follow-ups keep the analysis going.', points: ['Daily "Today’s summary" of what changed', 'Dataset guide listing key metrics and dimensions', 'Type @ to search for metrics and segments'], media: dataGPTMedia.chat },
  { title: 'For people who prefer to explore on their own', body: "A metric dashboard that's always one click from the chat. Each metric card shows the change between the comparison period and the observation period, and any card can be sent back to the chat as a question.", points: ['Chat Mode and Data Navigator side by side', 'Daily, weekly, monthly, quarterly, yearly or custom periods', 'Filters saved as defaults per databoard'], media: dataGPTMedia.navigator },
  { title: 'Data teams set up DataGPT without code', body: 'Admins connect a data source, set the ETL schedule and history length, and describe the company and its data. Each metric and dimension is a row they can edit, with a description, a format and synonyms. "Conversion rate" can also be "CR" or "conv rate".', points: ['Connections to BigQuery, Snowflake, Databricks', 'Version history, SQL import, upload and download', "The schema is what makes answers use the company's own terms"], media: dataGPTMedia.setup },
  { title: 'Three layers, documented in Figma', body: 'Every component shipped with interaction states, usage guidelines and behaviour rules. Engineers could build new features, from conversation flows to charts.', points: ['Base tokens', 'Core components', 'Analytical components'], media: dataGPTMedia.system },
];
export const queryResults = [
  { value: '−64%', label: 'Ambiguous queries (requiring clarification or rephrasing)' },
  { value: '+58%', label: 'First try query Success Rate' },
  { value: '+41%', label: 'Average session depth (queries per session) grew by' },
  { value: '2m → 30s', label: 'Average Time to Insight' },
];
export const contextResults = [
  { value: '+27%', label: 'Conversation satisfaction (thumbs-up ratio in chat)' },
  { value: '58%', label: 'Engagement Retention' },
  { value: '89%', label: 'Context Visibility Confidence (post-chat data clarity check)' },
];
export const conclusions = [
  ['Hybrid insight view', 'Allowed users to explore metrics and follow up through conversation within the same screen.'],
  ['Schema level LLM instructions', 'aligned AI responses with business terminology, cutting ambiguous interpretations by 64%.'],
  ['Date range presets', 'Saved date ranges for recurring analyses, shown above Chat and Data Navigator.'],
];

export const researchMetrics = [
  { value: '30+', label: 'stakeholder interviews' },
  { value: '4', label: 'user types synthesised' },
  { value: '4', label: 'competitor groups mapped' },
];

const asset = (name: string) => `/projects/datagpt-case-study/${name}.webp`;
const screenshot = (name: string, width: number, height: number, alt: string, presentation: 'framed' | 'bare' = 'framed') => ({ src: asset(name), width, height, alt, kind: 'image' as const, presentation });
export const dataGPTMedia = {
  hero: screenshot('hero', 2000, 1107, 'DataGPT logo on a dark dotted background.'),
  heroVideo: { src: '/projects/datagpt-case-study/hero-datagpt.mp4', width: 1728, height: 1116 },
  research: screenshot('research', 1280, 1000, 'Stakeholder interview notes, research findings, and a detailed data analyst persona.', 'bare'),
  competitors: screenshot('competitors', 1200, 510, 'Comparison of ThoughtSpot, Power BI and Copilot, ChatGPT plug-ins, and SQL wrappers across query comprehension, depth, data limits, and trust.', 'bare'),
  prototypes: screenshot('prototypes', 1280, 825, 'DataGPT prototype flows, schema screens, and information architecture.', 'bare'),
  chat: screenshot('chat', 2000, 2491, 'DataGPT chat with a written analysis, charts, source dates, and suggested follow-up questions.'),
  navigator: screenshot('navigator', 2000, 1293, 'Chat and Data Navigator side by side with comparison periods and metric exploration.'),
  setup: screenshot('data-setup', 1504, 918, 'Data connection and schema configuration for a Google Analytics dataset.'),
  system: screenshot('design-system', 1280, 1000, 'DataGPT input states, buttons, callouts, icons, and analytical charts.', 'bare'),
  pilot: screenshot('pilot', 1776, 924, 'Pilot version of DataGPT showing a gaming analytics conversation and metric cards.'),
  instructions: screenshot('llm-instructions', 1436, 858, 'DataGPT schema management used to configure business logic and definitions.'),
  after: screenshot('context-after', 2000, 1219, 'After: persistent date presets and filter chips above Chat and Data Navigator.'),
  // Temporary Before screenshot, approved by the user; replace when the final image arrives.
  before: screenshot('navigator', 2000, 1293, 'Before: earlier Data Navigator interface with date controls inside the navigator.'),
  website: screenshot('website', 1768, 994, 'DataGPT marketing website with the headline Chat with your data and a conversational product demo.'),
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
  { value: '−64%', label: 'Ambiguous queries (requiring clarification or rephrasing)', note: '' },
  { value: '+58%', label: 'First try query Success Rate', note: '' },
  { value: '+41%', label: 'Average session depth (queries per session) grew by', note: '' },
  { value: '2m → 30s', label: 'Average Time to Insight', note: '' },
];
export const contextResults = [
  { value: '+27%', label: 'Conversation satisfaction (thumbs-up ratio in chat)', note: '' },
  { value: '58%', label: 'Engagement Retention', note: '' },
  { value: '89%', label: 'Context Visibility Confidence (post-chat data clarity check)', note: '' },
];
export const conclusions = [
  ['Hybrid insight view', 'Allowed users to explore metrics and follow up through conversation within the same screen.'],
  ['Schema level LLM instructions', 'aligned AI responses with business terminology, cutting ambiguous interpretations by 64%.'],
  ['Date range presets', 'Enabled reusable, dynamic time filters for recurring analyses, boosting speed and consistency.'],
];

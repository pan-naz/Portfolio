// Profile contact details retained from the supplied resume; homepage copy from Figma.
// See COPY.md for sources, editorial decisions and deliberately omitted claims.
export const profile = {
  name: 'Nazarii Pankiv',
  brand: 'naz.wtf',
  title: 'Product Designer',
  email: 'nazariosnz@gmail.com',
  linkedin: 'https://www.linkedin.com/in/nazariypankiv/',
  approach: 'Understand how people work. Map the problem, test the idea and refine the interaction. Then build the systems that help a product grow—from the first useful experience to the details people use every day.',
  biography: 'I’ve led design at DataGPT and Voximplant, working across web, mobile and enterprise SaaS. My practice brings together UX research, interaction design and design systems—from early discovery to delivery. Alongside hands-on design, I’ve hired designers, shaped teams and helped bring B2B products from idea to launch.',
  description: 'Nazarii Pankiv — product designer with 10+ years in SaaS, UX research and design systems. Previously Design Lead at DataGPT and Head of Design at Voximplant.',
};

export interface Project {
  id: string;
  category: 'selected' | 'websites' | 'misc';
  title: string;
  description: string;
  outcome: string;
  tags: string[];
  logo?: string;
  image: string;
  imageAlt: string;
  imageHeight: number;
  imageSrcSet?: string;
  placeholder?: boolean;
  href?: string;
}

// Copy and artwork transcribed from the user-supplied figma-home.svg, node 67:15.
export const projects: Project[] = [
  { id: 'voximplant', category: 'selected', title: 'Voximplant Kit', outcome: 'Designed and launched from scratch as a no-code contact center builder. Scaled from MVP to a core SaaS product.', description: 'Voximplant Kit is an intelligent cloud contact center. Offering an easy-to-use drag & drop interface and industry-leading AI automation.', tags: ['Product design', 'Design system', 'Branding', 'Web design'], logo: '/projects/voximplant-logo.png', image: '/projects/voximplant.webp', imageHeight: 600, imageAlt: 'Voximplant Kit outbound campaign builder and contact database upload flow.' },
  { id: 'datagpt', category: 'selected', title: 'datagpt', outcome: 'Designed B2B product from 0 → 1', description: 'Conversational AI Analyst', tags: ['Product design', 'Design system', 'Branding', 'Web design'], logo: '/projects/datagpt-logo.svg', image: '/projects/datagpt.webp', imageHeight: 633, imageAlt: 'DataGPT conversational analytics interface with revenue charts and an AI analyst conversation.' },
  { id: 'hooko', category: 'selected', title: 'Hooko', outcome: 'Designed, built, and shipped to the App Store solo. My end-to-end proof of turning a product into a live, published experience.', description: 'AI-powered app that analyzes short-form videos and gives creators actionable feedback.', tags: ['App design', 'App dev', 'Design system', 'Branding', 'Web design'], logo: '/projects/hooko-logo.png', image: '/projects/hooko.webp', imageHeight: 481, imageAlt: 'Hooko mobile video analysis screens presented on a dark purple background.' },
];

// Fictional concepts requested for testing the Website and Misc collections.
// Replace these entries and their locally stored stock photos with real work later.
// All photo slots share one ratio; differing caption lengths create the masonry rhythm.
export const conceptProjects: Project[] = [
  { id: 'fieldwork', category: 'websites', title: 'Fieldwork', outcome: 'A slower way to find your next escape.', description: 'A concept website for cabin stays, open trails and weekends with no agenda.', tags: ['Web design', 'Art direction'], image: '/projects/concepts/fieldwork.webp', imageHeight: 720, imageAlt: 'Pine forest and distant mountains beneath a blue sky, a stock photo for Fieldwork.', placeholder: true },
  { id: 'common-ground', category: 'websites', title: 'Common Ground', outcome: 'Good coffee. Better company. A neighbourhood spot brought online.', description: 'An independent coffee-shop concept, from seasonal menus to a simple way to book a table or pick up your favourite beans.', tags: ['Web design', 'Branding', 'E-commerce'], image: '/projects/concepts/common-ground.webp', imageHeight: 720, imageAlt: 'Coffee on a sunlit wooden café counter, a stock photo for Common Ground.', placeholder: true },
  { id: 'forma', category: 'websites', title: 'Forma Studio', outcome: 'Spaces with room to breathe.', description: 'An architecture portfolio exploring material, light and the places we call home.', tags: ['Web design', 'Portfolio', 'Art direction'], image: '/projects/concepts/forma.webp', imageHeight: 720, imageAlt: 'White coastal buildings and domed rooftops, a stock photo for Forma Studio.', placeholder: true },
  { id: 'offgrid', category: 'websites', title: 'Offgrid Journal', outcome: 'Stories from the road less travelled, told at their own pace.', description: 'An editorial concept for independent travel. Long-form stories, field notes and destination guides come together in a photo-led reading experience.', tags: ['Editorial', 'Web design', 'Prototyping', 'Design system'], image: '/projects/concepts/offgrid.webp', imageHeight: 720, imageAlt: 'A snow-covered mountain valley, a stock photo for Offgrid Journal.', placeholder: true },
  { id: 'paper-route', category: 'websites', title: 'Steep & Co.', outcome: 'Good things take a little time.', description: 'An online home for loose-leaf tea, ceramics and brewing rituals. Built around discovery, with considered product pages and an easy path to checkout.', tags: ['E-commerce', 'Branding', 'Web design'], image: '/projects/concepts/paper-route.webp', imageHeight: 720, imageAlt: 'Glass teapot on a wooden table, a stock photograph for the Steep & Co. shop concept.', placeholder: true },
  { id: 'afterlight', category: 'misc', title: 'Afterlight', outcome: 'Finding the extraordinary in everyday light.', description: 'A photography-led visual identity study.', tags: ['Photography', 'Art direction'], image: '/projects/concepts/afterlight.webp', imageHeight: 720, imageAlt: 'Vintage film camera in warm light, a stock photo for the Afterlight study.', placeholder: true },
  { id: 'still-life', category: 'misc', title: 'Still Life Club', outcome: 'An ongoing collection of small, beautiful things worth noticing.', description: 'A personal concept exploring objects, composition and colour. A visual scrapbook designed to make everyday details feel a little more intentional.', tags: ['Visual design', 'Editorial', 'Photography'], image: '/projects/concepts/still-life.webp', imageHeight: 720, imageAlt: 'Raspberries on a sunlit wooden surface, a stock photo for Still Life Club.', placeholder: true },
  { id: 'soft-focus', category: 'misc', title: 'Soft Focus', outcome: 'A little room for daydreaming.', description: 'A collection of photographic moods for a fictional creative studio.', tags: ['Art direction', 'Branding'], image: '/projects/concepts/soft-focus.webp', imageHeight: 720, imageAlt: 'Pink flowers against a clear blue sky, a stock photo for Soft Focus.', placeholder: true },
  { id: 'slow-sunday', category: 'misc', title: 'Slow Sunday', outcome: 'Less on the schedule. More to look forward to.', description: 'An identity and packaging concept for a collection of everyday rituals, with an emphasis on tactile materials and small moments of calm.', tags: ['Branding', 'Packaging', 'Visual design', 'Art direction'], image: '/projects/concepts/slow-sunday.webp', imageHeight: 720, imageAlt: 'A close-up black-and-white clock face, a stock photo for Slow Sunday.', placeholder: true },
  { id: 'desk-notes', category: 'misc', title: 'Desk Notes', outcome: 'A home for unfinished ideas.', description: 'A lightweight workspace concept for notes, references and the next small experiment.', tags: ['Product design', 'Prototyping'], image: '/projects/concepts/desk-notes.webp', imageHeight: 720, imageAlt: 'An overhead view of a laptop, notebook and pencil, a stock photo for Desk Notes.', placeholder: true },
  { id: 'drift', category: 'misc', title: 'Drift Radio', outcome: 'A soundtrack for wherever the afternoon takes you.', description: 'A music discovery concept built around moods instead of genres. Cover studies and a simple listening flow explore how a quiet interface can let the music lead.', tags: ['App design', 'Interaction', 'Visual design'], image: '/projects/concepts/open-water.webp', imageHeight: 720, imageAlt: 'Laptop on a café table, a stock photograph for the Drift Radio concept.', placeholder: true },
  { id: 'open-water', category: 'misc', title: 'Open Water', outcome: 'An invitation to look a little further.', description: 'A poster series exploring rhythm, open space and the meeting of land and water.', tags: ['Graphic design', 'Photography'], image: '/projects/concepts/drift.webp', imageHeight: 720, imageAlt: 'Turquoise water between coastal cliffs, a stock photograph for the Open Water concept.', placeholder: true },
];

export interface ImpactMetric { value: string; label: string; note: string; }
export const impactGroups: { projectId: string; metrics: ImpactMetric[] }[] = [
  { projectId: 'datagpt', metrics: [
    { value: '$1.5M', label: 'revenue', note: 'DataGPT, first year after launch, team of 10' },
    { value: '~85%', label: 'customer adoption', note: 'vs ~18% for traditional analytics tools' },
    { value: '+26%', label: 'daily active users', note: 'over 90 days, with +18% revenue in the same period' },
  ] },
  { projectId: 'voximplant', metrics: [
    { value: '20K', label: 'calls automated per month', note: 'Voximplant Kit outbound campaigns' },
    { value: '4.8/5', label: 'rating on G2', note: 'Voximplant Kit' },
    { value: '10+', label: 'designers led', note: 'three departments and a research function, built from one seat' },
  ] },
];

export interface Experience { role: string; company: string; period: string; location: string; summary: string; duration: string; }
// The newly approved Figma timeline supersedes the earlier LinkedIn-derived copy.
export const experience: Experience[] = [
  { role: 'Lead Product Designer', company: 'DataGPT', period: '2023 — now', location: 'San Francisco, remote', summary: 'Designed the conversational analytics product from 0 to launch; brand, website and design system.', duration: '3 yrs 4 mos' },
  { role: 'Lead Product Designer', company: 'Voximplant', period: '2021 — 2023', location: 'Palo Alto', summary: 'Scaled the team from 1 to 10+ designers, structured three design departments.', duration: '1 yr 10 mos' },
  { role: 'Product Designer', company: 'Voximplant', period: '2018 — 2021', location: 'Palo Alto', summary: 'Designed Voximplant Kit from discovery to a core product line.', duration: '3 yrs' },
  { role: 'Senior UX/UI Designer', company: '24eastyard', period: '2017 — 2018', location: 'Ivano-Frankivsk', summary: 'Brand, website and client design systems; +30% engagement on managed projects.', duration: '1 yr 2 mos' },
  { role: 'UX/UI Designer', company: 'Yellow Leaf', period: '2016 — 2017', location: 'Ivano-Frankivsk', summary: 'Brand and web; dashboards and landing pages for clients.', duration: '1 yr 5 mos' },
  { role: 'Freelance Designer', company: 'Upwork', period: '2015 — 2017', location: 'part-time', summary: 'Landing pages, marketing sites and dashboards for SaaS and e-commerce clients.', duration: '2 yrs 4 mos' },
  { role: 'Web Designer', company: 'NetLS', period: '2013 — 2015', location: 'Ivano-Frankivsk', summary: 'Responsive sites and web apps; wireframes to export-ready assets.', duration: '1 yr 8 mos' },
];

export interface Tool { name: string; logo: string; width: number; height: number; }
// Original vector marks extracted from the user-supplied 10+ years of experience.svg.
export const tools: Tool[] = [
  { name: 'Claude Code', logo: '/tools/claude-code.svg', width: 112, height: 70 },
  { name: 'Codex', logo: '/tools/codex.svg', width: 70, height: 70 },
  { name: 'Replit', logo: '/tools/replit.svg', width: 58, height: 70 },
  { name: 'Paper', logo: '/tools/paper.svg', width: 70, height: 70 },
  { name: 'Figma', logo: '/tools/figma.svg', width: 47, height: 70 },
];
export const cvUrl = '/nazarii-pankiv-cv.pdf';
export const hookoAppUrl = 'https://apps.apple.com/us/app/blow-up-hooko/id6758728094';

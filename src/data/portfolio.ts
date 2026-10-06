import { dataGPTMedia } from './datagpt-case-study.ts';
import { peakHotelMedia } from './peak-hotel-case-study.ts';
import { yellowLeafMedia, yellowLeafDescription } from './yellow-leaf-case-study.ts';
import { indexLawFirmMedia, indexLawFirmDescription } from './index-law-firm-case-study.ts';
import { blaustromMedia, blaustromDescription } from './blaustrom-case-study.ts';
import { cravusMedia, cravusDescription } from './cravus-case-study.ts';
import { promshynaHero, promshynaDescription } from './promshyna-case-study.ts';

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
  // Optional lead: without one, the product description is the single intro title.
  outcome?: string;
  tags: string[];
  logo?: `/${string}.svg`;
  image: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight: number;
  imageSrcSet?: string;
  video?: { src: string; width: number; height: number; poster?: string; canvasColor?: string };
  placeholder?: boolean;
  href?: string;
}

// Shared card and case-study metadata, including the latest approved case-study copy.
// Original artwork transcribed from the user-supplied figma-home.svg, node 67:15.
export const projects: Project[] = [
  { id: 'voximplant', category: 'selected', title: 'Voximplant Kit', outcome: 'Designed and launched a no-code contact center from scratch. Scaled from MVP to a core SaaS product.', description: 'Voximplant Kit is intelligent cloud contact center. Offering an easy to use drag & drop interface and industry leading AI automation.', tags: ['Product design', 'Design system', 'Branding', 'Web design'], logo: '/projects/voximplant-logo.svg', image: '/projects/voximplant.webp', imageWidth: 1800, imageHeight: 900, imageAlt: 'Voximplant Kit outbound campaign builder and contact database upload flow.', video: { src: '/projects/voximplant-case-study/promo-voxkit.mp4', width: 1272, height: 720, poster: '/projects/voximplant-case-study/hero-poster.jpg' } },
  { id: 'hooko', category: 'selected', title: 'Hooko', outcome: 'I designed, built and launched App.', description: "Upload a Short, Reel or TikTok. Hooko scores the hook against the creator's niche, breaks down audio and visuals, and writes three reshootable alternatives backed by real videos from the same niche.", tags: ['Mobile UX', 'Product design', 'Built with AI', 'ASO + Apple Ads'], logo: '/projects/hooko-logo.svg', image: '/projects/hooko.webp', imageWidth: 1800, imageHeight: 722, imageAlt: 'Hooko mobile video analysis screens presented on a dark purple background.' },
  { id: 'datagpt', category: 'selected', title: 'Datagpt', description: 'DataGPT lets business teams ask questions about their data in plain English and get answers with charts, drawn from their own data warehouse.', tags: ['Product design', 'Design system', 'Branding', 'Web design', 'AI / LLM UX'], logo: '/projects/datagpt-logo.svg', image: dataGPTMedia.hero.src, imageWidth: dataGPTMedia.hero.width, imageHeight: dataGPTMedia.hero.height, imageSrcSet: `${dataGPTMedia.hero.src} ${dataGPTMedia.hero.width}w`, imageAlt: dataGPTMedia.hero.alt, video: dataGPTMedia.heroVideo },
];

// Website and Misc collections use the shared compact two-column cards.
// Websites contains the complete reference case studies, without samples.
// Misc retains its existing fictional concepts and local reference photos.
export const collectionProjects: Project[] = [
  { id: 'peak-hotel', category: 'websites', title: 'Peak Hotel', description: 'Website for Peak Hotel, one of the highest hotels in Dragobrat, a ski resort in the Ukrainian Carpathians.', tags: ['Web design', 'UI/UX', 'Interaction design', 'Responsive'], logo: '/projects/peak-hotel-case-study/logo.svg', image: peakHotelMedia.hero.src, imageWidth: peakHotelMedia.hero.width, imageHeight: peakHotelMedia.hero.height, imageSrcSet: peakHotelMedia.hero.src + ' 960w', imageAlt: peakHotelMedia.hero.alt, video: peakHotelMedia.heroVideo },
  { id: 'yellow-leaf', category: 'websites', title: 'Yellow Leaf', description: yellowLeafDescription, tags: ['Branding', 'Web design', 'UI/UX', 'Motion design', 'Responsive'], logo: '/projects/yellow-leaf-case-study/logo.svg', image: yellowLeafMedia.hero.src, imageWidth: yellowLeafMedia.hero.width, imageHeight: yellowLeafMedia.hero.height, imageSrcSet: yellowLeafMedia.hero.src + ' 1216w', imageAlt: yellowLeafMedia.hero.alt, video: yellowLeafMedia.heroVideo },
  { id: 'index-law-firm', category: 'websites', title: 'Index Law Firm', description: indexLawFirmDescription, tags: ['Web design', 'UI/UX', 'Interaction design', 'Animation'], logo: '/projects/index-law-firm-case-study/logo.svg', image: indexLawFirmMedia.hero.src, imageWidth: indexLawFirmMedia.hero.width, imageHeight: indexLawFirmMedia.hero.height, imageSrcSet: indexLawFirmMedia.hero.src + ' 1000w', imageAlt: indexLawFirmMedia.hero.alt, video: indexLawFirmMedia.heroVideo },
  { id: 'blaustrom', category: 'websites', title: 'Blaustrom', description: blaustromDescription, tags: ['Website', 'UI/UX', 'Configurator', 'Responsive design'], logo: '/projects/blaustrom-case-study/logo.svg', image: blaustromMedia.hero.src, imageWidth: blaustromMedia.hero.width, imageHeight: blaustromMedia.hero.height, imageSrcSet: blaustromMedia.hero.src + ' 1200w', imageAlt: blaustromMedia.hero.alt, video: blaustromMedia.heroVideo },
  { id: 'cravus', category: 'websites', title: 'Cravus', description: cravusDescription, tags: ['Web app', 'UI/UX', 'E-commerce', 'Responsive design'], logo: '/projects/cravus-case-study/logo.svg', image: cravusMedia.hero.src, imageWidth: cravusMedia.hero.width, imageHeight: cravusMedia.hero.height, imageSrcSet: cravusMedia.hero.src + ' 1400w', imageAlt: cravusMedia.hero.alt },
  { id: 'promshyna', category: 'websites', title: 'PromShyna', description: promshynaDescription, tags: ['E-commerce', 'Redesign', 'UI/UX', 'Logo', 'Responsive design'], logo: '/projects/promshyna-case-study/logo.svg', image: promshynaHero.src, imageWidth: promshynaHero.width, imageHeight: promshynaHero.height, imageSrcSet: promshynaHero.src + ' 1400w', imageAlt: promshynaHero.alt },
  { id: 'afterlight', category: 'misc', title: 'Afterlight', description: 'A photography-led visual identity study.', tags: ['Photography', 'Art direction'], image: '/projects/concepts/afterlight.webp', imageHeight: 720, imageAlt: 'Vintage film camera in warm light, a stock photo for the Afterlight study.', placeholder: true },
  { id: 'still-life', category: 'misc', title: 'Still Life Club', description: 'A personal concept exploring objects, composition and colour. A visual scrapbook designed to make everyday details feel a little more intentional.', tags: ['Visual design', 'Editorial', 'Photography'], image: '/projects/concepts/still-life.webp', imageHeight: 720, imageAlt: 'Raspberries on a sunlit wooden surface, a stock photo for Still Life Club.', placeholder: true },
  { id: 'soft-focus', category: 'misc', title: 'Soft Focus', description: 'A collection of photographic moods for a fictional creative studio.', tags: ['Art direction', 'Branding'], image: '/projects/concepts/soft-focus.webp', imageHeight: 720, imageAlt: 'Pink flowers against a clear blue sky, a stock photo for Soft Focus.', placeholder: true },
  { id: 'slow-sunday', category: 'misc', title: 'Slow Sunday', description: 'An identity and packaging concept for a collection of everyday rituals, with an emphasis on tactile materials and small moments of calm.', tags: ['Branding', 'Packaging', 'Visual design', 'Art direction'], image: '/projects/concepts/slow-sunday.webp', imageHeight: 720, imageAlt: 'A close-up black-and-white clock face, a stock photo for Slow Sunday.', placeholder: true },
  { id: 'desk-notes', category: 'misc', title: 'Desk Notes', description: 'A lightweight workspace concept for notes, references and the next small experiment.', tags: ['Product design', 'Prototyping'], image: '/projects/concepts/desk-notes.webp', imageHeight: 720, imageAlt: 'An overhead view of a laptop, notebook and pencil, a stock photo for Desk Notes.', placeholder: true },
  { id: 'drift', category: 'misc', title: 'Drift Radio', description: 'A music discovery concept built around moods instead of genres. Cover studies and a simple listening flow explore how a quiet interface can let the music lead.', tags: ['App design', 'Interaction', 'Visual design'], image: '/projects/concepts/open-water.webp', imageHeight: 720, imageAlt: 'Laptop on a café table, a stock photograph for the Drift Radio concept.', placeholder: true },
  { id: 'open-water', category: 'misc', title: 'Open Water', description: 'A poster series exploring rhythm, open space and the meeting of land and water.', tags: ['Graphic design', 'Photography'], image: '/projects/concepts/drift.webp', imageHeight: 720, imageAlt: 'Turquoise water between coastal cliffs, a stock photograph for the Open Water concept.', placeholder: true },
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

export interface Tool { name: string; logo: `/${string}.svg`; width: number; height: number; }
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
export const hookoSiteUrl = 'https://hooko.app/';

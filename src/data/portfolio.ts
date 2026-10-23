import { petCareDescription, petCareTags, petCareHero } from './pet-care-case-study.ts';
import { squareDescription, squareTags, squareHero } from './square-case-study.ts';
import { kitchenChatbotDescription, kitchenChatbotTags, kitchenChatbotHero } from './kitchen-chatbot-case-study.ts';
import { telegramDescription, telegramTags, telegramHero } from './telegram-file-picker-case-study.ts';
import { designCupDescription, designCupTags, designCupHero } from './design-cup-case-study.ts';
import { voximplantIvrDescription, voximplantIvrTags, voximplantIvrHero } from './voximplant-ivr-case-study.ts';
import { offfDescription, offfTags, offfHero } from './offf-conference-case-study.ts';
import { professionsInDigitalDescription, professionsInDigitalTags, professionsInDigitalHero } from './professions-in-digital-case-study.ts';
import { quitUniversityTitle, quitUniversityDescription, quitUniversityTags, quitUniversityHero } from './quit-university-case-study.ts';
import { dataGPTMedia } from './datagpt-case-study.ts';
import { peakHotelMedia } from './peak-hotel-case-study.ts';
import { yellowLeafMedia, yellowLeafDescription } from './yellow-leaf-case-study.ts';
import { indexLawFirmMedia, indexLawFirmDescription } from './index-law-firm-case-study.ts';
import { blaustromMedia, blaustromDescription } from './blaustrom-case-study.ts';
import { cravusMedia, cravusDescription } from './cravus-case-study.ts';
import { promshynaHero, promshynaDescription } from './promshyna-case-study.ts';
import { gutsulHero, gutsulDescription, gutsulTags } from './gutsul-made-case-study.ts';
import { sternfitHero, sternfitDescription, sternfitTags } from './team-sternfit-case-study.ts';

// Profile contact details retained from the supplied resume; homepage copy from Figma.
// See ../../../docs/copy.md for sources, editorial decisions and deliberately omitted claims.
const profileLinks = [
  'https://www.linkedin.com/in/nazariypankiv/',
  'https://www.behance.net/NazariyPankiv',
  'https://dribbble.com/NazariyPankiv',
];
export const heroSubtitle = {
  start: 'Launched B2B products from ',
  accent: '0 → 1',
  end: ', improved their adoption and helped grow ARR. Love solving complex problems.',
};
export const profile = {
  name: 'Nazarii Pankiv',
  alternateNames: ['Nazariy Pankiv', 'Nazar Pankiv'],
  sameAs: profileLinks,
  brand: 'naz.wtf',
  title: 'Product Designer',
  email: 'nazariosnz@gmail.com',
  linkedin: profileLinks[0],
  approach: 'Understand how people work. Map the problem, test the idea and refine the interaction. Then build the systems that help a product grow—from the first useful experience to the details people use every day.',
  biography: 'I’ve led design at DataGPT and Voximplant, working across web, mobile and enterprise SaaS. My practice brings together UX research, interaction design and design systems—from early discovery to delivery. Alongside hands-on design, I’ve hired designers, shaped teams and helped bring B2B products from idea to launch.',
  description: `${heroSubtitle.start}${heroSubtitle.accent}${heroSubtitle.end}`,
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
  logoBackground?: 'white';
  image: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight: number;
  imageSrcSet?: string;
  imageCanvasColor?: string;
  imageCanvasInset?: number;
  imageCanvasFade?: boolean;
  imageCanvasSourceRatio?: number;
  imageReducedMotionSrc?: string;
  video?: { src: string; width: number; height: number; poster?: string; canvasColor?: string; canvasInset?: number; canvasFade?: boolean; canvasSourceRatio?: number; cropPixels?: number };
  href?: string;
}

// Shared card and case-study metadata, including the latest approved case-study copy.
// Original artwork transcribed from the user-supplied figma-home.svg, node 67:15.
export const projects: Project[] = [
  { id: 'datagpt', category: 'selected', title: 'Datagpt', description: 'DataGPT lets business teams ask questions about their data in plain English and get answers with charts, drawn from their own data warehouse.', tags: ['Product design', 'Design system', 'Branding', 'Web design', 'AI / LLM UX'], logo: '/projects/datagpt-case-study/datagpt-logo.svg', image: dataGPTMedia.hero.src, imageWidth: dataGPTMedia.hero.width, imageHeight: dataGPTMedia.hero.height, imageSrcSet: `${dataGPTMedia.hero.src} ${dataGPTMedia.hero.width}w`, imageAlt: dataGPTMedia.hero.alt, video: dataGPTMedia.heroVideo },
  { id: 'hooko', category: 'selected', title: 'Hooko', outcome: 'I designed, built and launched App.', description: "Upload a Short, Reel or TikTok. Hooko scores the hook against the creator's niche, breaks down audio and visuals, and writes three reshootable alternatives backed by real videos from the same niche.", tags: ['Mobile UX', 'Product design', 'Built with AI', 'ASO + Apple Ads'], logo: '/projects/hooko-case-study/hooko-logo.svg', image: '/projects/hooko-case-study/hooko.webp', imageWidth: 1800, imageHeight: 722, imageAlt: 'Hooko mobile video analysis screens presented on a dark purple background.' },
  { id: 'voximplant', category: 'selected', title: 'Voximplant Kit', outcome: 'Designed and launched a no-code contact center from scratch. Scaled from MVP to a core SaaS product.', description: 'Voximplant Kit is a cloud contact center with a drag-and-drop scenario editor and AI call automation.', tags: ['Product design', 'Design system', 'Branding', 'Web design'], logo: '/projects/voximplant-case-study/voximplant-logo.svg', image: '/projects/voximplant-case-study/voximplant.webp', imageWidth: 1800, imageHeight: 900, imageAlt: 'Voximplant Kit outbound campaign builder and contact database upload flow.', video: { src: '/projects/voximplant-case-study/promo-voxkit.mp4', width: 1272, height: 720, poster: '/projects/voximplant-case-study/hero-poster.jpg' } },
];

// Website and Misc collections use the shared compact two-column cards.
// Websites contains the complete reference case studies, without samples.
// Misc contains real supplied concept studies, without samples.
export const collectionProjects: Project[] = [
  { id: 'gutsul-made', category: 'websites', title: 'Gutsul Made', description: gutsulDescription, tags: [...gutsulTags], logo: '/projects/gutsul-made-case-study/logo.svg', logoBackground: 'white', image: gutsulHero.src, imageWidth: gutsulHero.width, imageHeight: gutsulHero.height, imageSrcSet: `${gutsulHero.src} ${gutsulHero.width}w`, imageAlt: gutsulHero.alt, imageCanvasColor: gutsulHero.canvasColor, imageCanvasInset: gutsulHero.canvasInset },
  { id: 'peak-hotel', category: 'websites', title: 'Peak Hotel', description: 'Website for Peak Hotel, one of the highest hotels in Dragobrat, a ski resort in the Ukrainian Carpathians.', tags: ['Web design', 'UI/UX', 'Interaction design', 'Responsive'], logo: '/projects/peak-hotel-case-study/logo.svg', image: peakHotelMedia.hero.src, imageWidth: peakHotelMedia.hero.width, imageHeight: peakHotelMedia.hero.height, imageSrcSet: peakHotelMedia.hero.src + ' 960w', imageAlt: peakHotelMedia.hero.alt, video: peakHotelMedia.heroVideo },
  { id: 'yellow-leaf', category: 'websites', title: 'Yellow Leaf', description: yellowLeafDescription, tags: ['Branding', 'Web design', 'UI/UX', 'Motion design', 'Responsive'], logo: '/projects/yellow-leaf-case-study/logo.svg', image: yellowLeafMedia.hero.src, imageWidth: yellowLeafMedia.hero.width, imageHeight: yellowLeafMedia.hero.height, imageSrcSet: yellowLeafMedia.hero.src + ' 1216w', imageAlt: yellowLeafMedia.hero.alt, video: yellowLeafMedia.heroVideo },
  { id: 'index-law-firm', category: 'websites', title: 'Index Law Firm', description: indexLawFirmDescription, tags: ['Web design', 'UI/UX', 'Interaction design', 'Animation'], logo: '/projects/index-law-firm-case-study/logo.svg', logoBackground: 'white', image: indexLawFirmMedia.hero.src, imageWidth: indexLawFirmMedia.hero.width, imageHeight: indexLawFirmMedia.hero.height, imageSrcSet: indexLawFirmMedia.hero.src + ' 1000w', imageAlt: indexLawFirmMedia.hero.alt, video: indexLawFirmMedia.heroVideo },
  { id: 'blaustrom', category: 'websites', title: 'Blaustrom', description: blaustromDescription, tags: ['Website', 'UI/UX', 'Configurator', 'Responsive design'], logo: '/projects/blaustrom-case-study/logo.svg', image: blaustromMedia.hero.src, imageWidth: blaustromMedia.hero.width, imageHeight: blaustromMedia.hero.height, imageSrcSet: blaustromMedia.hero.src + ' 1200w', imageAlt: blaustromMedia.hero.alt, video: blaustromMedia.heroVideo },
  { id: 'promshyna', category: 'websites', title: 'PromShyna', description: promshynaDescription, tags: ['E-commerce', 'Redesign', 'UI/UX', 'Logo', 'Responsive design'], logo: '/projects/promshyna-case-study/logo.svg', logoBackground: 'white', image: promshynaHero.src, imageWidth: promshynaHero.width, imageHeight: promshynaHero.height, imageSrcSet: promshynaHero.src + ' 1400w', imageAlt: promshynaHero.alt },
  { id: 'cravus', category: 'websites', title: 'Cravus', description: cravusDescription, tags: ['Web app', 'UI/UX', 'E-commerce', 'Responsive design'], logo: '/projects/cravus-case-study/logo.svg', image: cravusMedia.hero.src, imageWidth: cravusMedia.hero.width, imageHeight: cravusMedia.hero.height, imageSrcSet: cravusMedia.hero.src + ' 1400w', imageAlt: cravusMedia.hero.alt },
  { id: 'team-sternfit', category: 'websites', title: 'Team Sternfit', description: sternfitDescription, tags: [...sternfitTags], logo: '/projects/team-sternfit-case-study/logo.svg', logoBackground: 'white', image: sternfitHero.src, imageWidth: sternfitHero.width, imageHeight: sternfitHero.height, imageSrcSet: `${sternfitHero.src} ${sternfitHero.width}w`, imageAlt: sternfitHero.alt },
  { id: 'pet-care', category: 'misc', title: 'Pet Care', description: petCareDescription, tags: [...petCareTags], logo: '/projects/pet-care-case-study/logo.svg', logoBackground: 'white', image: petCareHero.src, imageWidth: petCareHero.width, imageHeight: petCareHero.height, imageSrcSet: `${petCareHero.src} ${petCareHero.width}w`, imageAlt: petCareHero.alt },
  { id: 'telegram-file-picker', category: 'misc', title: 'Picker Concept', description: telegramDescription, tags: [...telegramTags], logo: '/projects/telegram-file-picker-case-study/logo.svg', logoBackground: 'white', image: telegramHero.poster, imageWidth: telegramHero.width, imageHeight: telegramHero.height, imageSrcSet: `${telegramHero.poster} ${telegramHero.width}w`, imageAlt: telegramHero.alt, video: { src: telegramHero.src, width: telegramHero.width, height: telegramHero.height, poster: telegramHero.poster } },
  { id: 'square', category: 'misc', title: 'SQUARE', description: squareDescription, tags: [...squareTags], logo: '/projects/square-case-study/logo.svg', logoBackground: 'white', image: squareHero.poster, imageWidth: squareHero.width, imageHeight: squareHero.height, imageSrcSet: `${squareHero.poster} ${squareHero.width}w`, imageAlt: squareHero.alt, video: { src: squareHero.src, width: squareHero.width, height: squareHero.height, poster: squareHero.poster } },
  { id: 'kitchen-chatbot', category: 'misc', title: 'Kitchen Chatbot', description: kitchenChatbotDescription, tags: [...kitchenChatbotTags], logo: '/projects/kitchen-chatbot-case-study/logo.svg', logoBackground: 'white', image: kitchenChatbotHero.src, imageWidth: kitchenChatbotHero.width, imageHeight: kitchenChatbotHero.height, imageSrcSet: `${kitchenChatbotHero.src} 800w`, imageAlt: kitchenChatbotHero.alt, imageCanvasColor: kitchenChatbotHero.canvasColor, imageCanvasInset: kitchenChatbotHero.canvasInset, imageCanvasFade: kitchenChatbotHero.canvasFade, imageCanvasSourceRatio: kitchenChatbotHero.canvasSourceRatio, imageReducedMotionSrc: kitchenChatbotHero.reducedMotionSrc },
  { id: 'design-cup', category: 'misc', title: 'Design Cup', description: designCupDescription, tags: [...designCupTags], logo: '/projects/design-cup-case-study/logo.svg', logoBackground: 'white', image: designCupHero.src, imageWidth: designCupHero.width, imageHeight: designCupHero.height, imageSrcSet: `${designCupHero.src} 800w`, imageAlt: designCupHero.alt, imageCanvasColor: designCupHero.canvasColor, imageCanvasSourceRatio: designCupHero.canvasSourceRatio, imageReducedMotionSrc: designCupHero.reducedMotionSrc },
  { id: 'voximplant-ivr', category: 'misc', title: 'Voximplant IVR', description: voximplantIvrDescription, tags: [...voximplantIvrTags], logo: '/projects/voximplant-ivr-case-study/logo.svg', image: voximplantIvrHero.src, imageWidth: voximplantIvrHero.width, imageHeight: voximplantIvrHero.height, imageSrcSet: `${voximplantIvrHero.src} 800w`, imageAlt: voximplantIvrHero.alt, imageCanvasColor: voximplantIvrHero.canvasColor, imageCanvasSourceRatio: voximplantIvrHero.canvasSourceRatio, imageReducedMotionSrc: voximplantIvrHero.reducedMotionSrc },
  { id: 'offf-conference', category: 'misc', title: 'OFFF Conference', description: offfDescription, tags: [...offfTags], logo: '/projects/offf-conference-case-study/logo.svg', logoBackground: 'white', image: offfHero.poster, imageWidth: offfHero.width, imageHeight: offfHero.height, imageSrcSet: `${offfHero.poster} ${offfHero.width}w`, imageAlt: offfHero.alt, video: { src: offfHero.src, width: offfHero.width, height: offfHero.height, poster: offfHero.poster } },
  { id: 'professions-in-digital', category: 'misc', title: 'Professions', description: professionsInDigitalDescription, tags: [...professionsInDigitalTags], logo: '/projects/professions-in-digital-case-study/logo.svg', logoBackground: 'white', image: professionsInDigitalHero.poster, imageWidth: professionsInDigitalHero.width, imageHeight: professionsInDigitalHero.height, imageSrcSet: `${professionsInDigitalHero.poster} ${professionsInDigitalHero.width}w`, imageAlt: professionsInDigitalHero.alt, video: { src: professionsInDigitalHero.src, width: professionsInDigitalHero.width, height: professionsInDigitalHero.height, poster: professionsInDigitalHero.poster, cropPixels: professionsInDigitalHero.cropPixels } },
  { id: 'quit-university', category: 'misc', title: quitUniversityTitle, description: quitUniversityDescription, tags: [...quitUniversityTags], logo: '/projects/quit-university-case-study/logo.svg', logoBackground: 'white', image: quitUniversityHero.poster, imageWidth: quitUniversityHero.width, imageHeight: quitUniversityHero.height, imageSrcSet: `${quitUniversityHero.poster} ${quitUniversityHero.width}w`, imageAlt: quitUniversityHero.alt, video: { src: quitUniversityHero.src, width: quitUniversityHero.width, height: quitUniversityHero.height, poster: quitUniversityHero.poster, cropPixels: quitUniversityHero.cropPixels } },
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

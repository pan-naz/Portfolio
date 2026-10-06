const asset = (name: string) => '/projects/yellow-leaf-case-study/' + name;
const image = (name: string, width: number, height: number, alt: string) => ({ src: asset(name + '.webp'), width, height, alt, kind: 'image' as const, presentation: 'floating' as const, radius: 'medium' as const });
const video = (name: string, width: number, height: number, alt: string) => ({ src: asset(name + '.mp4'), poster: asset(name + '.webp'), width, height, alt, presentation: 'floating' as const, radius: 'medium' as const });

export const yellowLeafLinkedIn = 'https://www.linkedin.com/company/yellow-leaf-technologies/';
export const yellowLeafDescription = 'Yellow Leaf is a software agency from Ivano-Frankivsk, Ukraine. They build web and mobile products for businesses in Europe and the US.';

export const yellowLeafHomeSections = [
  ['Preloader', 'A counter runs from 0 to 100 while the page loads.'],
  ['Hero', '“Ideas for your business success” over a background video, with a button to the agency\'s work.'],
  ['About', '“We develop complex interface systems for web, mobile and VR”, next to an illustration of a yellow tree.'],
  ['Our works', 'Recent projects as cards with the project name, services and a cover image.'],
  ['Testimonials', 'A quote from a client.'],
  ['Footer', 'An Estimate project button, social links, the address and contacts.'],
] as const;

export const yellowLeafEstimateSteps = [
  ['Project type', 'Commercial platform, information portal, corporate website, landing page or mobile app. A short note explains each option.'],
  ['Scope', 'Front-end, back-end or design, shown as cards with icons.'],
  ['Contacts', 'Name, email, phone, company and a short description of the idea. Errors show right under the field.'],
  ['Done', 'A thank-you screen with a link to the agency\'s work.'],
] as const;

export const yellowLeafPalette = [
  ['Buttons and accents', '#F7BC11'],
  ['Text and footer', '#191919'],
  ['Section background', '#F5F5F5'],
  ['Cards and pages', '#FFFFFF'],
] as const;
export const yellowLeafMedia = {
  hero: image('intro', 1216, 680, "Site intro: a preloader counts to 100, then the hero opens with the line Ideas for your business success over a background video"),
  heroVideo: { src: asset('intro.mp4'), poster: asset('intro.webp'), width: 1216, height: 680, alt: "Site intro: a preloader counts to 100, then the hero opens with the line Ideas for your business success over a background video" },
  homeHero: image('home-hero', 1600, 1082, "Main page: header with the Estimate project button, the yellow tree illustration with the line We develop complex interface systems for web, mobile and VR, and the start of Our works"),
  homeEnd: image('home-end', 1600, 1109, "A client testimonial, then the dark footer with the Estimate project button, social links, address and contacts"),
  estimate: image('estimate', 1600, 1081, "Estimate form opened over the main page: project type options with a note on the right, scope cards for front-end, back-end and design, and the contact form with an error on the phone field"),
  estimateDone: image('estimate-done', 700, 768, "Phone screen with a yellow check mark: Thanks, we'll get back to you soon, and an Our works button"),
  phoneHome: image('phone-home', 920, 1780, "Phone: the about block with the yellow tree and an About us button"),
  phoneWorks: image('phone-works', 920, 1780, "Phone: Our works with an All work button and the first project card"),
  menuTablet: image('menu-tablet', 1218, 1350, "Open menu on a tablet: logo, social links, the five sections and the language switch"),
  menuPhone: image('menu-phone', 386, 1400, "Open menu on a phone: logo, the five sections and the language switch in one column"),
  works: image('page-works', 566, 1144, "Our works page: project cards in two staggered columns, each with a name, services and a cover image"),
  careers: image('page-careers', 566, 1144, "Careers page: open roles with short descriptions and a photo of the office"),
  services: image('page-services', 566, 1144, "Services page: five services with icons and related projects, then an office photo"),
  about: image('page-about', 1200, 1574, "About us page at 1440 px: dark header, a short intro, three numbered values, a row of black and white team photos with roles, and an office photo"),
  notebooks: image('brand-notebooks', 620, 490, "Black notebooks with the yellow leaf logo and the LEAF wordmark, one with a large cropped y on the cover"),
  shirt: image('brand-shirt', 380, 680, "Dark T-shirt with a y made of small yellow leaves above the LEAF wordmark and a person sitting with a laptop"),
  homeScroll: video('home-scroll', 960, 540, "Screen recording: the hero, then scrolling down to the about block and Our works"),
  estimateMobile: video('estimate-mobile', 700, 768, "Screen recording on a phone: choosing Information portal as the project type and Back-end as the scope"),
  navigation: video('nav', 1200, 700, "Screen recording: the Our works page loads, then the menu opens, the cursor moves over the items and the menu closes"),
  phoneHero: video('phone-hero', 460, 890, "Phone: the hero with a background video, the line Ideas your success and an Our works button"),
  brandIntro: video('brand-intro', 900, 446, "Logo animation: yellow leaves fall from a tree, the leaf logo fills with yellow, Yellow Leaf appears, then the illustration of a person with a laptop under the tree opens"),
};

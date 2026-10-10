import { createCaseMedia } from './case-media.ts';
const { asset, image, video } = createCaseMedia('/projects/blaustrom-case-study/');

export const blaustromDescription = 'A website for Blaustrom, a Bavarian company that sells solar power systems for homes: solar panels, batteries and EV charging stations.';
export const blaustromHomeSections = [
  ['First screen', 'The logo, the line “It’s all about energy” and a “Design System now!” button.'],
  ['We make electricity blue', 'A solar system with a battery can cover up to 80% of a home’s electricity. Blaustrom supplies the rest from regional renewable sources.'],
  ['Your energy future from a single source', 'A line drawing of a farm, solar panels, a wind turbine, a house and an electric car. Each plus button opens a short note about that part of the system.'],
  ['From Registration to Z', 'The five steps Blaustrom takes care of: inquiry, planning, installation, registration and operation.'],
] as const;
export const blaustromPalette = [
  ['Button background', '#0497C3'],
  ['Gradient background', '#0497C3 → #04C1C1'], ['Slider color', '#FFBE0D'],
  ['Dark background', '#282828'], ['Slider background', '#C0CED5'],
] as const;
export const blaustromMedia = {
  hero: image('hero.webp', 1200, 400, 'The Blaustrom logo animation: a blue dot draws the letter b, the b closes and opens again, then a blue circle with the blaustrom wordmark fills the frame'),
  heroVideo: { src: asset('intro.mp4'), poster: asset('hero.webp'), width: 1200, height: 400, canvasColor: '#FFFFFF', alt: 'The Blaustrom logo animation: a blue dot draws the letter b, the b closes and opens again, then a blue circle with the blaustrom wordmark fills the frame' },
  firstScreen: image('first-screen.jpg', 818, 467, "First screen: the menu, a large blue b, the line It's all about energy and a blue Design System now! button on a dark background"),
  blue: image('slide-blue.jpg', 1170, 646, 'Slide We make electricity blue: text on the left and a photo of a house with solar panels at dusk on the right'),
  energy: video('energy', 784, 380, 'Slide Your energy future from a single source: a plus button on the line drawing is clicked and a note about the electricity meter opens'),
  steps: image('slide-steps.jpg', 1170, 646, 'Slide From Registration to Z: text on the left and five round icons joined by a dotted line: inquiry, planning, installation, registration, operation'),
  about: image('about.jpg', 1169, 644, 'About section: the heading Blaustrom is innovative and different with three paragraphs, and on the right a round photo of the founder Fabian Eckl with a bio in italics'),
  products: image('products.jpg', 1169, 628, 'Products section: Our Product Partner, BYD with three key points (long life, flexible capacity, automotive quality), a short text, the BYD logo, Show website and Download datasheet links, a video and dots for SolaX, LG and ABL'),
  configurator: image('cfg-start.jpg', 1169, 643, 'Configurator start: the blaustrom configurator heading, the four-step bar, an address field and a Do you have a solarsystem? switch'),
  roof: image('cfg-roof.jpg', 698, 384, 'Step 1: a satellite map of a house on the left, and on the right two roof areas, A in blue and B in yellow, each with kWp, orientation and a roof angle slider'),
  group: image('cfg-group.jpg', 698, 384, 'Step 2: Choose your consumer group with Home, Farm and Business, and a slider with person icons set to 4 persons above a field with 4500 kWh'),
  supplier: image('cfg-supplier.jpg', 698, 384, 'Step 3: Who is your actual energy supplier? with a drop-down, and What is your kWh price? with a slider set to 27 cents'),
  systems: image('cfg-proposals.jpg', 942, 433, 'Step 4: three cards with 68%, 78% and 72% local blaustrom rate, each listing solar system, yearly production, battery, grid consumption and grid feed, with a Take it button'),
  proposal: video('proposal', 920, 516, 'Prototype of step 4: Take it is clicked on the third card and the personal proposal form opens with the chosen system on a blue panel'),
  thanks: image('cfg-thanks.jpg', 934, 515, 'Thank you screen with all four steps checked and a text about the proposal sent by email'),
  contact: image('contact.jpg', 1170, 1324, "Contact section: Get in touch with us form, a grey map with a blue b pin, and a dark footer with a Sign in button, the address in Osterhofen, social icons and It's all about energy"),
  menu: video('menu', 800, 526, 'Phone layout: the round menu button opens a dark menu with the five sections, Sign in and the language switch'),
  responsive: image('responsive.jpg', 1400, 1205, 'Three widths of the main page side by side, desktop, tablet and phone: the dark first screen with the b, the From Registration to Z slide and the About section'),
  angle: image('slider-angle.png', 628, 91, 'Blue slider with a roof icon over each mark, set to 30 degrees'),
  people: image('slider-people.png', 628, 95, 'Yellow slider with a family icon over each mark, set to 3 persons'),
};
export const blaustromConfiguratorSteps = [
  { label: 'Step 1', title: 'Solar system', media: blaustromMedia.roof, description: 'A satellite map of the house. Each roof area gets a letter and its own row with the size in kWp, the orientation and a slider for the roof angle from 0° to 50°. A roof area that should not be used can be switched off.' },
  { label: 'Step 2', title: 'Consumer group', media: blaustromMedia.group, description: 'Home, farm or business. For a home, a yellow slider with household sizes from one to six people sets the yearly electricity use. The number in kWh below it can also be typed in.' },
  { label: 'Step 3', title: 'Electricity supplier', media: blaustromMedia.supplier, description: 'The customer picks their current supplier from a list and sets what they pay per kWh on a slider from 15 to 35 cents.' },
  { label: 'Step 4', title: 'Your blaustrom system', media: blaustromMedia.systems, description: 'Three systems to choose from. Each card shows the share of electricity the home would produce itself, the size of the solar system and the battery, the yearly production, and how much electricity would come from and go to the grid.' },
  { label: 'After step 4', title: 'Personal proposal', media: blaustromMedia.proposal, description: '“Take it” opens a form with the chosen system on a blue panel. The customer leaves their name, email and phone and can subscribe to the newsletter.' },
  { label: 'After step 4', title: 'Thank you', media: blaustromMedia.thanks, description: 'The last screen has all four steps checked and says that a detailed proposal was sent by email.' },
];

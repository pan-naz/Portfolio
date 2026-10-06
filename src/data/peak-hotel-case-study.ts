const asset = (name: string) => '/projects/peak-hotel-case-study/' + name;
const image = (name: string, width: number, height: number, alt: string) => ({ src: asset(name + '.webp'), width, height, alt, kind: 'image' as const, presentation: 'floating' as const, radius: 'medium' as const });

export const peakHotelLinks = {
  website: 'https://pikhotel.com/en/',
};
export const peakHotelMedia = {
  hero: image('slider', 960, 472, 'Preloader and the full-screen photo slider on the Peak Hotel home page'),
  heroVideo: { src: asset('slider.mp4'), width: 960, height: 472, poster: asset('slider.webp') },
  home: image('home', 1000, 2841, 'Full Peak Hotel home page: sunset photo slider with booking bar, intro line, European service, rooms slider, restaurant, more services and footer with weather'),
  rooms: image('rooms', 1000, 2759, 'Rooms page: header photo, then Luxury and Standard room cards with photos and amenity lists'),
  reviews: image('reviews', 1000, 2173, 'Testimonials page: review form on a dark panel, then a list of guest reviews with dates'),
  contact: image('contact', 1000, 1143, 'Contact page: photo of the hotel in snow, then a map with a contact form beside it'),
  restaurant: image('restaurant', 648, 324, 'The restaurant page header'),
  rental: image('rental', 648, 324, 'Equipment rental page header with a snowboarder'),
  safari: image('safari', 648, 324, 'Safari page header with snow vehicles'),
  navigation: { src: asset('navigation.mp4'), width: 1366, height: 646, poster: asset('navigation.webp'), alt: 'Screen recording: opening the menu, browsing the Services dropdown and moving through the rooms slider', kind: 'video' as const, presentation: 'floating' as const, radius: 'medium' as const },
  responsive: image('devices', 1400, 1388, 'Rooms, Testimonials and Contact pages on tablets, and the home, Rooms and footer screens on phones'),
  ui: image('ui-elements', 1400, 1283, 'Header with booking bar, date picker calendar, nights selector, room booking card, news dropdown, open menu with Services dropdown, room slider and service card'),
  button: { src: asset('button.gif'), reducedMotionSrc: asset('button-still.webp'), width: 618, height: 340, alt: 'Animated hover on the copper Reviews button', kind: 'image' as const, presentation: 'floating' as const, radius: 'medium' as const },
  icons: image('icons', 625, 95, 'Six line icons in copper: hotel building, news, porter with luggage, quill, weather and the Peak mountain mark'),
  grid: image('grid', 1205, 792, 'Rooms slider shown over the layout grid columns'),
};
export const peakHotelHomeSections = [
  ['Photo slider', 'The hotel name over a full-screen photo slider, with the booking bar on top.'],
  ['About', 'A short line about the individually furnished rooms.'],
  ['European service', 'A photo with a dark text panel and a link to guest reviews.'],
  ['Rooms', 'A slider that shows one room type at a time, with a counter and a button to view the room.'],
  ['Restaurant', 'The café-bar on the ground floor, with views of the mountains.'],
  ['More services', 'A newsletter sign-up and the latest guest review.'],
  ['Footer', 'Social links, contacts and the current weather at the resort.'],
] as const;
export const peakHotelInnerPages = [
  { title: 'Rooms', description: "Each room type with photos and a list of what's in the room.", media: peakHotelMedia.rooms },
  { title: 'Reviews', description: 'Guests can leave a review right on the page. All reviews are listed under the form.', media: peakHotelMedia.reviews },
  { title: 'Contact', description: 'A map showing where the hotel is, with a contact form next to it.', media: peakHotelMedia.contact },
];
export const peakHotelServices = [
  { title: 'The restaurant', media: peakHotelMedia.restaurant },
  { title: 'Equipment rental', media: peakHotelMedia.rental },
  { title: 'Safari', media: peakHotelMedia.safari },
];
export const peakHotelColors = [
  { label: 'UI elements', value: '#C66F21' },
  { label: 'Text', value: '#3B3736' },
  { label: 'Background, dark', value: '#302C2B' },
  { label: 'Background, light', value: '#FFFFFF' },
];

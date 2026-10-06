const asset = (name: string) => '/projects/cravus-case-study/' + name;
const image = (name: string, width: number, height: number, alt: string) => ({ src: asset(name), width, height, alt, kind: 'image' as const, presentation: 'floating' as const, radius: 'medium' as const });

export const cravusDescription = "A web app for Cravus, a food delivery startup for busy professionals and students.";
export const cravusRole = ["App structure and user flows", "Layouts for nine pages", "Cart, payment and order history", "Phone layouts", "Icons, UI elements and the style guide"] as const;
export const cravusTeam = "I was the only designer on the project and worked directly with the Cravus team. Their developers built the app.";
export const cravusConcepts = [["Chefs", "Cravus finds cooks from different countries who live in the area. They cook dishes from their home cuisine every day in a licensed central kitchen."], ["Weekly menu", "The menu of cuisines changes every week. Customers order meals for any day and time in the coming week. Ordering ahead is cheaper, and same-day orders cost more to deliver."], ["Offices", "Companies can sign up as enterprise customers and order lunch for their staff. Each employee picks their own meal, and the company pays only for what was ordered."]] as const;
export const cravusHomeSections = [["Header", "Login and sign up, the menu (Home, Dishes, How it works, Contact, Be a Chef), search and the cart."], ["First screen", "The logo and “What Are You Craving?” over a food photo, with an Explore button."], ["About", "“A Taste of Global Cuisine” with three points: affordable food, a menu that changes weekly and delivery to the curb."], ["Today’s dishes", "Six dish cards from the day’s menu."], ["Chef story", "“Do You Know Your Chef?” with a quote from one of the chefs about their home town."], ["Offices", "“Looking to feed your office?” with three reasons and a Sign up button."], ["Footer", "Phone and email, links to join the kitchen or the delivery fleet, and social links."]] as const;
export const cravusPalette = [["Buttons, links and icons", "#F3981E"], ["Text", "#36210D"], ["Background", "#F9E8BF"]] as const;
export const cravusMedia = {
  hero: image("hero.jpg", 1400, 800, "Cravus pages laid out at an angle on an orange background: the main page with dish cards, a chef story, the sign-up form, order history and the delivery map"),
  laptop: image("laptop.jpg", 1040, 660, "The Cravus main page on a laptop: a paella photo with the heading What Are You Craving? and an Explore button"),
  home: image("home.jpg", 836, 2320, "Full Cravus main page: header, food photo with the logo and heading, three icons, six dish cards, a chef quote over a steak photo, the office block with three orange cards, and the footer"),
  signup: image("signup.jpg", 1400, 740, "Login form with a Facebook button next to the sign-up form with the enterprise customer checkbox, company name and employee count"),
  profile: image("profile.jpg", 840, 990, "My Profile page with the user menu open: Refer a friend, History, Profile, Logout"),
  dishes: image("dishes.jpg", 1022, 1040, "Dishes page with Today and Tomorrow tabs, a sort menu and dish cards, with one card shown enlarged"),
  chefs: image("chefs.jpg", 1040, 990, "Chefs page with a grid of chef cards and one card shown enlarged"),
  chef: image("chef.jpg", 840, 1590, "Chef page with a food photo header, chef details, the chef's dishes and a comments block"),
  cart: image("cart.jpg", 1120, 1140, "Cart page with items grouped by delivery date and the payment panel open on the left"),
  history: image("history.jpg", 840, 980, "History page with orders grouped by day and a delivery status for each, with a Rate button on the last one"),
  delivery: image("delivery.jpg", 840, 960, "How it works page with three ways to order and a dark map with green, yellow and red delivery zones"),
  contact: image("contact.jpg", 840, 740, "Contact Us page with a short text and a three-field form"),
  phones: image("phones.jpg", 1400, 1260, "Nine phones on an orange background: main page, chefs, dishes, history, chef page, sign up, contact, how it works and cart"),
  grid: image("grid.jpg", 800, 820, "The office block and footer laid over 12 orange grid columns"),
  ui: image("ui.jpg", 1220, 1180, "UI elements: header, user menu, office card, sort menu, date tabs, delivery zones legend, payment panel, dish card, map and a cart row"),
} as const;

export const cravusPages = [
  { number: "02", title: "Sign up and profile", description: "Customers sign up with Facebook or email. A checkbox marks enterprise customers, who add the company name and the number of employees. The profile has the same fields, plus promo emails and a password change. The menu under the user’s name links to Refer a friend, History, Profile and Logout.", media: [cravusMedia.signup, cravusMedia.profile] },
  { number: "03", title: "Dishes", description: "The menu for today, tomorrow or a date picked in the calendar, with the cuisine of that day. Dishes can be sorted by newest, top rated or trending. Each card shows the photo, price, rating, cuisine, a short description, the chef and an Add to cart button.", media: [cravusMedia.dishes] },
  { number: "04", title: "Chefs", description: "Chef cards list the rating, type of cooking, cuisine, payment methods, email, and whether the chef delivers or offers pick-up.", media: [cravusMedia.chefs] },
  { number: "05", title: "Chef page", description: "A photo header with the chef’s name and rating, then their details, a Talk to chef button and a short bio. Below are the chef’s dishes and comments from customers.", media: [cravusMedia.chef] },
  { number: "06", title: "Cart and payment", description: "Items are grouped by delivery date. Each item has its own date, time and quantity, so one order can cover several days. Secure payment opens a panel with card details, phone, address and the order summary.", media: [cravusMedia.cart] },
  { number: "07", title: "Order history", description: "Past orders grouped by day, each with a status: placed, in progress, delivery, complete or declined. After a delivery the customer can rate the dish.", media: [cravusMedia.history] },
  { number: "08", title: "How it works", description: "Three ways to order: on demand for the same day, a day ahead to save 20% on delivery, or for the whole next week before 8:00pm on Saturday to save 60%. The service area map has three zones around the kitchen: under 10 meals, 10–25 meals, and 25 meals and more.", media: [cravusMedia.delivery] },
  { number: "09", title: "Contact", description: "A short description of Cravus and a form with name, email and message.", media: [cravusMedia.contact] },
] as const;

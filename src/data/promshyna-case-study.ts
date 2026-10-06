// Original copy and media from the user-supplied PromShyna reference.
export const promshynaDescription = "An online store for PromShyna, a shop in Ivano-Frankivsk that sells tires and wheels for special machinery, such as loaders, excavators, forklifts, tractors and trucks, and delivers across Ukraine." as const;

export const promshynaRole = [
  "Logo redesign",
  "Home, category and product pages",
  "Cart, checkout and delivery pages",
  "Blog, contacts and 404 pages",
  "Phone layouts"
] as const;

export const promshynaTeam = "I was the only designer and worked directly with the store’s owner. Their developers built the site." as const;

export const promshynaPages = [
  {
    "number": "01",
    "title": "Home page",
    "description": "The home page is called Special Tire Hypermarket and starts with a filter, so a buyer can search by size or category before anything else. Below it are a slider with the catalog categories, best sellers with a cart button on each card, manufacturer logos and a short text about the store.",
    "specs": [
      [
        "Filter",
        "Inner diameter, category, size, manufacturer, price from and to"
      ],
      [
        "Header",
        "Delivery phone, logo, menu, search and cart with a counter"
      ]
    ],
    "media": [
      {
        "src": "/projects/promshyna-case-study/home-top.jpg",
        "alt": "Home page top: the header with the delivery phone, logo, menu, search and cart, the title Special Tire Hypermarket and a filter with five fields and a search button",
        "width": 1100,
        "height": 321,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      },
      {
        "src": "/projects/promshyna-case-study/home-slider.mp4",
        "alt": "Category slider: the arrow is clicked and the cards for truck wheels, wheels and forklift tires slide over",
        "width": 1100,
        "height": 358,
        "kind": "video",
        "presentation": "floating",
        "radius": "medium",
        "poster": "/projects/promshyna-case-study/home-slider.jpg"
      },
      {
        "src": "/projects/promshyna-case-study/home-rest.jpg",
        "alt": "Home page continued: eight best sellers with prices and cart buttons, a manufacturer logo slider, a text about the store next to a photo of a mechanic at a large tire, and the dark footer",
        "width": 1100,
        "height": 1348,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    ],
    "sticky": true
  },
  {
    "number": "02",
    "title": "Category page",
    "description": "A category opens with a breadcrumb and four filters for the tire size. Products sit four to a row, each with a name, a short description, the price and a cart button. The last card loads more products, and page numbers sit under the grid. A text about the store closes the page.",
    "specs": [
      [
        "Filters",
        "Tire size, seat diameter, profile width, profile height"
      ],
      [
        "Product card",
        "Photo, name, description, price in hryvnias, cart button"
      ]
    ],
    "media": [
      {
        "src": "/projects/promshyna-case-study/listing-top.mp4",
        "alt": "Truck wheels category: the breadcrumb, four filter menus and the first row of products, with the pointer moving over the cards",
        "width": 1100,
        "height": 560,
        "kind": "video",
        "presentation": "floating",
        "radius": "medium",
        "poster": "/projects/promshyna-case-study/listing-top.jpg"
      },
      {
        "src": "/projects/promshyna-case-study/listing-rest.jpg",
        "alt": "Category page continued: four more rows of tires, wheels and oil canisters, a Show more card, page numbers up to 874, a text about the store next to a yellow dump truck, and the footer",
        "width": 1100,
        "height": 1659,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    ],
    "sticky": true
  },
  {
    "number": "03",
    "title": "Product page",
    "description": "A large photo sits next to the name and the specs. Under them are a short description, the price and the cart button. Once the item is added, the button reads In cart and has a cross to take it out again. Similar products follow under the card.",
    "specs": [
      [
        "Specs",
        "Size, model, ply rating, country, tire type, inner diameter"
      ]
    ],
    "media": [
      {
        "src": "/projects/promshyna-case-study/product.jpg",
        "alt": "Product card: a red 200 litre drum of Divinol gear oil next to its specs, description, price of 7784 hryvnias and an orange In cart button with a cross, and four similar products below",
        "width": 883,
        "height": 785,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    ],
    "sticky": false
  },
  {
    "number": "04",
    "title": "Cart",
    "description": "Each item is a row with its photo and specs, the price, a quantity menu, the sum and a delete icon. The last row has the total, a checkout button and a link back to the store.",
    "specs": [],
    "media": [
      {
        "src": "/projects/promshyna-case-study/cart.jpg",
        "alt": "Cart with three items, a drum of oil, a tire and a bottle of oil, each with specs, price, quantity menu, sum and a delete icon, and a last row with Checkout, Continue shopping and a total of 23352 hryvnias",
        "width": 1100,
        "height": 1068,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    ],
    "sticky": false
  },
  {
    "number": "05",
    "title": "Checkout",
    "description": "The store sells to companies as well as private buyers, so the order form has two tabs, Private person and Company. The company tab adds fields for the legal address, tax number, bank and account number. The order list and the total stay next to the form.",
    "specs": [
      [
        "Company tab",
        "Company name, contact name, delivery address, legal address, email, tax number, bank, account, phone, message"
      ]
    ],
    "media": [
      {
        "src": "/projects/promshyna-case-study/order.jpg",
        "alt": "Checkout page with the Company tab open: a column of form fields on the left and the three ordered items with prices on the right, and an Order button with the total under the form",
        "width": 1100,
        "height": 966,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    ],
    "sticky": false
  },
  {
    "number": "06",
    "title": "Delivery",
    "description": "Payment and delivery are explained in two columns. Below them is a map of Ukraine with pins on the cities, and the four steps from order to receipt, drawn next to a forklift carrying a stack of tires.",
    "specs": [
      [
        "Steps",
        "Order, processing, delivery, receipt"
      ]
    ],
    "media": [
      {
        "src": "/projects/promshyna-case-study/delivery.jpg",
        "alt": "Delivery page: Payment and Delivery text columns, a dotted map of Ukraine with orange pins, four numbered steps and an orange forklift carrying tires, and the footer",
        "width": 1100,
        "height": 1367,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      }
    ],
    "sticky": true
  }
] as const;

export const promshynaPhones = [
  {
    "src": "/projects/promshyna-case-study/phone-product.mp4",
    "alt": "Phone with a product card for Pewag Austro 61 SV tire chains, price and cart button, as the cards change",
    "width": 276,
    "height": 526,
    "kind": "video",
    "presentation": "floating",
    "radius": "medium",
    "poster": "/projects/promshyna-case-study/phone-product.jpg"
  },
  {
    "src": "/projects/promshyna-case-study/phone-slider.jpg",
    "alt": "Phone with the home page: the menu button, logo, search and cart, and the category cards running past the right edge of the screen, with an All categories button",
    "width": 630,
    "height": 560,
    "kind": "image",
    "presentation": "floating",
    "radius": "medium"
  },
  {
    "src": "/projects/promshyna-case-study/phone-filter.jpg",
    "alt": "Phone with the home page top: Special Tire Hypermarket and the filter fields in one column",
    "width": 290,
    "height": 550,
    "kind": "image",
    "presentation": "floating",
    "radius": "medium"
  }
] as const;

export const promshynaPhoneCopy = "On phones the menu turns into a button next to the logo, and search and the cart share one line under it. The filter fields stack in one column, the category cards scroll sideways, and product cards show one at a time." as const;

export const promshynaOtherPages = [
  {
    "title": "Blog",
    "description": "Store news and advice on choosing tires. Each post has a photo, a topic, a date and a short excerpt.",
    "media": {
      "src": "/projects/promshyna-case-study/blog.jpg",
      "alt": "Blog page: four posts, each with a title, topic, date, excerpt and a photo on the right",
      "width": 1100,
      "height": 1358,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  },
  {
    "title": "Contacts",
    "description": "Two sales managers with photos and their phone, email and Skype, then the office address, opening hours and a contact form.",
    "media": {
      "src": "/projects/promshyna-case-study/contacts.jpg",
      "alt": "Contacts page: two sales managers with photos, phone, email and Skype, the office address and hours, and a contact form",
      "width": 1100,
      "height": 1130,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  },
  {
    "title": "Page not found",
    "description": "The 0 in 404 is a tire, inside a striped frame with a traffic cone at the corner.",
    "media": {
      "src": "/projects/promshyna-case-study/404.jpg",
      "alt": "Page not found: 404 with a tire as the zero, inside an orange and black striped frame with a traffic cone",
      "width": 1100,
      "height": 893,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  }
] as const;

export const promshynaBranding = [
  {
    "title": "Old logo",
    "description": "PromShyna in a rounded typeface, with Shyna in orange and a tire behind the last letters.",
    "src": "/projects/promshyna-case-study/logo-before.png",
    "alt": "Old logo: PromShyna in a rounded typeface, Shyna in orange, with a dark tire behind the last letters",
    "width": 176,
    "height": 63
  },
  {
    "title": "New logo",
    "description": "Simpler and more geometric: PROM and SHYNA in wide capitals with a tire between the two words. It sits in the middle of the header and in the footer.",
    "src": "/projects/promshyna-case-study/logo-after.png",
    "alt": "New logo: PROM in black and SHYNA in orange, in wide capitals, with a tire between the two words",
    "width": 184,
    "height": 45
  },
  {
    "title": "The tire on the site",
    "description": "A tire like the one in the logo stands in for the 0 on the 404 page.",
    "src": "/projects/promshyna-case-study/404-sign.png",
    "alt": "404 in dark bold digits with a tire as the zero",
    "width": 283,
    "height": 112
  }
] as const;

export const promshynaBrandCopy = "Along with the new site, the store got a new logo. Its orange, its dark grey and its tire carried over into the store pages." as const;

export const promshynaPalette = [
  {
    "label": "Orange",
    "value": "#FF973B",
    "description": "Prices, buttons and the active menu item"
  },
  {
    "label": "Dark grey",
    "value": "#222222",
    "description": "Footer and cart buttons"
  },
  {
    "label": "Light grey",
    "value": "#F5F5F5",
    "description": "Page background"
  },
  {
    "label": "White",
    "value": "#FFFFFF",
    "description": "Header and product cards"
  }
] as const;

export const promshynaHero = {
  "src": "/projects/promshyna-case-study/hero.jpg",
  "alt": "An orange wheel loader in front of a large light grey PromShyna logo",
  "width": 1400,
  "height": 563,
  "kind": "image",
  "presentation": "floating",
  "radius": "medium"
} as const;


// Original copy and media from the user-supplied Gutsul Made artifact.
export const gutsulDescription = "An online gift shop for Hutsul souvenirs from the Carpathians: embroidered shirts, painted wooden boxes and boards, amulet dolls, ceramics and Carpathian tea." as const;

export const gutsulTags = [
  "Branding",
  "E-commerce",
  "UI/UX",
  "Icons",
  "Responsive design"
] as const;

export const gutsulRole = [
  "Branding and logo",
  "Web design",
  "Responsive design",
  "Icon set"
] as const;

export const gutsulHero = {
  "src": "/projects/gutsul-made-case-study/hero-devices.png",
  "alt": "The Gutsul Made main page on a laptop and a phone: a dark photo of a beaded necklace, the store's headline and a shopping button, with the first recommended products below",
  "width": 1902,
  "height": 1100,
  "canvasColor": "var(--color-white)",
  "canvasInset": 8,
  "kind": "image",
  "presentation": "floating",
  "radius": "medium"
} as const;

export const gutsulBranding = {
  "title": "Logo",
  "description": "Gutsul Made sells traditional Ukrainian goods, so its logo comes from a traditional ornament, the rhombus with hooks. It is one of the oldest motifs in Ukrainian embroidery. Stitched on shirts and rushnyky, it stands for a sown field and a wish for a good harvest.",
  "steps": [
    {
      "title": "Shirt",
      "description": "A traditional Ukrainian vyshyvanka, a linen shirt embroidered by hand, with rows of red rhombuses on the sleeves and hem.",
      "media": {
        "src": "/projects/gutsul-made-case-study/shirt.jpg",
        "alt": "Women's linen shirt with rows of red embroidered rhombuses on both sleeves and along the hem",
        "width": 801,
        "height": 1200,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      },
      "paper": false
    },
    {
      "title": "Rhombus",
      "description": "One rhombus picked from the sleeve. It has a small dotted rhombus on top, a dotted centre and hooks curling out on both sides.",
      "media": {
        "src": "/projects/gutsul-made-case-study/motif.jpg",
        "alt": "Close-up of one embroidered rhombus with a small dotted rhombus on top, a dotted centre and hooks on both sides",
        "width": 370,
        "height": 370,
        "kind": "image",
        "presentation": "floating",
        "radius": "medium"
      },
      "paper": false
    },
    {
      "title": "Sketch",
      "description": "The first idea, drawn by hand on paper. The rhombus, its dots and the hooks were sketched as simple outlines to see which parts carry the motif and which can go.",
      "media": {
        "src": "/projects/gutsul-made-case-study/logo-sketch.svg",
        "alt": "Pencil sketch of the rhombus with dots and hooks",
        "width": 290.0,
        "height": 290.0,
        "kind": "vector"
      },
      "paper": true
    },
    {
      "title": "On the grid",
      "description": "The motif redrawn stroke by stroke on a square grid turned 45°, in one colour.",
      "media": {
        "src": "/projects/gutsul-made-case-study/logo-grid.svg",
        "alt": "The motif redrawn on the grid",
        "width": 290.0,
        "height": 290.0,
        "kind": "vector"
      },
      "paper": false
    },
    {
      "title": "Frame",
      "description": "One line closes around the motif and becomes its frame.",
      "media": {
        "src": "/projects/gutsul-made-case-study/logo-frame.svg",
        "alt": "The motif closed in a frame",
        "width": 290.0,
        "height": 290.0,
        "kind": "vector"
      },
      "paper": false
    },
    {
      "title": "Final logo",
      "description": "The final version, approved by the client. Two of these motifs, one turned upside down, joined into one mark.",
      "media": {
        "src": "/projects/gutsul-made-case-study/logo-final.svg",
        "alt": "The finished mark",
        "width": 435.0,
        "height": 793.62,
        "kind": "vector"
      },
      "paper": false
    }
  ]
} as const;

export const gutsulMain = {
  "title": "Main page",
  "description": "The page opens on a dark photo of a beaded necklace with the store's headline, which asks visitors to make a gift for themselves and their loved ones, and a button to start shopping. Products come right after it, then the reasons to buy here, the latest news and the footer.",
  "facts": [
    {
      "label": "Header.",
      "text": "Phone and social links, the logo in the middle, sign in, search, wish list and cart with item counts."
    },
    {
      "label": "Recommended products.",
      "text": "Eight cards with New and Sale ribbons and the old price crossed out."
    },
    {
      "label": "Counters.",
      "text": "Handmade goods, delivery to every region of Ukraine, and offers and goods to order. Each number fills its diamond frame."
    }
  ],
  "media": [
    {
      "src": "/projects/gutsul-made-case-study/main-top.jpg",
      "alt": "Main page top: header with the red logo, a dark hero with the headline and a shopping button, and eight recommended products with prices",
      "width": 606,
      "height": 598,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    },
    {
      "src": "/projects/gutsul-made-case-study/main-counters.mp4",
      "alt": "Three counters over a photo of a poppy field at sunset; the red line around each diamond grows to 100, 95 and 65 percent",
      "width": 606,
      "height": 176,
      "kind": "video",
      "presentation": "floating",
      "radius": "medium",
      "poster": "/projects/gutsul-made-case-study/main-counters.jpg"
    },
    {
      "src": "/projects/gutsul-made-case-study/main-rest.jpg",
      "alt": "Main page continued: three news posts with photos, a line about the store's products, and the footer with the menu, phone, social links and email",
      "width": 606,
      "height": 437,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  ]
} as const;

export const gutsulCatalog = {
  "title": "Categories and filter",
  "description": "Categories run down a sidebar on the left. The open category turns red and shows its filter. Products sit three to a row, with sorting by price and page numbers above and below the grid, and a short text about the category at the end.",
  "facts": [
    {
      "label": "Categories.",
      "text": "Souvenirs, frames, ceramics, Ukrainian symbols, amulets, religious items, magnets, Carpathian tea, wool and leather goods."
    },
    {
      "label": "Filter.",
      "text": "A price range with a slider and checkboxes for size and shape."
    },
    {
      "label": "Recently viewed.",
      "text": "The last products the buyer opened, under the sidebar."
    }
  ],
  "media": [
    {
      "src": "/projects/gutsul-made-case-study/catalog-top.jpg",
      "alt": "Frames category: the breadcrumb, sorting by price, page numbers, the sidebar with the open Frames filter and the first row of products",
      "width": 606,
      "height": 255,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    },
    {
      "src": "/projects/gutsul-made-case-study/catalog-mid.jpg",
      "alt": "",
      "width": 606,
      "height": 176,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    },
    {
      "src": "/projects/gutsul-made-case-study/catalog-rest.jpg",
      "alt": "Catalog continued: more rows of products, recently viewed products under the sidebar, page numbers, a text about frames and the footer",
      "width": 606,
      "height": 597,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  ]
} as const;

export const gutsulProduct = {
  "title": "Product card",
  "description": "The same card is used on the main page, in the catalog and under the product page. It has the photo, a New or Sale ribbon, the name and price, a round cart button for buying in one click, and icons for the wish list and quick view.",
  "cutouts": [
    {
      "src": "/projects/gutsul-made-case-study/card-3d.jpg",
      "alt": "Product card for the Pidkova oven mitt: a red New ribbon, the price of 95 hryvnias, a round cart button, Buy in one click, and wish list and quick view icons",
      "width": 235,
      "height": 580,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    },
    {
      "src": "/projects/gutsul-made-case-study/filter-3d.jpg",
      "alt": "Catalog sidebar with the Frames category open: a price range from 65 to 1090 hryvnias with a slider, and checkboxes for square, carved, round and triangle frames",
      "width": 280,
      "height": 520,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  ],
  "page": {
    "title": "Product page",
    "description": "The page keeps the catalog sidebar, so the buyer can move to another category without going back. Next to the photo and its thumbnails are the price, stock status, quantity, and the cart and wish list buttons. Tabs below hold the description, specifications and reviews, with a form for a new review. Products that other buyers also bought close the page.",
    "media": {
      "src": "/projects/gutsul-made-case-study/product.jpg",
      "alt": "Product page for the Pidkova oven mitt: sidebar on the left, a large photo with four thumbnails, price of 95 hryvnias, In stock, quantity, cart and wish list buttons, the Reviews tab with three reviews, and three related products",
      "width": 606,
      "height": 909,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  }
} as const;

export const gutsulOther = [
  {
    "title": "Cart",
    "description": "Each item is a row with its photo, name and size, a quantity stepper, the price, the sum and a delete icon. The total and the order button are at the bottom, next to a link back to shopping.",
    "media": {
      "src": "/projects/gutsul-made-case-study/cart.jpg",
      "alt": "Cart with three items, each with a photo, name, size, quantity stepper, price, sum and delete icon, a total of 3100 hryvnias and a red order button",
      "width": 606,
      "height": 545,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  },
  {
    "title": "News",
    "description": "New arrivals and store news in three columns. Each post has a photo, a date, a title and a few lines of text.",
    "media": {
      "src": "/projects/gutsul-made-case-study/news.jpg",
      "alt": "News page: posts in three columns, each with a photo, date, title and short text",
      "width": 606,
      "height": 794,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  },
  {
    "title": "Contacts",
    "description": "A map with a pin on the store, then a form with name, email, phone and message.",
    "media": {
      "src": "/projects/gutsul-made-case-study/contact.jpg",
      "alt": "Contacts page: a street map with a red pin and a form with name, email, phone and message fields and a red send button",
      "width": 606,
      "height": 545,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  }
] as const;

export const gutsulResponsive = {
  "title": "Phone layouts",
  "description": "On phones the menu opens from the left as a white panel with the logo, the page links and sign in. The counters drop their frames and stack in one column, and each cart item becomes a block with its size, quantity, price and sum.",
  "media": [
    {
      "src": "/projects/gutsul-made-case-study/phone-menu.mp4",
      "alt": "Phone main page with the store's headline and a red shopping button; the menu slides in from the left with the logo and page links",
      "width": 190,
      "height": 338,
      "kind": "video",
      "presentation": "floating",
      "radius": "medium",
      "poster": "/projects/gutsul-made-case-study/phone-menu.jpg"
    },
    {
      "src": "/projects/gutsul-made-case-study/phone-home.jpg",
      "alt": "Phone main page further down: the reasons to buy with three percentages over a photo, and the start of the latest news",
      "width": 191,
      "height": 340,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    },
    {
      "src": "/projects/gutsul-made-case-study/phone-cart.jpg",
      "alt": "Phone cart: each item as a block with name, size, quantity stepper, price, sum and delete icon",
      "width": 191,
      "height": 337,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    },
    {
      "src": "/projects/gutsul-made-case-study/phone-contact.jpg",
      "alt": "Phone contacts: a map with a red pin and the first fields of the contact form",
      "width": 191,
      "height": 337,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  ]
} as const;

export const gutsulGuide = {
  "title": "Icons, type and colours",
  "description": "The store uses one icon set, one typeface and three colours.",
  "icons": {
    "title": "Icons",
    "description": "Account, cart, quick view, wish list, orders, menu and search, plus the four dots from the shopping button. Each icon comes in red and in dark grey.",
    "media": {
      "src": "/projects/gutsul-made-case-study/icons.jpg",
      "alt": "Icon set in red and in dark grey: four dots in a diamond, account, cart, quick view, wish list, orders, menu, search",
      "width": 753,
      "height": 125,
      "kind": "image",
      "presentation": "floating",
      "radius": "medium"
    }
  },
  "type": {
    "title": "Type",
    "description": "Open Sans in two weights: Regular for text, Bold for product names, prices and buttons."
  },
  "colours": {
    "title": "Colours",
    "description": "Red for the logo, the active menu item, New ribbons and order buttons. Dark grey for text, Sale ribbons and the cart button. Grey for secondary text and old prices.",
    "values": [
      {
        "label": "Red",
        "value": "#EB3148"
      },
      {
        "label": "Dark grey",
        "value": "#333333"
      },
      {
        "label": "Grey",
        "value": "#A6A6A6"
      }
    ]
  }
} as const;

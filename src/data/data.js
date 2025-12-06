// src/data.js

// Example cooler locations shown on Coolers page
export const COOLERS = [
  {
    id: "cooler-1",
    name: "Clark & 7 Mile",
    address: "12345 W 7 Mile Rd, Detroit, MI 48235",
    hours: "Open 24 hours",
    tags: ["EBT", "SNAP", "Prepared meals"],
  },
  {
    id: "cooler-2",
    name: "Gratiot & 6 Mile",
    address: "2468 Gratiot Ave, Detroit, MI 48213",
    hours: "7am – 11pm",
    tags: ["SNAP", "Fresh produce"],
  },
  {
    id: "cooler-3",
    name: "Vernor & Junction",
    address: "3920 W Vernor Hwy, Detroit, MI 48209",
    hours: "8am – 10pm",
    tags: ["Healthy snacks", "Drinks"],
  },
];

// Menu sections and items used on Menu page
export const MENU = [
  {
    id: "meals",
    label: "Meals & Bowls",
    items: [
      {
        id: "chicken-bowl",
        name: "Grilled Chicken Power Bowl",
        description: "Brown rice, grilled chicken, veggies, light sauce.",
        price: 7.5,
        calories: 480,
        tags: ["High protein", "EBT-eligible"],
      },
      {
        id: "veggie-bowl",
        name: "Veggie Grain Bowl",
        description: "Quinoa, roasted veggies, chickpeas, tahini drizzle.",
        price: 7.0,
        calories: 420,
        tags: ["Vegetarian"],
      },
    ],
  },
  {
    id: "snacks",
    label: "Snacks",
    items: [
      {
        id: "trail-mix",
        name: "Low-Sugar Trail Mix",
        description: "Nuts, seeds, and dried fruit with no added sugar.",
        price: 2.5,
        calories: 190,
        tags: ["Grab & go"],
      },
      {
        id: "yogurt",
        name: "Greek Yogurt Cup",
        description: "Plain or vanilla, with side granola.",
        price: 2.75,
        calories: 160,
        tags: ["High protein"],
      },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    items: [
      {
        id: "infused-water",
        name: "Fruit-Infused Water",
        description: "Lightly flavored, no added sugar.",
        price: 1.75,
        calories: 0,
        tags: ["No sugar"],
      },
      {
        id: "sparkling",
        name: "Sparkling Water",
        description: "Zero sugar, assorted flavors.",
        price: 1.5,
        calories: 0,
        tags: ["No sugar"],
      },
    ],
  },
];

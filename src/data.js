// src/data.js

// Coolers configured for the app
export const COOLERS = [
  {
    id: "seven-mile-evergreen",
    name: "Seven Mile & Evergreen",
  },
  {
    id: "warren-conner",
    name: "Warren & Conner",
  },
];

// Menu items mapped to coolerId
export const MENU = [
  {
    id: "fresh-fruit-cup",
    coolerId: "seven-mile-evergreen",
    name: "Fresh Fruit Cup",
    price: 3.0,
    inStock: true,
  },
  {
    id: "yogurt-parfait",
    coolerId: "seven-mile-evergreen",
    name: "Yogurt Parfait",
    price: 4.0,
    inStock: true,
  },
  {
    id: "turkey-swiss-wrap",
    coolerId: "seven-mile-evergreen",
    name: "Turkey & Swiss Wrap",
    price: 8.0,
    inStock: true,
  },
  // You can add items for Warren & Conner later if you want
];

// src/data.js

// Example cooler locations for HaRC
export const COOLERS = [
  {
    id: "cooler_1",
    name: "HaRC Cooler – Family Health Center (East Warren)",
    address: "1234 E Warren Ave, Detroit, MI",
  },
  {
    id: "cooler_2",
    name: "HaRC Cooler – Corner Market (Jefferson)",
    address: "2200 E Jefferson Ave, Detroit, MI",
  },
  {
    id: "cooler_3",
    name: "HaRC Cooler – Community Library (Gratiot)",
    address: "8900 Gratiot Ave, Detroit, MI",
  },
];

// Menu items; each one is mapped to a coolerId above
export const MENU = [
  // Cooler 1 items
  {
    id: "item_1",
    coolerId: "cooler_1",
    name: "Turkey & Veggie Wrap",
    price: 5.5,
  },
  {
    id: "item_2",
    coolerId: "cooler_1",
    name: "Fresh Fruit Cup",
    price: 3.0,
  },
  {
    id: "item_3",
    coolerId: "cooler_1",
    name: "Low-Sugar Yogurt",
    price: 2.75,
  },

  // Cooler 2 items
  {
    id: "item_4",
    coolerId: "cooler_2",
    name: "Grilled Chicken Salad",
    price: 6.0,
  },
  {
    id: "item_5",
    coolerId: "cooler_2",
    name: "Veggie Snack Pack",
    price: 3.25,
  },

  // Cooler 3 items
  {
    id: "item_6",
    coolerId: "cooler_3",
    name: "Hummus & Whole Grain Pita",
    price: 4.5,
  },
  {
    id: "item_7",
    coolerId: "cooler_3",
    name: "Bottled Water",
    price: 1.5,
  },
];

// harc-app/src/data.js

// Brand accent color if needed in the future
export const ORANGE = "#f97316";

// Core cooler locations for HaRC demo.
// NOTE: You can update these addresses later to match final clinic/store info.
export const COOLERS = [
  {
    id: "popoff",
    shortName: "Popoff",
    name: "Popoff Family Health Center",
    // TODO: Confirm final address; placeholder Mack Ave clinic location.
    address: "Mack Ave, Detroit, MI 48214",
    distance: "0.8 miles",
    status: "Open • Stocked",
    tagline: "Clinic + HaRC hub",
  },
  {
    id: "newcenter",
    shortName: "New Center One",
    name: "New Center One – Authority Health",
    address: "W Grand Blvd, Detroit, MI 48202",
    distance: "2.1 miles",
    status: "Open • Stocked",
    tagline: "Downtown workers & families",
  },
  {
    id: "eastside",
    shortName: "Mack Eastside",
    name: "Mack Ave Corner Store – HaRC Cooler",
    address: "Mack Ave, Detroit, MI 48214",
    distance: "3.4 miles",
    status: "Open • Limited items",
    tagline: "Neighborhood corner store",
  },
];

// Demo menu items for each cooler.
// You can replace/expand these with real Byte menu exports later.
export const MENU = [
  // Popoff – clinic-style meals
  {
    id: "wrap-turkey",
    coolerId: "popoff",
    name: "Turkey & Veggie Wrap",
    price: 6.5,
    calories: 420,
    tag: "High protein",
  },
  {
    id: "salad-garden",
    coolerId: "popoff",
    name: "Garden Salad w/ Chickpeas",
    price: 5.75,
    calories: 310,
    tag: "Plant-based",
  },
  {
    id: "bowl-quinoa",
    coolerId: "popoff",
    name: "Quinoa & Roasted Veggie Bowl",
    price: 7.0,
    calories: 450,
    tag: "Fiber rich",
  },

  // New Center One – office building / workers
  {
    id: "bowl-brown-rice",
    coolerId: "newcenter",
    name: "Brown Rice & Chicken Bowl",
    price: 7.25,
    calories: 480,
    tag: "Balanced meal",
  },
  {
    id: "snack-fruit",
    coolerId: "newcenter",
    name: "Fresh Fruit Cup",
    price: 3.0,
    calories: 150,
    tag: "Grab & go",
  },
  {
    id: "snack-trailmix",
    coolerId: "newcenter",
    name: "Low-Sugar Trail Mix",
    price: 3.75,
    calories: 220,
    tag: "Energy snack",
  },

  // Mack Eastside – corner store
  {
    id: "snack-yogurt",
    coolerId: "eastside",
    name: "Low-Fat Yogurt Parfait",
    price: 4.25,
    calories: 260,
    tag: "Breakfast or snack",
  },
  {
    id: "drink-infused",
    coolerId: "eastside",
    name: "Infused Water (Citrus)",
    price: 2.0,
    calories: 0,
    tag: "No sugar",
  },
  {
    id: "sandwich-chicken",
    coolerId: "eastside",
    name: "Grilled Chicken Sandwich",
    price: 5.95,
    calories: 430,
    tag: "Better choice",
  },
];

// src/data.js

/**
 * Brand color tokens
 * Keep these stable — used across Cart, Manager, UI cards
 */
export const ORANGE = {
  bg: "#FFF7ED",        // page background
  card: "#FFFFFF",     // card surface
  border: "#FED7AA",   // light orange border
  accent: "#F97316",   // primary orange
  accentDark: "#EA580C",
  success: "#16A34A",  // green (Place Order)
  text: "#1F2937",     // dark gray
  muted: "#6B7280",    // secondary text
};

/**
 * IMPORTANT:
 * - `cooler_id` is the canonical ID saved to Supabase
 * - Do NOT change cooler_id once orders exist
 */
export const COOLERS = [
  {
    id: 1,
    cooler_id: "popoff",
    name: "Popoff Health Center",
    address: "611 W Grand Blvd, Detroit, MI",
    notes: "Front entrance",
  },
  {
    id: 2,
    cooler_id: "hope",
    name: "Hope Family Health Center",
    address: "6071 W Outer Dr, Detroit, MI",
    notes: "Lobby cooler",
  },
  {
    id: 3,
    cooler_id: "partner_1",
    name: "Community Partner Site",
    address: "Detroit, MI",
    notes: "Ask staff for access",
  },
];

/**
 * Menu items
 * - `sku` must be unique
 * - `cooler_id` determines visibility per location
 */
export const MENU = [
  {
    sku: "veggie_wrap",
    name: "Veggie Wrap",
    price: 7.5,
    cooler_id: "popoff",
  },
  {
    sku: "chicken_caesar",
    name: "Chicken Caesar Salad",
    price: 9.25,
    cooler_id: "hope",
  },
  {
    sku: "fruit_cup",
    name: "Fresh Fruit Cup",
    price: 4.5,
    cooler_id: "partner_1",
  },
];

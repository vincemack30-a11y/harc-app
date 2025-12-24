// src/data.js
// Single source of truth for brand tokens + cooler locations + menu.
// Must export ORANGE because Cart.jsx imports it.

export const ORANGE = {
  // page background
  bg: "#FFF7ED",
  // cards/panels
  card: "#FFFFFF",
  // light border
  border: "#FED7AA",
  // primary orange (buttons/accents)
  accent: "#F97316",
  // dark text
  text: "#1F2937",
  // optional muted text
  muted: "#6B7280",
};

export const GREEN = {
  // green button/positive accent
  accent: "#16A34A",
  dark: "#166534",
};

/**
 * IMPORTANT:
 * - cooler_id is the stable ID you store in Supabase (orders.cooler_id, intake_requests.cooler_id)
 * - name/address can change later without breaking analytics
 */
export const COOLERS = [
  {
    id: 1,
    cooler_id: "popoff",
    name: "Popoff Health Center",
    address: "611 W Grand Blvd, Detroit, MI",
    notes: "Near front entrance",
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

// Menu items used by customer ordering UI
export const MENU = [
  {
    id: 1,
    sku: "chicken_caesar_salad",
    name: "Chicken Caesar Salad",
    price: 9.25,
    category: "Salads",
  },
  {
    id: 2,
    sku: "veggie_wrap",
    name: "Veggie Wrap",
    price: 7.5,
    category: "Wraps",
  },
  {
    id: 3,
    sku: "fruit_cup",
    name: "Fruit Cup",
    price: 4.5,
    category: "Snacks",
  },
  {
    id: 4,
    sku: "greek_yogurt",
    name: "Greek Yogurt",
    price: 3.75,
    category: "Snacks",
  },
  {
    id: 5,
    sku: "water",
    name: "Bottled Water",
    price: 1.5,
    category: "Drinks",
  },
];

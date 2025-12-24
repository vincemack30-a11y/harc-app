// src/data.js

/* -----------------------------
   Brand Colors
----------------------------- */
export const ORANGE = {
  bg: "#FFF7ED",
  card: "#FFFFFF",
  border: "#FED7AA",
  accent: "#F97316",
  text: "#1F2937",
};

export const GREEN = {
  accent: "#16A34A",
};

/* -----------------------------
   Survey
----------------------------- */
export const SURVEY_URL =
  "https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3";

/* -----------------------------
   Coolers
----------------------------- */
/**
 * IMPORTANT:
 * - cooler_id is the stable ID stored in orders/intake
 * - name/address can change without breaking analytics
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

/* -----------------------------
   Menu
----------------------------- */
export const MENU = [
  {
    sku: "veggie_wrap",
    name: "Veggie Wrap",
    price: 7.5,
  },
  {
    sku: "fruit_cup",
    name: "Fruit Cup",
    price: 4.0,
  },
];

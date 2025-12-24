// src/data.js

export const ORANGE = {
  bg: "#FFF7ED",
  card: "#FFFFFF",
  border: "#FED7AA",
  accent: "#F97316",
  accentDark: "#C2410C",
  text: "#1F2937",
  subtext: "#6B7280",
};

// External survey link (MPHI)
export const SURVEY_URL =
  "https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3";

/**
 * IMPORTANT:
 * - cooler_id is the stable ID saved into Supabase (orders.cooler_id, intake_requests.cooler_id)
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

// Example menu items.
// If you already have your real MENU, keep your structure — just ensure
// items that are cooler-specific use cooler_ids matching the COOLERS above.
export const MENU = [
  {
    id: "item_1",
    name: "Turkey Wrap",
    desc: "Lean protein + veggies",
    price: 7.5,
    cooler_ids: ["popoff", "hope", "partner_1"],
  },
  {
    id: "item_2",
    name: "Fruit Cup",
    desc: "Seasonal mixed fruit",
    price: 4.0,
    cooler_ids: ["popoff", "hope", "partner_1"],
  },
  {
    id: "item_3",
    name: "Greek Yogurt",
    desc: "High protein snack",
    price: 3.5,
    cooler_ids: ["popoff", "hope"],
  },
];

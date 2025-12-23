export const BRAND = {
  orangeBg: "#FFF7ED",
  orangeCard: "#FFFFFF",
  orangeBorder: "#FED7AA",
  orangeAccent: "#F97316",
  orangeDeep: "#C2410C",
  text: "#111827",
  muted: "#6B7280",
  green: "#16A34A",
  greenDeep: "#166534",
};

export const SURVEY_URL =
  "https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3";

/**
 * IMPORTANT:
 * - cooler_id is the stable ID saved into Supabase (orders.cooler_id, help_requests.cooler_id)
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

export const MENU = [
  {
    sku: "wrap_veg_01",
    name: "Veggie Wrap",
    price: 7.5,
    tags: ["Fresh", "Grab-and-go"],
  },
  {
    sku: "salad_caesar_01",
    name: "Chicken Caesar Salad",
    price: 9.25,
    tags: ["Protein", "Classic"],
  },
  {
    sku: "fruit_cup_01",
    name: "Fruit Cup",
    price: 4.0,
    tags: ["Snack", "Healthy"],
  },
  {
    sku: "yogurt_01",
    name: "Greek Yogurt",
    price: 3.5,
    tags: ["Protein", "Breakfast"],
  },
  {
    sku: "water_01",
    name: "Water",
    price: 1.5,
    tags: ["Hydration"],
  },
];

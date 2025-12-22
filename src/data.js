// src/data.js

/**
 * IMPORTANT:
 * - cooler_id is the stable ID saved into Supabase (orders.cooler_id, intake_requests.cooler_id, help_requests.cooler_id)
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

/**
 * MENU can be:
 *  A) Flat array (same menu for all coolers), OR
 *  B) Object keyed by cooler_id (different menu per cooler)
 *
 * App.jsx supports BOTH.
 */

// A) Flat array example:
export const MENU = [
  { id: "item_1", name: "Turkey Wrap", desc: "Lean protein + veggies", price: 7.5 },
  { id: "item_2", name: "Chicken Salad", desc: "Light + filling", price: 6.75 },
  { id: "item_3", name: "Fruit Cup", desc: "Fresh seasonal mix", price: 3.5 },
  { id: "item_4", name: "Granola Bar", desc: "Quick energy", price: 2.25 },
  { id: "item_5", name: "Water", desc: "16.9 oz", price: 1.0 },
];

/**
 * If you want B) keyed menu, replace MENU above with:
 *
 * export const MENU = {
 *   popoff: [ ... ],
 *   hope: [ ... ],
 *   partner_1: [ ... ],
 *   default: [ ... ],
 * };
 */

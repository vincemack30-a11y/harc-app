// src/lib/ordersApi.js
import { supabase } from "../supabaseClient";

/**
 * Insert an order into Supabase.
 * We keep payload flexible so we can map to your exact column names once confirmed.
 */
export async function createOrder(payload) {
  const { data, error } = await supabase.from("orders").insert([payload]).select().single();
  if (error) throw error;
  return data;
}

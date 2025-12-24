// src/lib/ordersApi.js
// Customer ordering API: localhost uses localStorage; Vercel uses /api/orders

const ORDERS_KEY = "harcOrderLog";

function isLocalhost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/* -------------------- ORDERS -------------------- */

// GET /orders
export async function listOrders() {
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      const orders = raw ? JSON.parse(raw) : [];
      return { ok: true, data: orders };
    } catch (error) {
      return { ok: false, error: "Could not load orders (local)" };
    }
  }

  try {
    const res = await fetch("/api/orders");
    const json = await res.json();
    return json;
  } catch (error) {
    return { ok: false, error: "Could not load orders" };
  }
}

// POST /orders
export async function createOrder(payload) {
  // payload: { cooler_id, cooler_name, total, items, note, source }
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      const orders = raw ? JSON.parse(raw) : [];

      const row = {
        id: `local_${Date.now()}`,
        created_at: new Date().toISOString(),
        ...payload,
      };

      orders.unshift(row);
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return { ok: true, data: row };
    } catch (error) {
      return { ok: false, error: "Could not create order (local)" };
    }
  }

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    return json;
  } catch (error) {
    return { ok: false, error: "Could not create order" };
  }
}

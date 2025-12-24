// src/lib/ordersApi.js
// IMPORTANT: Customer-side ordering must NEVER call Supabase directly.
// Customer ordering must ONLY call Vercel serverless routes: /api/orders

function isLocalhost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

const ORDERS_KEY = "harcOrderLog";

export async function listOrders() {
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      const orders = raw ? JSON.parse(raw) : [];
      return { ok: true, data: orders };
    } catch {
      return { ok: false, error: "Could not load orders (local)" };
    }
  }

  try {
    const res = await fetch("/api/orders", { method: "GET" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error || "Order list failed" };
    return json?.ok ? json : { ok: true, data: json?.data ?? json ?? [] };
  } catch {
    return { ok: false, error: "Could not load orders (server)" };
  }
}

export async function createOrder(payload) {
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      const orders = raw ? JSON.parse(raw) : [];

      const order = {
        id: `local_${Date.now()}`,
        created_at: new Date().toISOString(),
        ...payload,
      };

      const next = [order, ...orders];
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
      return { ok: true, data: order };
    } catch {
      return { ok: false, error: "Could not create order (local)" };
    }
  }

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error || "Order create failed" };
    return json?.ok ? json : { ok: true, data: json?.data ?? json };
  } catch {
    return { ok: false, error: "Could not create order (server)" };
  }
}

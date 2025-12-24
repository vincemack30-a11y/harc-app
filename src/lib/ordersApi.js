// src/lib/ordersApi.js
// IMPORTANT:
// This file must NEVER call Supabase directly from the browser.
// It must ONLY call our Vercel serverless routes: /api/orders and /api/intake
// Localhost can fall back to localStorage for dev.

const ORDERS_KEY = "harcOrderLog";
const INTAKE_KEY = "harcIntakeRequests";

function isLocalhost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

function ok(data) {
  return { ok: true, data };
}

function fail(error) {
  return { ok: false, error };
}

/* -------------------- ORDERS -------------------- */

// GET /api/orders
export async function listOrders() {
  // Local dev: read from localStorage
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      const orders = raw ? JSON.parse(raw) : [];
      return ok(Array.isArray(orders) ? orders : []);
    } catch (error) {
      return fail("Could not load orders (local)");
    }
  }

  // Production: call serverless route
  try {
    const res = await fetch("/api/orders");
    const json = await safeJson(res);

    if (!res.ok) {
      return fail((json && json.error) || "Could not load orders");
    }

    // Expect { ok: true, data: [...] } but tolerate plain arrays
    if (json && typeof json === "object" && "ok" in json) return json;
    return ok(Array.isArray(json) ? json : []);
  } catch (error) {
    return fail("Could not load orders");
  }
}

// POST /api/orders
export async function createOrder(payload) {
  // Local dev: append to localStorage
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const order = {
        id: payload?.id || `local_${Date.now()}`,
        created_at: new Date().toISOString(),
        ...payload,
      };
      const next = [order, ...(Array.isArray(existing) ? existing : [])];
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
      return ok(order);
    } catch (error) {
      return fail("Could not save order (local)");
    }
  }

  // Production: call serverless route
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await safeJson(res);

    if (!res.ok) {
      return fail((json && json.error) || "Failed to create order");
    }
    if (json && typeof json === "object" && "ok" in json) return json;
    return ok(json);
  } catch (error) {
    return fail("Network error creating order");
  }
}

// GET /api/orders?order_id=...
export async function getOrder(orderId) {
  if (!orderId) return fail("Missing order_id");

  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(existing) ? existing : [];
      const found = list.find((o) => String(o?.id) === String(orderId));
      if (!found) return fail("Order not found (local)");
      return ok(found);
    } catch (error) {
      return fail("Could not load order (local)");
    }
  }

  try {
    const res = await fetch(`/api/orders?order_id=${encodeURIComponent(orderId)}`);
    const json = await safeJson(res);

    if (!res.ok) {
      return fail((json && json.error) || "Failed to load order");
    }
    if (json && typeof json === "object" && "ok" in json) return json;
    return ok(json);
  } catch (error) {
    return fail("Network error loading order");
  }
}

/* -------------------- INTAKE -------------------- */

// GET /api/intake
export async function listIntakeRequests() {
  // Local dev: read from localStorage
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(INTAKE_KEY);
      const reqs = raw ? JSON.parse(raw) : [];
      return ok(Array.isArray(reqs) ? reqs : []);
    } catch (error) {
      return fail("Could not load intake requests (local)");
    }
  }

  // Production: call serverless route
  try {
    const res = await fetch("/api/intake");
    const json = await safeJson(res);

    if (!res.ok) {
      return fail((json && json.error) || "Could not load intake requests");
    }

    if (json && typeof json === "object" && "ok" in json) return json;
    return ok(Array.isArray(json) ? json : []);
  } catch (error) {
    return fail("Could not load intake requests");
  }
}

// POST /api/intake
export async function createIntakeRequest(payload) {
  // Local dev: append to localStorage
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(INTAKE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const req = {
        id: payload?.id || `local_intake_${Date.now()}`,
        created_at: new Date().toISOString(),
        ...payload,
      };
      const next = [req, ...(Array.isArray(existing) ? existing : [])];
      window.localStorage.setItem(INTAKE_KEY, JSON.stringify(next));
      return ok(req);
    } catch (error) {
      return fail("Could not save intake request (local)");
    }
  }

  // Production: call serverless route
  try {
    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await safeJson(res);

    if (!res.ok) {
      return fail((json && json.error) || "Failed to create intake request");
    }
    if (json && typeof json === "object" && "ok" in json) return json;
    return ok(json);
  } catch (error) {
    return fail("Network error creating intake request");
  }
}

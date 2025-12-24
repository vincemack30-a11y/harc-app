// src/api.js
// API layer: uses localStorage on localhost, Vercel serverless endpoints in production.

import { COOLERS, MENU } from "./data";

const ORDERS_KEY = "harcOrderLog";
const INTAKE_KEY = "harcIntakeRequests";

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

// POST /orders
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

/* -------------------- INTAKE -------------------- */

// GET /intake
export async function listIntakeRequests() {
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(INTAKE_KEY);
      const rows = raw ? JSON.parse(raw) : [];
      return { ok: true, data: rows };
    } catch {
      return { ok: false, error: "Could not load intake (local)" };
    }
  }

  try {
    const res = await fetch("/api/intake", { method: "GET" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error || "Intake list failed" };
    return json?.ok ? json : { ok: true, data: json?.data ?? json ?? [] };
  } catch {
    return { ok: false, error: "Could not load intake (server)" };
  }
}

// POST /intake
export async function createIntakeRequest(payload) {
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(INTAKE_KEY);
      const rows = raw ? JSON.parse(raw) : [];

      const row = {
        id: `local_${Date.now()}`,
        created_at: new Date().toISOString(),
        ...payload,
      };

      const next = [row, ...rows];
      window.localStorage.setItem(INTAKE_KEY, JSON.stringify(next));

      return { ok: true, data: row };
    } catch {
      return { ok: false, error: "Could not create intake (local)" };
    }
  }

  try {
    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error || "Intake create failed" };
    return json?.ok ? json : { ok: true, data: json?.data ?? json };
  } catch {
    return { ok: false, error: "Could not create intake (server)" };
  }
}

/* -------------------- DATA HELPERS (optional) -------------------- */

export function getCoolers() {
  return COOLERS;
}

export function getMenu() {
  return MENU;
}

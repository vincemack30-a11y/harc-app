// src/api.js
// API layer: uses localStorage on localhost, real backend on Vercel.

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
    } catch (error) {
      return { ok: false, error: "Could not load orders (local)" };
    }
  }

  try {
    const res = await fetch("/api/orders");
    const json = await res.json();
    return json;
  } catch (error) {
    return { ok: false, error: "Could not load orders (api)" };
  }
}

// POST /orders
export async function createOrder(orderInput) {
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      const existing = raw ? JSON.parse(raw) : [];

      const order = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...orderInput,
      };

      const updated = [order, ...existing];
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
      return { ok: true, data: order };
    } catch (error) {
      return { ok: false, error: "Could not save order (local)" };
    }
  }

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderInput),
    });
    return await res.json();
  } catch (error) {
    return { ok: false, error: "Could not save order (api)" };
  }
}

// DELETE /orders
export async function clearOrders() {
  if (isLocalhost()) {
    try {
      window.localStorage.removeItem(ORDERS_KEY);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: "Could not clear orders (local)" };
    }
  }

  try {
    await fetch("/api/orders", { method: "DELETE" });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Could not clear orders (api)" };
  }
}

/* -------------------- INTAKE REQUESTS -------------------- */

// POST /intake
export async function createIntakeRequest(intakeInput) {
  if (isLocalhost()) {
    try {
      const raw = window.localStorage.getItem(INTAKE_KEY);
      const existing = raw ? JSON.parse(raw) : [];

      const entry = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...intakeInput,
      };

      const updated = [entry, ...existing];
      window.localStorage.setItem(INTAKE_KEY, JSON.stringify(updated));
      return { ok: true, data: entry };
    } catch (error) {
      return { ok: false, error: "Could not save intake (local)" };
    }
  }

  try {
    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intakeInput),
    });
    return await res.json();
  } catch (error) {
    return { ok: false, error: "Could not save intake (api)" };
  }
}

/* -------------------- COOLERS + MENU -------------------- */

export async function listCoolers() {
  return { ok: true, data: COOLERS };
}

export async function listMenu() {
  return { ok: true, data: MENU };
}

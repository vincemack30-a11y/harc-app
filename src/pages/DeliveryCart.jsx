// src/pages/DeliveryCart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { COOLERS, MENU } from "../data.js";
import { useApp } from "../AppContext.jsx";
import { getActiveCoolerId, setActiveCoolerId } from "../lib/activeCooler.js";

function money(n) {
  const v = Number(n || 0);
  return `$${v.toFixed(2)}`;
}

export default function DeliveryCart() {
  const navigate = useNavigate();
  const location = useLocation();

  // App state (cart, etc.)
  const { cart, setCart } = useApp();

  const [note, setNote] = useState("");

  // Read cooler from URL first, then fallback to storage
  const queryCoolerId = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("cooler_id") || "";
  }, [location.search]);

  const activeCoolerId = useMemo(() => {
    return queryCoolerId || getActiveCoolerId() || "";
  }, [queryCoolerId]);

  // IMPORTANT: Only set cooler if it actually changed (prevents infinite loops)
  useEffect(() => {
    if (!queryCoolerId) return;
    const current = getActiveCoolerId();
    if (current !== queryCoolerId) {
      setActiveCoolerId(queryCoolerId);
    }
  }, [queryCoolerId]);

  const cooler = useMemo(() => {
    if (!activeCoolerId) return null;
    return COOLERS.find((c) => c.cooler_id === activeCoolerId) || null;
  }, [activeCoolerId]);

  // Build a lookup for menu items by id
  const menuById = useMemo(() => {
    const map = new Map();
    for (const item of MENU) map.set(item.id, item);
    return map;
  }, []);

  // cart shape support:
  // - either { [itemId]: qty }
  // - or array [{ id, qty }]
  const normalizedCart = useMemo(() => {
    if (!cart) return {};
    if (Array.isArray(cart)) {
      const obj = {};
      for (const row of cart) {
        if (!row) continue;
        const id = row.id ?? row.itemId ?? row.item_id;
        const qty = Number(row.qty ?? row.quantity ?? 0);
        if (id && qty > 0) obj[id] = (obj[id] || 0) + qty;
      }
      return obj;
    }
    if (typeof cart === "object") return cart;
    return {};
  }, [cart]);

  const lineItems = useMemo(() => {
    const rows = [];
    for (const [id, qtyRaw] of Object.entries(normalizedCart)) {
      const qty = Number(qtyRaw || 0);
      if (qty <= 0) continue;
      const item = menuById.get(id);
      if (!item) continue;
      rows.push({
        id,
        name: item.name,
        price: Number(item.price || 0),
        qty,
        subtotal: Number(item.price || 0) * qty,
      });
    }
    return rows;
  }, [normalizedCart, menuById]);

  const total = useMemo(() => {
    return lineItems.reduce((sum, r) => sum + r.subtotal, 0);
  }, [lineItems]);

  const withCooler = (path) => {
    if (!activeCoolerId) return path;
    return `${path}?cooler_id=${encodeURIComponent(activeCoolerId)}`;
  };

  const setQty = (itemId, nextQty) => {
    const qty = Math.max(0, Number(nextQty || 0));

    // preserve original cart type if possible
    if (Array.isArray(cart)) {
      const next = [];
      const existing = new Map();
      for (const row of cart) {
        const id = row?.id ?? row?.itemId ?? row?.item_id;
        const q = Number(row?.qty ?? row?.quantity ?? 0);
        if (id) existing.set(id, q);
      }
      if (qty > 0) existing.set(itemId, qty);
      else existing.delete(itemId);

      for (const [id, q] of existing.entries()) {
        next.push({ id, qty: q });
      }
      setCart(next);
      return;
    }

    // object cart
    const next = { ...(normalizedCart || {}) };
    if (qty > 0) next[itemId] = qty;
    else delete next[itemId];
    setCart(next);
  };

  const clearCart = () => {
    setCart(Array.isArray(cart) ? [] : {});
  };

  const placeOrder = () => {
    // This is a UI-only cart screen. Your actual order submit logic
    // is likely inside another page / API call. For now, route to confirm.
    navigate(withCooler("/confirm"));
  };

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Cart</h1>
          <p className="text-sm text-slate-600">
            Cooler:{" "}
            {cooler ? (
              <span className="font-semibold">{cooler.name}</span>
            ) : (
              <span className="font-semibold">Not selected</span>
            )}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to={withCooler("/coolers")}
            className="px-3 py-2 rounded-lg border border-orange-300 bg-white hover:bg-orange-50 text-sm"
          >
            Change cooler
          </Link>
          <Link
            to={withCooler("/menu")}
            className="px-3 py-2 rounded-lg border border-orange-300 bg-white hover:bg-orange-50 text-sm"
          >
            Back to menu
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Items */}
        <div className="lg:col-span-2 rounded-2xl border border-orange-200 bg-white p-4">
          {lineItems.length === 0 ? (
            <p className="text-sm text-slate-600">Your cart is empty.</p>
          ) : (
            <div className="space-y-3">
              {lineItems.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight">{r.name}</p>
                    <p className="text-xs text-slate-600">
                      {money(r.price)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(r.id, r.qty - 1)}
                      className="h-9 w-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                    >
                      –
                    </button>
                    <div className="w-10 text-center font-semibold">{r.qty}</div>
                    <button
                      type="button"
                      onClick={() => setQty(r.id, r.qty + 1)}
                      className="h-9 w-9 rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="w-20 text-right font-semibold">
                    {money(r.subtotal)}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-sm text-slate-600 hover:text-slate-900 underline"
                >
                  Clear cart
                </button>
                <div className="text-right">
                  <p className="text-xs text-slate-600">Total</p>
                  <p className="text-lg font-extrabold">{money(total)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Checkout */}
        <div className="rounded-2xl border border-orange-200 bg-white p-4">
          <p className="text-sm font-semibold">Order note (optional)</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Optional note"
            className="mt-2 w-full rounded-xl border border-slate-200 p-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
          />

          {!cooler && (
            <p className="mt-3 text-sm font-semibold text-red-600">
              Please select a cooler first.
            </p>
          )}

          <button
            type="button"
            onClick={placeOrder}
            disabled={!cooler || lineItems.length === 0}
            className={`mt-3 w-full rounded-xl py-3 text-sm font-bold border transition ${
              !cooler || lineItems.length === 0
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
            }`}
          >
            Place Order
          </button>

          <p className="mt-2 text-[11px] text-slate-500">
            If no cooler is selected, the app will block checkout.
          </p>
        </div>
      </div>
    </div>
  );
}

// src/ManagerOrders.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { COOLERS } from "./data";

export default function ManagerOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Order load error:", error);
      return;
    }

    setOrders(data || []);
  }

  // Helper: convert cooler_id → readable name
  function getCoolerName(id) {
    if (!id) return "—";
    const match = COOLERS.find((c) => c.id === id);
    return match ? match.name : id;
  }

  // Helper: format items cleanly
  function renderItems(items) {
    if (!items) return "—";

    try {
      const parsed = Array.isArray(items) ? items : JSON.parse(items);
      return parsed
        .map((item) => `${item.name} (x${item.qty})`)
        .join(", ");
    } catch {
      return items; // fallback
    }
  }

  // Search filter
  const filtered = orders.filter((order) => {
    const cooler = getCoolerName(order.cooler_id).toLowerCase();
    const itemText = renderItems(order.items).toLowerCase();
    const s = search.toLowerCase();
    return cooler.includes(s) || itemText.includes(s);
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">Orders Detail</h2>

      <div className="mb-3 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search items or cooler..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={loadOrders}
          className="bg-orange-500 text-white px-3 py-1 rounded"
        >
          Refresh All Data
        </button>
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-slate-100">
          <tr>
            <th className="border px-2 py-1">Time</th>
            <th className="border px-2 py-1">Cooler</th>
            <th className="border px-2 py-1">Items</th>
            <th className="border px-2 py-1">Total</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="border px-2 py-1">{order.created_at}</td>
              <td className="border px-2 py-1">
                {getCoolerName(order.cooler_id)}
              </td>
              <td className="border px-2 py-1">{renderItems(order.items)}</td>
              <td className="border px-2 py-1">
                ${Number(order.total || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

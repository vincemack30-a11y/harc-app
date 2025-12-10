// src/ManagerRestock.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

function formatDate(value) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

// Simple buckets based on how many items moved in the window
function getPriorityLabel(totalItems) {
  if (totalItems >= 40) return "High";
  if (totalItems >= 20) return "Medium";
  if (totalItems > 0) return "Low";
  return "None";
}

export default function ManagerRestock() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // We’ll look at the last 7 days of orders for restock signals
  const DAYS_WINDOW = 7;

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Unknown Supabase error");
    }

    setLoading(false);
  }

  // Only keep orders in the last N days
  function isInWindow(createdAt) {
    if (!createdAt) return false;
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return false;

    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - DAYS_WINDOW);
    return d >= cutoff && d <= now;
  }

  const recentOrders = orders.filter((o) => isInWindow(o.created_at));

  // Aggregate by cooler + item
  const coolerMap = {};

  for (const order of recentOrders) {
    const coolerId = order.cooler_id || "Unknown";
    if (!coolerMap[coolerId]) {
      coolerMap[coolerId] = {
        coolerId,
        totalItems: 0,
        ordersCount: 0,
        lastOrderAt: order.created_at || null,
        items: {}, // name -> qty
      };
    }

    const bucket = coolerMap[coolerId];
    bucket.ordersCount += 1;
    if (order.created_at && (!bucket.lastOrderAt || order.created_at > bucket.lastOrderAt)) {
      bucket.lastOrderAt = order.created_at;
    }

    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        const name = item.name || "Item";
        const qty = Number(item.qty || 0);
        if (!bucket.items[name]) bucket.items[name] = 0;
        bucket.items[name] += qty;
        bucket.totalItems += qty;
      }
    }
  }

  const coolerList = Object.values(coolerMap).sort(
    (a, b) => b.totalItems - a.totalItems
  );

  function downloadRestockCSV() {
    if (coolerList.length === 0) {
      alert(`No coolers have orders in the last ${DAYS_WINDOW} days.`);
      return;
    }

    const header = [
      "Cooler",
      "Priority",
      "Total Items (window)",
      "Orders Count",
      "Last Order At",
      "Top Items",
    ];

    const rows = coolerList.map((cooler) => {
      const priority = getPriorityLabel(cooler.totalItems);

      const topItems = Object.entries(cooler.items)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => `${name} (x${qty})`)
        .join(" | ");

      return [
        (cooler.coolerId || "").toString().replace(/,/g, " "),
        priority,
        cooler.totalItems,
        cooler.ordersCount,
        cooler.lastOrderAt ? formatDate(cooler.lastOrderAt).replace(/,/g, " ") : "",
        topItems.replace(/,/g, ";"),
      ].join(",");
    });

    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "harc_restock_plan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="p-4 text-slate-600 text-sm">
        Loading restock data…
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-4 text-red-600 text-sm font-semibold">
        Error loading restock data: {errorMsg}
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Restock & Service View</h2>
          <p className="text-xs text-slate-500">
            Based on orders from the last {DAYS_WINDOW} days
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadOrders}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 text-white shadow hover:bg-slate-800"
          >
            Refresh Data
          </button>

          <button
            type="button"
            onClick={downloadRestockCSV}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            Download Restock CSV
          </button>
        </div>
      </div>

      {coolerList.length === 0 ? (
        <p className="text-slate-500 text-sm">
          No recent orders in the last {DAYS_WINDOW} days.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coolerList.map((cooler) => {
            const priority = getPriorityLabel(cooler.totalItems);

            const topItems = Object.entries(cooler.items)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5);

            return (
              <div
                key={cooler.coolerId}
                className="bg-white border rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs uppercase text-slate-500">
                      Cooler
                    </p>
                    <p className="text-lg font-semibold">
                      {cooler.coolerId}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] uppercase text-slate-400">
                      Restock Priority
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        priority === "High"
                          ? "text-red-600"
                          : priority === "Medium"
                          ? "text-amber-600"
                          : priority === "Low"
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      {priority}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-2">
                  {cooler.totalItems} items sold in {cooler.ordersCount} orders
                  over the last {DAYS_WINDOW} days.
                  {cooler.lastOrderAt && (
                    <>
                      {" "}
                      Last order: {formatDate(cooler.lastOrderAt)}
                    </>
                  )}
                </p>

                <p className="text-xs font-semibold text-slate-600 mb-1">
                  Top Items (by quantity)
                </p>

                {topItems.length === 0 ? (
                  <p className="text-xs text-slate-500">No item detail.</p>
                ) : (
                  <ul className="text-xs text-slate-700 space-y-1">
                    {topItems.map(([name, qty]) => (
                      <li key={name} className="flex justify-between">
                        <span>{name}</span>
                        <span className="font-semibold">x{qty}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

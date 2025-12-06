// src/ManagerDashboard.jsx
import React, { useEffect, useState } from "react";
import supabase from "./supabaseClient.js";

// Format timestamp into something readable
function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

// Turn the JSON items array into "2× Fruit Cup, 1× Yogurt" text
function formatOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) return "—";
  return items.map((item) => `${item.qty}× ${item.name}`).join(", ");
}

function ManagerDashboard() {
  const [orders, setOrders] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadData({ isRefresh = false } = {}) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      // Get recent orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, created_at, cooler_id, items, total")
        .order("created_at", { ascending: false })
        .limit(30);

      if (ordersError) throw ordersError;

      // Get recent intake / help requests
      const { data: intakeData, error: intakeError } = await supabase
        .from("intake_requests")
        .select("id, created_at, cooler_id, phone, notes, needs_primary_care")
        .order("created_at", { ascending: false })
        .limit(30);

      if (intakeError) throw intakeError;

      setOrders(ordersData || []);
      setIntakes(intakeData || []);
    } catch (err) {
      console.error("Manager dashboard load error:", err);
      setError(
        "Could not load data from Supabase. Check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Simple stats
  const totalOrderCount = orders.length;
  const intakeCount = intakes.length;

  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) =>
    (o.created_at || "").startsWith(today)
  );
  const todayIntakes = intakes.filter((i) =>
    (i.created_at || "").startsWith(today)
  );

  return (
    <div className="manager-dashboard">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Manager dashboard</h2>
        <button
          type="button"
          onClick={() => loadData({ isRefresh: true })}
          disabled={refreshing || loading}
          className="border px-3 py-1 rounded bg-white hover:bg-gray-100 text-sm"
        >
          {refreshing || loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <p className="text-sm mb-4">
        Quick view of recent orders and help requests from the HaRC Healthy
        Coolers app.
      </p>

      {/* Summary cards */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
        <div className="border rounded p-3 bg-white/70">
          <div className="text-xs uppercase tracking-wide text-gray-600">
            Orders (last 30)
          </div>
          <div className="text-2xl font-semibold">{totalOrderCount}</div>
          <div className="text-xs text-gray-700">{todayOrders.length} today</div>
        </div>

        <div className="border rounded p-3 bg-white/70">
          <div className="text-xs uppercase tracking-wide text-gray-600">
            Help requests (last 30)
          </div>
          <div className="text-2xl font-semibold">{intakeCount}</div>
          <div className="text-xs text-gray-700">
            {todayIntakes.length} today
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 border border-red-400 bg-red-50 text-red-800 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {loading && !refreshing ? (
        <p>Loading manager data…</p>
      ) : (
        <>
          {/* Orders table */}
          <section className="mb-6">
            <h3 className="font-semibold mb-2">Recent orders</h3>
            {orders.length === 0 ? (
              <p className="text-sm text-gray-700">No orders yet.</p>
            ) : (
              <div className="overflow-auto border rounded bg-white/80">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-left">Time</th>
                      <th className="px-2 py-1 text-left">Cooler</th>
                      <th className="px-2 py-1 text-left">Items</th>
                      <th className="px-2 py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="px-2 py-1 whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {order.cooler_id || "—"}
                        </td>
                        <td className="px-2 py-1">
                          {formatOrderItems(order.items)}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {typeof order.total === "number"
                            ? `$${order.total.toFixed(2)}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Intake / help requests table */}
          <section>
            <h3 className="font-semibold mb-2">
              Recent help / coverage requests
            </h3>
            {intakes.length === 0 ? (
              <p className="text-sm text-gray-700">No help requests yet.</p>
            ) : (
              <div className="overflow-auto border rounded bg-white/80">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 text-left">Time</th>
                      <th className="px-2 py-1 text-left">Cooler</th>
                      <th className="px-2 py-1 text-left">Phone</th>
                      <th className="px-2 py-1 text-left">
                        Needs primary care?
                      </th>
                      <th className="px-2 py-1 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intakes.map((req) => (
                      <tr key={req.id} className="border-t align-top">
                        <td className="px-2 py-1 whitespace-nowrap">
                          {formatDate(req.created_at)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {req.cooler_id || "—"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {req.phone || "—"}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {req.needs_primary_care
                            ? "Yes"
                            : "No / not checked"}
                        </td>
                        <td className="px-2 py-1">{req.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default ManagerDashboard;

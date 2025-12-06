// src/ManagerOrders.jsx
import React, { useEffect, useState } from "react";
import supabase from "./supabaseClient";

function ManagerOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Could not load orders. Try again in a moment.");
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  async function updateStatus(orderId, newStatus) {
    try {
      setUpdatingId(orderId);
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error(error);
        setError("Failed to update status. Try again.");
      } else {
        // Re-fetch to keep things simple and always correct
        await fetchOrders();
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function getFilteredOrders() {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => (o.status || "pending") === statusFilter);
  }

  function formatItems(items) {
    if (!items) return "—";

    // If it's already an array of items
    if (Array.isArray(items)) {
      return items
        .map((item) => {
          const name = item.name || item.item_name || "Item";
          const qty = item.quantity || item.qty || 1;
          return `${name} x${qty}`;
        })
        .join(" • ");
    }

    // If it's stored as JSON text in the DB
    if (typeof items === "string") {
      try {
        const parsed = JSON.parse(items);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => {
              const name = item.name || item.item_name || "Item";
              const qty = item.quantity || item.qty || 1;
              return `${name} x${qty}`;
            })
            .join(" • ");
        }
        return items;
      } catch {
        return items;
      }
    }

    return String(items);
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              HaRC Cooler Orders
            </h1>
            <p className="text-sm text-slate-500">
              Live view of customer orders coming from the app.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
            <button
              onClick={fetchOrders}
              className="text-sm border rounded-lg px-3 py-1.5 hover:bg-slate-100 active:scale-[0.98] transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && (
          <div className="py-8 text-center text-slate-500">
            Loading orders…
          </div>
        )}

        {!loading && error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && filteredOrders.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            No orders yet. They’ll appear here as customers submit them.
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="px-3 py-2 font-medium text-slate-700">
                    Time
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-700">
                    Cooler
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-700">
                    Items
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-700">
                    Total
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-700">
                    Status
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-700">
                    Contact
                  </th>
                  <th className="px-3 py-2 font-medium text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const status = order.status || "pending";
                  const total =
                    typeof order.total === "number"
                      ? `$${order.total.toFixed(2)}`
                      : order.total || "—";

                  return (
                    <tr
                      key={order.id}
                      className="border-b last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-3 py-2 align-top">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {order.cooler_name || order.cooler_id || "—"}
                      </td>
                      <td className="px-3 py-2 align-top max-w-xs">
                        {formatItems(order.items)}
                      </td>
                      <td className="px-3 py-2 align-top whitespace-nowrap">
                        {total}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            status === "fulfilled"
                              ? "bg-emerald-50 text-emerald-700"
                              : status === "in_progress"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-sky-50 text-sky-700"
                          }`}
                        >
                          {status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-top">
                        {order.phone || order.contact || "—"}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex flex-col gap-1">
                          {status !== "pending" && (
                            <button
                              disabled={updatingId === order.id}
                              onClick={() =>
                                updateStatus(order.id, "pending")
                              }
                              className="text-xs border rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-50"
                            >
                              Set pending
                            </button>
                          )}
                          {status !== "in_progress" && (
                            <button
                              disabled={updatingId === order.id}
                              onClick={() =>
                                updateStatus(order.id, "in_progress")
                              }
                              className="text-xs border rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-50"
                            >
                              In progress
                            </button>
                          )}
                          {status !== "fulfilled" && (
                            <button
                              disabled={updatingId === order.id}
                              onClick={() =>
                                updateStatus(order.id, "fulfilled")
                              }
                              className="text-xs border rounded px-2 py-1 hover:bg-emerald-50 disabled:opacity-50"
                            >
                              Fulfilled ✅
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerOrders;

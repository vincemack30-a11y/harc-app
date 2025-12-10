// src/ManagerDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import StatusDashboard from "./StatusDashboard.jsx";
import ManagerOrders from "./ManagerOrders.jsx";
import ManagerRestock from "./ManagerRestock.jsx";

function formatDate(value) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function formatItemsFromOrder(order) {
  const { items } = order;
  if (Array.isArray(items)) {
    return items.map((item) => `${item.name} (x${item.qty})`).join(", ");
  }
  return String(items || "");
}

function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return `$${value ?? "--"}`;
  return `$${num.toFixed(2)}`;
}

export default function ManagerDashboard() {
  const [orders, setOrders] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("all");

  // Tabs: overview, status, orders, restock
  const [activeTab, setActiveTab] = useState("overview");

  // PIN state
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState("");

  // Last refresh timestamp
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const CORRECT_PIN = "1357";

  // Status filter options
  const STATUS_OPTIONS = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "in_progress", label: "In Progress" },
    { id: "done", label: "Done" },
  ];

  // Load orders + intake requests on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    try {
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (orderErr) {
        console.error("Order load error:", orderErr);
      } else {
        setOrders(orderData || []);
      }

      const { data: intakeData, error: intakeErr } = await supabase
        .from("intake_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (intakeErr) {
        console.error("Intake load error:", intakeErr);
      } else {
        setIntakes(intakeData || []);
      }

      setLastRefreshed(new Date().toISOString());
    } catch (err) {
      console.error("Load error:", err);
    }

    setLoading(false);
  }

  // Update status for an intake request
  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from("intake_requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Status update error:", error);
      alert("Could not update status. Try again.");
      return;
    }

    // Reload so counts + lists stay accurate
    loadData();
  }

  // Filter logic for overview tab
  const filteredIntakes =
    activeStatus === "all"
      ? intakes
      : intakes.filter((item) => (item.status || "new") === activeStatus);

  // Summary counts (overview)
  const totalOrders = orders.length;
  const totalIntakes = intakes.length;
  const newCount = intakes.filter(
    (i) => (i.status || "new") === "new"
  ).length;
  const inProgressCount = intakes.filter(
    (i) => (i.status || "new") === "in_progress"
  ).length;
  const doneCount = intakes.filter(
    (i) => (i.status || "new") === "done"
  ).length;

  function handlePinSubmit(e) {
    e.preventDefault();
    if (pin.trim() === CORRECT_PIN) {
      setUnlocked(true);
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Try again.");
    }
  }

  // ---------- PIN SCREEN ----------
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100 to-emerald-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            HaRC • Manager Portal
          </p>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Manager Access
          </h1>
          <p className="text-sm text-slate-600 mb-4">
            Enter your 4-digit PIN to view live orders, intake requests, and
            restock priorities.
          </p>

          <form onSubmit={handlePinSubmit}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-lg tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              placeholder="••••"
            />

            {pinError && (
              <p className="text-xs text-red-600 mt-2">{pinError}</p>
            )}

            <button
              type="submit"
              className="mt-4 w-full rounded-full py-2.5 text-sm font-semibold text-slate-900 bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-300 shadow-md hover:shadow-lg transition"
            >
              Unlock Dashboard
            </button>
          </form>

          <p className="text-[11px] text-slate-400 mt-4 text-center">
            Authorized staff only • HaRC Healthy Coolers • Authority Health
          </p>
        </div>
      </div>
    );
  }

  // ---------- LOADING ----------
  if (loading && !lastRefreshed) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center text-slate-600 text-sm">
          Loading dashboard…
        </div>
      </div>
    );
  }

  // ---------- MAIN DASHBOARD ----------
  return (
    <div className="min-h-screen bg-slate-100 p-4">
      {/* Header row: title + refresh + last updated */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            {lastRefreshed
              ? `Last refreshed: ${formatDate(lastRefreshed)}`
              : "Data just loaded"}
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm"
        >
          {loading ? "Refreshing…" : "Refresh All Data"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-2 rounded-full text-sm font-medium ${
            activeTab === "overview"
              ? "bg-slate-900 text-white shadow"
              : "bg-white border border-slate-300 text-slate-700"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("status")}
          className={`px-3 py-2 rounded-full text-sm font-medium ${
            activeTab === "status"
              ? "bg-slate-900 text-white shadow"
              : "bg-white border border-slate-300 text-slate-700"
          }`}
        >
          Status Dashboard
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`px-3 py-2 rounded-full text-sm font-medium ${
            activeTab === "orders"
              ? "bg-slate-900 text-white shadow"
              : "bg-white border border-slate-300 text-slate-700"
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("restock")}
          className={`px-3 py-2 rounded-full text-sm font-medium ${
            activeTab === "restock"
              ? "bg-slate-900 text-white shadow"
              : "bg-white border border-slate-300 text-slate-700"
          }`}
        >
          Restock
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
          {/* Top Status Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total Orders
              </p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {totalOrders}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Help / Coverage Requests
              </p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {totalIntakes}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                New Requests
              </p>
              <p className="text-2xl font-semibold text-amber-600 mt-1">
                {newCount}
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                In Progress / Done
              </p>
              <p className="text-sm text-slate-800 mt-1">
                <span className="font-semibold text-blue-600">
                  {inProgressCount}
                </span>{" "}
                in progress,{" "}
                <span className="font-semibold text-emerald-600">
                  {doneCount}
                </span>{" "}
                done
              </p>
            </div>
          </div>

          {/* Status filter buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActiveStatus(opt.id)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  activeStatus === opt.id
                    ? "bg-orange-500 text-white"
                    : "bg-white border border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Intake Requests */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-2">
              Help / Coverage Requests
            </h2>

            {filteredIntakes.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No requests with this status.
              </p>
            ) : (
              filteredIntakes.map((req) => (
                <div
                  key={req.id}
                  className="bg-white border rounded-xl p-4 mb-4 shadow-sm"
                >
                  <p className="text-xs text-slate-600 mb-1">
                    <strong>Created:</strong> {formatDate(req.created_at)}
                  </p>

                  <p className="text-sm">
                    <strong>Phone:</strong> {req.phone || "--"}
                  </p>

                  <p className="text-sm">
                    <strong>Primary care needed?:</strong>{" "}
                    {req.primary_care_needed ? "Yes" : "No"}
                  </p>

                  <p className="text-sm">
                    <strong>Notes:</strong> {req.notes || "--"}
                  </p>

                  <div className="mt-2">
                    <span className="text-xs font-medium">
                      <strong>Status:</strong>{" "}
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-200 text-slate-800 text-xs">
                      {req.status || "new"}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => updateStatus(req.id, "in_progress")}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Mark In Progress
                    </button>

                    <button
                      onClick={() => updateStatus(req.id, "done")}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Mark Done
                    </button>

                    <button
                      onClick={() => updateStatus(req.id, "new")}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Quick recent orders list */}
          <section>
            <h2 className="text-xl font-semibold mb-2">Recent Orders</h2>

            {orders.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent orders.</p>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="bg-white border rounded-xl p-4 mb-4 shadow-sm"
                >
                  <p className="text-xs text-slate-600 mb-1">
                    <strong>Time:</strong> {formatDate(order.created_at)}
                  </p>

                  <p className="text-sm">
                    <strong>Cooler:</strong> {order.cooler_id}
                  </p>

                  <p className="text-sm">
                    <strong>Items:</strong>{" "}
                    {formatItemsFromOrder(order)}
                  </p>

                  <p className="text-sm">
                    <strong>Total:</strong> {formatMoney(order.total)}
                  </p>
                </div>
              ))
            )}
          </section>
        </>
      )}

      {/* STATUS TAB */}
      {activeTab === "status" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 sm:p-4">
          <StatusDashboard />
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 sm:p-4">
          <ManagerOrders />
        </div>
      )}

      {/* RESTOCK TAB */}
      {activeTab === "restock" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 sm:p-4">
          <ManagerRestock />
        </div>
      )}
    </div>
  );
}

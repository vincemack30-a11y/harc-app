// src/ManagerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import StatusDashboard from "./StatusDashboard.jsx";
import ManagerOrders from "./ManagerOrders.jsx";
import ManagerRestock from "./ManagerRestock.jsx";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "status", label: "Status Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "restock", label: "Restock" },
];

export default function ManagerDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: orderData, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (orderErr) {
      console.error("Order load error:", orderErr);
    }

    const { data: intakeData, error: intakeErr } = await supabase
      .from("intake_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (intakeErr) {
      console.error("Intake load error:", intakeErr);
    }

    setOrders(orderData || []);
    setIntakes(intakeData || []);
    setLoading(false);
  }

  const recentIntakes = intakes.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-emerald-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-orange-500">
              HaRC Healthy Coolers
            </p>
            <h1 className="text-2xl font-bold mt-1">Manager Dashboard</h1>
            <p className="text-xs text-slate-500">
              Monitor cooler orders, surveys, and help requests.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-xs px-3 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-50"
          >
            Back to customer view
          </button>
        </header>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* NEW: Delivery tab -> goes to /manager/delivery */}
          <button
            onClick={() => navigate("/manager/delivery")}
            className="px-3 py-1.5 rounded-full text-xs border bg-white text-slate-700 border-slate-300"
          >
            Delivery
          </button>
        </div>

        {/* Stats + refresh */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <p className="text-xs text-slate-600">
            Orders: <span className="font-semibold">{orders.length}</span> •
            &nbsp;Help / coverage requests:{" "}
            <span className="font-semibold">{intakes.length}</span>
          </p>
          <button
            onClick={loadData}
            className="text-xs px-3 py-1.5 rounded-full border border-slate-400 bg-white hover:bg-slate-50"
          >
            Refresh All Data
          </button>
        </div>

        {/* Main content */}
        {loading ? (
          <p className="text-sm text-slate-600">Loading dashboard…</p>
        ) : (
          <>
            {activeTab === "overview" && (
              <section className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500">Total orders</p>
                    <p className="text-xl font-bold">{orders.length}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500">
                      Help / coverage requests
                    </p>
                    <p className="text-xl font-bold">{intakes.length}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-slate-500">
                      Recent help requests (last few)
                    </p>
                    <p className="text-xl font-bold">
                      {recentIntakes.length}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h2 className="text-sm font-semibold mb-2">
                    Recent help / coverage requests
                  </h2>
                  {recentIntakes.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No recent intake requests.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {recentIntakes.map((req) => (
                        <li
                          key={req.id}
                          className="border-b last:border-b-0 pb-2 last:pb-0"
                        >
                          <p className="font-medium">
                            {req.phone || "No phone listed"}
                          </p>
                          <p className="text-slate-600">
                            Primary care needed:{" "}
                            {req.primary_care_needed ? "Yes" : "No"}
                          </p>
                          <p className="text-slate-600">
                            Notes: {req.notes || "—"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(req.created_at).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            )}

            {activeTab === "status" && (
              <StatusDashboard orders={orders} intakes={intakes} />
            )}

            {activeTab === "orders" && (
              <ManagerOrders orders={orders} onRefresh={loadData} />
            )}

            {activeTab === "restock" && (
              <ManagerRestock orders={orders} onRefresh={loadData} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

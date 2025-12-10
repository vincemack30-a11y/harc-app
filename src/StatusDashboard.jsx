// src/StatusDashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

const DATE_RANGES = [
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "all", label: "All time", days: null },
];

function formatDate(value) {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function StatusDashboard() {
  const [orders, setOrders] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeRange, setActiveRange] = useState("7");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setErrorMsg("");

    try {
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (orderErr) throw orderErr;
      setOrders(orderData || []);

      const { data: intakeData, error: intakeErr } = await supabase
        .from("intake_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (intakeErr) throw intakeErr;
      setIntakes(intakeData || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Unknown Supabase error");
    }

    setLoading(false);
  }

  if (loading) {
    return <div className="p-4 text-slate-600">Loading status dashboard…</div>;
  }

  if (errorMsg) {
    return (
      <div className="p-4 text-red-600 font-semibold">
        Error: {errorMsg}
      </div>
    );
  }

  const selectedRange = DATE_RANGES.find((r) => r.id === activeRange);

  function isInRange(createdAt) {
    if (!selectedRange || selectedRange.days == null) return true;
    if (!createdAt) return false;

    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return false;

    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - selectedRange.days);

    return d >= cutoff && d <= now;
  }

  const filteredOrders =
    activeRange === "all"
      ? orders
      : orders.filter((o) => isInRange(o.created_at));

  const filteredIntakes =
    activeRange === "all"
      ? intakes
      : intakes.filter((i) => isInRange(i.created_at));

  const totalOrders = filteredOrders.length;
  const totalIntakes = filteredIntakes.length;
  const newIntakes = filteredIntakes.filter(
    (i) => (i.status || "new") === "new"
  ).length;
  const inProgress = filteredIntakes.filter(
    (i) => i.status === "in_progress"
  ).length;
  const done = filteredIntakes.filter((i) => i.status === "done").length;

  function downloadIntakeCSV() {
    if (filteredIntakes.length === 0) {
      alert("No intake records to export.");
      return;
    }

    const header = ["Created At", "Status", "Phone", "Notes"];
    const rows = filteredIntakes.map((intk) => {
      return [
        formatDate(intk.created_at).replace(/,/g, " "),
        (intk.status || "new").replace(/,/g, " "),
        (intk.phone || "--").replace(/,/g, " "),
        (intk.notes || "--").replace(/,/g, ";"),
      ].join(",");
    });

    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "harc_intake_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4">
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <h2 className="text-xl font-semibold">HaRC Status Dashboard</h2>

        <div className="flex flex-wrap gap-2">
          {DATE_RANGES.map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => setActiveRange(range.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                activeRange === range.id
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white border border-slate-300 text-slate-700"
              }`}
            >
              {range.label}
            </button>
          ))}

          <button
            type="button"
            onClick={downloadIntakeCSV}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            Download Intake CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Orders</p>
          <p className="text-2xl font-semibold">{totalOrders}</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Intake Requests</p>
          <p className="text-2xl font-semibold">{totalIntakes}</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">New</p>
          <p className="text-2xl font-semibold text-amber-600">{newIntakes}</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Progress</p>
          <p className="text-sm mt-1">
            <span className="font-semibold text-blue-600">{inProgress}</span>{" "}
            in progress,{" "}
            <span className="font-semibold text-emerald-600">{done}</span> done
          </p>
        </div>
      </div>

      {/* Recent intakes */}
      <h3 className="text-lg font-medium mb-2">Recent Intakes</h3>

      {filteredIntakes.length === 0 ? (
        <p className="text-slate-500 text-sm">No intake records in this range.</p>
      ) : (
        filteredIntakes.slice(0, 5).map((intk) => (
          <div
            key={intk.id}
            className="bg-white border rounded-xl p-3 mb-2 shadow-sm"
          >
            <p className="text-xs text-slate-600">
              {formatDate(intk.created_at)}
            </p>

            <p className="text-sm">
              <strong>Status:</strong> {intk.status || "new"}
            </p>

            <p className="text-sm">
              <strong>Phone:</strong> {intk.phone || "--"}
            </p>

            <p className="text-sm">
              <strong>Notes:</strong> {intk.notes || "--"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

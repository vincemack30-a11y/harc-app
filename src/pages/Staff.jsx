// src/pages/Staff.jsx
import React, { useState, useEffect } from "react";
import { COOLERS } from "../data.js";

function StaffPage() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "intakes"
  const [coolerId, setCoolerId] = useState(COOLERS[0].id);

  const [orders, setOrders] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [error, setError] = useState("");

  const unlock = () => {
    if (pin === "1357") {
      setUnlocked(true);
      setPin("");
    } else {
      alert("Incorrect PIN.");
    }
  };

  // Fetch orders + intakes from Vercel API routes
  const fetchData = async () => {
    setError("");

    try {
      // Orders
      const orderRes = await fetch(
        `/api/orders?cooler_id=${encodeURIComponent(coolerId)}`
      );
      if (!orderRes.ok) throw new Error("Orders fetch failed");
      const orderData = await orderRes.json();
      setOrders(orderData);

      // Intake Requests
      const intakeRes = await fetch(
        `/api/intake?cooler_id=${encodeURIComponent(coolerId)}`
      );
      if (!intakeRes.ok) throw new Error("Intake fetch failed");
      const intakeData = await intakeRes.json();
      setIntakes(intakeData);
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection.");
    }
  };

  // Refresh every 10 seconds
  useEffect(() => {
    if (!unlocked) return;

    fetchData(); // initial load

    const timer = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(timer);
  }, [unlocked, coolerId]);

  if (!unlocked) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-2">HaRC Staff Dashboard</h2>
        <p className="text-sm mb-4">
          Internal use only. Enter staff PIN to continue.
        </p>

        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          className="border px-3 py-2 text-sm rounded"
        />
        <button
          onClick={unlock}
          className="ml-2 px-3 py-2 text-sm bg-black text-white rounded"
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">HaRC Staff Dashboard</h2>
      <p className="text-xs mb-4">Internal view — not for public use.</p>

      {/* Tabs */}
      <div className="flex gap-3 mb-3">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-3 py-1 rounded text-sm ${
            activeTab === "orders"
              ? "bg-black text-white"
              : "bg-white border border-black"
          }`}
        >
          Orders
        </button>

        <button
          onClick={() => setActiveTab("intakes")}
          className={`px-3 py-1 rounded text-sm ${
            activeTab === "intakes"
              ? "bg-black text-white"
              : "bg-white border border-black"
          }`}
        >
          Intake requests
        </button>
      </div>

      {/* Cooler filter */}
      <label className="text-sm mr-2">Cooler:</label>
      <select
        value={coolerId}
        onChange={(e) => setCoolerId(e.target.value)}
        className="border px-2 py-1 text-sm rounded"
      >
        {COOLERS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-red-600 text-sm mt-3">{error}</p>
      )}

      {/* Display Data */}
      <div className="mt-4 text-sm">
        {activeTab === "orders" ? (
          <div>
            <h3 className="text-lg font-semibold mb-2">Orders</h3>
            {orders.length === 0 ? (
              <p>No orders found for this cooler.</p>
            ) : (
              <ul className="list-disc ml-5">
                {orders.map((o) => (
                  <li key={o.id} className="mb-1">
                    <strong>#{o.id.slice(0, 8)}</strong> —{" "}
                    {o.items.map((i) => `${i.name} x${i.qty}`).join(", ")} —{" "}
                    Total: ${o.total} —{" "}
                    {new Date(o.created_at).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-2">Intake Requests</h3>
            {intakes.length === 0 ? (
              <p>No intake requests for this cooler.</p>
            ) : (
              <ul className="list-disc ml-5">
                {intakes.map((i) => (
                  <li key={i.id} className="mb-1">
                    <strong>#{i.id.slice(0, 8)}</strong> — {i.name || "No name"},{" "}
                    {i.phone || "No phone"} — Need help:{" "}
                    {i.need_insurance ? "Yes" : "No"} —{" "}
                    {new Date(i.created_at).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] mt-6 text-black/70">
        Demo workflow for Authority Health HaRC — Not for real patient data.
      </p>
    </div>
  );
}

export default StaffPage;

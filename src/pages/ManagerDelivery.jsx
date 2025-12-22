import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ManagerDelivery() {
  const [deliveries, setDeliveries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDeliveries();
  }, []);

  async function loadDeliveries() {
    const { data, error } = await supabase
      .from("delivery_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load delivery error:", error);
      return;
    }

    setDeliveries(data);
    setFiltered(data);
  }

  function applyFilters() {
    let list = [...deliveries];

    if (statusFilter !== "all") {
      list = list.filter((d) => d.status === statusFilter);
    }

    if (search.trim() !== "") {
      const s = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.customer_name?.toLowerCase().includes(s) ||
          d.phone?.toLowerCase().includes(s) ||
          d.address_line1?.toLowerCase().includes(s)
      );
    }

    setFiltered(list);
  }

  useEffect(applyFilters, [statusFilter, search, deliveries]);

  async function updateStatus(id, newStatus) {
    const { error } = await supabase
      .from("delivery_orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Status update error:", error);
      return;
    }

    loadDeliveries();
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Delivery Orders</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="text"
          placeholder="Search name, phone, address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 flex-1"
        />

        <button
          onClick={loadDeliveries}
          className="border px-3 py-1 rounded bg-slate-200"
        >
          Refresh
        </button>
      </div>

      {/* Delivery list */}
      <div className="space-y-4">
        {filtered.map((d) => (
          <div key={d.id} className="border rounded p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{d.customer_name}</p>
                <p className="text-sm">{d.phone}</p>
                <p className="text-sm">{d.address_line1}</p>
                {d.address_line2 && <p className="text-sm">{d.address_line2}</p>}
                <p className="text-sm">
                  {d.city}, {d.zip}
                </p>
                <p className="text-sm mt-1 text-gray-600">
                  {new Date(d.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-sm border">
                  {d.status}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="mt-3">
              <p className="font-medium">Items</p>
              <ul className="text-sm list-disc ml-4">
                {d.items?.map((item, idx) => (
                  <li key={idx}>
                    {item.name} (x{item.qty}) — ${(item.price * item.qty).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Total */}
            <p className="font-semibold mt-2">Total: ${d.total?.toFixed(2)}</p>

            {/* Notes */}
            {d.notes && (
              <p className="text-sm mt-1 italic">Customer note: {d.notes}</p>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => updateStatus(d.id, "in_progress")}
                className="px-3 py-1 border rounded bg-yellow-200"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => updateStatus(d.id, "delivered")}
                className="px-3 py-1 border rounded bg-green-200"
              >
                Mark Delivered
              </button>
              <button
                onClick={() => updateStatus(d.id, "cancelled")}
                className="px-3 py-1 border rounded bg-red-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-gray-600">No delivery orders found.</p>
        )}
      </div>
    </div>
  );
}

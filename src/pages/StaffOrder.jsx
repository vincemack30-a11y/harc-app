import { useEffect, useState } from "react";

export default function StaffOrder({ orderId, setActiveTab }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        const found = (data.orders || []).find((o) => o.id === orderId);
        setOrder(found || null);
      } catch (err) {
        console.error("Failed to load order", err);
      }
    }

    loadOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div>
        <h2>Order Not Found</h2>
        <button
          className="btn-secondary"
          onClick={() => setActiveTab("staff")}
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="staff-order-detail">
      <button
        className="btn-secondary"
        onClick={() => setActiveTab("staff")}
      >
        ← Back to Orders
      </button>

      <h2>Order #{order.id}</h2>
      <p><strong>Cooler:</strong> {order.cooler}</p>

      <h3>Items</h3>
      <ul className="staff-items-list">
        {order.items.map((item, idx) => (
          <li key={idx}>
            {item.name} — Qty {item.qty}
          </li>
        ))}
      </ul>

      <p className="staff-timestamp">
        Submitted: {order.submittedAt || "N/A"}
      </p>
    </div>
  );
}

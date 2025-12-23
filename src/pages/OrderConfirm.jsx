import React from "react";
import { Link } from "react-router-dom";

export default function OrderConfirm({ ctx }) {
  const { lastOrder, selectedCooler } = ctx;

  return (
    <div className="card">
      <h1 className="h1">Order Confirmed</h1>
      <p className="h2">
        Thank you. Your order has been recorded{selectedCooler ? ` for ${selectedCooler.name}` : ""}.
      </p>

      <hr className="hr" />

      {lastOrder ? (
        <div className="card" style={{ borderRadius: 14 }}>
          <div className="small">Order ID</div>
          <div style={{ fontWeight: 900 }}>{lastOrder.order_id}</div>

          <div className="small" style={{ marginTop: 10 }}>
            Total
          </div>
          <div style={{ fontWeight: 900 }}>${Number(lastOrder.total || 0).toFixed(2)}</div>

          <div className="small" style={{ marginTop: 10 }}>
            Items
          </div>
          <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
            {lastOrder.items?.map((i) => (
              <div key={i.sku} className="row" style={{ justifyContent: "space-between" }}>
                <span>
                  {i.name} <span className="badge">x{i.qty}</span>
                </span>
                <span className="small">${Number(i.line_total || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="small">No order details found. If you just refreshed, that is expected.</div>
      )}

      <hr className="hr" />

      <div className="row">
        <Link to="/survey" className="btn btn-green">
          Take Quick Survey
        </Link>
        <Link to="/menu" className="btn btn-primary">
          Order More
        </Link>
        <Link to="/help" className="btn">
          Get Help
        </Link>
      </div>
    </div>
  );
}

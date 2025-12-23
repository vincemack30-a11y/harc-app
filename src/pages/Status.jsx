import React from "react";
import { Link } from "react-router-dom";

export default function Status({ ctx }) {
  const { selectedCoolerId } = ctx;

  return (
    <div className="card">
      <h1 className="h1">Status</h1>
      <p className="h2">
        Manager status view (placeholder). Current selected cooler_id:{" "}
        <span className="badge">{selectedCoolerId || "none"}</span>
      </p>

      <hr className="hr" />

      <div className="row">
        <Link to="/manager/analytics" className="btn btn-primary">
          Back to Analytics
        </Link>
        <Link to="/" className="btn">
          Exit Manager
        </Link>
      </div>
    </div>
  );
}

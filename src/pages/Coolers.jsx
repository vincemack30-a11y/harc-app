// src/pages/Coolers.jsx
import React from "react";
import { Link } from "react-router-dom";
import { COOLERS } from "../data";
import { useAppContext } from "../context/AppContext";

export default function CoolersPage() {
  const { selectedCoolerId, setSelectedCoolerId } = useAppContext();

  const handleSelect = (coolerId) => {
    if (setSelectedCoolerId) {
      setSelectedCoolerId(coolerId);
    }
  };

  return (
    <main className="page">
      <h1 className="page-title">Choose a cooler</h1>
      <p className="page-intro">
        Pick the HaRC cooler closest to you. Menus may vary by location.
      </p>

      <ul className="cooler-list">
        {COOLERS.map((cooler) => (
          <li key={cooler.id} className="cooler-card">
            <button
              type="button"
              onClick={() => handleSelect(cooler.id)}
              className={
                cooler.id === selectedCoolerId
                  ? "cooler-button cooler-button--active"
                  : "cooler-button"
              }
            >
              <div className="cooler-name">{cooler.name}</div>
              <div className="cooler-address">{cooler.address}</div>
            </button>
          </li>
        ))}
      </ul>

      <div className="page-actions">
        <Link to="/menu" className="btn-primary">
          Continue to menu
        </Link>
      </div>
    </main>
  );
}

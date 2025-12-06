// src/pages/Coolers.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function CoolersPage({ coolers, selectedCoolerId, onSelectCooler }) {
  const navigate = useNavigate();

  const handleSelect = (coolerId) => {
    if (onSelectCooler) {
      onSelectCooler(coolerId);
    }
    // After selecting, send them straight to the menu
    navigate("/menu");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Choose a cooler location</h2>
      <p className="text-sm mb-4">
        Pick the cooler you&#39;re standing at. Staff will see which location
        your order or coverage request came from.
      </p>

      {selectedCoolerId && (
        <p className="text-xs mb-3">
          Current selection:{" "}
          <strong>
            {coolers.find((c) => c.id === selectedCoolerId)?.name ||
              "Unknown cooler"}
          </strong>
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {coolers.map((cooler) => {
          const isActive = cooler.id === selectedCoolerId;
          return (
            <button
              key={cooler.id}
              onClick={() => handleSelect(cooler.id)}
              className={`text-left rounded-lg border px-3 py-2 text-sm bg-white/80 hover:bg-white shadow-sm ${
                isActive ? "border-black font-semibold" : "border-black/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span>{cooler.name}</span>
                {isActive && (
                  <span className="text-[11px] px-2 py-[2px] rounded-full bg-black text-white">
                    Selected
                  </span>
                )}
              </div>
              {cooler.address && (
                <p className="text-[11px] text-black/80">{cooler.address}</p>
              )}
              {cooler.hours && (
                <p className="text-[11px] text-black/80 mt-1">
                  Hours: {cooler.hours}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] mt-4 text-black/80">
        Demo workflow for Authority Health HaRC &mdash; not for real patient
        data.
      </p>
    </div>
  );
}

export default CoolersPage;

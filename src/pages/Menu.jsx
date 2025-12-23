import React from "react";
import { Link } from "react-router-dom";

export default function MenuPage({ ctx }) {
  const { MENU, selectedCooler, addToCart } = ctx;

  if (!selectedCooler) {
    return (
      <div className="card">
        <h1 className="h1">Menu</h1>
        <p className="h2">You must select a cooler first.</p>
        <Link to="/coolers" className="btn btn-primary">
          Select a Cooler
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="h1">Menu</h1>
      <p className="h2">
        Ordering from: <strong>{selectedCooler.name}</strong>
      </p>

      <hr className="hr" />

      <div style={{ display: "grid", gap: 12 }}>
        {MENU.map((m) => (
          <div key={m.sku} className="card" style={{ borderRadius: 14 }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{m.name}</div>
                <div className="small">
                  ${m.price.toFixed(2)}{" "}
                  {m.tags?.length ? (
                    <span style={{ marginLeft: 8 }}>
                      {m.tags.map((t) => (
                        <span key={t} className="badge" style={{ marginRight: 6 }}>
                          {t}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </div>
              </div>

              <button className="btn btn-primary" onClick={() => addToCart(m)}>
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      <hr className="hr" />

      <div className="row">
        <Link to="/cart" className="btn btn-green">
          Go to Cart
        </Link>
        <Link to="/coolers" className="btn">
          Change Cooler
        </Link>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { COOLERS, MENU } from "./data.js";
import { restockData } from "./restockData.js";

function App() {
  const [cart, setCart] = useState([]);
  const [activeCooler, setActiveCooler] = useState(null);

  const addToCart = (item) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (indexToRemove) => {
    setCart((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const clearCart = () => setCart([]);

  return (
    <Router>
      <div className="app-shell">
        <TopBar cartCount={cart.length} />

        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/coolers"
              element={
                <CoolerList
                  coolers={COOLERS}
                  activeCooler={activeCooler}
                  onSelectCooler={setActiveCooler}
                />
              }
            />

            <Route
              path="/menu"
              element={
                <MenuPage
                  cooler={activeCooler}
                  menu={MENU}
                  addToCart={addToCart}
                />
              }
            />

            <Route
              path="/cart"
              element={
                <CartPage cart={cart} removeFromCart={removeFromCart} />
              }
            />

            <Route
              path="/confirmation"
              element={
                <ConfirmationPage cart={cart} clearCart={clearCart} />
              }
            />

            <Route
              path="/restock"
              element={<RestockPage data={restockData} />}
            />

            <Route path="/assist" element={<AssistPage />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </Router>
  );
}

/* ---------- Layout components ---------- */

function TopBar({ cartCount }) {
  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <h1 className="top-title">HaRC Healthy Coolers</h1>
        <Link to="/cart" className="cart-link">
          Cart ({cartCount})
        </Link>
      </div>
    </header>
  );
}

function BottomNav() {
  const location = useLocation();
  const current = location.pathname;

  const linkClass = (path) =>
    "nav-link" + (current === path ? " nav-link-active" : "");

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <Link to="/" className={linkClass("/")}>
          Home
        </Link>
        <Link to="/coolers" className={linkClass("/coolers")}>
          Coolers
        </Link>
        <Link to="/cart" className={linkClass("/cart")}>
          Cart
        </Link>
        <Link to="/restock" className={linkClass("/restock")}>
          Restock
        </Link>
      </div>
    </nav>
  );
}

/* ---------- Home ---------- */

function Home() {
  return (
    <section className="section">
      <h2 className="section-title">Healthy food, right where you are.</h2>
      <p className="section-text">
        Find HaRC-approved Byte coolers with fresh meals, snacks, and drinks.
      </p>

      <Link to="/coolers" className="button-primary" style={{ marginTop: 8 }}>
        Find a cooler near me
      </Link>

      <Link
        to="/assist"
        className="button-secondary"
        style={{ marginTop: 8, textDecoration: "none" }}
      >
        Need help with Medicaid, Medicare or a doctor?
      </Link>
    </section>
  );
}

/* ---------- Coolers ---------- */

function CoolerList({ coolers, activeCooler, onSelectCooler }) {
  return (
    <section className="section">
      <h2 className="section-title">Nearby Healthy Coolers</h2>
      <p className="section-subtitle">Tap a cooler to see what&apos;s inside.</p>

      <div className="card-list">
        {coolers.map((cooler) => (
          <div
            key={cooler.id}
            className={
              "cooler-card" +
              (activeCooler?.id === cooler.id ? " cooler-card--active" : "")
            }
          >
            <div className="cooler-top">
              <div>
                <p className="cooler-name">{cooler.name}</p>
                <p className="cooler-address">{cooler.address}</p>
                <p className="cooler-meta">
                  {cooler.status} • {cooler.distance}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="cooler-tag">{cooler.tagline}</span>
                <br />
                <Link
                  to="/menu"
                  onClick={() => onSelectCooler(cooler)}
                  className="cooler-view-link"
                >
                  View menu
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Menu ---------- */

function MenuPage({ cooler, menu, addToCart }) {
  const navigate = useNavigate();

  if (!cooler) {
    return (
      <section className="section">
        <p className="section-text">
          Pick a cooler first to see what&apos;s inside.
        </p>
        <button
          onClick={() => navigate("/coolers")}
          className="button-secondary"
          style={{ marginTop: 8 }}
        >
          Back to coolers
        </button>
      </section>
    );
  }

  const itemsForCooler = menu.filter((item) => item.coolerId === cooler.id);

  return (
    <section className="section">
      <h2 className="section-title">
        Menu at {cooler.shortName || cooler.name}
      </h2>
      <p className="section-subtitle">
        Tap “Add” to send an item to your cart.
      </p>

      <div className="card-list">
        {itemsForCooler.map((item) => (
          <div key={item.id} className="menu-card">
            <div>
              <p className="menu-title">{item.name}</p>
              <p className="menu-meta">
                {item.calories} cal • {item.tag}
              </p>
              <p className="menu-price">${item.price.toFixed(2)}</p>
            </div>
            <button onClick={() => addToCart(item)} className="menu-add">
              Add
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate("/cart")}
        className="button-secondary"
        style={{ marginTop: 10 }}
      >
        Go to cart
      </button>
    </section>
  );
}

/* ---------- Cart ---------- */

function CartPage({ cart, removeFromCart }) {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <section className="section">
      <h2 className="section-title">Your cart</h2>

      {cart.length === 0 ? (
        <p className="cart-empty">
          No items yet. Add something from a cooler menu.
        </p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div>
                  <p className="cart-item-title">{item.name}</p>
                  <p className="cart-item-price">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(index)}
                  className="cart-remove"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            onClick={() => navigate("/confirmation")}
            disabled={cart.length === 0}
            className="button-primary"
            style={{ marginTop: 10, opacity: cart.length === 0 ? 0.5 : 1 }}
          >
            Checkout
          </button>
        </>
      )}
    </section>
  );
}

/* ---------- Confirmation ---------- */

function ConfirmationPage({ cart, clearCart }) {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleStartOver = () => {
    clearCart();
    navigate("/coolers");
  };

  const SURVEY_URL =
    "https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3";

  return (
    <section className="section">
      <h2 className="section-title">Order confirmed ✅</h2>
      <p className="section-text">
        Thanks for choosing a HaRC Healthy Cooler. Your items will be ready
        at the machine you selected.
      </p>

      {cart.length > 0 && (
        <div className="summary-card">
          <p className="summary-header">Order summary</p>
          {cart.map((item, index) => (
            <div key={index} className="summary-row">
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row summary-row--bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <a
        href={SURVEY_URL}
        target="_blank"
        rel="noreferrer"
        className="button-outline-orange"
        style={{ textDecoration: "none" }}
      >
        Take quick HaRC survey
      </a>

      <button
        onClick={handleStartOver}
        className="button-primary"
        style={{ marginTop: 8 }}
      >
        Back to coolers
      </button>
    </section>
  );
}

/* ---------- Restock (sorted + high priority) ---------- */

function RestockPage({ data }) {
  // Map SKUs to human-friendly names
  const skuToName = {};
  data.products.forEach((p) => {
    skuToName[p.sku] = p.name;
  });

  // Helper: total items at a store
  const getTotalItems = (store) =>
    Object.values(store.restock).reduce((sum, qty) => sum + qty, 0);

  // Only stores with something to bring
  const activeStores = data.stores.filter(
    (store) => Object.keys(store.restock).length > 0
  );

  // Sort by biggest restock first
  const sortedStores = [...activeStores].sort(
    (a, b) => getTotalItems(b) - getTotalItems(a)
  );

  // Anything at or above this total is "high priority"
  const HEAVY_THRESHOLD = 6;

  return (
    <section className="section">
      <h2 className="section-title">Today&apos;s Restock</h2>
      <p className="section-subtitle">
        Internal view for HaRC staff. Sorted by highest total items first.
      </p>

      <div>
        {sortedStores.map((store) => {
          const total = getTotalItems(store);
          const isHighPriority = total >= HEAVY_THRESHOLD;

          return (
            <div key={store.id} className="restock-card">
              <p className="restock-title">{store.name}</p>
              <p className="restock-address">{store.address}</p>
              <p className="restock-code">Store code: {store.code}</p>
              <p className="restock-total">
                Total items to restock: {total}
              </p>

              {isHighPriority && (
                <span className="restock-badge-high">
                  High priority restock
                </span>
              )}

              <div className="restock-items">
                {Object.entries(store.restock).map(([sku, qty]) => (
                  <div key={sku} className="restock-row">
                    <span>{skuToName[sku] || `SKU #${sku}`}</span>
                    <span>x {qty}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="restock-footer">Data timestamp: {data.generated_at}</p>
    </section>
  );
}

/* ---------- Assist / Help ---------- */

function AssistPage() {
  return (
    <section className="section">
      <h2 className="section-title">Need help beyond the cooler?</h2>
      <p className="section-text">
        HaRC Community Health Workers can help you get connected to:
      </p>
      <ul className="section-text" style={{ paddingLeft: "1.1rem" }}>
        <li>• Medicaid or Medicare enrollment or questions</li>
        <li>• Finding a primary care doctor or clinic</li>
        <li>• Support for chronic conditions like diabetes or high blood pressure</li>
      </ul>

      <p className="section-text" style={{ marginTop: 8 }}>
        Talk with a CHW at your nearest HaRC clinic, or use the contact
        information your program provides.
      </p>

      {/* Placeholder text you can customize later with real numbers / links */}
      <p className="section-text" style={{ marginTop: 8, fontSize: "0.8rem" }}>
        This is a demo screen. Add your real phone numbers, clinic names, or
        contact forms here so residents can reach you directly.
      </p>

      <Link
        to="/coolers"
        className="button-secondary"
        style={{ marginTop: 12, textDecoration: "none" }}
      >
        Back to coolers
      </Link>
    </section>
  );
}

export default App;

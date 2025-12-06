// src/App.jsx
import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useCart } from "./AppContext.jsx";
import { COOLERS, MENU } from "./data.js";
import supabase from "./supabaseClient.js";
import { submitIntakeRequest } from "./intake.js";

/* ---------- Shared layout ---------- */

function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 via-orange-300 to-emerald-300 flex justify-center items-start">
      <div className="w-full max-w-xl bg-transparent px-4 py-6">
        <header className="mb-4">
          <h1 className="text-3xl font-bold text-black">HaRC Healthy Coolers</h1>
          <p className="text-sm text-black">
            Grab &amp; go healthy options in your neighborhood.
          </p>
          <Navbar />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    "mr-3 text-sm " +
    (location.pathname === path ? "font-bold underline" : "font-medium");

  return (
    <nav className="mt-2 mb-4">
      <Link to="/" className={linkClass("/")}>
        Home
      </Link>
      <Link to="/coolers" className={linkClass("/coolers")}>
        Coolers
      </Link>
      <Link to="/menu" className={linkClass("/menu")}>
        Menu
      </Link>
      <Link to="/cart" className={linkClass("/cart")}>
        Cart
      </Link>
      <Link to="/help" className={linkClass("/help")}>
        Help
      </Link>
      <Link to="/manage" className={linkClass("/manage")}>
        Manage
      </Link>
    </nav>
  );
}

/* ---------- Pages ---------- */

function HomePage() {
  return (
    <PageLayout>
      <h2 className="text-xl font-semibold mb-2">Welcome</h2>
      <p className="mb-3 text-sm text-black">
        Start by choosing a cooler near you, then view the menu and place an
        order for pickup.
      </p>
      <Link
        to="/coolers"
        className="inline-block bg-black text-white px-4 py-2 rounded text-sm"
      >
        Choose a cooler
      </Link>
    </PageLayout>
  );
}

function CoolersPage() {
  const { selectedCooler, setSelectedCooler } = useCart();
  const navigate = useNavigate();

  const handleSelect = (cooler) => {
    setSelectedCooler(cooler);
    navigate("/menu");
  };

  return (
    <PageLayout>
      <h2 className="text-xl font-semibold mb-3">Choose a cooler</h2>
      <ul className="space-y-2">
        {COOLERS.map((cooler) => (
          <li key={cooler.id}>
            <button
              onClick={() => handleSelect(cooler)}
              className={
                "w-full text-left px-3 py-2 border rounded text-sm " +
                (selectedCooler && selectedCooler.id === cooler.id
                  ? "bg-black text-white"
                  : "bg-white text-black")
              }
            >
              <div className="font-semibold">{cooler.name}</div>
              {cooler.address && (
                <div className="text-xs text-gray-700">{cooler.address}</div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}

function MenuPage() {
  const { selectedCooler, addToCart } = useCart();
  const navigate = useNavigate();

  if (!selectedCooler) {
    return (
      <PageLayout>
        <h2 className="text-xl font-semibold mb-2">Menu</h2>
        <p className="text-sm mb-3">
          Please choose a cooler first so we know which menu to show.
        </p>
        <button
          onClick={() => navigate("/coolers")}
          className="bg-black text-white px-3 py-2 rounded text-sm"
        >
          Go to coolers
        </button>
      </PageLayout>
    );
  }

  const itemsForCooler = MENU.filter(
    (item) => item.coolerId === selectedCooler.id
  );

  return (
    <PageLayout>
      <h2 className="text-xl font-semibold mb-2">Menu</h2>
      <p className="text-sm mb-3">
        Cooler: <span className="font-semibold">{selectedCooler.name}</span>
      </p>

      {itemsForCooler.length === 0 ? (
        <p className="text-sm">No items configured for this cooler yet.</p>
      ) : (
        <ul className="space-y-3">
          {itemsForCooler.map((item) => (
            <li
              key={item.id}
              className="border rounded px-3 py-2 flex justify-between items-center bg-white"
            >
              <div>
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-gray-600">
                  ${item.price.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() =>
                  addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                  })
                }
                className="bg-black text-white px-3 py-1 rounded text-xs"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </PageLayout>
  );
}

function CartPage() {
  const {
    selectedCooler,
    cartItems,
    updateQuantity,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmitOrder = async () => {
    if (!selectedCooler) {
      alert("Please choose a cooler first.");
      navigate("/coolers");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        cooler_id: selectedCooler.id,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
        })),
        total,
        source: "harc-app",
      };

      const { error } = await supabase.from("orders").insert([payload]);

      if (error) {
        console.error("Supabase order error:", error);
        alert("Could not submit order. Please try again.");
      } else {
        clearCart();
        navigate("/cart/confirmed");
      }
    } catch (err) {
      console.error("Unexpected order error:", err);
      alert("Could not submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <h2 className="text-xl font-semibold mb-2">Cart</h2>
      {selectedCooler ? (
        <p className="text-sm mb-2">
          Cooler: <span className="font-semibold">{selectedCooler.name}</span>
        </p>
      ) : (
        <p className="text-sm mb-2">No cooler selected yet.</p>
      )}

      {cartItems.length === 0 ? (
        <p className="text-sm mb-3">Choose a cooler, then add items to cart.</p>
      ) : (
        <ul className="space-y-2 mb-3">
          {cartItems.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center text-sm"
            >
              <div>
                <div>{item.name}</div>
                <div className="text-xs text-gray-600">
                  {item.quantity} x ${item.price.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="px-2 py-1 border rounded text-xs"
                >
                  -
                </button>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="px-2 py-1 border rounded text-xs"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm mb-3">
        Total: <span className="font-semibold">${total.toFixed(2)}</span>
      </p>

      <div className="space-x-2">
        <button
          onClick={clearCart}
          className="px-3 py-2 border rounded text-xs bg-white"
        >
          Clear cart
        </button>
        <button
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className="px-3 py-2 bg-black text-white rounded text-xs disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit order"}
        </button>
      </div>
    </PageLayout>
  );
}

function CartConfirmedPage() {
  return (
    <PageLayout>
      <h2 className="text-xl font-semibold mb-2">Order submitted!</h2>
      <p className="text-sm mb-3">
        Thank you. Your order was successfully placed at the selected cooler.
      </p>
      <Link to="/" className="text-sm underline">
        Back to Home
      </Link>
    </PageLayout>
  );
}

function HelpPage() {
  const { selectedCooler } = useCart();
  const navigate = useNavigate();
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [needsPrimaryCare, setNeedsPrimaryCare] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCooler) {
      alert("Please choose a cooler first.");
      navigate("/coolers");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitIntakeRequest({
        coolerId: selectedCooler.id,
        phone,
        notes,
        needsPrimaryCare,
      });
      navigate("/help/thanks");
    } catch (error) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <h2 className="text-xl font-semibold mb-3">
        Need help with coverage or a doctor?
      </h2>
      <p className="text-sm mb-3">
        Fill this out if you want a community health worker to reach out about
        Medicaid/Medicare, food help, or finding a primary care provider.
      </p>

      {selectedCooler && (
        <p className="text-sm mb-2">
          Cooler:{" "}
          <span className="font-semibold">{selectedCooler.name}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="block mb-1 font-medium">
            Phone (required)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            What do you need help with?
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={needsPrimaryCare}
            onChange={(e) => setNeedsPrimaryCare(e.target.checked)}
          />
          <span>
            I want help with Medicaid/Medicare or a primary care provider.
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit request"}
        </button>
      </form>

      <p className="text-xs mt-4 text-gray-800">
        If this is an emergency, please call 911. For non-emergency medical
        questions, you can also call your health plan&apos;s nurse line.
      </p>
    </PageLayout>
  );
}

function HelpThanksPage() {
  return (
    <PageLayout>
      <h2 className="text-xl font-semibold mb-2">Thank you!</h2>
      <p className="text-sm mb-3">
        A community health worker will review your request and reach out.
      </p>
      <Link to="/" className="text-sm underline">
        Back to Home
      </Link>
    </PageLayout>
  );
}

/* ---------- Manager (for you / staff) ---------- */

const ManagerDashboard = React.lazy(() => import("./ManagerDashboard.jsx"));

function ManagerRoute() {
  return (
    <PageLayout>
      <Suspense fallback={<p>Loading manager view…</p>}>
        <ManagerDashboard />
      </Suspense>
    </PageLayout>
  );
}

/* ---------- App root ---------- */

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/coolers" element={<CoolersPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/cart/confirmed" element={<CartConfirmedPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/help/thanks" element={<HelpThanksPage />} />
        <Route path="/manage" element={<ManagerRoute />} />
        <Route
          path="*"
          element={
            <PageLayout>
              <p>Page not found.</p>
            </PageLayout>
          }
        />
      </Routes>
    </Router>
  );
}

// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  ShoppingCart,
  ClipboardList,
  ExternalLink,
  Shield,
  LogOut,
  Calendar,
  Download,
  RefreshCcw,
  Trophy,
} from "lucide-react";

import { COOLERS, MENU } from "./data.js";
import { supabase } from "./supabaseClient";
import { applyTheme } from "./theme.js";

const SURVEY_URL = "https://survey.mphi.org/surveys/?s=HD7C7FPHNCEWFXR3";

const pageAnim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

function money(n) {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysISO(baseISO, days) {
  const d = new Date(`${baseISO}T00:00:00`);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function monthStartISO(iso) {
  const d = new Date(`${iso}T00:00:00`);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}

function monthEndISO(iso) {
  const d = new Date(`${iso}T00:00:00`);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function prevMonthStartISO(iso) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}

function prevMonthEndISO(iso) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(1);
  d.setDate(0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isoDateFromCreatedAt(created_at) {
  if (!created_at) return null;
  const d = new Date(created_at);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Week starts on Monday
function startOfWeekISO(isoDate) {
  const d = new Date(`${isoDate}T00:00:00`);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  d.setDate(d.getDate() + diff);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// EXCLUDE-ZERO helper (new)
function bestByMetric(rows, metricKey) {
  const eligible = (rows || []).filter((r) => Number(r?.[metricKey] || 0) > 0);
  if (!eligible.length) return null;

  let best = eligible[0];
  for (const r of eligible) {
    if (Number(r[metricKey] || 0) > Number(best[metricKey] || 0)) best = r;
  }
  return best;
}

const Shell = ({ children }) => {
  const location = useLocation();
  const isManager = location.pathname.startsWith("/manager");

  return (
    <div style={{ minHeight: "100vh", background: "var(--harc-bg)", color: "var(--harc-text)" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--harc-bg)",
          borderBottom: "1px solid var(--harc-border)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                background: "var(--harc-orange)",
                display: "grid",
                placeItems: "center",
                color: "white",
                fontWeight: 900,
              }}
              aria-label="HaRC"
              title="HaRC"
            >
              H
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 900, fontSize: 16 }}>HaRC Healthy Coolers</div>
              <div style={{ fontSize: 12, color: "var(--harc-muted)" }}>
                Find • Order • Survey • Get Help
              </div>
            </div>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!isManager ? (
              <>
                <NavLink to="/" label="Coolers" icon={<MapPin size={16} />} />
                <NavLink to="/cart" label="Cart" icon={<ShoppingCart size={16} />} />
                <NavLink to="/survey" label="Survey" icon={<ClipboardList size={16} />} />
                <NavLink to="/help" label="Help" icon={<ExternalLink size={16} />} />
                <NavLink to="/manager" label="Manager" icon={<Shield size={16} />} />
              </>
            ) : (
              <NavLink to="/" label="Back to Customer" icon={<LogOut size={16} />} />
            )}
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 16px 36px" }}>
        {children}
      </main>

      <footer style={{ borderTop: "1px solid var(--harc-border)", padding: "16px" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            color: "var(--harc-muted)",
            fontSize: 12,
          }}
        >
          <span>Authority Health • Healthy & Resilient Communities (HaRC)</span>
          <span>Detroit, MI</span>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({ to, label, icon }) => {
  return (
    <Link
      to={to}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 999,
        border: "1px solid var(--harc-border)",
        background: "white",
        textDecoration: "none",
        color: "var(--harc-text)",
        fontSize: 13,
        fontWeight: 900,
      }}
    >
      {icon}
      {label}
    </Link>
  );
};

const Card = ({ children, style }) => (
  <div
    style={{
      background: "var(--harc-card)",
      border: "1px solid var(--harc-border)",
      borderRadius: 18,
      padding: 16,
      boxShadow: "0 6px 18px rgba(17,24,39,0.06)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, type = "button", variant = "primary", disabled }) => {
  const isPrimary = variant === "primary";
  const bg = isPrimary ? "var(--harc-orange)" : "white";
  const fg = isPrimary ? "white" : "var(--harc-text)";
  const border = isPrimary ? "var(--harc-orange)" : "var(--harc-border)";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${border}`,
        background: bg,
        color: fg,
        fontWeight: 900,
        fontSize: 14,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
};

const Pill = ({ active, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${active ? "var(--harc-green)" : "var(--harc-border)"}`,
        background: active ? "var(--harc-soft-green-bg)" : "white",
        color: "var(--harc-text)",
        fontWeight: 900,
        fontSize: 12,
      }}
    >
      {label}
    </button>
  );
};

export default function App() {
  useEffect(() => {
    applyTheme();
  }, []);

  const [selectedCoolerId, setSelectedCoolerId] = useState(COOLERS?.[0]?.cooler_id || "");
  const [cart, setCart] = useState([]); // {id, name, price, qty}
  const [lastOrderId, setLastOrderId] = useState(null);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);

  const [managerUnlocked, setManagerUnlocked] = useState(false);

  const navigate = useNavigate();

  const selectedCooler = useMemo(
    () => COOLERS.find((c) => c.cooler_id === selectedCoolerId) || COOLERS[0],
    [selectedCoolerId]
  );

  const menuItems = useMemo(() => {
    if (Array.isArray(MENU)) return MENU;
    if (MENU && typeof MENU === "object") {
      return MENU[selectedCoolerId] || MENU.default || [];
    }
    return [];
  }, [selectedCoolerId]);

  const cartCount = useMemo(() => cart.reduce((sum, x) => sum + x.qty, 0), [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, x) => sum + Number(x.price || 0) * Number(x.qty || 0), 0);
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const decFromCart = (id) => {
    setCart((prev) => {
      const found = prev.find((p) => p.id === id);
      if (!found) return prev;
      if (found.qty <= 1) return prev.filter((p) => p.id !== id);
      return prev.map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p));
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((p) => p.id !== id));
  const clearCart = () => setCart([]);

  const checkout = async () => {
    if (!selectedCoolerId) {
      alert("Select a cooler first.");
      navigate("/");
      return;
    }
    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    const payload = {
      cooler_id: selectedCoolerId,
      items: cart.map((x) => ({ id: x.id, name: x.name, price: x.price, qty: x.qty })),
      total: Number(subtotal.toFixed(2)),
    };

    try {
      const { data, error } = await supabase.from("orders").insert(payload).select("id").single();
      if (error) throw error;

      setLastOrderId(data?.id ?? null);
      setLastOrderTotal(payload.total);
      clearCart();

      navigate("/confirm");
    } catch (e) {
      console.error(e);
      alert(`Checkout failed.\n\nDetails: ${e?.message || "Unknown error"}`);
    }
  };

  return (
    <Shell>
      <Routes>
        <Route
          path="/"
          element={
            <motion.div {...pageAnim}>
              <CoolersPage
                selectedCoolerId={selectedCoolerId}
                setSelectedCoolerId={setSelectedCoolerId}
                selectedCooler={selectedCooler}
                cartCount={cartCount}
                onGoMenu={() => navigate("/menu")}
              />
            </motion.div>
          }
        />

        <Route
          path="/menu"
          element={
            <motion.div {...pageAnim}>
              <MenuPage
                selectedCooler={selectedCooler}
                menuItems={menuItems}
                onAdd={addToCart}
                onGoCart={() => navigate("/cart")}
                cartCount={cartCount}
              />
            </motion.div>
          }
        />

        <Route
          path="/cart"
          element={
            <motion.div {...pageAnim}>
              <CartPage
                selectedCooler={selectedCooler}
                cart={cart}
                subtotal={subtotal}
                onAdd={(x) => addToCart(x)}
                onDec={(id) => decFromCart(id)}
                onRemove={(id) => removeFromCart(id)}
                onCheckout={checkout}
                onBack={() => navigate("/menu")}
              />
            </motion.div>
          }
        />

        <Route
          path="/confirm"
          element={
            <motion.div {...pageAnim}>
              <ConfirmPage
                orderId={lastOrderId}
                total={lastOrderTotal}
                cooler={selectedCooler}
                onGoSurvey={() => navigate("/survey")}
                onGoCoolers={() => navigate("/")}
              />
            </motion.div>
          }
        />

        <Route
          path="/survey"
          element={
            <motion.div {...pageAnim}>
              <SurveyPage onOpenSurvey={() => window.open(SURVEY_URL, "_blank")} />
            </motion.div>
          }
        />

        <Route
          path="/help"
          element={
            <motion.div {...pageAnim}>
              <HelpPage selectedCoolerId={selectedCoolerId} />
            </motion.div>
          }
        />

        <Route
          path="/manager"
          element={
            <motion.div {...pageAnim}>
              <ManagerHome
                unlocked={managerUnlocked}
                setUnlocked={setManagerUnlocked}
                onGoAnalytics={() => navigate("/manager/analytics")}
              />
            </motion.div>
          }
        />

        <Route
          path="/manager/analytics"
          element={
            <motion.div {...pageAnim}>
              <ManagerAnalytics unlocked={managerUnlocked} />
            </motion.div>
          }
        />

        <Route
          path="*"
          element={
            <motion.div {...pageAnim}>
              <Card>
                <div style={{ fontWeight: 900, fontSize: 18 }}>Page not found</div>
                <div style={{ color: "var(--harc-muted)", marginTop: 6 }}>
                  Use the navigation above to continue.
                </div>
                <div style={{ marginTop: 12 }}>
                  <Button onClick={() => navigate("/")}>Go to Coolers</Button>
                </div>
              </Card>
            </motion.div>
          }
        />
      </Routes>
    </Shell>
  );
}

/* ------------------------- Customer Pages ------------------------- */

function CoolersPage({ selectedCoolerId, setSelectedCoolerId, selectedCooler, cartCount, onGoMenu }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Select a Cooler</div>
            <div style={{ color: "var(--harc-muted)", marginTop: 6 }}>
              Choose the location you’re shopping from.
            </div>
          </div>
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid var(--harc-border)",
              background: "white",
              fontWeight: 900,
            }}
          >
            Cart: {cartCount}
          </div>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {COOLERS.map((c) => {
            const active = c.cooler_id === selectedCoolerId;
            return (
              <button
                key={c.cooler_id}
                onClick={() => setSelectedCoolerId(c.cooler_id)}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 16,
                  border: `2px solid ${active ? "var(--harc-green)" : "var(--harc-border)"}`,
                  background: active ? "var(--harc-soft-green-bg)" : "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={16} />
                  {c.name}
                </div>
                <div style={{ color: "var(--harc-muted)", marginTop: 4 }}>{c.address}</div>
                {c.notes ? (
                  <div style={{ color: "var(--harc-muted)", marginTop: 4, fontSize: 12 }}>
                    Notes: {c.notes}
                  </div>
                ) : null}
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--harc-muted)" }}>
                  ID: <span style={{ fontWeight: 900 }}>{c.cooler_id}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onGoMenu}>Continue to Menu</Button>
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 900 }}>Selected</div>
        <div style={{ marginTop: 6 }}>
          <div style={{ fontWeight: 900 }}>{selectedCooler?.name}</div>
          <div style={{ color: "var(--harc-muted)" }}>{selectedCooler?.address}</div>
        </div>
      </Card>
    </div>
  );
}

function MenuPage({ selectedCooler, menuItems, onAdd, onGoCart, cartCount }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Menu</div>
            <div style={{ color: "var(--harc-muted)", marginTop: 6 }}>
              Shopping at <span style={{ fontWeight: 900 }}>{selectedCooler?.name}</span>
            </div>
          </div>
          <Button variant="secondary" onClick={onGoCart}>
            View Cart ({cartCount})
          </Button>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 12,
          }}
        >
          {menuItems?.length ? (
            menuItems.map((item) => (
              <Card key={item.id} style={{ padding: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>{item.name}</div>
                {item.desc ? (
                  <div style={{ color: "var(--harc-muted)", marginTop: 6, fontSize: 13 }}>
                    {item.desc}
                  </div>
                ) : null}
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{money(item.price)}</div>
                  <Button onClick={() => onAdd(item)}>Add</Button>
                </div>
              </Card>
            ))
          ) : (
            <div style={{ color: "var(--harc-muted)" }}>
              No menu items found. If MENU is keyed by cooler, ensure it has an entry for this cooler_id.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function CartPage({ selectedCooler, cart, subtotal, onAdd, onDec, onRemove, onCheckout, onBack }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Cart</div>
            <div style={{ color: "var(--harc-muted)", marginTop: 6 }}>
              Cooler: <span style={{ fontWeight: 900 }}>{selectedCooler?.name}</span>
            </div>
          </div>
          <Button variant="secondary" onClick={onBack}>
            Back to Menu
          </Button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {cart.length ? (
            cart.map((x) => (
              <div
                key={x.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                  padding: 12,
                  border: "1px solid var(--harc-border)",
                  borderRadius: 16,
                  background: "white",
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>{x.name}</div>
                  <div style={{ color: "var(--harc-muted)", fontSize: 13 }}>{money(x.price)}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Button variant="secondary" onClick={() => onDec(x.id)}>
                    −
                  </Button>
                  <div style={{ width: 28, textAlign: "center", fontWeight: 900 }}>{x.qty}</div>
                  <Button variant="secondary" onClick={() => onAdd(x)}>
                    +
                  </Button>
                  <Button variant="secondary" onClick={() => onRemove(x.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "var(--harc-muted)" }}>Your cart is empty.</div>
          )}
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Subtotal: {money(subtotal)}</div>
          <Button onClick={onCheckout} disabled={!cart.length}>
            Checkout
          </Button>
        </div>
      </Card>
    </div>
  );
}

function ConfirmPage({ orderId, total, cooler, onGoSurvey, onGoCoolers }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Order Confirmed</div>
        <div style={{ color: "var(--harc-muted)", marginTop: 6 }}>
          Thank you. Your order has been recorded.
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <div>
            <span style={{ color: "var(--harc-muted)" }}>Cooler:</span>{" "}
            <span style={{ fontWeight: 900 }}>{cooler?.name}</span>
          </div>
          <div>
            <span style={{ color: "var(--harc-muted)" }}>Order ID:</span>{" "}
            <span style={{ fontWeight: 900 }}>{orderId ?? "—"}</span>
          </div>
          <div>
            <span style={{ color: "var(--harc-muted)" }}>Total:</span>{" "}
            <span style={{ fontWeight: 900 }}>{money(total)}</span>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button onClick={onGoSurvey}>Continue to Survey</Button>
          <Button variant="secondary" onClick={onGoCoolers}>
            Back to Coolers
          </Button>
        </div>
      </Card>
    </div>
  );
}

function SurveyPage({ onOpenSurvey }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Quick Survey</div>
        <div style={{ color: "var(--harc-muted)", marginTop: 6 }}>
          Your feedback helps improve cooler options and access.
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button onClick={onOpenSurvey}>
            Open Official Survey{" "}
            <ExternalLink size={16} style={{ marginLeft: 8, verticalAlign: "middle" }} />
          </Button>
          <a href={SURVEY_URL} target="_blank" rel="noreferrer" style={{ fontWeight: 900, textDecoration: "none" }}>
            Or copy link
          </a>
        </div>
      </Card>
    </div>
  );
}

function HelpPage({ selectedCoolerId }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("Medicaid/Medicare Help");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name, phone, topic, notes, cooler_id: selectedCoolerId || null };
      const { error } = await supabase.from("help_requests").insert(payload);
      if (error) throw error;

      alert("Request submitted. A team member will follow up.");
      setName("");
      setPhone("");
      setNotes("");
    } catch (err) {
      console.error(err);
      alert(`Help request failed.\n\n${err?.message || ""}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Get Assistance</div>
        <div style={{ color: "var(--harc-muted)", marginTop: 6 }}>
          Request help with insurance, primary care, or program navigation.
        </div>

        <form onSubmit={submit} style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle()} />
          </Field>
          <Field label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle()} />
          </Field>
          <Field label="Topic">
            <select value={topic} onChange={(e) => setTopic(e.target.value)} style={inputStyle()}>
              <option>Medicaid/Medicare Help</option>
              <option>Find a Primary Care Provider</option>
              <option>Food Access / Cooler Support</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Notes (optional)">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} style={inputStyle()} />
          </Field>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" disabled={saving}>
              {saving ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <div style={{ fontWeight: 900, fontSize: 13 }}>{label}</div>
      {children}
    </label>
  );
}

function inputStyle() {
  return {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid var(--harc-border)",
    outline: "none",
    fontSize: 14,
    background: "white",
  };
}

/* ------------------------- Manager Pages ------------------------- */

function ManagerHome({ unlocked, setUnlocked, onGoAnalytics }) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const unlock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("manager_unlock", { pin });
      if (error) throw error;

      const ok =
        data === true ||
        data === 1 ||
        (typeof data === "object" && data !== null) ||
        Array.isArray(data);

      if (!ok) {
        alert("Invalid PIN.");
        return;
      }

      setUnlocked(true);
      onGoAnalytics();
    } catch (err) {
      console.error(err);
      alert(
        `Manager unlock failed.\nConfirm function exists and param name is exactly "pin".\n\nDetails: ${
          err?.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const lock = () => {
    setUnlocked(false);
    setPin("");
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Manager</div>
            <div style={{ color: "var(--harc-muted)", marginTop: 6 }}>
              PIN-gated analytics for cooler performance.
            </div>
          </div>

          {unlocked ? (
            <Button variant="secondary" onClick={lock}>
              Lock
            </Button>
          ) : null}
        </div>

        {!unlocked ? (
          <form onSubmit={unlock} style={{ marginTop: 12, display: "grid", gap: 10, maxWidth: 420 }}>
            <Field label="Manager PIN">
              <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter PIN" style={inputStyle()} />
            </Field>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="submit" disabled={loading || !pin}>
                {loading ? "Unlocking..." : "Unlock"}
              </Button>
            </div>
          </form>
        ) : (
          <div style={{ marginTop: 12 }}>
            <Button onClick={onGoAnalytics}>Go to Analytics</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function ManagerAnalytics({ unlocked }) {
  const ISO_TODAY = todayISO();

  const [dateFrom, setDateFrom] = useState(addDaysISO(ISO_TODAY, -30));
  const [dateTo, setDateTo] = useState(ISO_TODAY);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rows, setRows] = useState([]); // per-cooler summary rows
  const [ordersRaw, setOrdersRaw] = useState([]); // raw orders in range (for rollups)

  const [tab, setTab] = useState("coolers"); // coolers | weekly | daily

  const normalized = useMemo(() => {
    const byId = new Map();
    for (const r of rows || []) byId.set(r.cooler_id, r);

    return COOLERS.map((c) => {
      const r = byId.get(c.cooler_id) || {};
      return {
        cooler_id: c.cooler_id,
        cooler_name: c.name,
        orders_count: Number(r.orders_count || 0),
        items_count: Number(r.items_count || 0),
        revenue_total: Number(r.revenue_total || 0),
      };
    });
  }, [rows]);

  const totals = useMemo(() => {
    return normalized.reduce(
      (acc, r) => {
        acc.orders += r.orders_count;
        acc.items += r.items_count;
        acc.revenue += r.revenue_total;
        return acc;
      },
      { orders: 0, items: 0, revenue: 0 }
    );
  }, [normalized]);

  // TOP PERFORMERS (exclude zeros)
  const topRevenue = useMemo(() => bestByMetric(normalized, "revenue_total"), [normalized]);
  const topOrders = useMemo(() => bestByMetric(normalized, "orders_count"), [normalized]);
  const topItems = useMemo(() => bestByMetric(normalized, "items_count"), [normalized]);

  const dailyRollups = useMemo(() => {
    const byDay = new Map();

    for (const o of ordersRaw || []) {
      const dayISO = isoDateFromCreatedAt(o.created_at);
      if (!dayISO) continue;

      const cur = byDay.get(dayISO) || { day: dayISO, orders: 0, items: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += Number(o.total || 0);

      const items = Array.isArray(o.items) ? o.items : [];
      cur.items += items.reduce((s, x) => s + Number(x.qty || 0), 0);

      byDay.set(dayISO, cur);
    }

    return Array.from(byDay.values()).sort((a, b) => (a.day > b.day ? -1 : 1)); // newest first
  }, [ordersRaw]);

  const weeklyRollups = useMemo(() => {
    const byWeek = new Map();

    for (const o of ordersRaw || []) {
      const dayISO = isoDateFromCreatedAt(o.created_at);
      if (!dayISO) continue;

      const weekStart = startOfWeekISO(dayISO);
      const weekEnd = addDaysISO(weekStart, 6);

      const key = weekStart;
      const cur = byWeek.get(key) || {
        week_start: weekStart,
        week_end: weekEnd,
        orders: 0,
        items: 0,
        revenue: 0,
      };

      cur.orders += 1;
      cur.revenue += Number(o.total || 0);

      const items = Array.isArray(o.items) ? o.items : [];
      cur.items += items.reduce((s, x) => s + Number(x.qty || 0), 0);

      byWeek.set(key, cur);
    }

    return Array.from(byWeek.values()).sort((a, b) => (a.week_start > b.week_start ? -1 : 1)); // newest first
  }, [ordersRaw]);

  const fetchOrdersForRollups = async () => {
    const { data: orders, error: qerr } = await supabase
      .from("orders")
      .select("cooler_id,total,items,created_at")
      .gte("created_at", `${dateFrom}T00:00:00`)
      .lte("created_at", `${dateTo}T23:59:59`);

    if (qerr) throw qerr;
    setOrdersRaw(Array.isArray(orders) ? orders : []);
  };

  const fetchAnalytics = async () => {
    if (!unlocked) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.rpc("manager_analytics", {
        date_from: dateFrom,
        date_to: dateTo,
      });
      if (error) throw error;
      setRows(Array.isArray(data) ? data : []);

      await fetchOrdersForRollups();
    } catch (err) {
      console.error(err);

      try {
        const { data: orders, error: qerr } = await supabase
          .from("orders")
          .select("cooler_id,total,items,created_at")
          .gte("created_at", `${dateFrom}T00:00:00`)
          .lte("created_at", `${dateTo}T23:59:59`);
        if (qerr) throw qerr;

        setOrdersRaw(Array.isArray(orders) ? orders : []);

        const roll = new Map();
        for (const o of orders || []) {
          const id = o.cooler_id;
          const cur = roll.get(id) || { cooler_id: id, orders_count: 0, items_count: 0, revenue_total: 0 };
          cur.orders_count += 1;
          cur.revenue_total += Number(o.total || 0);

          const items = Array.isArray(o.items) ? o.items : [];
          cur.items_count += items.reduce((s, x) => s + Number(x.qty || 0), 0);

          roll.set(id, cur);
        }

        setRows(Array.from(roll.values()));
        setErrorMsg(`RPC not available. Using fallback query from orders table.\n(${err?.message || "RPC error"})`);
      } catch (fallbackErr) {
        console.error(fallbackErr);
        setErrorMsg(fallbackErr?.message || "Analytics failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  const downloadCSV = () => {
    const header = ["cooler_id", "cooler_name", "orders_count", "items_count", "revenue_total"];
    const lines = [header.join(",")].concat(
      normalized.map((r) =>
        [
          r.cooler_id,
          `"${(r.cooler_name || "").replaceAll('"', '""')}"`,
          r.orders_count,
          r.items_count,
          r.revenue_total,
        ].join(",")
      )
    );

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harc_analytics_${dateFrom}_to_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadWeeklyCSV = () => {
    const header = ["week_start", "week_end", "orders", "items", "revenue"];
    const lines = [header.join(",")].concat(
      weeklyRollups.map((w) =>
        [w.week_start, w.week_end, w.orders, w.items, Number(w.revenue || 0).toFixed(2)].join(",")
      )
    );

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harc_weekly_rollups_${dateFrom}_to_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDailyCSV = () => {
    const header = ["day", "orders", "items", "revenue"];
    const lines = [header.join(",")].concat(
      dailyRollups.map((d) => [d.day, d.orders, d.items, Number(d.revenue || 0).toFixed(2)].join(","))
    );

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harc_daily_rollups_${dateFrom}_to_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setRange = (rangeId) => {
    const t = todayISO();

    if (rangeId === "7") {
      setDateFrom(addDaysISO(t, -7));
      setDateTo(t);
      return;
    }
    if (rangeId === "30") {
      setDateFrom(addDaysISO(t, -30));
      setDateTo(t);
      return;
    }
    if (rangeId === "mtd") {
      setDateFrom(monthStartISO(t));
      setDateTo(t);
      return;
    }
    if (rangeId === "this_month") {
      setDateFrom(monthStartISO(t));
      setDateTo(monthEndISO(t));
      return;
    }
    if (rangeId === "last_month") {
      setDateFrom(prevMonthStartISO(t));
      setDateTo(prevMonthEndISO(t));
      return;
    }
    if (rangeId === "all") {
      setDateFrom("2000-01-01");
      setDateTo(t);
      return;
    }
  };

  const rangeKey = useMemo(() => `${dateFrom}_${dateTo}`, [dateFrom, dateTo]);

  if (!unlocked) {
    return (
      <Card>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Locked</div>
        <div style={{ color: "var(--harc-muted)", marginTop: 6 }}>
          Go to Manager and unlock with PIN to view analytics.
        </div>
        <div style={{ marginTop: 12 }}>
          <Link to="/manager" style={{ fontWeight: 900, textDecoration: "none" }}>
            Go to Manager
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>Manager Analytics</div>
            <div style={{ color: "var(--harc-muted)", marginTop: 6 }}>
              Rollups by cooler + weekly/daily summaries (includes zero-activity locations).
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={fetchAnalytics} disabled={loading}>
              <RefreshCcw size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              {loading ? "Refreshing..." : "Refresh"}
            </Button>

            <Button variant="secondary" onClick={downloadCSV}>
              <Download size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Export Cooler CSV
            </Button>

            <Button variant="secondary" onClick={downloadWeeklyCSV} disabled={!weeklyRollups.length}>
              <Download size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Export Weekly CSV
            </Button>

            <Button variant="secondary" onClick={downloadDailyCSV} disabled={!dailyRollups.length}>
              <Download size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Export Daily CSV
            </Button>
          </div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill label="Last 7" onClick={() => setRange("7")} />
          <Pill label="Last 30" onClick={() => setRange("30")} />
          <Pill label="MTD" onClick={() => setRange("mtd")} />
          <Pill label="This Month" onClick={() => setRange("this_month")} />
          <Pill label="Last Month" onClick={() => setRange("last_month")} />
          <Pill label="All Time" onClick={() => setRange("all")} />
          <div style={{ color: "var(--harc-muted)", fontSize: 12, alignSelf: "center", marginLeft: 6 }}>
            Range: <span style={{ fontWeight: 900 }}>{dateFrom}</span> →{" "}
            <span style={{ fontWeight: 900 }}>{dateTo}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          <Field label="Date From">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Calendar size={16} />
              <input value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} type="date" style={inputStyle()} />
            </div>
          </Field>
          <Field label="Date To">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Calendar size={16} />
              <input value={dateTo} onChange={(e) => setDateTo(e.target.value)} type="date" style={inputStyle()} />
            </div>
          </Field>
        </div>

        {errorMsg ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 14,
              border: "1px solid var(--harc-danger-border)",
              background: "var(--harc-danger-bg)",
            }}
          >
            <div style={{ fontWeight: 900 }}>Note</div>
            <div style={{ color: "var(--harc-danger-text)", marginTop: 6, whiteSpace: "pre-wrap" }}>
              {errorMsg}
            </div>
          </div>
        ) : null}

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 10,
          }}
        >
          <Card style={{ padding: 14, borderColor: "var(--harc-soft-green-border)" }}>
            <div style={{ color: "var(--harc-muted)", fontWeight: 900 }}>Total Orders</div>
            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{totals.orders}</div>
          </Card>
          <Card style={{ padding: 14, borderColor: "var(--harc-soft-green-border)" }}>
            <div style={{ color: "var(--harc-muted)", fontWeight: 900 }}>Total Items</div>
            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{totals.items}</div>
          </Card>
          <Card style={{ padding: 14, borderColor: "var(--harc-soft-green-border)" }}>
            <div style={{ color: "var(--harc-muted)", fontWeight: 900 }}>Total Revenue</div>
            <div style={{ fontWeight: 900, fontSize: 22, marginTop: 6 }}>{money(totals.revenue)}</div>
          </Card>
        </div>

        {/* Top performers (exclude zeros) */}
        <div
          style={{
            marginTop: 10,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 10,
          }}
        >
          <Card style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
              <Trophy size={16} />
              Top Revenue Cooler
            </div>
            {topRevenue ? (
              <>
                <div style={{ marginTop: 8, fontWeight: 900, fontSize: 18 }}>{topRevenue.cooler_name}</div>
                <div style={{ color: "var(--harc-muted)", fontSize: 12 }}>ID: {topRevenue.cooler_id}</div>
                <div style={{ marginTop: 8, fontWeight: 900, fontSize: 20 }}>{money(topRevenue.revenue_total)}</div>
              </>
            ) : (
              <div style={{ marginTop: 8, color: "var(--harc-muted)" }}>
                No revenue in this date range.
              </div>
            )}
          </Card>

          <Card style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
              <Trophy size={16} />
              Top Orders Cooler
            </div>
            {topOrders ? (
              <>
                <div style={{ marginTop: 8, fontWeight: 900, fontSize: 18 }}>{topOrders.cooler_name}</div>
                <div style={{ color: "var(--harc-muted)", fontSize: 12 }}>ID: {topOrders.cooler_id}</div>
                <div style={{ marginTop: 8, fontWeight: 900, fontSize: 20 }}>{topOrders.orders_count}</div>
              </>
            ) : (
              <div style={{ marginTop: 8, color: "var(--harc-muted)" }}>
                No orders in this date range.
              </div>
            )}
          </Card>

          <Card style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
              <Trophy size={16} />
              Top Items Cooler
            </div>
            {topItems ? (
              <>
                <div style={{ marginTop: 8, fontWeight: 900, fontSize: 18 }}>{topItems.cooler_name}</div>
                <div style={{ color: "var(--harc-muted)", fontSize: 12 }}>ID: {topItems.cooler_id}</div>
                <div style={{ marginTop: 8, fontWeight: 900, fontSize: 20 }}>{topItems.items_count}</div>
              </>
            ) : (
              <div style={{ marginTop: 8, color: "var(--harc-muted)" }}>
                No items sold in this date range.
              </div>
            )}
          </Card>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Pill active={tab === "coolers"} label="By Cooler" onClick={() => setTab("coolers")} />
          <Pill active={tab === "weekly"} label="Weekly Rollups" onClick={() => setTab("weekly")} />
          <Pill active={tab === "daily"} label="Daily Rollups" onClick={() => setTab("daily")} />
          <div style={{ color: "var(--harc-muted)", fontSize: 12, alignSelf: "center", marginLeft: 6 }}>
            Orders loaded for rollups: <span style={{ fontWeight: 900 }}>{(ordersRaw || []).length}</span>{" "}
            <span style={{ color: "var(--harc-muted)" }}>(key: {rangeKey})</span>
          </div>
        </div>
      </Card>

      {tab === "coolers" ? (
        <Card>
          <div style={{ fontWeight: 900, fontSize: 16 }}>By Cooler</div>
          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Cooler", "Orders", "Items", "Revenue"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 10px",
                        borderBottom: "1px solid var(--harc-border)",
                        color: "var(--harc-muted)",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {normalized.map((r) => (
                  <tr key={r.cooler_id}>
                    <td style={tdStyle()}>
                      <div style={{ fontWeight: 900 }}>{r.cooler_name}</div>
                      <div style={{ color: "var(--harc-muted)", fontSize: 12 }}>ID: {r.cooler_id}</div>
                    </td>
                    <td style={tdStyle()}>{r.orders_count}</td>
                    <td style={tdStyle()}>{r.items_count}</td>
                    <td style={tdStyle()}>{money(r.revenue_total)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...tdStyle(), fontWeight: 900 }}>Totals</td>
                  <td style={{ ...tdStyle(), fontWeight: 900 }}>{totals.orders}</td>
                  <td style={{ ...tdStyle(), fontWeight: 900 }}>{totals.items}</td>
                  <td style={{ ...tdStyle(), fontWeight: 900 }}>{money(totals.revenue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === "weekly" ? (
        <Card>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Weekly Rollups</div>
          <div style={{ color: "var(--harc-muted)", fontSize: 12, marginTop: 6 }}>
            Week starts Monday. Revenue and items are summed from orders in the selected date range.
          </div>

          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Week", "Orders", "Items", "Revenue"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 10px",
                        borderBottom: "1px solid var(--harc-border)",
                        color: "var(--harc-muted)",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeklyRollups.length ? (
                  weeklyRollups.map((w) => (
                    <tr key={w.week_start}>
                      <td style={tdStyle()}>
                        <div style={{ fontWeight: 900 }}>
                          {w.week_start} → {w.week_end}
                        </div>
                        <div style={{ color: "var(--harc-muted)", fontSize: 12 }}>Week of {w.week_start}</div>
                      </td>
                      <td style={tdStyle()}>{w.orders}</td>
                      <td style={tdStyle()}>{w.items}</td>
                      <td style={tdStyle()}>{money(w.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={tdStyle()} colSpan={4}>
                      <span style={{ color: "var(--harc-muted)" }}>
                        No orders found in this range. Try “All Time” or expand the dates, then Refresh.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {tab === "daily" ? (
        <Card>
          <div style={{ fontWeight: 900, fontSize: 16 }}>Daily Rollups</div>
          <div style={{ color: "var(--harc-muted)", fontSize: 12, marginTop: 6 }}>
            Daily totals from orders in the selected date range.
          </div>

          <div style={{ overflowX: "auto", marginTop: 10 }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Day", "Orders", "Items", "Revenue"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "10px 10px",
                        borderBottom: "1px solid var(--harc-border)",
                        color: "var(--harc-muted)",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dailyRollups.length ? (
                  dailyRollups.map((d) => (
                    <tr key={d.day}>
                      <td style={tdStyle()}>
                        <div style={{ fontWeight: 900 }}>{d.day}</div>
                      </td>
                      <td style={tdStyle()}>{d.orders}</td>
                      <td style={tdStyle()}>{d.items}</td>
                      <td style={tdStyle()}>{money(d.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={tdStyle()} colSpan={4}>
                      <span style={{ color: "var(--harc-muted)" }}>
                        No orders found in this range. Try “All Time” or expand the dates, then Refresh.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function tdStyle() {
  return {
    padding: "12px 10px",
    borderBottom: "1px solid var(--harc-border)",
    fontSize: 14,
  };
}

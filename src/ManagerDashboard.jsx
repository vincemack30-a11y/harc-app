// src/ManagerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

const TABS = ["orders", "help", "restock"];

const DATE_RANGES = [
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "all", label: "All recent" },
];

// PIN comes from env; falls back to 1357 if missing
const MANAGER_PIN =
  import.meta.env.VITE_MANAGER_PIN &&
  import.meta.env.VITE_MANAGER_PIN.toString().trim() !== ""
    ? import.meta.env.VITE_MANAGER_PIN.toString().trim()
    : "1357";

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Summary metrics
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [lastOrderTime, setLastOrderTime] = useState("");

  // Filters
  const [dateRange, setDateRange] = useState("7");
  const [coolerFilter, setCoolerFilter] = useState("all");

  // PIN gate
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        let safeOrders = [];
        if (ordersError) {
          console.error("ManagerDashboard orders error:", ordersError);
        } else if (ordersData) {
          safeOrders = ordersData;
        }
        setOrders(safeOrders);

        // Help / intake
        const { data: intakeData, error: intakeError } = await supabase
          .from("intake")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (intakeError) {
          console.error("ManagerDashboard intake error:", intakeError);
          setHelpRequests([]);
        } else {
          setHelpRequests(intakeData || []);
        }
      } catch (err) {
        console.error("ManagerDashboard unexpected error:", err);
        setOrders([]);
        setHelpRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Unique cooler IDs from orders
  const coolerIds = React.useMemo(() => {
    const ids = orders
      .map((o) => o.cooler_id ?? o.cooler ?? null)
      .filter(Boolean);
    return Array.from(new Set(ids));
  }, [orders]);

  // Apply date + cooler filters
  const filterOrders = (ordersList) => {
    if (!ordersList.length) return [];

    let filtered = ordersList;

    if (dateRange !== "all") {
      const days = dateRange === "7" ? 7 : 30;
      const now = new Date();
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((order) => {
        if (!order.created_at) return false;
        const created = new Date(order.created_at);
        return created >= cutoff;
      });
    }

    if (coolerFilter !== "all") {
      filtered = filtered.filter((order) => {
        const cid = order.cooler_id ?? order.cooler ?? null;
        return cid === coolerFilter;
      });
    }

    return filtered;
  };

  const visibleOrders = filterOrders(orders);

  // Summary metrics from visibleOrders
  useEffect(() => {
    if (!visibleOrders.length) {
      setTotalOrders(0);
      setTotalItems(0);
      setTotalRevenue(0);
      setLastOrderTime("");
      return;
    }

    const numOrders = visibleOrders.length;
    let itemsCount = 0;
    let revenue = 0;

    visibleOrders.forEach((order) => {
      const itemsArray = Array.isArray(order.items) ? order.items : [];
      const orderItemsCount =
        typeof order.total_items === "number"
          ? order.total_items
          : itemsArray.reduce(
              (sum, item) => sum + (Number(item.qty) || 1),
              0
            );
      itemsCount += orderItemsCount;

      if (order.subtotal !== undefined && order.subtotal !== null) {
        const n = Number(order.subtotal);
        if (!Number.isNaN(n)) revenue += n;
      }
    });

    setTotalOrders(numOrders);
    setTotalItems(itemsCount);
    setTotalRevenue(revenue);

    const latest = visibleOrders[0];
    if (latest?.created_at) {
      setLastOrderTime(
        new Date(latest.created_at).toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short",
        })
      );
    } else {
      setLastOrderTime("");
    }
  }, [visibleOrders]);

  // Orders per day (tiny trend)
  const ordersPerDay = React.useMemo(() => {
    if (!visibleOrders.length) return [];

    const map = new Map();

    visibleOrders.forEach((order) => {
      if (!order.created_at) return;
      const d = new Date(order.created_at);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const existing = map.get(key) || { date: key, count: 0 };
      existing.count += 1;
      map.set(key, existing);
    });

    const result = Array.from(map.values());
    result.sort((a, b) => (a.date > b.date ? 1 : -1));
    return result;
  }, [visibleOrders]);

  const maxOrdersPerDay = React.useMemo(() => {
    if (!ordersPerDay.length) return 0;
    return ordersPerDay.reduce(
      (max, entry) => (entry.count > max ? entry.count : max),
      0
    );
  }, [ordersPerDay]);

  // CSV builders
  const buildOrdersCsv = (ordersList) => {
    const header = [
      "order_id",
      "created_at",
      "cooler_id",
      "total_items",
      "subtotal",
      "items_summary",
    ];

    const rows = ordersList.map((order) => {
      const created = order.created_at || "";
      const itemsArray = Array.isArray(order.items) ? order.items : [];

      const orderItemsCount =
        typeof order.total_items === "number"
          ? order.total_items
          : itemsArray.reduce(
              (sum, item) => sum + (Number(item.qty) || 1),
              0
            );

      const subtotal =
        order.subtotal !== undefined && order.subtotal !== null
          ? Number(order.subtotal).toFixed(2)
          : "";

      const itemsSummary = itemsArray
        .map((item) => {
          const qty = item.qty || 1;
          const name = item.name || "Item";
          return `${qty}x ${name}`;
        })
        .join("; ");

      const coolerId = order.cooler_id ?? order.cooler ?? "";

      const raw = [
        order.id ?? "",
        created,
        coolerId,
        orderItemsCount,
        subtotal,
        itemsSummary,
      ];

      return raw
        .map((field) => {
          const str = String(field ?? "");
          if (str.includes('"')) {
            const escaped = str.replace(/"/g, '""');
            return `"${escaped}"`;
          }
          if (str.includes(",") || str.includes(";")) {
            return `"${str}"`;
          }
          return str;
        })
        .join(",");
    });

    return [header.join(","), ...rows].join("\n");
  };

  const handleDownloadOrdersCsv = () => {
    if (!visibleOrders.length) {
      alert("No orders in this filter to export yet.");
      return;
    }

    const csvString = buildOrdersCsv(visibleOrders);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const stamp = now.toISOString().slice(0, 10);

    let suffix =
      dateRange === "7"
        ? "last7days"
        : dateRange === "30"
        ? "last30days"
        : "allrecent";

    if (coolerFilter !== "all") {
      suffix = `${suffix}_cooler-${coolerFilter}`;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = `harc_orders_${suffix}_${stamp}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const buildHelpCsv = (helpList) => {
    const header = [
      "id",
      "created_at",
      "full_name",
      "phone",
      "insurance_type",
      "note_or_comments",
    ];

    const rows = helpList.map((req) => {
      const created = req.created_at || "";
      const name = req.full_name || req.name || "";
      const phone = req.phone || "";
      const insurance = req.insurance_type || "";
      const note = req.note || req.comments || "";

      const raw = [req.id ?? "", created, name, phone, insurance, note];

      return raw
        .map((field) => {
          const str = String(field ?? "");
          if (str.includes('"')) {
            const escaped = str.replace(/"/g, '""');
            return `"${escaped}"`;
          }
          if (str.includes(",") || str.includes(";") || str.includes("\n")) {
            return `"${str}"`;
          }
          return str;
        })
        .join(",");
    });

    return [header.join(","), ...rows].join("\n");
  };

  const handleDownloadHelpCsv = () => {
    if (!helpRequests.length) {
      alert("No help / coverage requests to export yet.");
      return;
    }

    const csvString = buildHelpCsv(helpRequests);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const stamp = now.toISOString().slice(0, 10);

    const link = document.createElement("a");
    link.href = url;
    link.download = `harc_help_requests_${stamp}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Restock summary from visibleOrders
  const restockSummary = React.useMemo(() => {
    const map = new Map();

    visibleOrders.forEach((order) => {
      const itemsArray = Array.isArray(order.items) ? order.items : [];
      itemsArray.forEach((item) => {
        const name = item.name || "Item";
        const qty = Number(item.qty) || 1;

        const existing = map.get(name) || { name, sold: 0 };
        existing.sold += qty;
        map.set(name, existing);
      });
    });

    const result = Array.from(map.values());
    result.sort((a, b) => b.sold - a.sold);
    return result;
  }, [visibleOrders]);

  // PIN handler
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === MANAGER_PIN) {
      setIsUnlocked(true);
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Try again.");
    }
  };

  // --- RENDER HELPERS ---

  const renderOrders = () => {
    if (!visibleOrders.length) {
      return (
        <p className="text-sm text-slate-600">
          No orders in this filter yet. Try expanding the date range or
          selecting &quot;All coolers&quot;, or place a test order from the
          customer screen.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {visibleOrders.map((order) => {
          const created =
            order.created_at &&
            new Date(order.created_at).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            });

          const itemsArray = Array.isArray(order.items) ? order.items : [];
          const itemSummary = itemsArray
            .map((i) => `${i.qty || 1}× ${i.name || "Item"}`)
            .join(", ");

          const subtotalNumber =
            order.subtotal !== undefined && order.subtotal !== null
              ? Number(order.subtotal)
              : null;

          const orderItemsCount =
            typeof order.total_items === "number"
              ? order.total_items
              : itemsArray.reduce(
                  (sum, item) => sum + (Number(item.qty) || 1),
                  0
                );

          const coolerId = order.cooler_id ?? order.cooler ?? "—";

          return (
            <div
              key={order.id}
              className="border border-slate-200 rounded-2xl bg-white/80 p-3 text-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-900">
                  Order #{order.id?.toString().slice(-6) || "—"}
                </span>
                <span className="text-[11px] text-slate-500">{created}</span>
              </div>

              <p className="text-[11px] text-slate-500 mb-1">
                Cooler: <span className="font-medium">{coolerId}</span>
              </p>

              <p className="text-xs text-slate-600 mb-1">
                Items: {itemSummary || "—"}
              </p>

              <div className="flex justify-between text-xs text-slate-700">
                <span>Total items: {orderItemsCount}</span>
                <span>
                  Est. total: $
                  {subtotalNumber !== null
                    ? subtotalNumber.toFixed(2)
                    : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderHelp = () => {
    if (!helpRequests.length) {
      return (
        <p className="text-sm text-slate-600">
          No recent help or coverage requests yet.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {helpRequests.map((req) => {
          const created =
            req.created_at &&
            new Date(req.created_at).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            });

          return (
            <div
              key={req.id}
              className="border border-slate-200 rounded-2xl bg-white/80 p-3 text-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-900">
                  {req.full_name || req.name || "Unknown"}
                </span>
                <span className="text-[11px] text-slate-500">{created}</span>
              </div>

              {req.phone && (
                <p className="text-xs text-slate-700 mb-1">
                  Phone: {req.phone}
                </p>
              )}

              {req.insurance_type && (
                <p className="text-xs text-slate-700">
                  Coverage: {req.insurance_type}
                </p>
              )}

              {req.note || req.comments ? (
                <p className="text-xs text-slate-600 mt-1">
                  Notes: {req.note || req.comments}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

  const renderRestock = () => {
    if (!visibleOrders.length || !restockSummary.length) {
      return (
        <p className="text-sm text-slate-600">
          No sales in this filter yet. Pick a wider date range or &quot;All
          coolers&quot; to see restock guidance.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-600 mb-1">
          Based on the selected date range and cooler filter, this shows how
          many units of each item were sold. Use this as a quick guide for how
          much to restock.
        </p>

        {restockSummary.map((entry) => {
          const sold = entry.sold;
          const suggested = Math.max(4, Math.ceil(sold * 1.3));

          return (
            <div
              key={entry.name}
              className="border border-slate-200 rounded-2xl bg-white/80 p-3 text-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-900">
                  {entry.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  Units sold: {sold}
                </span>
              </div>

              <p className="text-xs text-slate-700">
                Suggested restock:{" "}
                <span className="font-semibold">{suggested}</span> units
                (sold + buffer).
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  // PIN screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white/90 border border-orange-200 shadow-md p-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500">
            HARC HEALTHY COOLERS
          </p>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">
            Manager access
          </h1>
          <p className="mt-1 text-xs text-slate-600">
            Enter the staff PIN to view orders, coverage requests, and restock
            guidance.
          </p>

          <form onSubmit={handlePinSubmit} className="mt-4 space-y-3">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Enter PIN"
            />
            {pinError && (
              <p className="text-[11px] text-red-500">{pinError}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-2xl bg-orange-500 text-black text-sm font-semibold py-2"
            >
              Unlock dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 via-amber-50 to-emerald-50 text-slate-900 flex flex-col">
      {/* Header with Back to staff tools */}
      <header className="px-4 pt-6 pb-4 border-b border-orange-200/60 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-orange-500">
            HARC HEALTHY COOLERS
          </p>
          <h1 className="mt-1 text-xl font-semibold">Manager dashboard</h1>
          <p className="mt-1 text-xs text-slate-600 max-w-xs">
            View recent orders, coverage / help requests, and restock guidance
            for this cooler network.
          </p>
        </div>

        <button
          onClick={() => navigate("/staff")}
          className="mt-1 text-[11px] border border-slate-300 rounded-full px-3 py-1 bg-white/80 text-slate-800 font-medium"
        >
          Back to staff tools
        </button>
      </header>

      {/* Summary cards */}
      <section className="px-4 pt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-2xl bg-white/80 border border-orange-200 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Total orders
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 border border-orange-200 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Total items
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {totalItems}
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 border border-orange-200 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Est. revenue
          </p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 border border-orange-200 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            Last order
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-900">
            {lastOrderTime || "—"}
          </p>
        </div>
      </section>

      {/* Tiny orders-per-day chart */}
      {activeTab === "orders" &&
        ordersPerDay.length > 0 &&
        maxOrdersPerDay > 0 && (
          <section className="px-4 pt-3 pb-1 text-[11px]">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">
              Orders per day (filtered)
            </p>
            <div className="space-y-1.5">
              {ordersPerDay.map((entry) => {
                const widthPct = (entry.count / maxOrdersPerDay) * 100;
                const label = entry.date;
                return (
                  <div key={entry.date} className="flex items-center gap-2">
                    <span className="w-[4.5rem] text-[10px] text-slate-600">
                      {label}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-orange-100 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-orange-500"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="w-6 text-[10px] text-right text-slate-700">
                      {entry.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      {/* Tabs + filters + CSV row */}
      <div className="px-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full border ${
                activeTab === tab
                  ? "bg-orange-500 text-black border-orange-500"
                  : "border-slate-300 text-slate-700 bg-white/70"
              }`}
            >
              {tab === "orders"
                ? "Recent orders"
                : tab === "help"
                ? "Help / coverage"
                : "Restock guide"}
            </button>
          ))}
        </div>

        {activeTab === "orders" && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-full bg-white/60 border border-slate-300 overflow-hidden">
              {DATE_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id)}
                  className={`px-2.5 py-1 text-[10px] ${
                    dateRange === range.id
                      ? "bg-orange-500 text-black"
                      : "text-slate-700"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {coolerIds.length > 0 && (
              <select
                value={coolerFilter}
                onChange={(e) => setCoolerFilter(e.target.value)}
                className="text-[11px] border border-slate-300 rounded-full bg-white/80 px-2 py-1"
              >
                <option value="all">All coolers</option>
                {coolerIds.map((id) => (
                  <option key={id} value={id}>
                    Cooler {id}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleDownloadOrdersCsv}
              className="px-3 py-1.5 rounded-full border border-slate-300 bg-white/80 text-[11px] font-medium text-slate-800"
            >
              Download CSV
            </button>
          </div>
        )}

        {activeTab === "help" && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadHelpCsv}
              className="px-3 py-1.5 rounded-full border border-slate-300 bg-white/80 text-[11px] font-medium text-slate-800"
            >
              Download help CSV
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <main className="flex-1 px-4 py-4">
        {loading ? (
          <p className="text-sm text-slate-600">Loading dashboard…</p>
        ) : activeTab === "orders" ? (
          renderOrders()
        ) : activeTab === "help" ? (
          renderHelp()
        ) : (
          renderRestock()
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;

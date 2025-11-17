// src/pages/Confirm.jsx
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Receipt, Home, MessageSquare } from "lucide-react";

function currency(n) {
return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

function makeOrderId() {
// e.g., HARC-251110-AB12
const d = new Date();
const stamp = `${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}`;
const rand = Math.random().toString(36).toUpperCase().slice(2,6);
return `HARC-${stamp}-${rand}`;
}

export default function Confirm() {
const navigate = useNavigate();
const { state } = useLocation();

// Prefer order details from router state; fall back to localStorage if user refreshed
const order = useMemo(() => {
if (state?.order) return state.order;
try {
const cached = JSON.parse(localStorage.getItem("harc_last_order") || "null");
return cached || { items: [], subtotal: 0, tax: 0, total: 0 };
} catch {
return { items: [], subtotal: 0, tax: 0, total: 0 };
}
}, [state]);

const hasItems = order.items && order.items.length > 0;

// Generate an orderId if missing and persist the last order for refresh safety
useEffect(() => {
if (!order.orderId) order.orderId = makeOrderId();
localStorage.setItem("harc_last_order", JSON.stringify(order));
}, [order]);

function downloadReceipt() {
const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `${order.orderId}-receipt.json`;
a.click();
URL.revokeObjectURL(url);
}

const taxLabel = order.tax ?? (order.subtotal ? order.subtotal * 0.06 : 0);

return (
<div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.35 }}
className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6"
>
<div className="flex items-center gap-3 mb-4">
<CheckCircle2 className="w-8 h-8 text-green-600" />
<h1 className="text-2xl font-semibold">Order Confirmed</h1>
</div>

<p className="text-gray-600 mb-2">Thank you! Your healthy picks are on the way.</p>
}
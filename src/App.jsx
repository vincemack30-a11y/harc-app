// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";

// Providers
import { AppProvider } from "./context/AppContext.jsx";
import * as CartCtx from "./context/CartContext.jsx";

// Customer pages
import Home from "./pages/Home.jsx";
import Coolers from "./pages/Coolers.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Confirm from "./pages/Confirm.jsx";
import OrderConfirm from "./pages/OrderConfirm.jsx";
import Survey from "./pages/Survey.jsx";
import Help from "./pages/Help.jsx";
import Intake from "./pages/Intake.jsx";

// Delivery pages
import DeliveryStart from "./pages/DeliveryStart.jsx";
import DeliveryMenu from "./pages/DeliveryMenu.jsx";
import DeliveryCart from "./pages/DeliveryCart.jsx";
import DeliveryCheckout from "./pages/DeliveryCheckout.jsx";
import DeliveryConfirm from "./pages/DeliveryConfirm.jsx";
import DeliveryConfirmation from "./pages/DeliveryConfirmation.jsx";

// Manager pages
import ManagerDashboard from "./ManagerDashboard.jsx";
import ManagerOrders from "./ManagerOrders.jsx";
import ManagerPin from "./ManagerPin.jsx";
import ManagerRestock from "./ManagerRestock.jsx";
import ManagerAnalytics from "./pages/ManagerAnalytics.jsx";
import ManagerDelivery from "./pages/ManagerDelivery.jsx";
import Manager from "./pages/Manager.jsx";

// Optional pages
import Status from "./pages/Status.jsx";
import Restock from "./pages/Restock.jsx";
import Staff from "./pages/Staff.jsx";
import StaffOrder from "./pages/StaffOrder.jsx";
import Assist from "./pages/Assist.jsx";

function Providers({ children }) {
  // If your CartContext exports a provider, use it; otherwise just render children.
  const CartProvider = CartCtx.CartProvider || CartCtx.Provider || null;

  if (CartProvider) {
    return (
      <AppProvider>
        <CartProvider>{children}</CartProvider>
      </AppProvider>
    );
  }

  return <AppProvider>{children}</AppProvider>;
}

export default function App() {
  return (
    <Providers>
      <Layout>
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Customer flow */}
          <Route path="/coolers" element={<Coolers />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/confirm" element={<Confirm />} />

          {/* Order confirmation (aliases) */}
          <Route path="/order-confirm" element={<OrderConfirm />} />
          <Route path="/orderconfirmation" element={<OrderConfirm />} />
          <Route path="/order-confirm/:id" element={<OrderConfirm />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirm />} />
          <Route path="/orderconfirmation/:id" element={<OrderConfirm />} />

          {/* Survey / Help / Intake */}
          <Route path="/survey" element={<Survey />} />
          <Route path="/help" element={<Help />} />
          <Route path="/intake" element={<Intake />} />

          {/* Delivery flow */}
          <Route path="/delivery" element={<DeliveryStart />} />
          <Route path="/delivery/menu" element={<DeliveryMenu />} />
          <Route path="/delivery/cart" element={<DeliveryCart />} />
          <Route path="/delivery/checkout" element={<DeliveryCheckout />} />
          <Route path="/delivery/confirm" element={<DeliveryConfirm />} />
          <Route path="/delivery/confirmation" element={<DeliveryConfirmation />} />

          {/* Manager flow */}
          <Route path="/manager" element={<Manager />} />
          <Route path="/manager/pin" element={<ManagerPin />} />
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/orders" element={<ManagerOrders />} />
          <Route path="/manager/restock" element={<ManagerRestock />} />
          <Route path="/manager/analytics" element={<ManagerAnalytics />} />
          <Route path="/manager/delivery" element={<ManagerDelivery />} />

          {/* Optional */}
          <Route path="/status" element={<Status />} />
          <Route path="/restock" element={<Restock />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/staff/order" element={<StaffOrder />} />
          <Route path="/assist" element={<Assist />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Providers>
  );
}

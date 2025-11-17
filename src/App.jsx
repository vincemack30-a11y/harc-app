// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout.jsx";

import Home from "./pages/Home.jsx";
import Coolers from "./pages/Coolers.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Confirm from "./pages/Confirm.jsx";
import Survey from "./pages/Survey.jsx";
import Help from "./pages/Help.jsx";

import { CartProvider } from "./context/CartContext.jsx";
import { ORANGE } from "./data.js";
import "./index.css";

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout brandColor={ORANGE}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coolers" element={<Coolers />} />
            <Route path="/menu/:coolerId" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/confirm" element={<Confirm />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;

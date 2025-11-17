// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Coolers from "./pages/Coolers";
import Cart from "./pages/Cart";
import Confirm from "./pages/Confirm";
import Survey from "./pages/Survey";
import Help from "./pages/Help";
import { CartProvider } from "./context/CartContext.jsx";

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coolers" element={<Coolers />} />
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

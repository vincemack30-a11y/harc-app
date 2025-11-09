import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Confirm from "./pages/Confirm.jsx";
import Survey from "./pages/Survey.jsx";
import Help from "./pages/Help.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu/:id" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </Layout>
  );
}

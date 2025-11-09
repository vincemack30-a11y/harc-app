import Title from "../components/Title.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Confirm() {
  const nav = useNavigate();
  const { cooler, resetAll } = useCart();

  return (
    <>
      <Title>Order Confirmation</Title>
      <Card>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Success ✅</div>
        <div style={{ color: "#885522", marginBottom: 12 }}>
          Your order has been sent to <b>{cooler?.name || "the selected cooler"}</b>.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => nav("/survey")}>Take 30-sec Survey</Button>
          <Button kind="ghost" onClick={() => { resetAll(); nav("/"); }}>Finish</Button>
        </div>
      </Card>
    </>
  );
}

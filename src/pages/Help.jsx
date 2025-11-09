import Title from "../components/Title.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Help() {
  const nav = useNavigate();
  const { resetAll } = useCart();

  return (
    <>
      <Title>Health Assistance</Title>
      <Card>
        <p style={{ color: "#885522", marginTop: 0 }}>
          Need help with Medicaid/Medicare enrollment or primary care? A Community Health Worker can assist.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button onClick={() => { resetAll(); nav("/"); }}>Back to Coolers</Button>
          <Button kind="ghost" onClick={() => nav("/survey")}>Survey</Button>
        </div>
      </Card>
    </>
  );
}

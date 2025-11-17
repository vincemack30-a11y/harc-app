import Title from "../components/Title.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { useCart } from "../context/CartContext.jsx";
import { MENU } from "../data.js";
import { useNavigate } from "react-router-dom";
import { submitOrder } from "../api.js";

export default function Cart() {
  const { cart, add, dec, removeLine, total, cooler } = useCart();
  const nav = useNavigate();

  async function checkout() {
    await submitOrder({ coolerId: cooler?.id, items: cart });
    nav("/confirm");
  }

  return (
    <>
      <Title>Cart</Title>
      {cart.length === 0 ? (
        <Card><div style={{ color: "#885522" }}>Your cart is empty.</div></Card>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {cart.map((line) => {
            const item = MENU.find((m) => m.id === line.id);
            if (!item) return null;
            return (
              <Card key={line.id}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.name}</div>
                    <div style={{ color: "#885522", fontSize: 13 }}>${item.price.toFixed(2)} each</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Button kind="ghost" onClick={() => dec(line.id)}>-</Button>
                    <div style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}>{line.qty}</div>
                    <Button kind="ghost" onClick={() => add(line.id)}>+</Button>
                    <Button kind="ghost" onClick={() => removeLine(line.id)}>Remove</Button>
                  </div>
                </div>
              </Card>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 800 }}>Total</div>
            <div style={{ fontWeight: 800 }}>${total.toFixed(2)}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button kind="ghost" onClick={() => nav(-1)}>Keep Browsing</Button>
            <Button onClick={checkout}>Checkout</Button>
          </div>
        </div>
      )}
    </>
  );
}

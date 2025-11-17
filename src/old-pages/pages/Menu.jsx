import Title from "../components/Title.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { getMenuByCooler } from "../api.js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Menu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const nav = useNavigate();
  const { cooler, add } = useCart();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getMenuByCooler(id).then((res) => {
      if (!alive) return;
      setMenu(res);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [id]);

  return (
    <>
      <Title subtitle={cooler?.address || ""}>{cooler?.name || "Cooler"}</Title>

      {loading ? (
        <Card>
          <div style={{ color: "#885522" }}>Loading menu…</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {menu.map((m) => (
            <Card key={m.id}>
              <div style={{ fontWeight: 700 }}>{m.name}</div>
              <div style={{ color: "#885522", fontSize: 13, marginTop: 6 }}>{m.calories} cal</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <div style={{ fontWeight: 800 }}>${m.price.toFixed(2)}</div>
                <Button onClick={() => add(m.id)}>Add</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Button kind="ghost" onClick={() => nav("/")}>Back</Button>
        <Button onClick={() => nav("/cart")} disabled={menu.length === 0 && !loading}>Go to Cart</Button>
      </div>
    </>
  );
}

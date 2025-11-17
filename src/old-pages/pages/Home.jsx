import Title from "../components/Title.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { getCoolers } from "../api.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Home() {
  const [coolers, setCoolers] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const { setCooler } = useCart();

  useEffect(() => {
    let alive = true;
    getCoolers().then((res) => {
      if (!alive) return;
      setCoolers(res);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  return (
    <>
      <Title>Nearby Coolers</Title>

      {loading ? (
        <Card>
          <div style={{ color: "#885522" }}>Loading coolers…</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {coolers.map((c) => (
            <Card key={c.id}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{c.name}</div>
              <div style={{ color: "#885522", fontSize: 14, marginBottom: 12 }}>{c.address}</div>
              <Button onClick={() => { setCooler(c); nav(`/menu/${c.id}`); }}>View Menu</Button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

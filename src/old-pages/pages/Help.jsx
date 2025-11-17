import Title from "../components/Title.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const CHW_PHONE = "313-000-0000";        // TODO: replace with real number
const CHW_SMS   = "313-000-0000";        // TODO: replace with real SMS number
const CHW_EMAIL = "chw@authorityhealth.org"; // TODO: replace with real email

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

        {/* Quick contact actions */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Button onClick={() => window.location.href = `tel:${CHW_PHONE}`}>
            Call CHW
          </Button>
          <Button onClick={() => window.location.href = `sms:${CHW_SMS}`}>
            Text CHW
          </Button>
          <Button onClick={() => window.location.href = `mailto:${CHW_EMAIL}?subject=HaRC%20Assistance&body=Hi%2C%20I%27d%20like%20help%20with%20Medicaid%2FMedicare%20or%20primary%20care.`}>
            Email CHW
          </Button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button onClick={() => { resetAll(); nav("/"); }}>Back to Coolers</Button>
          <Button kind="ghost" onClick={() => nav("/survey")}>Survey</Button>
        </div>

        <p style={{ color: "#a06a3a", fontSize: 12, marginTop: 12 }}>
          Tip: update the contact details in <code>src/pages/Help.jsx</code> to your real CHW line and inbox.
        </p>
      </Card>
    </>
  );
}

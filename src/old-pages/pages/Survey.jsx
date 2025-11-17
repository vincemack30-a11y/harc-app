import Title from "../components/Title.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { useCart } from "../context/CartContext.jsx";
import { submitSurvey } from "../api.js";
import { useNavigate } from "react-router-dom";

export default function Survey() {
  const { survey, setSurvey } = useCart();
  const nav = useNavigate();

  async function handleSubmit() {
    await submitSurvey(survey);
    nav("/help");
  }

  return (
    <>
      <Title>Quick Survey</Title>
      <Card>
        <div style={{ display: "grid", gap: 14 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>How was your experience?</div>
            <select
              value={survey.rating}
              onChange={(e) => setSurvey((s) => ({ ...s, rating: e.target.value }))}
              style={{ padding: 8, borderRadius: 10, border: "1px solid #f0d6bd" }}
            >
              <option value="">Choose…</option>
              <option value="5">Excellent (5)</option>
              <option value="4">Good (4)</option>
              <option value="3">Okay (3)</option>
              <option value="2">Poor (2)</option>
              <option value="1">Bad (1)</option>
            </select>
          </label>

          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Would you recommend HaRC coolers?</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["Yes", "Maybe", "No"].map((opt) => (
                <Button
                  key={opt}
                  kind={survey.wouldRecommend === opt ? "primary" : "ghost"}
                  onClick={() => setSurvey((s) => ({ ...s, wouldRecommend: opt }))}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </label>

          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Anything else?</div>
            <textarea
              value={survey.notes}
              onChange={(e) => setSurvey((s) => ({ ...s, notes: e.target.value }))}
              placeholder="Comments (optional)"
              rows={3}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 12,
                border: "1px solid #f0d6bd",
                resize: "vertical",
                color: "#4a2a12",
              }}
            />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={handleSubmit} disabled={!survey.rating || !survey.wouldRecommend}>Submit</Button>
            <Button kind="ghost" onClick={() => nav("/help")}>Skip</Button>
          </div>
        </div>
      </Card>
    </>
  );
}

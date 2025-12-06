// src/pages/Home.jsx

export default function Home() {
  return (
    <div className="home">
      <h1 className="menu-title">Welcome to HaRC Healthy Coolers</h1>

      <p className="menu-subtitle">
        Find healthy grab-and-go meals, snacks, and drinks in Byte coolers across
        Detroit, and connect to Medicaid/Medicare help and community resources.
      </p>

      <div style={{ marginTop: "18px", marginBottom: "8px" }}>
        <button type="button" className="btn-primary">
          Start an order
        </button>
      </div>

      <p
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginTop: "4px",
          maxWidth: "540px",
        }}
      >
        Use the tabs above to switch between coolers, menus, your cart, the survey,
        help, and insurance support.
      </p>
    </div>
  );
}

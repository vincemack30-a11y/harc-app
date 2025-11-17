export default function Card({ children }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      padding: 16,
      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      border: "1px solid #f2e6d9",
    }}>
      {children}
    </div>
  );
}

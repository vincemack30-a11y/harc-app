export default function Title({ children, subtitle }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>{children}</h1>
      {subtitle ? <p style={{ margin: "6px 0 0", color: "#884400", fontSize: 14 }}>{subtitle}</p> : null}
    </div>
  );
}

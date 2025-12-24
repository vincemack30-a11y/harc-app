// api/status.js
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, message: "Method not allowed. Use GET /api/status." });
    return;
  }

  const hasUrl = Boolean(process.env.SUPABASE_URL);
  const hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasAdmin = Boolean(process.env.HARC_ADMIN_TOKEN);

  res.status(200).json({
    ok: true,
    message: "HaRC API is live",
    env: {
      SUPABASE_URL: hasUrl ? "present" : "missing",
      SUPABASE_SERVICE_ROLE_KEY: hasService ? "present" : "missing",
      HARC_ADMIN_TOKEN: hasAdmin ? "present" : "missing",
    },
    time: new Date().toISOString(),
  });
}

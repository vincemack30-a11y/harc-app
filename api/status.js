// Simple health-check endpoint for HaRC backend
// GET /api/status

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({
      ok: false,
      message: "Method not allowed. Use GET /api/status.",
    });
    return;
  }

  res.status(200).json({
    ok: true,
    message: "HaRC API is live",
    service: "harc-app",
    time: new Date().toISOString(),
  });
}

// api/status.js
// Server-truth status endpoint for build/version stamping.
// This runs on Vercel (serverless), NOT in the browser.

export default function handler(req, res) {
  try {
    const env = process.env.VERCEL_ENV || "production";
    const branch = process.env.VERCEL_GIT_COMMIT_REF || "";
    const sha = process.env.VERCEL_GIT_COMMIT_SHA || "";

    const shaShort = sha ? sha.slice(0, 12) : "";

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).json({
      ok: true,
      message: "HaRC API is live",
      env,
      branch,
      sha,
      shaShort,
      serverTime: new Date().toISOString(),
    });
  } catch (e) {
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).json({
      ok: false,
      message: "status failed",
      error: e?.message || String(e),
      serverTime: new Date().toISOString(),
    });
  }
}

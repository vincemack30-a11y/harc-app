// api/status.js
// Canonical server-truth status endpoint for HaRC
// This file runs on Vercel serverless (Node), NOT the browser

export default function handler(req, res) {
  try {
    const env = process.env.VERCEL_ENV || "production";

    const branch =
      process.env.VERCEL_GIT_COMMIT_REF ||
      process.env.GIT_BRANCH ||
      "";

    const sha =
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT_SHA ||
      "";

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
  } catch (error) {
    res.setHeader("Cache-Control", "no-store, max-age=0");

    res.status(200).json({
      ok: false,
      message: "status endpoint failed",
      error: error?.message || String(error),
      serverTime: new Date().toISOString(),
    });
  }
}

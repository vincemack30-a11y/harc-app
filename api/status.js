// api/status.js
// Server-truth build stamp.
// This runs on Vercel (serverless) and can read process.env safely.
// The browser calls /api/status and displays what the server reports.

export default function handler(req, res) {
  try {
    const sha =
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT_SHA ||
      "";

    const branch =
      process.env.VERCEL_GIT_COMMIT_REF ||
      process.env.GIT_BRANCH ||
      "";

    const env =
      process.env.VERCEL_ENV ||
      process.env.NODE_ENV ||
      "production";

    const deploymentId = process.env.VERCEL_DEPLOYMENT_ID || "";
    const region = process.env.VERCEL_REGION || "";
    const now = new Date().toISOString();

    res.setHeader("Content-Type", "application/json");
    // Light caching is fine; if you prefer always-live, set to "no-store"
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=600");

    res.status(200).json({
      ok: true,
      env,
      branch,
      sha,
      shaShort: sha ? sha.slice(0, 12) : "",
      serverTime: now,
      deploymentId,
      region,
    });
  } catch (e) {
    res.status(200).json({
      ok: false,
      error: e?.message || "status_error",
      env: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      serverTime: new Date().toISOString(),
    });
  }
}

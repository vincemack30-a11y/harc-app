// src/buildInfo.js
// Build/version stamp for UI.
// Works on Vercel + local.
// - Vercel exposes VERCEL_GIT_COMMIT_SHA (when Git is connected)
// - Vite exposes import.meta.env (VITE_* only), but we can safely read common Vercel vars too.

function pick(...vals) {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function shortSha(sha) {
  if (!sha) return "";
  return sha.length > 12 ? sha.slice(0, 12) : sha;
}

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};

// Vercel variables that may exist at build time
const sha =
  pick(
    env.VERCEL_GIT_COMMIT_SHA,
    env.VITE_VERCEL_GIT_COMMIT_SHA,
    env.GIT_COMMIT_SHA,
    env.VITE_GIT_COMMIT_SHA
  ) || "";

const ref =
  pick(
    env.VERCEL_GIT_COMMIT_REF,
    env.VITE_VERCEL_GIT_COMMIT_REF,
    env.GIT_BRANCH,
    env.VITE_GIT_BRANCH
  ) || "";

// Vercel provides env.VERCEL_ENV: "production" | "preview" | "development"
const vercelEnv =
  pick(env.VERCEL_ENV, env.VITE_VERCEL_ENV) ||
  (env.DEV ? "development" : "production");

const builtAt =
  pick(env.VERCEL_BUILD_TIME, env.VITE_VERCEL_BUILD_TIME) ||
  new Date().toISOString(); // fallback: build time at bundle creation

export const BUILD_INFO = {
  env: vercelEnv,
  branch: ref || "",
  sha: sha || "",
  shaShort: shortSha(sha),
  builtAt,
};

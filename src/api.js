import { COOLERS, MENU } from "./data.js";

export async function getCoolers() {
  await delay(150);
  return COOLERS;
}

export async function getMenuByCooler(/* coolerId */) {
  await delay(150);
  return MENU;
}

export async function submitOrder({ coolerId, items }) {
  await delay(250);
  return { ok: true, orderId: String(Date.now()), coolerId, items };
}

export async function submitSurvey(payload) {
  await delay(150);
  return { ok: true, receivedAt: new Date().toISOString(), payload };
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

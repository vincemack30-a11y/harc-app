export async function getCoolers() {
  const data = await import("./data/inventory.json");
  return data.coolers || data.default?.coolers || [];
}

export async function getMenuByCooler(/* coolerId */) {
  const data = await import("./data/inventory.json");
  return data.menu || data.default?.menu || [];
}

export async function submitOrder({ coolerId, items }) {
  await delay(250);
  return { ok: true, orderId: String(Date.now()), coolerId, items };
}

export async function submitSurvey(payload) {
  await delay(150);
  return { ok: true, receivedAt: new Date().toISOString(), payload };
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

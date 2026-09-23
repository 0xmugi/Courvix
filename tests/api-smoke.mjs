import assert from "node:assert/strict";
const base = "http://localhost:5173";
const unauth = await fetch(base + "/api/demo-state");
assert.equal(unauth.status, 401);
const signin = await fetch(
  base + "/signin-with-chatgpt?return_to=/api/demo-state",
  { redirect: "manual" },
);
const cookie = signin.headers.get("set-cookie")?.split(";")[0];
assert.ok(cookie, "Local sign-in must issue a cookie");
const headers = {
  Cookie: cookie,
  "Content-Type": "application/json",
  Origin: base,
};
const read = () =>
  fetch(base + "/api/demo-state", { headers }).then((r) => r.json());
const initial = await read();
assert.ok(initial.data.records.Members.length >= 584);
const put = (body, extra = {}) =>
  fetch(base + "/api/demo-state", {
    method: "PUT",
    headers: { ...headers, ...extra },
    body: JSON.stringify(body),
  });
let res = await put(initial, { Origin: "https://untrusted.invalid" });
assert.equal(res.status, 403);
res = await put({ revision: initial.revision, data: {} });
assert.equal(res.status, 422);
const state = structuredClone(initial);
const id = "TEST-" + Date.now();
state.data.records.Invoices.push({
  id,
  club: "batam",
  member: "batam-1",
  name: "QA payment simulation",
  amount: 350000,
  status: "Paid",
  date: "2026-09-23",
  due: "2026-09-25",
  fee: 1,
  gateway: 1,
});
res = await put(state);
assert.equal(res.status, 200);
const saved = await res.json();
const payment = saved.data.records.Invoices.find((r) => r.id === id);
assert.equal(payment.fee, 1750);
assert.equal(payment.gateway, 4000);
res = await put(state);
assert.equal(res.status, 409, "A stale write must not duplicate payment");
const tampered = structuredClone(saved);
tampered.data.records.Invoices.find((r) => r.id === id).amount = 1;
res = await put(tampered);
assert.equal(res.status, 409);
const erased = structuredClone(saved);
erased.data.records.Invoices = erased.data.records.Invoices.filter(
  (r) => r.id !== id,
);
res = await put(erased);
assert.equal(res.status, 409);
const cross = structuredClone(saved);
cross.data.records.Invoices.find((r) => r.id === id).member = "rally-1";
res = await put(cross);
assert.equal(res.status, 422);
const reread = await read();
assert.equal(reread.revision, saved.revision);
assert.equal(reread.data.records.Invoices.filter((r) => r.id === id).length, 1);
console.log(
  "PASS: auth, origin, schema, server-calculated fee, persistence, stale-write protection, immutable history, cross-club invoice validation",
);

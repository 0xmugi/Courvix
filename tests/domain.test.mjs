import assert from "node:assert/strict";
import { seed, feeFor } from "../lib/courvix.ts";
const db = seed();
assert.equal(db.records.Members.filter((m) => m.club === "batam").length, 520);
assert.equal(db.records.Members.filter((m) => m.club === "rally").length, 64);
assert.equal(new Set(db.records.Members.map((m) => m.id)).size, 584);
assert.equal(feeFor(350000, db.fee), 1750);
assert.equal(feeFor(50000, db.fee), 1000);
assert.equal(feeFor(2000000, db.fee), 7500);
assert.equal(feeFor(500, db.fee), 500);
assert.equal(feeFor(350000, { ...db.fee, type: "Fixed", flat: 2500 }), 2500);
for (const invoice of db.records.Invoices) {
  assert.ok(
    db.records.Members.some(
      (m) => m.id === invoice.member && m.club === invoice.club,
    ),
  );
  if (invoice.status !== "Paid") assert.equal(invoice.fee, 0);
}
console.log(
  "PASS: fee floors, caps, fixed rate, tiny amount, seed uniqueness, cross-club references",
);

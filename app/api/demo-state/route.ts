import { env } from "cloudflare:workers";
import { seed, feeFor, type DB } from "@/lib/courvix";
import { z } from "zod";
import { readStore, account, owner as accessOwner } from "@/lib/demo-access";
import { scoped, mergeScoped } from "@/lib/access-policy";

// Private, user-owned demonstration workspaces. These are not production club accounts.
export const dynamic = "force-dynamic";
const payloadSchema = z.object({
  reset: z.boolean().optional(),
  revision: z.number().int().min(0),
  data: z.object({
    records: z.record(
      z
        .array(
          z
            .object({
              id: z.string().max(150),
              club: z.string().min(1).max(150),
            })
            .passthrough(),
        )
        .max(10000),
    ),
    fee: z.object({
      rate: z.number().min(0).max(100),
      min: z.number().int().min(0),
      max: z.number().int().min(0),
      gateway: z.number().int().min(0),
      flat: z.number().int().min(0),
      type: z.enum(["Percentage", "Fixed"]),
    }),
    websites: z.record(
      z.object({
        title: z.string().max(200),
        headline: z.string().max(200),
        about: z.string().max(2000),
      }),
    ),
  }),
});
function user(request: Request) {
  return accessOwner(request);
}
function fail(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
function raw() {
  if (!env.DB) throw Error("Database unavailable");
  return env.DB as D1Database;
}
export async function GET(request: Request) {
  try {
    const store = await readStore(request);
    const identity = account(request, store.data);
    if (!identity) return fail("Masuk ke demo terlebih dahulu.", 401);
    return Response.json(
      {
        data: scoped(store.data, identity),
        revision: store.revision,
        session: identity,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return fail("Workspace belum dapat dimuat. Coba lagi.", 503);
  }
}
export async function PUT(request: Request) {
  const owner = user(request);
  if (!owner) return fail("Sesi tidak tersedia. Masuk kembali.", 401);
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    return fail("Permintaan tidak diizinkan.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return fail("Format permintaan tidak valid.", 415);
  try {
    const body = await request.text();
    if (body.length > 3000000) return fail("Data melebihi batas demo.", 413);
    let decoded: unknown;
    try {
      decoded = JSON.parse(body);
    } catch {
      return fail("Format JSON tidak valid.", 400);
    }
    const parsed = payloadSchema.safeParse(decoded);
    if (!parsed.success)
      return fail("Data tidak valid. Periksa isian lalu coba lagi.", 422);
    const { revision } = parsed.data;
    let data = parsed.data.reset ? seed() : (parsed.data.data as DB);
    if (data.fee.min > data.fee.max) return fail("Batas fee tidak valid.", 422);
    const baseline = seed();
    if (
      Object.keys(baseline.records).some((k) => !Array.isArray(data.records[k]))
    )
      return fail("Modul data tidak lengkap.", 422);
    const db = raw();
    const previous = await db
      .prepare("SELECT payload, revision FROM demo_workspaces WHERE owner = ?")
      .bind(owner)
      .first<{ payload: string; revision: number }>();
    if ((previous?.revision || 0) !== revision)
      return fail(
        "Data berubah di tab lain. Muat ulang sebelum menyimpan.",
        409,
      );
    const store = await readStore(request);
    const identity = account(request, store.data);
    if (!identity) return fail("Sesi berakhir. Masuk kembali.", 401);
    if (parsed.data.reset)
      return fail(
        "Reset dinonaktifkan agar akun dan klub yang terdaftar tetap konsisten.",
        409,
      );
    const subscription=store.data.records.Clubs.find((c:any)=>c.id===identity.club);
    if(identity.role!=='Administrator'&&((subscription?.status==='Trial'&&Date.parse(subscription.trialEnds)<Date.now())||(subscription?.status==='Active'&&subscription.renewAt&&Date.parse(subscription.renewAt)<Date.now())))return fail('Masa langganan demo berakhir. Admin klub dapat mengaktifkan subscription di Settings.',403);
    const old: DB = store.data;
    try {
      data = parsed.data.reset
        ? ({
            ...seed(),
            _access: store.data._access,
            records: { ...seed().records, Clubs: store.data.records.Clubs },
          } as DB)
        : mergeScoped(store.data, data, identity);
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Akses ditolak.", 403);
    }
    // Identity, club subscriptions and invitation state can only change via /api/access.
    (data as any)._access = store.data._access;
    data.records.Clubs = store.data.records.Clubs;
    data.records["Audit logs"] = [
      {
        id: crypto.randomUUID(),
        club: identity.club,
        name: "Perubahan workspace",
        actor: identity.name,
        date: new Date().toISOString(),
        status: "Success",
      },
      ...old.records["Audit logs"],
    ];
    for(const linked of store.data._access.accounts.filter((a:any)=>a.role==='Member'))if(!data.records.Members.some(m=>m.id===linked.member&&m.club===linked.club))return fail('Member memiliki akun login. Nonaktifkan statusnya, jangan hapus data yang terhubung.',409);
    for (const rows of Object.values(data.records))
      if (new Set(rows.map((r) => r.id)).size !== rows.length)
        return fail("Data duplikat terdeteksi.", 422);
    for (const key of ["Members", "Schedule", "Attendance", "Training"])
      for (const row of data.records[key] || []) {
        if (
          row.team &&
          !data.records.Teams.some(
            (t) => t.id === row.team && t.club === row.club,
          )
        )
          return fail("Tim harus berada di klub yang sama.", 422);
        if (
          row.member &&
          !data.records.Members.some(
            (m) => m.id === row.member && m.club === row.club,
          )
        )
          return fail("Member harus berada di klub yang sama.", 422);
      }
    for (const invoice of data.records.Invoices) {
      if (
        !data.records.Members.some(
          (m) => m.id === invoice.member && m.club === invoice.club,
        )
      )
        return fail("Anggota dan klub invoice tidak sesuai.", 422);
      if (
        ![
          "Pending",
          "Processing",
          "Paid",
          "Failed",
          "Expired",
          "Cancelled",
          "Refunded",
        ].includes(invoice.status)
      )
        return fail("Status pembayaran tidak valid.", 422);
    }
    if (
      !parsed.data.reset &&
      old.records.Invoices.some(
        (r) =>
          ["Paid", "Refunded"].includes(r.status) &&
          !data.records.Invoices.some((n) => n.id === r.id),
      )
    )
      return fail("Histori pembayaran tidak dapat dihapus.", 409);
    // Financial history is immutable; new paid transitions use server-authoritative policy.
    for (const invoice of parsed.data.reset ? [] : data.records.Invoices) {
      if (!Number.isSafeInteger(invoice.amount) || invoice.amount <= 0)
        return fail("Nominal invoice tidak valid.", 422);
      const before = old.records.Invoices.find((r) => r.id === invoice.id);
      if (before?.status === "Paid" || before?.status === "Refunded") {
        if (
          invoice.amount !== before.amount ||
          invoice.member !== before.member ||
          invoice.club !== before.club
        )
          return fail("Histori pembayaran tidak dapat diubah.", 409);
        if (before.status === "Refunded" && invoice.status !== "Refunded")
          return fail("Refund bersifat final.", 409);
        if (
          before.status === "Paid" &&
          !["Paid", "Refunded"].includes(invoice.status)
        )
          return fail("Transisi pembayaran tidak valid.", 409);
        invoice.fee = before.fee;
        invoice.gateway = before.gateway;
        invoice.reference = before.reference;
        if (invoice.status === "Refunded") {
          invoice.refund = before.amount;
          invoice.reversedFee = before.fee;
        }
      } else if (invoice.status === "Paid") {
        invoice.fee = feeFor(invoice.amount, old.fee);
        invoice.gateway = old.fee.gateway;
        invoice.reference = "SIM-" + crypto.randomUUID();
      } else {
        invoice.fee = 0;
        invoice.gateway = 0;
      }
    }
    const json = JSON.stringify(data);
    const now = new Date().toISOString();
    const result = previous
      ? await db
          .prepare(
            "UPDATE demo_workspaces SET payload = ?, revision = revision + 1, updated_at = ? WHERE owner = ? AND revision = ?",
          )
          .bind(json, now, owner, revision)
          .run()
      : await db
          .prepare(
            "INSERT INTO demo_workspaces (owner,payload,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(owner) DO NOTHING",
          )
          .bind(owner, json, now)
          .run();
    if (!result.meta.changes)
      return fail(
        "Perubahan bersamaan terdeteksi. Muat ulang lalu coba lagi.",
        409,
      );
    return Response.json(
      { data: scoped(data, identity), revision: revision + 1 },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return fail("Perubahan belum tersimpan. Coba lagi.", 503);
  }
}

import {
  readStore,
  saveStore,
  account,
  cookie,
  failure,
  type Access,
} from "@/lib/demo-access";
import type { Identity } from "@/lib/access-policy";
export const dynamic = "force-dynamic";
const plans = ["Starter", "Growth", "Club Pro"];
const text = (v: unknown, max = 150) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
export async function GET(req: Request) {
  try {
    const s = await readStore(req);
    const a = account(req, s.data);
    return Response.json(
      {
        session: a,
        accounts: s.data._access.accounts.map((x: Identity) => ({
          id: x.id,
          name: x.name,
          role: x.role,
          club: x.club,
        })),
        clubs: s.data.records.Clubs.map((x: any) => ({
          id: x.id,
          name: x.name,
          ...(a?.role === "Administrator" || a?.club === x.id
            ? { status: x.status, plan: x.plan, trialEnds: x.trialEnds }
            : {}),
        })),
        invites:
          a && ["Admin", "Administrator"].includes(a.role)
            ? s.data._access.invites.filter(
                (i: any) => a.role === "Administrator" || i.club === a.club,
              )
            : [],
        teams: a
          ? s.data.records.Teams.filter((t: any) => t.club === a.club)
          : [],
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: Request) {
  try {
    if (req.headers.get("origin") !== new URL(req.url).origin)
      throw Error("Origin tidak diizinkan.");
    const raw = await req.text();
    if (raw.length > 12000) throw Error("Permintaan terlalu besar.");
    const b = JSON.parse(raw);
    const s = await readStore(req);
    const d = s.data;
    const access = d._access as Access;
    const a = account(req, d);
    let signed: Identity | undefined;
    let newCookie = "";
    if (b.action === "login") {
      signed = access.accounts.find((x) => x.id === b.account);
      if (!signed) throw Error("Akun demo tidak ditemukan.");
    } else if (b.action === "brief") {
      const name = text(b.name),
        email = text(b.email),
        description = text(b.description, 2000);
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || description.length < 15)
        throw Error("Lengkapi brief dan email yang valid.");
      d.records.Projects.unshift({
        id: crypto.randomUUID(),
        club: "batam",
        name,
        email,
        description,
        contact: text(b.contact),
        status: "Lead",
      });
    } else if (b.action === "logout") {
      const token = req.headers
        .get("cookie")
        ?.match(/courvix_session=([^;]+)/)?.[1];
      access.sessions = access.sessions.filter((x) => x.token !== token);
      newCookie = cookie("");
    } else if (b.action === "register") {
      const name = text(b.name),
        clubName = text(b.clubName),
        email = text(b.email).toLowerCase(),
        sport = text(b.sport),
        plan = text(b.plan);
      if (
        !name ||
        !clubName ||
        !sport ||
        !/^\S+@\S+\.\S+$/.test(email) ||
        !plans.includes(plan)
      )
        throw Error("Lengkapi nama, email, klub, olahraga, dan paket.");
      if (access.accounts.some((x) => x.email === email))
        throw Error(
          "Email sudah terdaftar di demo. Gunakan akun tersebut dari halaman login.",
        );
      const id = "club-" + crypto.randomUUID();
      d.records.Clubs.push({
        id,
        club: id,
        name: clubName,
        short: clubName.slice(0, 3).toUpperCase(),
        sport,
        status: "Trial",
        plan,
        trialEnds: new Date(Date.now() + 14 * 86400000).toISOString(),
      });
      d.records.Teams.push({
        id: id + "-t0",
        club: id,
        name: "Kelompok utama",
        sport,
        coach: name,
        status: "Active",
      });
      d.websites[id] = {
        title: clubName,
        headline: "Bertumbuh bersama melalui olahraga.",
        about: "Selamat datang di " + clubName,
      };
      signed = {
        id: crypto.randomUUID(),
        name,
        email,
        role: "Admin",
        club: id,
      };
      access.accounts.push(signed);
    } else if (b.action === "invite") {
      if (a?.role !== "Admin")
        throw Error("Hanya admin klub yang dapat mengundang.");
      const email = text(b.email).toLowerCase();
      if (
        !/^\S+@\S+\.\S+$/.test(email) ||
        !["Coach", "Member"].includes(b.role) ||
        !d.records.Teams.some((t: any) => t.club === a.club && t.id === b.team)
      )
        throw Error("Periksa email, role, dan tim tujuan.");
      if (access.accounts.some((x) => x.email === email))
        throw Error("Email sudah memiliki akun demo.");
      if (
        access.invites.some(
          (x) =>
            x.club === a.club &&
            x.email === email &&
            !x.used &&
            !x.revoked &&
            x.expires > Date.now(),
        )
      )
        throw Error("Undangan aktif untuk email ini sudah ada.");
      const code =
        "CVX-" + crypto.randomUUID().replaceAll("-", "").toUpperCase();
      access.invites.push({
        id: crypto.randomUUID(),
        code,
        club: a.club,
        role: b.role,
        email,
        team: b.team,
        expires: Date.now() + 7 * 86400000,
        used: false,
        revoked: false,
      });
    } else if (b.action === "revoke") {
      const i = access.invites.find((x) => x.id === b.id && x.club === a?.club);
      if (a?.role !== "Admin" || !i || i.used)
        throw Error("Undangan tidak dapat dicabut.");
      i.revoked = true;
    } else if (b.action === "join") {
      const email = text(b.email).toLowerCase(),
        name = text(b.name);
      const i = access.invites.find(
        (x) => x.code === text(b.code).toUpperCase(),
      );
      if (
        !i ||
        i.used ||
        i.revoked ||
        i.expires < Date.now() ||
        i.email !== email
      )
        throw Error(
          "Undangan tidak valid, sudah dipakai, kedaluwarsa, atau email tidak sesuai.",
        );
      if (!name || access.accounts.some((x) => x.email === email))
        throw Error("Nama diperlukan dan email belum boleh memiliki akun.");
      signed = {
        id: crypto.randomUUID(),
        name,
        email,
        role: i.role,
        club: i.club,
        team: i.team,
      };
      if (i.role === "Member") {
        const existing = d.records.Members.find(
          (m: any) => m.club === i.club && m.email?.toLowerCase() === email,
        );
        signed.member = existing?.id || crypto.randomUUID();
        if (existing) {
          signed.team = existing.team;
        } else
          d.records.Members.push({
            id: signed.member,
            club: i.club,
            name,
            email,
            team: i.team,
            status: "Active",
            date: new Date().toISOString().slice(0, 10),
            amount: 0,
          });
      } else
        d.records.Coaches.push({
          id: signed.id,
          club: i.club,
          name,
          email,
          team: i.team,
          status: "Active",
          description: "Coach undangan",
        });
      access.accounts.push(signed);
      i.used = true;
    } else if (b.action === "subscribe") {
      if (a?.role !== "Admin" || !plans.includes(b.plan))
        throw Error("Paket tidak valid atau akses tidak diizinkan.");
      const club = d.records.Clubs.find((c: any) => c.id === a.club);
      club.plan = b.plan;
      club.status = "Active";
      club.renewAt = new Date(Date.now() + 30 * 86400000).toISOString();
    } else throw Error("Aksi tidak tersedia.");
    if (signed) {
      const token = crypto.randomUUID() + crypto.randomUUID();
      access.sessions = access.sessions.filter((x) => x.expires > Date.now());
      access.sessions.push({
        token,
        account: signed.id,
        expires: Date.now() + 86400000,
      });
      newCookie = cookie(token);
    }
    await saveStore(s);
    const headers: Record<string, string> = { "Cache-Control": "no-store" };
    if (newCookie)
      headers["Set-Cookie"] =
        newCookie + (new URL(req.url).protocol === "https:" ? "; Secure" : "");
    return Response.json({ ok: true }, { headers });
  } catch (e) {
    return failure(e);
  }
}

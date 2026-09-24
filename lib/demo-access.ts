import { env } from "cloudflare:workers";
import { seed, clubs } from "./courvix";
import type { Identity } from "./access-policy";
export type Access = {
  accounts: Identity[];
  sessions: { token: string; account: string; expires: number }[];
  invites: {
    id: string;
    code: string;
    club: string;
    role: "Coach" | "Member";
    email: string;
    team: string;
    expires: number;
    used: boolean;
    revoked: boolean;
  }[];
};
export function owner(request: Request) {
  return (
    request.headers.get("oai-authenticated-user-id") ||
    (["localhost", "127.0.0.1"].includes(new URL(request.url).hostname)
      ? "local-demo-preview"
      : null)
  );
}
export function initialAccess(): Access {
  return {
    accounts: [
      {
        id: "platform-owner",
        name: "Gilang · Courvix",
        email: "owner@courvix.demo",
        role: "Administrator",
        club: "batam",
      },
      ...clubs.flatMap((c) => [
        {
          id: c.id + "-admin",
          name: "Admin " + c.short,
          email: "admin@" + c.id + ".demo",
          role: "Admin" as const,
          club: c.id,
        },
        {
          id: c.id + "-coach",
          name: "Coach " + c.short,
          email: "coach@" + c.id + ".demo",
          role: "Coach" as const,
          club: c.id,
          team: c.id + "-t0",
        },
        {
          id: c.id + "-member",
          name: "Member " + c.short,
          email: "member@" + c.id + ".demo",
          role: "Member" as const,
          club: c.id,
          member: c.id + "-1",
          team: c.id + "-t0",
        },
      ]),
    ],
    sessions: [],
    invites: [],
  };
}
export async function readStore(request: Request) {
  const who = owner(request);
  if (!who) throw Error("UNAUTHORIZED");
  const row = await (env.DB as D1Database)
    .prepare("SELECT payload,revision FROM demo_workspaces WHERE owner = ?")
    .bind(who)
    .first<{ payload: string; revision: number }>();
  const data: any = row ? JSON.parse(row.payload) : seed();
  data._access ??= initialAccess();
  data.records.Clubs ??= clubs.map((c) => ({
    ...c,
    club: c.id,
    status: "Trial",
    plan: "Growth",
    trialEnds: new Date(Date.now() + 14 * 86400000).toISOString(),
  }));
  return { data, revision: row?.revision || 0, who, exists: !!row };
}
export function account(request: Request, data: any): Identity | null {
  const token = request.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)courvix_session=([^;]+)/)?.[1];
  const s = (data._access as Access).sessions.find(
    (s) => s.token === token && s.expires > Date.now(),
  );
  const identity:Identity|undefined=s?data._access.accounts.find((a:Identity)=>a.id===s.account):undefined;
  if(!identity)return null;
  if(identity.role==='Member'){const member=data.records.Members.find((m:any)=>m.id===identity.member&&m.club===identity.club);if(!member)return null;return {...identity,team:member.team};}
  return identity;
}
export async function saveStore(store: Awaited<ReturnType<typeof readStore>>) {
  const { data, who, revision, exists } = store;
  const result = exists
    ? await (env.DB as D1Database)
        .prepare(
          "UPDATE demo_workspaces SET payload=?, revision=revision+1, updated_at=? WHERE owner=? AND revision=?",
        )
        .bind(JSON.stringify(data), new Date().toISOString(), who, revision)
        .run()
    : await (env.DB as D1Database)
        .prepare(
          "INSERT INTO demo_workspaces(owner,payload,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(owner) DO NOTHING",
        )
        .bind(who, JSON.stringify(data), new Date().toISOString())
        .run();
  if (!result.meta.changes)
    throw Error("Data berubah di tab lain. Muat ulang lalu coba lagi.");
  return revision + 1;
}
export function cookie(token: string) {
  return (
    "courvix_session=" +
    token +
    "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" +
    (token ? "86400" : "0")
  );
}
export function failure(e: unknown) {
  return Response.json(
    {
      error:
        e instanceof Error
          ? e.message === "UNAUTHORIZED"
            ? "Masuk ke akun pemilik demo terlebih dahulu."
            : e.message
          : "Permintaan gagal. Coba lagi.",
    },
    {
      status: e instanceof Error && e.message === "UNAUTHORIZED" ? 401 : 400,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

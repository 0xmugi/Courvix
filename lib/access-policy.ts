function canonical(value:any):string|undefined {return JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);}
export type Identity = {
  id: string;
  name: string;
  email: string;
  role: "Administrator" | "Admin" | "Coach" | "Member";
  club: string;
  member?: string;
  team?: string;
};
export function visibleRow(key: string, r: any, a: Identity, data?: any) {
  if (a.role === "Administrator") return true;
  if (r.club !== a.club) return false;
  if (a.role === "Member") {
    if (["Members", "Invoices", "Attendance"].includes(key))
      return r.id === a.member || r.member === a.member;
    if (
      ["Teams", "Schedule", "Training", "Competitions", "Documents"].includes(
        key,
      )
    )
      return !r.team || r.team === a.team;
    return ["Announcements", "Membership", "Clubs"].includes(key);
  }
  if (a.role === "Coach") {
    if (
      ["Teams", "Members", "Schedule", "Training", "Attendance"].includes(key)
    )
      return (
        r.id === a.team ||
        r.team === a.team ||
        (key === "Attendance" &&
          data?.records.Members.some(
            (m: any) =>
              m.id === r.member && m.club === a.club && m.team === a.team,
          ))
      );
    return ["Announcements", "Documents", "Competitions", "Clubs"].includes(
      key,
    );
  }
  return !["Audit logs", "Projects"].includes(key);
}
export function scoped(data: any, a: Identity) {
  return {
    records: Object.fromEntries(
      Object.entries(data.records).map(([key, rows]) => [
        key,
        (rows as any[]).filter((r) => visibleRow(key, r, a, data)),
      ]),
    ),
    fee: data.fee,
    websites:
      a.role === "Administrator"
        ? data.websites
        : { [a.club]: data.websites[a.club] },
  };
}
export function mergeScoped(old: any, incoming: any, a: Identity) {
  if (a.role === "Administrator") return { ...incoming, _access: old._access };
  if (canonical(incoming.fee) !== canonical(old.fee))
    throw Error("Hanya administrator platform yang dapat mengubah fee.");
  const allowed =
    a.role === "Admin"
      ? [
          "Members",
          "Teams",
          "Coaches",
          "Schedule",
          "Attendance",
          "Training",
          "Competitions",
          "Membership",
          "Invoices",
          "Expenses",
          "Announcements",
          "Documents",
          "Support",
        ]
      : a.role === "Coach"
        ? ["Attendance", "Training"]
        : ["Invoices"];
  const current = scoped(old, a);
  const next = structuredClone(old);
  for (const key of Object.keys(incoming.records)) {
    const rows = incoming.records[key];
    if (key === "Audit logs") continue;
    if (canonical(rows) === canonical(current.records[key] || []))
      continue;
    if (!allowed.includes(key))
      throw Error("Modul ini tidak dapat diubah oleh peran Anda.");
    if (rows.some((r: any) => !visibleRow(key, r, a, old)))
      throw Error("Data berada di luar akses klub atau tim Anda.");
    const hidden = old.records[key].filter(
      (r: any) => !visibleRow(key, r, a, old),
    );
    if (rows.some((r: any) => hidden.some((h: any) => h.id === r.id)))
      throw Error("ID data tidak tersedia.");
    if (a.role === "Member") {
      if (rows.length !== current.records[key].length)
        throw Error("Tagihan tidak dapat ditambah atau dihapus oleh member.");
      for (const r of rows) {
        const prev = current.records[key].find((x: any) => x.id === r.id);
        if (!prev) throw Error("Tagihan tidak tersedia.");
        const editable = ["status", "method", "fee", "gateway", "reference"];
        for (const k of new Set([...Object.keys(prev), ...Object.keys(r)]))
          if (
            !editable.includes(k) &&
            canonical(prev[k]) !== canonical(r[k])
          )
            throw Error("Detail tagihan tidak dapat diubah.");
        if (
          r.status !== prev.status &&
          !(
            ["Pending", "Expired", "Failed"].includes(prev.status) &&
            ["Paid", "Failed"].includes(r.status)
          )
        )
          throw Error("Transisi pembayaran member tidak diizinkan.");
      }
    }
    next.records[key] = [...hidden, ...rows];
  }
  for (const [id, site] of Object.entries(incoming.websites)) {
    if (id !== a.club) throw Error("Website di luar klub Anda.");
    if (
      a.role !== "Admin" &&
      canonical(site) !== canonical(old.websites[id])
    )
      throw Error("Hanya admin klub yang dapat mengubah website.");
    next.websites[id] = site;
  }
  return next;
}

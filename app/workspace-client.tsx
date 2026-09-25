"use client";
import { CourvixSelect } from "@/components/courvix-select";
import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Users,
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  Wallet,
  Shield,
  Search,
  Bell,
  ChevronRight,
  Trophy,
  Globe,
  Settings,
  LogOut,
  Download,
  Activity,
  Check,
  Layers,
  FileText,
  Megaphone,
  Dumbbell,
  LifeBuoy,
  Briefcase,
  GraduationCap,
  ChevronLeft,
  CreditCard,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast, Toaster } from "sonner";
import { seed, clubs, money, feeFor, type DB, type Row } from "@/lib/courvix";
import Landing from "./landing";
import { ClubAccess, accessAction } from "./access-client";
import type { Identity } from "@/lib/access-policy";
import { TeamsView, CalendarView, MemberDetails } from "./operations";
const icons: any = {
  Dashboard: LayoutDashboard,
  Members: Users,
  Teams: Layers,
  Coaches: GraduationCap,
  Attendance: ClipboardCheck,
  Schedule: CalendarDays,
  Training: Dumbbell,
  Competitions: Trophy,
  Membership: CreditCard,
  Invoices: FileText,
  Payments: Wallet,
  Finance: Activity,
  Announcements: Megaphone,
  Documents: FileText,
  Reports: Activity,
  Website: Globe,
  Settings: Settings,
  Clubs: Layers,
  Projects: Briefcase,
  "Audit logs": Shield,
  Support: LifeBuoy,
};
const roleNav: Record<string, string[]> = {
  Admin: [
    "Dashboard",
    "Members",
    "Teams",
    "Coaches",
    "Attendance",
    "Schedule",
    "Training",
    "Competitions",
    "Membership",
    "Invoices",
    "Payments",
    "Finance",
    "Announcements",
    "Documents",
    "Reports",
    "Website",
    "Settings",
    "Support",
  ],
  Coach: [
    "Dashboard",
    "Members",
    "Teams",
    "Attendance",
    "Schedule",
    "Training",
    "Competitions",
    "Announcements",
    "Documents",
  ],
  Member: [
    "Dashboard",
    "Schedule",
    "Attendance",
    "Invoices",
    "Payments",
    "Announcements",
    "Documents",
  ],
  Administrator: [
    "Dashboard",
    "Clubs",
    "Payments",
    "Projects",
    "Reports",
    "Settings",
    "Audit logs",
    "Support",
  ],
};
const initials = (s: string) =>
  s
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0])
    .join("");
export function Brand() {
  return (
    <span className="brand">
      <span className="brandmark">
        c<span>↗</span>
      </span>
      courvix<span className="brand-dot">.</span>
    </span>
  );
}
export function Badge({ value }: { value: string }) {
  return (
    <span
      className={
        "badge " +
        (["Paid", "Active", "Present", "Completed"].includes(value)
          ? "green"
          : ["Pending", "Important", "Late", "Discovery"].includes(value)
            ? "amber"
            : ["Failed", "Expired", "Absent"].includes(value)
              ? "red"
              : "neutral")
      }
    >
      {value}
    </span>
  );
}
export default function Courvix() {
  const [db, setDb] = useState<DB>(seed),
    [ready, setReady] = useState(false),
    [role, setRole] = useState("Admin"),
    [club, setClub] = useState("batam"),
    [page, setPage] = useState("Dashboard"),
    [surface, setSurface] = useState("app"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All"),
    [pg, setPg] = useState(1),
    [modal, setModal] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(false),
    [session, setSession] = useState("batam-s0");
  const [storage, setStorage] = useState("local");
  const revision = useRef(0);
  const lock = useRef(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loadError, setLoadError] = useState("");
  const organizations = db.records.Clubs || clubs;
  const org = organizations.find((c: any) => c.id === club) || {
    id: club,
    name: "Courvix platform",
    short: "CVX",
    sport: "",
  };
  async function logout() {
    try {
      await accessAction({ action: "logout" });
      location.assign("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Keluar gagal. Coba lagi.");
    }
  }
  const admin = role === "Admin" || role === "Administrator";
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/demo-state", { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          location.replace("/login");
          return;
        }
        if (!response.ok)
          throw Error(
            "Workspace tidak dapat dimuat. Muat ulang untuk mencoba kembali.",
          );
        const payload = (await response.json()) as {
          data: DB;
          revision: number;
          session: Identity;
        };
        if (controller.signal.aborted) return;
        setDb(payload.data);
        revision.current = payload.revision;
        setIdentity(payload.session);
        setRole(payload.session.role);
        setClub(payload.session.club);
        setStorage("cloud");
        setSession(payload.session.club + "-s0");
        setReady(true);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      });
    return () => controller.abort();
  }, []);
  const scope = (requested: string) => {
    const key = requested === "Payments" ? "Invoices" : requested;
    const ownMember = db.records.Members.find(
      (m) => m.id === (identity?.member || club + "-1"),
    );
    return (db.records[key] || []).filter((r) => {
      if (role !== "Administrator" && r.club !== club) return false;
      if (role === "Member") {
        if (["Members", "Invoices", "Attendance"].includes(key))
          return (
            r.id === (identity?.member || club + "-1") ||
            r.member === (identity?.member || club + "-1")
          );
        if (key === "Schedule") return r.team === ownMember?.team;
      }
      if (
        role === "Coach" &&
        ["Members", "Schedule", "Teams", "Attendance", "Training"].includes(key)
      )
        return (
          r.team === (identity?.team || club + "-t0") ||
          r.id === (identity?.team || club + "-t0") ||
          db.records.Members.find((m) => m.id === r.member)?.team ===
            (identity?.team || club + "-t0")
        );
      return true;
    });
  };
  const members = scope("Members"),
    invoices = scope("Invoices"),
    sessions = scope("Schedule"),
    teams = scope("Teams"),
    paid = invoices.filter((x) => x.status === "Paid"),
    gross = paid.reduce((s, r) => s + r.amount, 0),
    fees = paid.reduce((s, r) => s + r.fee, 0),
    outstanding = invoices.filter((x) =>
      ["Pending", "Expired", "Failed"].includes(x.status),
    ),
    expenses = scope("Expenses").reduce((s, r) => s + r.amount, 0),
    gateway = invoices
      .filter((r) => ["Paid", "Refunded"].includes(r.status))
      .reduce((s, r) => s + r.gateway, 0);
  const go = (p: string) => {
    if (!roleNav[role].includes(p)) return;
    setPage(p);
    setQuery("");
    setFilter("All");
    setPg(1);
    setError("");
  };
  const open = (m: any) => {
    setError("");
    setModal(m);
  };
  async function mutate(fn: (d: DB) => DB, message: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (!navigator.onLine)
        throw Error("Koneksi terputus. Sambungkan kembali lalu coba lagi.");
      const next = fn(structuredClone(db));
      next.records["Audit logs"].unshift({
        id: crypto.randomUUID(),
        club,
        name: message,
        actor: role,
        date: new Date().toISOString(),
        status: "Success",
      });
      if (storage === "cloud") {
        const response = await fetch("/api/demo-state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: next,
            revision: revision.current,
            reset: message === "Data demo direset",
          }),
          signal: AbortSignal.timeout(15000),
        });
        const result = (await response.json()) as {
          data: DB;
          revision: number;
          error?: string;
        };
        if (response.status === 401) {
          location.replace("/login");
          throw Error("Sesi berakhir.");
        }
        if (!response.ok)
          throw Error(result.error || "Perubahan gagal disimpan.");
        revision.current = result.revision;
        setDb(result.data);
      } else {
        localStorage.setItem("courvix-demo-v2", JSON.stringify(next));
        setDb(next);
      }
      setModal(null);
      toast.success(message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tindakan gagal. Coba lagi.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function download(rows: Row[], name: string) {
    try {
      if (!rows.length) throw Error("Tidak ada data untuk diekspor.");
      const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))];
      const safe = (v: any) =>
        '"' +
        String(v ?? "")
          .replace(/^[=+@-]/, "'$&")
          .replaceAll('"', '""') +
        '"';
      const blob = new Blob(
        [
          "\ufeff" +
            [
              keys.join(","),
              ...rows.map((r) => keys.map((k) => safe(r[k])).join(",")),
            ].join("\r\n"),
        ],
        { type: "text/csv;charset=utf-8" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name + ".csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Ekspor siap.");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  useEffect(() => {
    const ctx = (document as any).modelContext;
    if (!ctx?.registerTool) return;
    const c = new AbortController();
    Promise.resolve(
      ctx.registerTool(
        {
          name: "navigate_courvix",
          description:
            "Open an available module for the current Courvix demo role.",
          inputSchema: {
            type: "object",
            properties: { page: { type: "string", enum: roleNav[role] } },
            required: ["page"],
            additionalProperties: false,
          },
          execute: (input: any) => {
            if (!roleNav[role].includes(input?.page))
              throw Error("Module not available");
            go(input.page);
            return { page: input.page, mode: "demo" };
          },
        },
        { signal: c.signal },
      ),
    ).catch(() => {});
    return () => c.abort();
  }, [role]);
  const fields = (mod: string): string[][] =>
    mod === "Members"
      ? [
          ["name", "Nama lengkap"],
          ["email", "Email"],
          ["team", "Tim", "team"],
        ]
      : mod === "Invoices"
        ? [
            ["member", "Anggota", "member"],
            ["amount", "Nominal (Rp)", "number"],
            ["description", "Deskripsi"],
            ["due", "Jatuh tempo", "date"],
          ]
        : mod === "Schedule"
          ? [
              ["name", "Judul sesi"],
              ["team", "Tim", "team"],
              ["date", "Tanggal", "date"],
              ["time", "Waktu", "time"],
              ["venue", "Lokasi"],
            ]
          : mod === "Teams"
            ? [
                ["name", "Nama tim"],
                ["sport", "Olahraga"],
                ["coach", "Coach"],
              ]
            : mod === "Coaches"
              ? [
                  ["name", "Nama"],
                  ["email", "Email"],
                  ["description", "Spesialisasi"],
                ]
              : mod === "Membership" || mod === "Expenses"
                ? [
                    ["name", "Nama / keterangan"],
                    ["amount", "Nominal (Rp)", "number"],
                    ["description", "Periode / kategori"],
                  ]
                : mod === "Competitions"
                  ? [
                      ["name", "Nama kompetisi"],
                      ["date", "Tanggal", "date"],
                      ["venue", "Lokasi"],
                    ]
                  : mod === "Projects"
                    ? [
                        ["name", "Organisasi / proyek"],
                        ["email", "Email"],
                        ["phone", "Telepon"],
                        ["sport", "Olahraga"],
                        ["budget", "Perkiraan anggaran"],
                        ["description", "Kebutuhan sistem", "textarea"],
                      ]
                    : [
                        ["name", "Judul"],
                        ["description", "Isi / catatan", "textarea"],
                      ];
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const mod = modal.module;
    if (
      !admin &&
      !["Training", "Announcements"].includes(mod) &&
      surface !== "landing"
    ) {
      setError("Akses tidak diizinkan.");
      return;
    }
    await mutate((d) => {
      const row: any = {
        ...f,
        id: modal.edit?.id || crypto.randomUUID(),
        club,
        status:
          modal.edit?.status ||
          (mod === "Invoices"
            ? "Pending"
            : mod === "Projects"
              ? "Lead"
              : "Active"),
        date: f.date || "2026-09-23",
      };
      if ("amount" in f) {
        row.amount = Number(f.amount);
        if (!Number.isSafeInteger(row.amount) || row.amount <= 0)
          throw Error("Nominal harus bilangan rupiah positif.");
      }
      if (mod === "Members") {
        if (
          d.records.Members.some(
            (m) =>
              m.club === club && m.email === f.email && m.id !== modal.edit?.id,
          )
        )
          throw Error("Email sudah terdaftar di klub.");
        row.amount =
          d.records.Membership.find((p) => p.club === club)?.amount || 0;
      }
      if (
        mod === "Schedule" &&
        d.records.Schedule.some(
          (s) =>
            s.id !== modal.edit?.id &&
            s.club === club &&
            s.date === f.date &&
            s.time === f.time &&
            (s.venue === f.venue || s.team === f.team),
        )
      )
        throw Error("Jadwal bentrok dengan sesi yang sudah ada.");
      if (mod === "Invoices") {
        const m = d.records.Members.find(
          (m) => m.id === f.member && m.club === club,
        );
        if (!m) throw Error("Pilih anggota klub yang valid.");
        row.name = m.name;
        row.fee = 0;
        row.gateway = 0;
        row.method = "Virtual Account";
      }
      if (modal.edit) {
        const index = d.records[mod].findIndex(
          (r) => r.id === modal.edit.id && r.club === club,
        );
        if (index < 0) throw Error("Data tidak ditemukan.");
        d.records[mod][index] = { ...d.records[mod][index], ...row };
      } else d.records[mod].unshift(row);
      return d;
    }, mod + " berhasil ditambahkan");
  }
  const filtered = (key: string) =>
    scope(key).filter(
      (r) =>
        (filter === "All" || r.status === filter) &&
        Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase()),
    );
  function List() {
    const rows = filtered(page);
    const financial = ["Invoices", "Payments"].includes(page);
    return (
      <>
        <div className="toolbar">
          <div className="searchbox">
            <Search size={17} />
            <input
              aria-label="Cari data"
              placeholder={"Cari " + page.toLowerCase() + "..."}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPg(1);
              }}
            />
          </div>
          <CourvixSelect
            aria-label="Filter status"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPg(1);
            }}
          >
            {[
              "All",
              ...Array.from(
                new Set(
                  scope(page)
                    .map((r) => r.status)
                    .filter(Boolean),
                ),
              ),
            ].map((s: any) => (
              <option key={s}>{s}</option>
            ))}
          </CourvixSelect>
          <button className="btn" onClick={() => download(rows, page)}>
            <Download size={16} /> Export
          </button>
          {(admin ||
            (["Training", "Announcements"].includes(page) &&
              role === "Coach")) &&
            !["Payments", "Audit logs"].includes(page) && (
              <button
                className="btn primary"
                onClick={() => open({ type: "create", module: page })}
              >
                <Plus size={16} /> Tambah
              </button>
            )}
        </div>
        <div className="panel data-panel">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{financial ? "Invoice / Member" : "Nama"}</TableHead>
                <TableHead>
                  {financial
                    ? "Nominal"
                    : page === "Members"
                      ? "Tim"
                      : "Detail"}
                </TableHead>
                <TableHead>{financial ? "Jatuh tempo" : "Tanggal"}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.slice((pg - 1) * 10, pg * 10).map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="identity">
                      <span className={"avatar a" + (i % 4)}>
                        {initials(r.name || "CV")}
                      </span>
                      <div>
                        <strong>{r.name}</strong>
                        <small>
                          {financial
                            ? r.id
                            : r.email ||
                              r.sport ||
                              r.actor ||
                              r.id.slice(0, 10)}
                        </small>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    data-label={
                      financial
                        ? "Nominal"
                        : page === "Members"
                          ? "Tim"
                          : "Detail"
                    }
                  >
                    {financial || page === "Membership"
                      ? money(r.amount)
                      : page === "Members"
                        ? db.records.Teams.find((t) => t.id === r.team)?.name
                        : r.description?.slice(0, 58) ||
                          r.coach ||
                          r.venue ||
                          "—"}
                  </TableCell>
                  <TableCell data-label={financial ? "Jatuh tempo" : "Tanggal"}>
                    {r.due || r.date?.slice(0, 10) || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge value={r.status || "Recorded"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      className="text-btn"
                      onClick={() =>
                        open({
                          type: financial ? "payment" : "detail",
                          row: r,
                          module: page,
                        })
                      }
                    >
                      Detail <ChevronRight size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!rows.length && (
            <div className="empty">
              <Search />
              <h3>Belum ada data yang sesuai</h3>
              <p>Ubah filter atau tambahkan data pertama.</p>
            </div>
          )}
          <div className="tablefoot">
            <span>
              {rows.length} data · halaman {pg} dari{" "}
              {Math.max(1, Math.ceil(rows.length / 10))}
            </span>
            <div className="actions">
              <button
                className="btn small"
                aria-label="Halaman sebelumnya"
                disabled={pg === 1}
                onClick={() => setPg(pg - 1)}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                className="btn small"
                aria-label="Halaman berikutnya"
                disabled={pg * 10 >= rows.length}
                onClick={() => setPg(pg + 1)}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  function ScheduleList() {
    return (
      <div className="schedule-list">
        {sessions.slice(0, 4).map((s, i) => (
          <button
            key={s.id}
            onClick={() => open({ type: "detail", row: s, module: "Schedule" })}
            className="schedule-row"
          >
            <span className={"date-tile " + (!i ? "today" : "")}>
              <small>{i ? "SEP" : "TODAY"}</small>
              <b>{s.date.slice(-2)}</b>
            </span>
            <span className="schedule-info">
              <strong>{s.name}</strong>
              <small>
                {s.time} WIB · {s.venue}
              </small>
              <span className="tag">
                {db.records.Teams.find((t) => t.id === s.team)?.name}
              </span>
            </span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
    );
  }
  function Chart() {
    const amounts = Array.from({ length: 7 }, (_, i) =>
      paid
        .filter(
          (r) =>
            Math.min(6, Math.floor((Number(r.date.slice(-2)) - 1) / 4)) === i,
        )
        .reduce((s, r) => s + r.amount, 0),
    );
    const max = Math.max(...amounts, 1);
    return (
      <>
        <div className="chart">
          <div className="chart-y">
            {[1, 0.75, 0.5, 0.25, 0].map((n) => (
              <span key={n}>{((max * n) / 1000000).toFixed(1)} jt</span>
            ))}
          </div>
          <div className="plot">
            <div className="gridlines">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="bars">
              {amounts.map((n, i) => (
                <div className="bar-col" key={i}>
                  <div
                    title={money(n)}
                    className={i === 4 ? "bar selected" : "bar"}
                    style={{ height: Math.max(2, (n / max) * 100) + "%" }}
                  />
                  <span>
                    {
                      [
                        "01–04",
                        "05–08",
                        "09–12",
                        "13–16",
                        "17–20",
                        "21–24",
                        "25–30",
                      ][i]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="chart-caption">
          Successful payments · IDR million · September 2026 · Demo data
        </p>
      </>
    );
  }
  function Dashboard() {
    const metrics =
      role === "Coach"
        ? [
            ["Team members", String(members.length), "Assigned roster", Users],
            ["My teams", String(teams.length), "Development group", Layers],
            [
              "Upcoming sessions",
              String(sessions.length),
              "September schedule",
              CalendarDays,
            ],
            [
              "Attendance records",
              String(scope("Attendance").length),
              "Recorded check-ins",
              ClipboardCheck,
            ],
          ]
        : role === "Member"
          ? [
              ["My membership", "Active", "Monthly Academy", CreditCard],
              [
                "My invoices",
                String(invoices.length),
                "Personal billing",
                FileText,
              ],
              [
                "Outstanding",
                money(outstanding.reduce((s, r) => s + r.amount, 0)),
                "Awaiting payment",
                Wallet,
              ],
              [
                "Next session",
                sessions[0]?.time || "—",
                "September schedule",
                CalendarDays,
              ],
            ]
          : [
              [
                "Total members",
                members.length.toLocaleString("en-US"),
                "Across " + teams.length + " active teams",
                Users,
              ],
              [
                "Revenue this month",
                money(role === "Administrator" ? fees : gross),
                "Successful payments only",
                Wallet,
              ],
              [
                "Payment success",
                Math.round((paid.length / Math.max(1, invoices.length)) * 100) +
                  "%",
                paid.length + " completed payments",
                Activity,
              ],
              [
                "Outstanding",
                money(outstanding.reduce((s, r) => s + r.amount, 0)),
                outstanding.length + " invoices need attention",
                FileText,
              ],
            ];
    return (
      <>
        <div className="welcome">
          <div>
            <p className="eyebrow">YOUR CLUB, AT A GLANCE</p>
            <h1>
              {role === "Administrator"
                ? "The Courvix overview"
                : role === "Coach"
                  ? "Let’s build a stronger team"
                  : role === "Member"
                    ? "Your next chapter starts here"
                    : `Selamat datang, ${identity?.name || "tim"}`}
              <span className="orange">.</span>
            </h1>
            <p>
              Here’s what’s happening{" "}
              {role === "Administrator"
                ? "across the platform"
                : "at " + org.name}{" "}
              today.
            </p>
          </div>
          <button className="btn" onClick={() => open({ type: "period" })}>
            <CalendarDays size={16} /> September 2026 <ChevronRight size={14} />
          </button>
        </div>
        <div className="metrics">
          {metrics.map(([label, value, sub, Icon]: any, i) => (
            <div className="metric" key={label}>
              <div className="metric-label">
                {label}
                <Icon size={18} />
              </div>
              <strong>{value}</strong>
              <small>
                <span className={i === 3 ? "orange" : "green-text"}>
                  {i === 3 ? "Review" : "●"}
                </span>{" "}
                {sub}
              </small>
            </div>
          ))}
        </div>
        <div className="dashboard-grid">
          <div className="panel revenue">
            <div className="panel-title">
              <div>
                <h2>{admin ? "Revenue overview" : "Your training schedule"}</h2>
                <p>
                  {admin
                    ? "A clear view of your club’s financial momentum."
                    : "Keep your next session in sight."}
                </p>
              </div>
              <span className="tag">This month</span>
            </div>
            {admin ? (
              <>
                <div className="chart-heading">
                  <strong>{money(gross)}</strong>
                  <span className="legend">
                    <i /> Membership payments
                  </span>
                </div>
                {Chart()}
              </>
            ) : (
              ScheduleList()
            )}
          </div>
          <div className="panel">
            <div className="panel-title">
              <h2>Upcoming sessions</h2>
              <button
                className="text-btn"
                onClick={() =>
                  go(role === "Administrator" ? "Clubs" : "Schedule")
                }
              >
                View all <ArrowUpRight size={15} />
              </button>
            </div>
            {ScheduleList()}
          </div>
          <div className="panel recent">
            <div className="panel-title">
              <div>
                <h2>{admin ? "Recent transactions" : "Team announcements"}</h2>
                <p>
                  {admin
                    ? "Every payment, accounted for."
                    : "Stay connected with your club."}
                </p>
              </div>
              <button
                className="text-btn"
                onClick={() => go(admin ? "Payments" : "Announcements")}
              >
                View all <ArrowUpRight size={15} />
              </button>
            </div>
            {admin ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(1, 6).map((r, i) => (
                    <TableRow
                      key={r.id}
                      onClick={() => open({ type: "payment", row: r })}
                      className="clickable"
                    >
                      <TableCell>
                        <div className="identity">
                          <span className={"avatar a" + (i % 4)}>
                            {initials(r.name)}
                          </span>
                          <div>
                            <strong>{r.name}</strong>
                            <small>{r.id}</small>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <b>{money(r.amount)}</b>
                      </TableCell>
                      <TableCell>{r.method}</TableCell>
                      <TableCell>
                        <Badge value={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              scope("Announcements").map((a) => (
                <div className="announcement" key={a.id}>
                  <Badge value={a.status} />
                  <h3>{a.name}</h3>
                  <p>{a.description}</p>
                </div>
              ))
            )}
          </div>
          <div className="right-stack">
            <div className="quick-panel">
              <span className="eyebrow">LESS ADMIN. MORE GAME.</span>
              <h2>Make your next move.</h2>
              <div className="quick-grid">
                {(admin
                  ? [
                      ["Add member", "Members", Users],
                      ["Create invoice", "Invoices", FileText],
                      ["Schedule session", "Schedule", CalendarDays],
                      ["Record attendance", "Attendance", ClipboardCheck],
                    ]
                  : [
                      ["My schedule", "Schedule", CalendarDays],
                      ["Attendance", "Attendance", ClipboardCheck],
                    ]
                ).map(([label, m, Icon]: any) => (
                  <button
                    key={label}
                    onClick={() =>
                      role === "Administrator"
                        ? go("Clubs")
                        : m === "Attendance"
                          ? go(m)
                          : admin
                            ? open({ type: "create", module: m })
                            : go(m)
                    }
                  >
                    <Icon size={19} />
                    <span>{label}</span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            </div>
            <div className="website-callout">
              <Globe size={24} />
              <div>
                <h3>Your club. Your digital home.</h3>
                <p>A website that plays for your team.</p>
                <button
                  className="text-btn"
                  onClick={() =>
                    role === "Admin" ? go("Website") : setSurface("landing")
                  }
                >
                  Explore club websites <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  function Attendance() {
    const s = sessions.find((s) => s.id === session) || sessions[0];
    const roster = members.filter((m) => m.team === s?.team);
    return (
      <>
        <div className="toolbar">
          <CourvixSelect
            aria-label="Pilih sesi"
            value={s?.id || ""}
            onChange={(e) => {
              setSession(e.target.value);
              setPg(1);
            }}
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.date} · {s.name}
              </option>
            ))}
          </CourvixSelect>
          <button
            className="btn"
            onClick={() => download(scope("Attendance"), "attendance")}
          >
            <Download size={16} />
            Export
          </button>
        </div>
        <div className="panel">
          <div className="panel-title">
            <h2>Session attendance</h2>
            <Badge value="Demo" />
          </div>
          {role === "Member" ? (
            <div className="empty">
              <ClipboardCheck />
              <h3>Riwayat kehadiran pribadi</h3>
              {scope("Attendance").map((a) => (
                <p key={a.id}>
                  {db.records.Schedule.find((s) => s.id === a.session)?.name} ·{" "}
                  {a.status}
                </p>
              ))}
              <p>Coach mencatat kehadiran saat latihan berlangsung.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Status kehadiran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.slice((pg - 1) * 15, pg * 15).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="identity">
                          <span className="avatar">{initials(m.name)}</span>
                          <strong>{m.name}</strong>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="attendance-actions">
                          {["Present", "Late", "Absent", "Excused"].map(
                            (status) => (
                              <button
                                disabled={busy}
                                className={
                                  "btn small " +
                                  (db.records.Attendance.find(
                                    (a) =>
                                      a.member === m.id && a.session === s.id,
                                  )?.status === status
                                    ? "primary"
                                    : "")
                                }
                                key={status}
                                onClick={() =>
                                  mutate(
                                    (d) => {
                                      const a = d.records.Attendance.find(
                                        (a) =>
                                          a.member === m.id &&
                                          a.session === s.id,
                                      );
                                      if (a) a.status = status;
                                      else
                                        d.records.Attendance.push({
                                          id: crypto.randomUUID(),
                                          club,
                                          member: m.id,
                                          session: s.id,
                                          name: m.name,
                                          status,
                                          date: s.date,
                                        });
                                      return d;
                                    },
                                    "Kehadiran " + m.name + " disimpan",
                                  )
                                }
                              >
                                {status}
                              </button>
                            ),
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="tablefoot">
                <span>
                  {roster.length} peserta · halaman {pg}
                </span>
                <div className="actions">
                  <button
                    className="btn small"
                    disabled={pg === 1}
                    onClick={() => setPg(pg - 1)}
                  >
                    Sebelumnya
                  </button>
                  <button
                    className="btn small"
                    disabled={pg * 15 >= roster.length}
                    onClick={() => setPg(pg + 1)}
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  }
  function Finance() {
    return (
      <>
        <div className="metrics">
          {[
            ["Gross payments", gross],
            ["Processing costs", fees + gateway],
            ["Expenses", expenses],
            ["Net cash flow", gross - fees - gateway - expenses],
          ].map(([k, v]) => (
            <div className="metric" key={k}>
              <div className="metric-label">{k}</div>
              <strong>{money(Number(v))}</strong>
              <small>September 2026 · demo</small>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="panel-title">
            <h2>Cash flow overview</h2>
            <div className="actions">
              <button
                className="btn"
                onClick={() => download(invoices, "financial-report")}
              >
                <Download size={16} /> Export
              </button>
              {page === "Finance" && (
                <button
                  className="btn primary"
                  onClick={() => open({ type: "create", module: "Expenses" })}
                >
                  <Plus size={16} /> Pengeluaran
                </button>
              )}
            </div>
          </div>
          {Chart()}
          <div className="breakdown padded">
            {scope("Expenses").map((r) => (
              <p key={r.id}>
                <span>{r.name}</span>
                <b>{money(r.amount)}</b>
              </p>
            ))}
            <p>
              <span>Gross − platform fee − gateway − expenses</span>
              <b>{money(gross - fees - gateway - expenses)}</b>
            </p>
          </div>
        </div>
      </>
    );
  }
  function SettingsPage() {
    if (role === "Admin")
      return (
        <ClubAccess
          onUpdated={() => {
            fetch("/api/demo-state")
              .then(async (r) => {
                if (!r.ok) return;
                const p = (await r.json()) as { data: DB; revision: number };
                setDb(p.data);
                revision.current = p.revision;
              })
              .catch(() => {});
          }}
        />
      );
    return (
      <div className="settings-grid">
        <div className="panel padded">
          <p className="eyebrow">
            {role === "Administrator"
              ? "PLATFORM CONFIGURATION"
              : "CLUB WORKSPACE"}
          </p>
          <h2>
            {role === "Administrator" ? "Transaction fee policy" : org.name}
          </h2>
          <p className="hint">
            Perubahan berlaku untuk pembayaran berikutnya. Histori tidak
            dihitung ulang.
          </p>
          {role === "Administrator" ? (
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                mutate((d) => {
                  const fee = {
                    type: String(f.get("type")),
                    rate: Number(f.get("rate")),
                    min: Number(f.get("min")),
                    max: Number(f.get("max")),
                    flat: Number(f.get("flat")),
                    gateway: Number(f.get("gateway")),
                  };
                  if (
                    fee.max < fee.min ||
                    Object.values(fee).some(
                      (v) =>
                        typeof v === "number" && (!Number.isFinite(v) || v < 0),
                    )
                  )
                    throw Error(
                      "Konfigurasi tidak valid. Maksimum harus lebih besar dari minimum.",
                    );
                  d.fee = fee;
                  return d;
                }, "Kebijakan fee diperbarui");
              }}
            >
              <label>
                Tipe fee
                <CourvixSelect name="type" defaultValue={db.fee.type}>
                  <option>Percentage</option>
                  <option>Fixed</option>
                </CourvixSelect>
              </label>
              {[
                ["rate", "Persentase (%)"],
                ["min", "Minimum (Rp)"],
                ["max", "Maksimum (Rp)"],
                ["flat", "Flat fee (Rp)"],
                ["gateway", "Gateway simulasi VA (Rp)"],
              ].map(([k, l]) => (
                <label key={k}>
                  {l}
                  <input
                    required
                    name={k}
                    type="number"
                    min="0"
                    step={k === "rate" ? ".1" : "1"}
                    defaultValue={(db.fee as any)[k]}
                  />
                </label>
              ))}
              <button disabled={busy} className="btn primary">
                Simpan kebijakan
              </button>
            </form>
          ) : (
            <>
              <div className="breakdown">
                <p>
                  <span>Subscription demo</span>
                  <b>Club · Rp399.000 / bulan</b>
                </p>
                <p>
                  <span>Platform fee</span>
                  <b>
                    {db.fee.rate}% · min {money(db.fee.min)}
                  </b>
                </p>
                <p>
                  <span>Batas maksimum</span>
                  <b>{money(db.fee.max)}</b>
                </p>
                <p>
                  <span>Anggota</span>
                  <b>{members.length}</b>
                </p>
              </div>
              <button
                className="btn"
                onClick={() => open({ type: "onboarding" })}
              >
                Onboarding klub <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
        <div className="panel padded">
          <Shield className="orange" size={30} />
          <h2>Demo environment</h2>
          <p>
            Data dan transaksi adalah simulasi. Jangan masukkan password,
            dokumen pribadi, atau data kartu.
          </p>
          <p className="hint">
            Autentikasi produksi, domain, pesan eksternal, dan payment gateway
            membutuhkan backend serta konfigurasi merchant.
          </p>
          <p className="hint">
            Akun, undangan, dan data klub tersimpan dalam demo privat ini.
            Keluar untuk mencoba identitas demo lainnya.
          </p>
        </div>
      </div>
    );
  }
  function Website() {
    const site = db.websites[club];
    return (
      <div className="settings-grid">
        <div className="panel padded">
          <h2>Club website editor</h2>
          <p className="hint">
            Edit konten dan lihat preview. Domain publik belum terhubung.
          </p>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget));
              mutate((d) => {
                d.websites[club] = {
                  title: String(f.title),
                  headline: String(f.headline),
                  about: String(f.about),
                };
                return d;
              }, "Konten website disimpan");
            }}
          >
            {Object.entries(site).map(([k, v]) => (
              <label key={k}>
                {k}
                <input name={k} defaultValue={v} required />
              </label>
            ))}
            <button className="btn primary" disabled={busy}>
              Simpan konten
            </button>
          </form>
        </div>
        <div className="club-preview">
          <Badge value="Demo preview" />
          <p className="eyebrow">{site.title}</p>
          <h2>{site.headline}</h2>
          <p>{site.about}</p>
          <button
            className="btn primary"
            onClick={() => open({ type: "create", module: "Projects" })}
          >
            Konsultasi website <ArrowUpRight size={16} />
          </button>
          <span className="preview-footer">{org.sport} · Indonesia</span>
        </div>
      </div>
    );
  }
  function Payment() {
    const r = modal.row;
    if (r.status === "Refunded")
      return (
        <>
          <Badge value="Refunded" />
          <div className="breakdown">
            <p>
              <span>Nilai dikembalikan</span>
              <b>{money(r.amount)}</b>
            </p>
            <p>
              <span>Fee platform dibalikkan</span>
              <b>{money(r.reversedFee || r.fee)}</b>
            </p>
            <p>
              <span>Biaya gateway historis</span>
              <b>{money(r.gateway)}</b>
            </p>
          </div>
          <p className="hint">
            Transaksi refund simulasi selesai. Histori pembayaran dipertahankan.
          </p>
        </>
      );
    return (
      <>
        <div className="invoice-total">
          <small>TAGIHAN MEMBERSHIP</small>
          <h2>{money(r.amount)}</h2>
          <Badge value={r.status} />
        </div>
        <div className="breakdown">
          {[
            ["Member", r.name],
            ["Invoice", r.id.slice(0, 16)],
            [
              "Fee Courvix",
              money(r.status === "Paid" ? r.fee : feeFor(r.amount, db.fee)),
            ],
            [
              "Gateway · simulasi VA",
              money(r.status === "Paid" ? r.gateway : db.fee.gateway),
            ],
            [
              "Penerimaan klub",
              money(
                r.amount -
                  (r.status === "Paid" ? r.fee : feeFor(r.amount, db.fee)) -
                  (r.status === "Paid" ? r.gateway : db.fee.gateway),
              ),
            ],
          ].map(([k, v]) => (
            <p key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </p>
          ))}
        </div>
        <p className="hint">
          Simulasi. Tidak ada uang dipindahkan. Biaya ditanggung klub.
        </p>
        {!["Paid", "Refunded"].includes(r.status) ? (
          <div className="actions">
            <button
              className="btn primary"
              disabled={busy}
              onClick={() =>
                mutate((d) => {
                  const p = d.records.Invoices.find((p) => p.id === r.id)!;
                  if (p.status === "Paid") return d;
                  p.status = "Paid";
                  p.fee = feeFor(p.amount, d.fee);
                  p.gateway = d.fee.gateway;
                  p.method = "Virtual Account";
                  p.reference = "SIM-" + crypto.randomUUID();
                  return d;
                }, "Pembayaran simulasi berhasil")
              }
            >
              Simulasikan berhasil
            </button>
            <button
              className="btn"
              disabled={busy}
              onClick={() =>
                mutate((d) => {
                  d.records.Invoices.find((p) => p.id === r.id)!.status =
                    "Failed";
                  return d;
                }, "Pembayaran ditandai gagal")
              }
            >
              Gagal
            </button>
          </div>
        ) : admin && r.status === "Paid" ? (
          <button
            className="btn danger"
            onClick={() => open({ type: "refund", row: r })}
          >
            Refund pembayaran
          </button>
        ) : null}
      </>
    );
  }
  if (!ready || !identity)
    return (
      <main className="access-main" style={{ minHeight: "100vh" }}>
        <h1>Courvix</h1>
        <p role={loadError ? "alert" : "status"}>
          {loadError || "Memeriksa sesi demo…"}
        </p>
        {loadError && (
          <>
            <button className="btn" onClick={() => location.reload()}>
              Coba lagi
            </button>
            <a href="/login">Kembali ke login</a>
          </>
        )}
      </main>
    );
  return (
    <>
      <Toaster position="bottom-right" richColors />
      {surface === "landing" ? (
        <Landing
          enter={(r = "Admin", p = "Dashboard") => {
            setRole(r);
            go(p);
            setSurface("app");
            location.hash = "app";
          }}
          contact={() => open({ type: "create", module: "Projects" })}
          legal={() => open({ type: "legal" })}
        />
      ) : (
        <SidebarProvider>
          <Sidebar className="courvix-sidebar">
            <SidebarHeader>
              <button
                className="brand-button"
                onClick={() => {
                  setSurface("landing");
                  location.hash = "landing";
                }}
              >
                <Brand />
              </button>
              <div className="club-switch">
                <span className="club-icon">{org.short}</span>
                <div>
                  <strong>
                    {role === "Administrator" ? "Courvix · Platform" : org.name}
                  </strong>
                  <small>
                    Club workspace <span>DEMO</span>
                  </small>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <span className="nav-label">WORKSPACE</span>
              <SidebarMenu>
                {roleNav[role].map((item, i) => {
                  const Icon = icons[item];
                  return (
                    <SidebarMenuItem key={item}>
                      {[8, 15].includes(i) && (
                        <span className="nav-label">
                          {i === 8 ? "BUSINESS" : "CLUB SETTINGS"}
                        </span>
                      )}
                      <SidebarMenuButton
                        onClick={() => go(item)}
                        isActive={page === item}
                        className="nav-item"
                      >
                        <Icon size={18} />
                        <span>{item}</span>
                        {item === "Invoices" && (
                          <span className="nav-count">
                            {outstanding.length}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="session-identity">
                <strong>{identity?.name}</strong>
                <small>
                  {role} · {role === "Administrator" ? "Platform" : org.short}
                </small>
              </div>
              <button
                className="user-profile"
                onClick={logout}
                aria-label="Keluar dari demo"
              >
                <span className="avatar user">GP</span>
                <span>
                  <strong>Keluar dari demo</strong>
                  <small>
                    {role === "Admin" ? "Club administrator" : role}
                  </small>
                </span>
                <LogOut size={17} />
              </button>
            </SidebarFooter>
          </Sidebar>
          <main className="workspace">
            <header className="topbar">
              <div className="breadcrumb">
                <SidebarTrigger />
                <span>Workspace</span>
                <ChevronRight size={14} />
                <b>{page}</b>
              </div>
              <div className="topbar-actions">
                <button
                  className="top-search"
                  onClick={() => open({ type: "search" })}
                >
                  <Search size={17} />
                  <span>Search anything...</span>
                  <kbd>⌕</kbd>
                </button>
                <span className="demo-pill">Demo workspace</span>
                <button
                  className="icon-btn notification"
                  aria-label="Notifications"
                  onClick={() => setNotice(!notice)}
                >
                  <Bell size={19} />
                  <i />
                </button>
                <span className="avatar user tiny">GP</span>
              </div>
            </header>
            {notice && (
              <div className="notification-panel">
                <h3>Notifications</h3>
                <p>{outstanding.length} tagihan menunggu pembayaran.</p>
                <p>Jadwal latihan September tersedia.</p>
                <button
                  className="text-btn"
                  onClick={() => {
                    setNotice(false);
                    go(
                      role === "Administrator" ? "Audit logs" : "Announcements",
                    );
                  }}
                >
                  Lihat pengumuman <ArrowRight size={14} />
                </button>
              </div>
            )}
            <div className="workspace-body">
              {!ready ? (
                <div className="loading">Preparing your workspace…</div>
              ) : (
                <>
                  {page !== "Dashboard" && (
                    <div className="page-heading">
                      <div>
                        <p className="eyebrow">{org.name.toUpperCase()}</p>
                        <h1>
                          {page}
                          <span className="orange">.</span>
                        </h1>
                        <p>Your club operations, connected.</p>
                      </div>
                      <span className="tag">September 2026 · Demo</span>
                    </div>
                  )}
                  {error && !modal && (
                    <p className="error" role="alert">
                      {error}
                    </p>
                  )}
                  {role === "Admin" && page === "Members" && (
                    <div className="onboard-links">
                      <button className="btn" onClick={() => go("Settings")}>
                        Undang member / coach
                      </button>
                      <span className="hint">
                        Tambah manual untuk pendataan; undang untuk memberi
                        akses login.
                      </span>
                    </div>
                  )}
                  {role === "Administrator" && page === "Clubs" && (
                    <div className="onboard-links">
                      <a href="/register">
                        Simulasikan pendaftaran klub mandiri ↗
                      </a>
                      <p className="hint">
                        Klub membuat akun admin, memilih paket, lalu memulai
                        trial. Administrator memantau klub dan subscription.
                      </p>
                    </div>
                  )}
                  {page === "Dashboard" ? (
                    Dashboard()
                  ) : page === "Teams" ? (
                    <TeamsView
                      teams={teams}
                      members={members}
                      canEdit={admin}
                      create={() => open({ type: "create", module: "Teams" })}
                      open={(row) =>
                        open({ type: "detail", row, module: "Teams" })
                      }
                    />
                  ) : page === "Schedule" ? (
                    <CalendarView
                      sessions={sessions}
                      canEdit={admin}
                      create={() =>
                        open({ type: "create", module: "Schedule" })
                      }
                      open={(row) =>
                        open({ type: "detail", row, module: "Schedule" })
                      }
                    />
                  ) : page === "Attendance" ? (
                    Attendance()
                  ) : page === "Finance" || page === "Reports" ? (
                    Finance()
                  ) : page === "Settings" ? (
                    SettingsPage()
                  ) : page === "Website" ? (
                    Website()
                  ) : page === "Clubs" ? (
                    <div className="team-grid">
                      {organizations.map((c: any) => (
                        <div className="panel padded" key={c.id}>
                          <span className="club-icon">{c.short}</span>
                          <h2>{c.name}</h2>
                          <p>{c.sport} · Indonesia</p>
                          <p>
                            {
                              db.records.Members.filter((m) => m.club === c.id)
                                .length
                            }{" "}
                            members
                          </p>
                          <button
                            className="btn"
                            onClick={() => {
                              open({ type: "club-info", clubInfo: c });
                            }}
                          >
                            Detail klub <ArrowRight size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    List()
                  )}
                  <div className="workspace-footer">
                    <span>Courvix · Built for the people behind the game.</span>
                    <span>
                      {storage === "cloud"
                        ? "Demo data · Saved to your private account"
                        : "Demo data · Stored on this device"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </main>
          <nav className="mobile-nav" aria-label="Navigasi utama mobile">
            {roleNav[role]
              .filter((p) =>
                ["Dashboard", "Members", "Schedule", "Payments"].includes(p),
              )
              .map((p) => {
                const Icon = icons[p];
                return (
                  <button
                    key={p}
                    className={page === p ? "active" : ""}
                    onClick={() => go(p)}
                  >
                    <Icon size={19} />
                    <span>{p === "Dashboard" ? "Home" : p}</span>
                  </button>
                );
              })}
            <div>
              <SidebarTrigger />
              <span>More</span>
            </div>
          </nav>
        </SidebarProvider>
      )}
      <Dialog
        open={!!modal}
        onOpenChange={(v) => {
          if (!v && !busy) setModal(null);
        }}
      >
        <DialogContent className="courvix-modal">
          <DialogTitle>
            {modal?.type === "create"
              ? (modal.edit ? "Edit " : "Tambah ") + modal.module
              : modal?.type === "payment"
                ? "Payment details"
                : modal?.type === "search"
                  ? "Search your workspace"
                  : modal?.type === "refund"
                    ? "Refund pembayaran ini?"
                    : modal?.type === "reset"
                      ? "Reset seluruh data demo?"
                      : modal?.type === "legal"
                        ? "Privacy & terms · Demo"
                        : modal?.type === "onboarding"
                          ? "Welcome to Courvix"
                          : modal?.type === "period"
                            ? "Demo reporting period"
                            : modal?.row?.name || "Courvix"}
          </DialogTitle>
          <DialogDescription>
            Courvix demo workspace · Tidak ada transaksi atau pengiriman pesan
            nyata.
          </DialogDescription>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {modal?.type === "create" && (
            <form className="form" onSubmit={submit}>
              {fields(modal.module).map(([name, label, type]) => (
                <label key={name}>
                  {label}
                  <span className="orange"> *</span>
                  {type === "textarea" ? (
                    <textarea
                      defaultValue={modal.edit?.[name]}
                      required
                      name={name}
                      maxLength={2000}
                    />
                  ) : type === "team" || type === "member" ? (
                    <CourvixSelect
                      defaultValue={modal.edit?.[name]}
                      required
                      name={name}
                    >
                      {(type === "team" ? teams : members).map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </CourvixSelect>
                  ) : (
                    <input
                      defaultValue={modal.edit?.[name]}
                      required
                      name={name}
                      type={type || (name === "email" ? "email" : "text")}
                      min={type === "number" ? 1 : undefined}
                      maxLength={200}
                    />
                  )}
                </label>
              ))}
              <button disabled={busy} className="btn primary">
                {busy ? "Menyimpan..." : "Simpan " + modal.module}
              </button>
            </form>
          )}
          {modal?.type === "payment" && Payment()}
          {modal?.type === "period" && (
            <p>
              Data contoh mencakup September 2026. Gunakan ekspor untuk
              memeriksa transaksi dan tanggal. Rentang laporan produksi akan
              mengikuti data akun klub.
            </p>
          )}
          {modal?.type === "refund" && (
            <>
              <p>
                Nilai pembayaran simulasi dikembalikan. Fee platform dibalikkan;
                biaya gateway historis tetap dicatat.
              </p>
              <button
                disabled={busy}
                className="btn danger"
                onClick={() =>
                  mutate((d) => {
                    const r = d.records.Invoices.find(
                      (x) => x.id === modal.row.id,
                    );
                    if (!admin || !r || r.status !== "Paid")
                      throw Error("Refund tidak diizinkan.");
                    r.status = "Refunded";
                    r.refund = r.amount;
                    r.reversedFee = r.fee;
                    return d;
                  }, "Refund simulasi dicatat")
                }
              >
                Konfirmasi refund
              </button>
            </>
          )}
          {modal?.type === "club-info" && (
            <div className="breakdown">
              <h2>{modal.clubInfo.name}</h2>
              <p>
                Olahraga <b>{modal.clubInfo.sport}</b>
              </p>
              <p>
                Subscription{" "}
                <b>
                  {modal.clubInfo.status} · {modal.clubInfo.plan}
                </b>
              </p>
              <p>Admin klub mengelola workspace melalui akun mereka sendiri.</p>
            </div>
          )}
          {modal?.type === "reset" && (
            <>
              <p>
                Semua perubahan lokal akan diganti dengan data awal. Tindakan
                tidak dapat dibatalkan.
              </p>
              <button
                className="btn danger"
                disabled={busy}
                onClick={() => mutate(() => seed(), "Data demo direset")}
              >
                Reset demo
              </button>
            </>
          )}
          {modal?.type === "detail" && (
            <>
              {modal.module === "Members" ? (
                <MemberDetails
                  member={modal.row}
                  team={teams.find((t) => t.id === modal.row.team)}
                  attendance={scope("Attendance").filter(
                    (a) => a.member === modal.row.id,
                  )}
                  invoices={invoices.filter((i) => i.member === modal.row.id)}
                  audit={scope("Audit logs")}
                  financial={admin}
                />
              ) : (
                <div className="breakdown">
                  {Object.entries(modal.row)
                    .filter(
                      ([k]) =>
                        !["club", "id"].includes(k) &&
                        (role !== "Coach" || !["amount", "email"].includes(k)),
                    )
                    .map(([k, v]) => (
                      <p key={k}>
                        <span>{k}</span>
                        <b>{String(v)}</b>
                      </p>
                    ))}
                </div>
              )}
              {admin &&
                [
                  "Members",
                  "Teams",
                  "Coaches",
                  "Schedule",
                  "Training",
                  "Competitions",
                  "Membership",
                  "Announcements",
                  "Documents",
                  "Projects",
                ].includes(modal.module) && (
                  <button
                    className="btn primary"
                    onClick={() =>
                      open({
                        type: "create",
                        module: modal.module,
                        edit: modal.row,
                      })
                    }
                  >
                    Edit detail
                  </button>
                )}
              {modal.module === "Members" && admin && (
                <button
                  className="btn"
                  disabled={busy}
                  onClick={() =>
                    mutate((d) => {
                      const m = d.records.Members.find(
                        (x) => x.id === modal.row.id,
                      )!;
                      m.status =
                        m.status === "Archived" ? "Active" : "Archived";
                      return d;
                    }, "Status anggota diperbarui")
                  }
                >
                  {modal.row.status === "Archived" ? "Aktifkan" : "Arsipkan"}{" "}
                  anggota
                </button>
              )}
            </>
          )}
          {modal?.type === "search" && (
            <>
              <input
                autoFocus
                aria-label="Pencarian global"
                placeholder="Nama, tim, invoice, atau jadwal..."
                className="global-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="search-results">
                {["Members", "Teams", "Schedule", "Invoices", "Documents"]
                  .filter((m) => roleNav[role].includes(m))
                  .flatMap((m) =>
                    filtered(m)
                      .slice(0, 4)
                      .map((r) => (
                        <button
                          key={m + r.id}
                          onClick={() => {
                            go(m);
                            open({
                              type: m === "Invoices" ? "payment" : "detail",
                              row: r,
                              module: m,
                            });
                          }}
                        >
                          <span>
                            <b>{r.name}</b>
                            <small>{m}</small>
                          </span>
                          <ChevronRight size={16} />
                        </button>
                      )),
                  )}
              </div>
            </>
          )}
          {modal?.type === "onboarding" && (
            <div className="onboarding">
              {[
                "Create your club",
                "Choose sports",
                "Create teams",
                "Invite coaches",
                "Import members",
                "Create membership plans",
                "Connect payments",
                "Launch club website",
              ].map((s, i) => (
                <button
                  key={s}
                  onClick={() => {
                    go(
                      [
                        "Settings",
                        "Settings",
                        "Teams",
                        "Coaches",
                        "Members",
                        "Membership",
                        "Settings",
                        "Website",
                      ][i],
                    );
                    setModal(null);
                  }}
                >
                  <span>{i < 6 ? <Check size={16} /> : i + 1}</span>
                  <div>
                    <b>{s}</b>
                    <small>
                      {i < 6
                        ? "Demo configuration ready"
                        : "Production setup required"}
                    </small>
                  </div>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          )}
          {modal?.type === "legal" && (
            <p>
              Data sintetis dan perubahan disimpan pada browser, bukan akun
              produksi. Jangan memasukkan informasi sensitif. Harga bersifat
              ilustratif; pembayaran, domain, dan pesan eksternal belum aktif.
              Kebijakan privasi dan syarat layanan produksi perlu ditetapkan
              sebelum menerima pengguna nyata.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

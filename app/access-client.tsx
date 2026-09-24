"use client";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { ArrowUpRight, Shield, Users, Check, Copy, LogOut } from "lucide-react";
import "./access.css";
export async function accessAction(body: Record<string, unknown>) {
  const r = await fetch("/api/access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = (await r.json()) as { error?: string };
  if (!r.ok) throw Error(data.error || "Permintaan gagal. Coba lagi.");
  return data;
}
export default function AccessPage({
  mode = "login",
}: {
  mode?: "login" | "register" | "join";
}) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [selected, setSelected] = useState("batam-admin");
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/access", { signal: c.signal })
      .then(async (r) => {
        if (!r.ok)
          throw Error(
            "Demo belum dapat dimuat. Muat ulang untuk mencoba lagi.",
          );
        setData(await r.json());
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const form = Object.fromEntries(new FormData(e.currentTarget));
      await accessAction({
        ...form,
        action:
          mode === "login"
            ? "login"
            : mode === "register"
              ? "register"
              : "join",
        ...(mode === "login" ? { account: selected } : {}),
      });
      location.assign("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal. Coba lagi.");
      setBusy(false);
      lock.current = false;
    }
  }
  return (
    <main className="access-shell">
      <section className="access-story">
        <a href="/" className="access-logo">
          courvix<span>.</span>
        </a>
        <div>
          <span className="access-kicker">
            YOUR CLUB. YOUR PEOPLE. YOUR SPACE.
          </span>
          <h1>
            SATU TIM.
            <br />
            SATU RUANG.
            <br />
            <em>SATU TUJUAN.</em>
          </h1>
          <p>
            Dari pendaftaran klub, hingga latihan pertama. Kelola perjalanan
            timmu di Courvix.
          </p>
          <div className="access-steps">
            <span>01 · Daftarkan klub</span>
            <span>02 · Pilih paket & coba trial</span>
            <span>03 · Undang timmu</span>
          </div>
        </div>
        <small>DEMO INTERAKTIF · TANPA PEMBAYARAN NYATA</small>
      </section>
      <section className="access-main">
        <nav>
          <a href="/login" aria-current={mode === "login" ? "page" : undefined}>
            Masuk demo
          </a>
          <a
            href="/register"
            aria-current={mode === "register" ? "page" : undefined}
          >
            Daftar klub
          </a>
          <a href="/join" aria-current={mode === "join" ? "page" : undefined}>
            Punya undangan?
          </a>
        </nav>
        <form onSubmit={submit}>
          <span className="access-kicker">
            {mode === "login"
              ? "WELCOME BACK"
              : mode === "register"
                ? "YOUR CLUB STARTS HERE"
                : "JOIN YOUR TEAM"}
          </span>
          <h2>
            {mode === "login"
              ? "Masuk ke ruang klubmu."
              : mode === "register"
                ? "Buat workspace klub."
                : "Gabung lewat undangan."}
          </h2>
          <p>
            {mode === "login"
              ? "Pilih identitas demo. Role dan klub mengikuti akun yang dipilih, tanpa pergantian role di dashboard."
              : mode === "register"
                ? "Daftar mandiri sebagai Admin klub. Mulai trial 14 hari; aktivasi subscription dapat disimulasikan dari dashboard."
                : "Masukkan kode unik dan email yang menerima undangan. Klub, role, serta tim ditentukan oleh admin pengundang."}
          </p>
          {mode === "login" ? (
            <>
              <label>
                Akun demo
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  disabled={!data}
                >
                  {data?.accounts.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.role}
                    </option>
                  ))}
                </select>
              </label>
              <div className="access-account">
                <Shield />
                <div>
                  <strong>
                    {data?.accounts.find((a: any) => a.id === selected)?.role ||
                      "Memuat akun…"}
                  </strong>
                  <p>
                    {selected === "platform-owner"
                      ? "Pengelola platform Courvix"
                      : data?.clubs.find(
                          (c: any) =>
                            c.id ===
                            data?.accounts.find((a: any) => a.id === selected)
                              ?.club,
                        )?.name}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <label>
                Nama lengkap
                <input
                  name="name"
                  required
                  maxLength={100}
                  autoComplete="name"
                />
              </label>
              <label>
                Email demo
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={150}
                  autoComplete="email"
                />
              </label>
              {mode === "register" ? (
                <>
                  <label>
                    Nama klub
                    <input name="clubName" required maxLength={150} />
                  </label>
                  <label>
                    Cabang olahraga
                    <input
                      name="sport"
                      required
                      maxLength={80}
                      placeholder="Contoh: Basket, Badminton, Renang"
                    />
                  </label>
                  <label>
                    Rencana paket
                    <select name="plan" defaultValue="Growth">
                      <option>Starter</option>
                      <option>Growth</option>
                      <option>Club Pro</option>
                    </select>
                  </label>
                  <div className="access-account">
                    <Check />
                    <p>
                      Trial 14 hari · Tidak perlu kartu · Harga paket masih
                      rancangan demo
                    </p>
                  </div>
                </>
              ) : (
                <label>
                  Kode undangan
                  <input
                    name="code"
                    required
                    maxLength={50}
                    placeholder="CVX-..."
                    autoComplete="off"
                  />
                </label>
              )}
            </>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary" disabled={busy || !data}>
            {busy
              ? "Memproses…"
              : mode === "login"
                ? "Masuk demo"
                : mode === "register"
                  ? "Buat klub & mulai trial"
                  : "Terima undangan"}
            <ArrowUpRight size={18} />
          </button>
          <p className="access-note">
            Login ini adalah pemilihan identitas dalam demo privat, bukan
            autentikasi akun produksi. Gunakan data contoh. Tidak ada email atau
            transaksi nyata.
          </p>
        </form>
        <a href="/" className="text-btn">
          Kembali ke website Courvix
        </a>
      </section>
    </main>
  );
}
export function ClubAccess({ onUpdated }: { onUpdated?: () => void }) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function refresh() {
    const r = await fetch("/api/access");
    if (!r.ok) throw Error("Pengaturan klub belum dapat dimuat.");
    setData(await r.json());
  }
  useEffect(() => {
    let mounted = true;
    fetch("/api/access")
      .then(async (r) => {
        if (!r.ok) throw Error("Pengaturan belum dapat dimuat.");
        const d = await r.json();
        if (mounted) setData(d);
      })
      .catch((e) => {
        if (mounted) setError(e.message);
      });
    return () => {
      mounted = false;
    };
  }, []);
  async function act(body: any) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await accessAction(body);
      await refresh();
      setNotice(
        body.action === "subscribe"
          ? "Subscription demo aktif. Tidak ada uang yang ditagihkan."
          : body.action === "revoke"
            ? "Undangan dicabut."
            : "Undangan berhasil dibuat. Salin kode untuk simulasi penerimaan.",
      );
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Coba kembali.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const club = data?.clubs.find((c: any) => c.id === data.session?.club);
  return (
    <div className="club-access">
      <div className="panel padded">
        <h2>Subscription klub</h2>
        <p>
          Workspace: <strong>{club?.name || "Memuat…"}</strong>
        </p>
        <p>
          <span className="badge amber">{club?.status || "—"}</span> ·{" "}
          {club?.plan}{" "}
          {club?.status === "Trial" &&
            club?.trialEnds &&
            " · Trial sampai " +
              new Date(club.trialEnds).toLocaleDateString("id-ID")}
        </p>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            act({
              action: "subscribe",
              plan: new FormData(e.currentTarget).get("plan"),
            });
          }}
        >
          <label>
            Paket
            <select name="plan" defaultValue="Growth">
              <option>Starter</option>
              <option>Growth</option>
              <option>Club Pro</option>
            </select>
          </label>
          <button disabled={busy || !data} className="btn primary">
            Simulasikan aktivasi subscription
          </button>
        </form>
        <p className="hint">
          Paket platform terpisah dari iuran member. Aktivasi ini simulasi,
          tanpa gateway atau penagihan nyata.
        </p>
      </div>
      <div className="panel padded">
        <h2>Undang coach & member</h2>
        <p className="hint">
          Satu kode hanya untuk satu penerima, berlaku 7 hari, dan tidak dapat
          digunakan ulang. Member yang sudah dicatat manual ditautkan melalui
          email yang sama.
        </p>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            act({
              action: "invite",
              ...Object.fromEntries(new FormData(e.currentTarget)),
            });
          }}
        >
          <label>
            Email penerima
            <input name="email" type="email" required maxLength={150} />
          </label>
          <label>
            Role
            <select name="role">
              <option>Member</option>
              <option>Coach</option>
            </select>
          </label>
          <label>
            Tim
            <select name="team" required>
              {data?.teams.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="btn primary"
            disabled={busy || !data?.teams.length}
          >
            Buat undangan unik
          </button>
        </form>
      </div>
      <div className="panel padded access-invites">
        <h2>Daftar undangan</h2>
        {!data?.invites.length && (
          <p className="hint">
            Belum ada undangan. Tambah member secara manual atau buat kode di
            atas.
          </p>
        )}
        {data?.invites.map((i: any) => (
          <article key={i.id}>
            <div>
              <strong>{i.email}</strong>
              <p>
                {i.role} ·{" "}
                {i.used
                  ? "Sudah dipakai"
                  : i.revoked
                    ? "Dicabut"
                    : i.expires < Date.now()
                      ? "Kedaluwarsa"
                      : "Aktif"}
              </p>
              <small>
                Berlaku hingga {new Date(i.expires).toLocaleString("id-ID")}
              </small>
              <code>{i.code}</code>
            </div>
            {!i.used && !i.revoked && i.expires > Date.now() && (
              <div className="actions">
                <button
                  className="btn"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(i.code);
                      setNotice(
                        "Kode disalin. Buka /join untuk mencoba penerimaan undangan.",
                      );
                    } catch {
                      setError(
                        "Clipboard tidak tersedia. Pilih dan salin kode yang ditampilkan.",
                      );
                    }
                  }}
                >
                  <Copy size={15} />
                  Salin
                </button>
                <button
                  className="btn danger"
                  disabled={busy}
                  onClick={() => act({ action: "revoke", id: i.id })}
                >
                  Cabut
                </button>
              </div>
            )}
          </article>
        ))}
        <a href="/join" className="text-btn">
          Coba halaman penerimaan undangan <ArrowUpRight size={16} />
        </a>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="access-success">
          {notice}
        </p>
      )}
    </div>
  );
}

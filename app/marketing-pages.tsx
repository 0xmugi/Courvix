"use client";
import { useState, useRef, type FormEvent } from "react";
import {
  ArrowUpRight,
  Check,
  Users,
  CalendarDays,
  Wallet,
  ClipboardCheck,
  Globe,
  Shield,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { money, feeFor, seed, type DB } from "@/lib/courvix";
export const modules = [
  {
    icon: Users,
    title: "Member & tim",
    text: "Profil member, kelompok latihan, status keanggotaan, serta penugasan coach dalam satu tempat.",
    detail:
      "Susun roster berdasarkan usia, level, atau program. Telusuri data member tanpa mencari ulang di percakapan grup.",
  },
  {
    icon: CalendarDays,
    title: "Jadwal latihan",
    text: "Atur agenda latihan, lokasi, coach, dan tim yang mengikuti setiap sesi.",
    detail:
      "Lihat jadwal dalam kalender atau agenda. Semua sesi terhubung dengan tim agar pengurus lebih mudah mengatur kegiatan.",
  },
  {
    icon: ClipboardCheck,
    title: "Absensi yang rapi",
    text: "Catat kehadiran per sesi dan lihat riwayat aktivitas setiap member.",
    detail:
      "Coach bisa mencatat hadir, izin, sakit, atau absen. Evaluasi konsistensi latihan dengan riwayat yang mudah ditelusuri.",
  },
  {
    icon: Wallet,
    title: "Tagihan & pembayaran",
    text: "Pantau iuran, status invoice, rincian fee, dan riwayat transaksi.",
    detail:
      "Demo mencakup alur QRIS dan virtual account. Pembayaran di versi ini adalah simulasi; tidak ada uang yang dipindahkan.",
  },
  {
    icon: Shield,
    title: "Peran yang jelas",
    text: "Ruang kerja untuk administrator, admin klub, coach, dan member.",
    detail:
      "Coba sudut pandang tiap peran melalui demo. Penerapan akses dan akun klub produksi disesuaikan saat implementasi.",
  },
  {
    icon: Globe,
    title: "Identitas digital klub",
    text: "Kelola profil klub dan rencanakan website atau sistem khusus sesuai kebutuhan.",
    detail:
      "Dari halaman publik klub sampai alur operasional khusus, identitas klub tetap menjadi pusat pengalaman.",
  },
];
export function Intro({
  label,
  title,
  accent,
  text,
}: {
  label: string;
  title: string;
  accent: string;
  text: string;
}) {
  return (
    <section className="cv-intro">
      <div className="cv-eyebrow">{label}</div>
      <h1>
        {title}
        <br />
        <em>{accent}</em>
      </h1>
      <p>{text}</p>
    </section>
  );
}
export function CTA() {
  return (
    <section className="cv-cta">
      <div>
        <div className="cv-eyebrow">YOUR NEXT CHAPTER STARTS HERE</div>
        <h2>
          SIAP MEMBAWA
          <br />
          KLUBMU <span>NAIK KELAS?</span>
        </h2>
      </div>
      <div>
        <p>
          Coba alurnya. Temukan kebutuhan klubmu.
          <br />
          Bangun langkah berikutnya bersama Courvix.
        </p>
        <a className="cv-button dark" href="/dashboard">
          Masuk ke demo <ArrowUpRight />
        </a>
      </div>
    </section>
  );
}
export function HomeSections() {
  return (
    <>
      <section className="cv-section">
        <div className="cv-section-head">
          <div>
            <div className="cv-eyebrow">01 / THE CLUB OPERATING SYSTEM</div>
            <h2>
              LEBIH SEDIKIT ADMIN.
              <br />
              <em>LEBIH BANYAK AKSI.</em>
            </h2>
          </div>
          <p>
            Energi pengurus seharusnya untuk mengembangkan klub. Courvix
            menyatukan pekerjaan hariannya.
          </p>
        </div>
        <div className="cv-featuregrid">
          {modules.slice(0, 3).map((m, i) => (
            <a href="/platform" className="cv-feature" key={m.title}>
              <div className="cv-feature-top">
                <m.icon />
                <span>0{i + 1}</span>
              </div>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
              <span className="cv-textlink">
                Lihat cara kerjanya <ArrowUpRight size={17} />
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="cv-orange cv-section cv-split">
        <div>
          <div className="cv-eyebrow">02 / EVERY PART CONNECTED</div>
          <h2>
            SATU KLUB.
            <br />
            SATU RITME.
            <br />
            <span className="cv-white">SATU COURVIX.</span>
          </h2>
          <p>
            Dari roster ke lapangan, lalu ke laporan pembayaran. Semuanya punya
            tempat dan alur yang jelas.
          </p>
          <a href="/platform" className="cv-button dark">
            Jelajahi fitur <ArrowUpRight />
          </a>
        </div>
        <div className="cv-product">
          <div className="cv-product-head">
            <strong>courvix.</strong>
            <span>PREVIEW DEMO</span>
          </div>
          <div className="cv-product-body">
            <small>BATAM BASKETBALL CLUB</small>
            <h3>LET’S GET TO WORK.</h3>
            <div className="cv-metrics">
              <div>
                <span>Member terdaftar</span>
                <b>520</b>
              </div>
              <div>
                <span>Iuran bulanan</span>
                <b>
                  350<span>rb</span>
                </b>
              </div>
            </div>
            <div className="cv-training">
              <span className="cv-day">
                24
                <br />
                <small>SEP</small>
              </span>
              <div>
                <strong>U-18 Performance</strong>
                <p>Latihan sore · 16.00–18.00</p>
              </div>
              <ClipboardCheck />
            </div>
            <div className="cv-minirow">
              <span>Roster tim</span>
              <b>Siap latihan ↗</b>
            </div>
            <div className="cv-minirow">
              <span>Invoice & riwayat</span>
              <b>Satu tempat ↗</b>
            </div>
          </div>
        </div>
      </section>
      <section className="cv-section cv-split">
        <div>
          <div className="cv-eyebrow">03 / NO SPORT LEFT BEHIND</div>
          <h2>
            BEDA LAPANGAN.
            <br />
            <em>SATU SEMANGAT.</em>
          </h2>
          <p>
            Klub basket, akademi badminton, komunitas lari, hingga sekolah
            renang. Sesuaikan tim dan program dengan cara klubmu bergerak.
          </p>
          <a href="/sports" className="cv-textlink">
            Temukan olahraga klubmu <ArrowUpRight />
          </a>
        </div>
        <div className="cv-sportlist">
          {[
            "BASKETBALL / FOOTBALL",
            "BADMINTON / TENNIS",
            "SWIMMING / RUNNING",
            "MARTIAL ARTS / MORE",
          ].map((s, i) => (
            <a href="/sports" key={s}>
              <span>0{i + 1}</span>
              <strong>{s}</strong>
              <ArrowUpRight />
            </a>
          ))}
        </div>
      </section>
      <section className="cv-custom-teaser cv-section">
        <div className="cv-eyebrow">04 / MADE FOR YOUR CLUB</div>
        <h2>
          NAMA KLUBMU.
          <br />
          IDENTITASMU.
          <br />
          <em>WEBSITE-MU.</em>
        </h2>
        <div>
          <p>
            Courvix juga menjadi partner pembuatan website dan sistem khusus.
            Punya kebutuhan di luar platform? Mari susun solusinya.
          </p>
          <a href="/custom" className="cv-button">
            Jelajahi layanan custom <ArrowUpRight />
          </a>
        </div>
      </section>
      <CTA />
    </>
  );
}
export function Platform() {
  return (
    <>
      <Intro
        label="PLATFORM / BUILT AROUND YOUR TEAM"
        title="SEMUA TERHUBUNG."
        accent="KLUB TERKELOLA."
        text="Enam fondasi untuk operasional klub. Satu pengalaman yang menghubungkan pengurus, pelatih, dan member."
      />
      <section className="cv-section cv-modulegrid">
        {modules.map((m, i) => (
          <article className="cv-module" key={m.title}>
            <div className="cv-feature-top">
              <m.icon size={30} />
              <span>MODULE / 0{i + 1}</span>
            </div>
            <h2>{m.title}</h2>
            <p>{m.text}</p>
            <p>{m.detail}</p>
          </article>
        ))}
      </section>
      <section className="cv-section cv-orange">
        <div className="cv-section-head">
          <h2>
            PERAN BERBEDA.
            <br />
            TUJUAN YANG SAMA.
          </h2>
          <p>Jelajahi pembagian ruang kerja dalam demo Courvix.</p>
        </div>
        <Tabs defaultValue="Admin" className="cv-tabs">
          <TabsList>
            {["Administrator", "Admin", "Coach", "Member"].map((r) => (
              <TabsTrigger key={r} value={r}>
                {r}
              </TabsTrigger>
            ))}
          </TabsList>
          {[
            [
              "Administrator",
              "PANTAU EKOSISTEM.",
              "Kelola daftar klub, konfigurasi fee platform, dan permintaan proyek website.",
            ],
            [
              "Admin",
              "KENDALIKAN OPERASIONAL.",
              "Kelola member, tim, jadwal, invoice, pengumuman, dan identitas website klub.",
            ],
            [
              "Coach",
              "FOKUS PADA LATIHAN.",
              "Lihat tim yang dibina, jadwal sesi, dan pencatatan absensi anggota.",
            ],
            [
              "Member",
              "IKUTI PERKEMBANGANMU.",
              "Akses jadwal, status tagihan, riwayat pembayaran, serta informasi dari klub.",
            ],
          ].map(([role, title, text]) => (
            <TabsContent key={role} value={role}>
              <h3>{title}</h3>
              <p>{text}</p>
              <a className="cv-button dark" href="/dashboard">
                Coba pilihan peran di demo <ArrowUpRight />
              </a>
            </TabsContent>
          ))}
        </Tabs>
      </section>
      <section className="cv-section">
        <div className="cv-eyebrow">FROM FIRST SIGN-UP TO EVERY SESSION</div>
        <h2>
          ALUR YANG MENGIKUTI
          <br />
          <em>HARI-HARI KLUBMU.</em>
        </h2>
        <div className="cv-steps">
          {[
            [
              "Susun tim",
              "Daftarkan member dan tempatkan ke kelompok latihan.",
            ],
            [
              "Jalankan sesi",
              "Atur jadwal, tentukan coach, lalu catat kehadiran.",
            ],
            [
              "Rapikan iuran",
              "Buat tagihan dan telusuri status pembayarannya.",
            ],
            [
              "Evaluasi klub",
              "Gunakan riwayat aktivitas dan transaksi untuk tindak lanjut.",
            ],
          ].map(([a, b], i) => (
            <article key={a}>
              <span>0{i + 1}</span>
              <h3>{a}</h3>
              <p>{b}</p>
            </article>
          ))}
        </div>
      </section>
      <CTA />
    </>
  );
}
const sports = [
  {
    group: "Tim",
    name: "Basket",
    detail:
      "Roster per kelompok usia, coach, jadwal latihan, dan iuran akademi.",
    tags: "U-16 · U-18 · Senior",
  },
  {
    group: "Tim",
    name: "Sepak bola & futsal",
    detail: "Kelompok pembinaan, agenda latihan, dan absensi tiap skuad.",
    tags: "SSB · Akademi · Komunitas",
  },
  {
    group: "Raket",
    name: "Badminton",
    detail: "Kelas berdasarkan level, sesi latihan, dan paket membership.",
    tags: "Pemula · Intermediate · Prestasi",
  },
  {
    group: "Raket",
    name: "Tenis & padel",
    detail: "Program reguler, kelompok latihan, dan penugasan pelatih.",
    tags: "Junior · Dewasa · Grup",
  },
  {
    group: "Individual",
    name: "Renang",
    detail:
      "Kelompok usia dan kemampuan, jadwal sesi, serta kehadiran peserta.",
    tags: "Dasar · Teknik · Kompetisi",
  },
  {
    group: "Individual",
    name: "Lari & atletik",
    detail: "Grup latihan, agenda komunitas, dan administrasi keanggotaan.",
    tags: "Track · Road · Community",
  },
  {
    group: "Bela diri",
    name: "Martial arts",
    detail: "Kelompok tingkatan, jadwal kelas, coach, dan riwayat latihan.",
    tags: "Karate · Taekwondo · Silat",
  },
  {
    group: "Tim",
    name: "Voli & olahraga lain",
    detail: "Struktur kelompok yang fleksibel untuk kebutuhan klubmu.",
    tags: "Voli · Rugby · Cabang lainnya",
  },
];
export function Sports() {
  const [filter, setFilter] = useState("Semua");
  return (
    <>
      <Intro
        label="SPORTS / FIND YOUR FIELD"
        title="APAPUN LAPANGANNYA."
        accent="INI RUANG KLUBMU."
        text="Setiap olahraga punya ritme sendiri. Kelola fondasi yang sama, lalu susun kelompok, program, dan jadwal sesuai kebutuhan."
      />
      <section className="cv-section">
        <Tabs value={filter} onValueChange={setFilter} className="cv-tabs">
          <TabsList>
            {["Semua", "Tim", "Raket", "Individual", "Bela diri"].map((x) => (
              <TabsTrigger value={x} key={x}>
                {x}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={filter}>
            <div className="cv-sportgrid">
              {sports
                .filter((s) => filter === "Semua" || s.group === filter)
                .map((s, i) => (
                  <article key={s.name}>
                    <span className="cv-sport-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <small>{s.group.toUpperCase()}</small>
                    <h2>{s.name}</h2>
                    <p>{s.detail}</p>
                    <div>{s.tags}</div>
                  </article>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
      <section className="cv-section cv-orange cv-split">
        <h2>
          STRUKTURNYA FLEKSIBEL.
          <br />
          IDENTITASNYA
          <br />
          <span className="cv-white">TETAP MILIKMU.</span>
        </h2>
        <div>
          <p>
            Gunakan tim untuk skuad, kelompok usia, kelas, atau level latihan.
            Buat jadwal dan iuran sesuai program yang berjalan.
          </p>
          <p>
            Butuh scoring, booking lapangan, atau penilaian teknik yang
            spesifik? Fitur khusus cabang olahraga dibahas sebagai pengembangan
            custom.
          </p>
          <a href="/custom" className="cv-button dark">
            Bahas sistem khusus <ArrowUpRight />
          </a>
        </div>
      </section>
      <CTA />
    </>
  );
}
export function Pricing() {
  const [amount, setAmount] = useState("350000"),
    [count, setCount] = useState("520"),
    [gateway, setGateway] = useState("0");
  const valid =
    /^\d+$/.test(amount) &&
    Number(amount) > 0 &&
    Number(amount) <= 100000000 &&
    /^\d+$/.test(count) &&
    Number(count) > 0 &&
    Number(count) <= 100000 &&
    /^\d+$/.test(gateway) &&
    Number(gateway) <= Number(amount);
  const fee = valid
    ? feeFor(Number(amount), {
        rate: 0.5,
        min: 1000,
        max: 7500,
        type: "Percentage",
        flat: 0,
        gateway: 0,
      })
    : 0;
  return (
    <>
      <Intro
        label="PRICING / EVERY RUPIAH, CLEAR"
        title="BIAYA JELAS."
        accent="LANGKAH LEBIH PASTI."
        text="Pisahkan biaya langganan, fee platform, dan biaya penyedia pembayaran. Supaya klub tahu persis apa yang dihitung."
      />
      <section className="cv-section cv-plans">
        {[
          [
            "Starter",
            "199rb",
            "Untuk klub yang mulai merapikan administrasi.",
            "Member & tim|Jadwal & absensi|Invoice & riwayat",
          ],
          [
            "Growth",
            "399rb",
            "Untuk akademi dengan operasional yang berkembang.",
            "Semua cakupan Starter|Pendampingan pengaturan klub|Perencanaan migrasi data",
          ],
          [
            "Club Pro",
            "699rb",
            "Untuk kebutuhan operasional yang lebih kompleks.",
            "Semua cakupan Growth|Pemetaan kebutuhan lanjutan|Pendampingan implementasi",
          ],
        ].map(([name, price, desc, items], i) => (
          <article key={name} className={i === 1 ? "featured" : ""}>
            <small>
              {i === 1 ? "UNTUK KLUB YANG BERTUMBUH" : "RENCANA PAKET"}
            </small>
            <h3>{name}</h3>
            <div className="cv-plan-price">
              Rp {price}
              <span>/bulan</span>
            </div>
            <p>{desc}</p>
            <ul>
              {items.split("|").map((x) => (
                <li key={x}>
                  <Check size={17} />
                  {x}
                </li>
              ))}
            </ul>
            <a href="/contact" className="cv-button">
              Diskusikan paket <ArrowUpRight size={18} />
            </a>
          </article>
        ))}
      </section>
      <p className="cv-caption">
        Harga dan cakupan di atas merupakan rancangan demo, bukan penawaran
        final. Biaya gateway, pajak, dan pekerjaan custom belum termasuk.
      </p>
      <section className="cv-section cv-orange cv-split" id="simulator">
        <div>
          <div className="cv-eyebrow">PLATFORM FEE / SIMULATOR</div>
          <h2>
            KECIL PER TRANSAKSI.
            <br />
            <span className="cv-white">JELAS HITUNGANNYA.</span>
          </h2>
          <p>
            Model demo: <strong>0,5% per pembayaran berhasil</strong>, minimum
            Rp1.000 dan maksimum Rp7.500. Fee dibatasi sebesar nilai pembayaran.
          </p>
          <p>
            Simulasi ini mengasumsikan fee ditanggung klub dan satu pembayaran
            per member setiap bulan. Biaya gateway diisi sesuai penyedia yang
            nantinya dipilih.
          </p>
        </div>
        <div className="cv-calculator">
          <div className="cv-fieldgrid">
            <label>
              Iuran per member (Rp)
              <input
                type="number"
                min="1"
                max="100000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label>
              Member yang membayar
              <input
                type="number"
                min="1"
                max="100000"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </label>
            <label className="cv-full">
              Biaya gateway per pembayaran (Rp)
              <input
                type="number"
                min="0"
                max={amount}
                value={gateway}
                onChange={(e) => setGateway(e.target.value)}
              />
            </label>
          </div>
          {valid ? (
            <div aria-live="polite">
              <div className="cv-minirow">
                <span>Fee platform / pembayaran</span>
                <strong>{money(fee)}</strong>
              </div>
              <div className="cv-minirow">
                <span>Total iuran bruto</span>
                <strong>{money(Number(amount) * Number(count))}</strong>
              </div>
              <div className="cv-minirow">
                <span>Total fee platform</span>
                <strong>{money(fee * Number(count))}</strong>
              </div>
              <div className="cv-minirow">
                <span>Total biaya gateway</span>
                <strong>{money(Number(gateway) * Number(count))}</strong>
              </div>
              <div className="cv-calc-total">
                <span>Estimasi penerimaan klub*</span>
                <strong>
                  {money(
                    (Number(amount) - fee - Number(gateway)) * Number(count),
                  )}
                </strong>
              </div>
              <small>
                *Sebelum langganan, pajak, refund, dan biaya lainnya. Jika total
                fee melebihi iuran, selisih menjadi biaya klub.
              </small>
            </div>
          ) : (
            <p role="alert">
              Isi iuran dan jumlah member dengan bilangan bulat positif. Biaya
              gateway tidak boleh melebihi iuran.
            </p>
          )}
        </div>
      </section>
      <section className="cv-section cv-split">
        <div>
          <div className="cv-eyebrow">GOOD QUESTIONS. CLEAR ANSWERS.</div>
          <h2>
            SEBELUM
            <br />
            <em>MULAI LATIHAN.</em>
          </h2>
        </div>
        <div className="cv-faq">
          {[
            [
              "Apakah fee platform sama dengan biaya gateway?",
              "Berbeda. Fee platform adalah biaya layanan Courvix. Biaya gateway ditetapkan penyedia pembayaran dan dapat berbeda menurut metode transaksi. Angka gateway dalam simulator bukan tarif resmi.",
            ],
            [
              "Apakah semua klub harus punya iuran yang sama?",
              "Tidak. Nominal iuran mengikuti program klub. Persentase dengan batas minimum dan maksimum membuat perhitungannya konsisten untuk nominal yang berbeda.",
            ],
            [
              "Kapan fee dihitung?",
              "Model demo menghitung fee pada pembayaran berhasil. Kebijakan refund, pembatalan, serta penyelesaian dana perlu ditetapkan dalam implementasi produksi.",
            ],
            [
              "Bisakah membuat website sendiri?",
              "Bisa. Layanan website dan sistem custom memiliki ruang lingkup serta biaya terpisah, berdasarkan fitur dan kebutuhan integrasinya.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <CTA />
    </>
  );
}
export function Custom() {
  return (
    <>
      <Intro
        label="COURVIX STUDIO / YOUR DIGITAL HOME"
        title="KLUBMU PUNYA CERITA."
        accent="BERI PANGGUNGNYA."
        text="Lebih dari platform pengelolaan. Courvix membantu merancang website dan sistem yang membawa nama, karakter, dan cara kerja klubmu."
      />
      <section className="cv-custom-showcase">
        <div>
          <span>CONCEPT WEBSITE / ATHLETICS ACADEMY</span>
          <h2>
            BUILD THE
            <br />
            NEXT
            <br />
            <em>GENERATION.</em>
          </h2>
          <p>Profil klub. Program latihan. Jalan masuk untuk member baru.</p>
        </div>
        <img
          src="/courvix-track.webp"
          alt="Suasana latihan atlet sebagai contoh visual website olahraga"
          width="1536"
          height="1024"
          loading="lazy"
        />
      </section>
      <section className="cv-section">
        <div className="cv-section-head">
          <h2>
            DARI PROFIL KLUB.
            <br />
            <em>SAMPAI SISTEM KHUSUS.</em>
          </h2>
          <p>
            Pilih cakupan berdasarkan kebutuhan operasional dan pengalaman yang
            ingin diberikan kepada member.
          </p>
        </div>
        <div className="cv-featuregrid">
          {[
            [
              "Club website",
              "Profil, program, coach, fasilitas, galeri, dan informasi pendaftaran dengan identitas visual klub.",
            ],
            [
              "Member portal",
              "Ruang member untuk mengakses jadwal, tagihan, dan informasi klub dalam alur yang terintegrasi.",
            ],
            [
              "Custom system",
              "Pemetaan dan pengembangan alur khusus seperti booking, penilaian, atau integrasi sistem yang sudah digunakan.",
            ],
          ].map(([a, b], i) => (
            <article className="cv-feature" key={a}>
              <span>0{i + 1} / SERVICE</span>
              <h3>{a}</h3>
              <p>{b}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="cv-section cv-orange">
        <div className="cv-eyebrow">A COLLABORATIVE PROCESS</div>
        <h2>
          DIBANGUN BERSAMA.
          <br />
          <span className="cv-white">DARI AWAL SAMPAI SIAP.</span>
        </h2>
        <div className="cv-steps">
          {[
            [
              "Discovery",
              "Petakan pengguna, kebutuhan klub, dan prioritas fitur.",
            ],
            [
              "Design",
              "Susun struktur halaman, alur, dan visual untuk disepakati.",
            ],
            [
              "Build & test",
              "Bangun sistem dan uji alur utama bersama tim klub.",
            ],
            [
              "Launch & handover",
              "Siapkan publikasi, dokumentasi, dan pelatihan pengelolaan.",
            ],
          ].map(([a, b], i) => (
            <article key={a}>
              <span>0{i + 1}</span>
              <h3>{a}</h3>
              <p>{b}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="cv-section cv-split">
        <h2>
          BUKAN SATU UKURAN
          <br />
          <em>UNTUK SEMUA KLUB.</em>
        </h2>
        <div>
          <p>
            Ruang lingkup, jadwal pengerjaan, biaya hosting, domain, kepemilikan
            hasil, dan dukungan pemeliharaan dibahas sebelum proyek dimulai.
          </p>
          <p>
            Ceritakan tujuan klub, jumlah member, serta sistem yang sedang
            digunakan. Kita mulai dari kebutuhan yang paling penting.
          </p>
          <a className="cv-button" href="/contact">
            Susun kebutuhan proyek <ArrowUpRight />
          </a>
        </div>
      </section>
    </>
  );
}
export function Contact() {
  const [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [error, setError] = useState("");
  const lock = useRef(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    if (
      !String(f.get("name")).trim() ||
      !String(f.get("club")).trim() ||
      !String(f.get("message")).trim()
    ) {
      setError("Lengkapi nama, klub, dan kebutuhan dengan teks yang valid.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const row = {
        id: crypto.randomUUID(),
        club: "batam",
        name: String(f.get("club")),
        contact: String(f.get("name")),
        email: String(f.get("email")),
        description: String(f.get("message")),
        status: "New",
        date: new Date().toISOString().slice(0, 10),
        type: "Website / system",
      };
      const response = await fetch("/api/demo-state", {
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 401) {
        const saved = localStorage.getItem("courvix-demo-v2");
        const data = saved ? JSON.parse(saved) : seed();
        data.records.Projects = [row, ...(data.records.Projects || [])];
        localStorage.setItem("courvix-demo-v2", JSON.stringify(data));
      } else {
        if (!response.ok)
          throw Error("Penyimpanan sementara tidak tersedia. Coba kembali.");
        const snapshot = await response.json() as {data: DB; revision: number};
        snapshot.data.records.Projects = [
          row,
          ...(snapshot.data.records.Projects || []),
        ];
        const result = await fetch("/api/demo-state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snapshot),
          signal: AbortSignal.timeout(15000),
        });
        if (!result.ok)
          throw Error(
            result.status === 409
              ? "Data berubah di tab lain. Coba simpan kembali."
              : "Belum berhasil disimpan. Isian tetap tersedia untuk dicoba kembali.",
          );
      }
      setStatus(
        "Brief tersimpan di demo. Lihat melalui peran Administrator → Projects. Belum dikirim ke tim Courvix.",
      );
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kendala. Coba lagi.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <Intro
        label="CONTACT / LET’S TALK SPORT"
        title="LANGKAH BESAR."
        accent="MULAI DARI OBROLAN."
        text="Butuh pengelolaan klub yang lebih rapi atau website dengan karakter sendiri? Mulai dengan ceritakan kebutuhanmu."
      />
      <section className="cv-section cv-contact">
        <aside>
          <div className="cv-eyebrow">TELL US YOUR GAME PLAN</div>
          <h2>
            KITA MULAI
            <br />
            DARI <em>KLUBMU.</em>
          </h2>
          <p>
            Brief yang jelas membantu menentukan prioritas, cakupan, dan langkah
            implementasi.
          </p>
          <ol>
            <li>Ceritakan cabang olahraga dan skala klub.</li>
            <li>Tuliskan kendala operasional saat ini.</li>
            <li>Sebutkan fitur serta target waktu yang diharapkan.</li>
          </ol>
          <div className="cv-contact-note">
            <strong>Masih eksplorasi?</strong>
            <p>
              Coba dashboard dengan data contoh tanpa membuat transaksi
              sungguhan.
            </p>
            <a href="/dashboard" className="cv-textlink">
              Buka demo <ArrowUpRight />
            </a>
          </div>
        </aside>
        <form className="cv-form" onSubmit={submit}>
          <h3>BRIEF KLUBMU</h3>
          <p>
            Formulir demo. Disimpan untuk simulasi, belum mengirim email atau
            pesan ke tim Courvix.
          </p>
          <div className="cv-fieldgrid">
            <label>
              Nama lengkap
              <input
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                placeholder="Nama kamu"
              />
            </label>
            <label>
              Nama klub
              <input
                name="club"
                required
                maxLength={150}
                placeholder="Nama klub / akademi"
              />
            </label>
            <label className="cv-full">
              Email
              <input
                name="email"
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                placeholder="nama@klub.com"
              />
            </label>
            <label className="cv-full">
              Ceritakan kebutuhan klub
              <textarea
                name="message"
                required
                minLength={15}
                maxLength={2000}
                rows={5}
                placeholder="Cabang olahraga, jumlah member, kebutuhan fitur, dan rencana website..."
              />
            </label>
          </div>
          <button className="cv-button" disabled={busy}>
            {busy ? "Menyimpan brief…" : "Simpan brief demo"}
            <ArrowUpRight />
          </button>
          {error && (
            <p className="cv-error" role="alert">
              {error}
            </p>
          )}
          {status && (
            <p className="cv-success" role="status">
              {status}
            </p>
          )}
        </form>
      </section>
    </>
  );
}

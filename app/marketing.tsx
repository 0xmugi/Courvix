"use client";
import { ArrowUpRight, ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import {
  HomeSections,
  Platform,
  Sports,
  Pricing,
  Custom,
  Contact,
} from "./marketing-pages";
import "./marketing.css";
const links = [
  ["platform", "Platform"],
  ["sports", "Cabang olahraga"],
  ["pricing", "Harga"],
  ["custom", "Website klub"],
  ["contact", "Kontak"],
];
export default function Marketing({ page = "home" }: { page?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (page === "home") {
      const old = location.hash.slice(1);
      if (["platform", "sports", "pricing", "custom", "contact"].includes(old))
        location.replace("/" + old);
      if (old === "app") location.replace("/dashboard");
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("cv-in");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".cv-section")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [page]);
  return (
    <div className="cv-public">
      <a className="cv-skip" href="#main-content">
        Lewati ke konten
      </a>
      <header className="cv-nav">
        <a className="cv-logo" href="/" aria-label="Courvix beranda">
          <span>c↗</span>courvix<b>.</b>
        </a>
        <nav aria-label="Navigasi utama" className={open ? "is-open" : ""}>
          {links.map(([url, title]) => (
            <a
              key={url}
              href={"/" + url}
              aria-current={page === url ? "page" : undefined}
            >
              {title}
            </a>
          ))}
        </nav>
        <a className="cv-button small" href="/dashboard">
          Coba demo <ArrowUpRight size={17} />
        </a>
        <button
          className="cv-menu"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <main id="main-content">
        {page === "home" ? (
          <>
            <section className="cv-hero">
              <div className="cv-hero-copy">
                <div className="cv-eyebrow">
                  SPORTS CLUB MANAGEMENT & DIGITAL PARTNER
                </div>
                <h1>
                  BEHIND EVERY
                  <br />
                  <em>GREAT TEAM.</em>
                </h1>
                <p>
                  Tim hebat butuh pengelolaan yang hebat. Satukan member,
                  latihan, dan pembayaran. Bawa klubmu melangkah lebih jauh.
                </p>
                <div className="cv-actions">
                  <a className="cv-button" href="/dashboard">
                    Jelajahi demo <ArrowUpRight size={20} />
                  </a>
                  <a className="cv-textlink" href="/platform">
                    Kenali platform <ArrowRight size={18} />
                  </a>
                </div>
                <div className="cv-hero-note">
                  <span>01 / LESS ADMIN. MORE ACTION.</span>
                  <span>UNTUK SETIAP OLAHRAGA ↗</span>
                </div>
              </div>
              <div className="cv-hero-image">
                <img
                  src="/courvix-track.webp"
                  alt="Atlet berlari di lintasan olahraga berwarna oranye"
                  width="1536"
                  height="1024"
                />
                <span className="cv-photo-label">
                  BUILT FOR THE
                  <br />
                  <strong>NEXT MOVE.</strong>
                </span>
                <div className="cv-photo-caption">
                  <span>Dari sesi pertama. Sampai podium berikutnya.</span>
                  <ArrowUpRight />
                </div>
              </div>
            </section>
            <div className="cv-sportstrip">
              <span>BASKETBALL</span>
              <span>✳</span>
              <span>BADMINTON</span>
              <span>✳</span>
              <span>FOOTBALL</span>
              <span>✳</span>
              <span>SWIMMING</span>
              <span>✳</span>
              <span>YOUR SPORT.</span>
            </div>
            <HomeSections />
          </>
        ) : page === "platform" ? (
          <Platform />
        ) : page === "sports" ? (
          <Sports />
        ) : page === "pricing" ? (
          <Pricing />
        ) : page === "custom" ? (
          <Custom />
        ) : (
          <Contact />
        )}
      </main>
      <footer className="cv-footer">
        <a className="cv-logo" href="/">
          courvix.
        </a>
        <p>Better managed. Better together.</p>
        <div>
          {links.map(([url, title]) => (
            <a key={url} href={"/" + url}>
              {title}
            </a>
          ))}
        </div>
        <small>
          © {new Date().getFullYear()} Courvix · Demo platform olahraga
        </small>
      </footer>
    </div>
  );
}

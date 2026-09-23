"use client";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Users,
  CalendarDays,
  Wallet,
  Globe,
  Shield,
  Plus,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
export default function Landing({
  enter,
  contact,
  legal,
}: {
  enter: (role?: string, page?: string) => void;
  contact: () => void;
  legal: () => void;
}) {
  const brand = (
    <span className="brand">
      <span className="brandmark">
        c<span>↗</span>
      </span>
      courvix<span className="brand-dot">.</span>
    </span>
  );
  return (
    <div className="landing">
      <nav className="landing-nav">
        {brand}
        <div>
          <a href="#product">Platform</a>
          <a href="#sports">Sports</a>
          <a href="#custom">Build with us</a>
          <a href="#pricing">Pricing</a>
        </div>
        <button className="btn primary" onClick={() => enter()}>
          Explore demo <ArrowUpRight size={16} />
        </button>
      </nav>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="orange">●</span> THE OPERATING SYSTEM FOR YOUR CLUB
          </p>
          <h1>
            Run your club.
            <br />
            Grow your team.
            <br />
            <span>Power your sport.</span>
          </h1>
          <p>
            From the first training session to your next big season. Bring your
            people, payments, and club operations together.
          </p>
          <div className="actions">
            <button className="btn primary" onClick={() => enter()}>
              Explore Courvix <ArrowUpRight size={18} />
            </button>
            <button className="btn" onClick={contact}>
              Book a demo
            </button>
          </div>
          <small>Built for every sport. Made for the people behind it.</small>
        </div>
        <div className="hero-product">
          <div className="mini-top">
            {brand}
            <span className="tag">Demo</span>
          </div>
          <p className="eyebrow">BATAM BASKETBALL CLUB</p>
          <h2>A good day to move forward.</h2>
          <div className="mini-metrics">
            <div>
              <small>Members</small>
              <b>520</b>
            </div>
            <div>
              <small>Active teams</small>
              <b>04</b>
            </div>
            <div>
              <small>Platform fee</small>
              <b>0.5%</b>
            </div>
          </div>
          <div className="mini-chart">
            {[35, 48, 41, 67, 55, 81, 74, 94, 87, 100, 90, 96].map((h, i) => (
              <i key={i} style={{ height: h + "%" }} />
            ))}
          </div>
          <div className="mini-payment">
            <span className="avatar">
              <Check size={18} />
            </span>
            <div>
              <b>Membership, taken care of.</b>
              <small>Payments and people. Finally connected.</small>
            </div>
            <ArrowUpRight size={18} />
          </div>
          <span className="hero-caption">
            PRODUCT PREVIEW · ILLUSTRATIVE DEMO DATA
          </span>
        </div>
      </section>
      <div className="value-strip">
        {[
          "One connected workspace",
          "Every sport, every level",
          "Transparent payments",
          "Your own club website",
        ].map((x) => (
          <span key={x}>
            <Check size={16} />
            {x}
          </span>
        ))}
      </div>
      <section id="product" className="landing-section">
        <div className="section-intro">
          <p className="eyebrow">BUILT FOR THE WORK BEHIND THE WIN</p>
          <h2>
            Less juggling.
            <br />
            More moving forward.
          </h2>
          <p>Give every part of your club a place to work together.</p>
        </div>
        <div className="feature-grid">
          {[
            [
              Users,
              "People, in one place.",
              "Members, coaches, teams, and membership plans that fit your organization.",
            ],
            [
              CalendarDays,
              "A better rhythm.",
              "Training, attendance, and competitions connected to your daily schedule.",
            ],
            [
              Wallet,
              "Every rupiah, accounted for.",
              "Invoices, payment history, processing fees, and clear financial reports.",
            ],
            [
              Globe,
              "Your own digital home.",
              "A club website and custom systems that carry your identity.",
            ],
          ].map(([Icon, title, desc]: any, i) => (
            <article key={title}>
              <span className="feature-number">0{i + 1}</span>
              <Icon size={26} />
              <h3>{title}</h3>
              <p>{desc}</p>
              <button
                className="text-btn"
                onClick={() =>
                  enter(
                    "Admin",
                    ["Members", "Schedule", "Payments", "Website"][i],
                  )
                }
              >
                Explore feature <ArrowUpRight size={15} />
              </button>
            </article>
          ))}
        </div>
      </section>
      <section className="sports-section" id="sports">
        <p className="eyebrow">DIFFERENT GAMES. ONE PLATFORM.</p>
        <h2>Built for every sport.</h2>
        <div className="sport-tags">
          {[
            "Basketball",
            "Football",
            "Badminton",
            "Swimming",
            "Tennis",
            "Volleyball",
            "Martial Arts",
            "Athletics",
            "Cycling",
            "Gymnastics",
            "Esports",
            "Your sport",
          ].map((s) => (
            <span key={s}>
              {s}
              <ArrowUpRight size={16} />
            </span>
          ))}
        </div>
        <p>
          Flexible teams, programs, and sessions. Sport-specific competition
          rules can be developed to fit your needs.
        </p>
      </section>
      <section className="landing-section roles-section">
        <p className="eyebrow">THE RIGHT VIEW FOR EVERY ROLE</p>
        <h2>One club. Everyone connected.</h2>
        <Tabs defaultValue="Admin">
          <TabsList>
            {["Administrator", "Admin", "Coach", "Member"].map((r) => (
              <TabsTrigger value={r} key={r}>
                {r}
              </TabsTrigger>
            ))}
          </TabsList>
          {["Administrator", "Admin", "Coach", "Member"].map((r) => (
            <TabsContent key={r} value={r}>
              <div className="role-demo">
                <Shield size={42} />
                <div>
                  <h3>
                    {r === "Admin"
                      ? "Your club, under control."
                      : r === "Coach"
                        ? "Focus on the people you train."
                        : r === "Member"
                          ? "Stay ready for your next session."
                          : "A clear view across the platform."}
                  </h3>
                  <p>
                    {r === "Admin"
                      ? "Members, attendance, finance, and your club website."
                      : r === "Coach"
                        ? "Your roster, training schedule, and attendance."
                        : r === "Member"
                          ? "Your invoices, sessions, and announcements."
                          : "Clubs, platform fees, projects, and audit history."}
                  </p>
                  <button className="btn" onClick={() => enter(r)}>
                    Try {r} demo <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
      <section className="custom-section" id="custom">
        <div>
          <p className="eyebrow">YOUR SPORTS TECHNOLOGY PARTNER</p>
          <h2>
            Your ambition.
            <br />
            Your system.
            <br />
            <span>Built with Courvix.</span>
          </h2>
          <p>
            Need more than a platform? We build club websites, registration
            portals, booking tools, and custom digital systems around the way
            you work.
          </p>
          <button className="btn primary" onClick={contact}>
            Build your club system <ArrowUpRight size={18} />
          </button>
        </div>
        <div className="custom-services">
          {[
            "Club websites & identity",
            "Member & registration portals",
            "Booking & tournament systems",
            "Payments & custom integrations",
          ].map((s, i) => (
            <div key={s}>
              <small>0{i + 1}</small>
              <h3>{s}</h3>
              <ArrowUpRight />
            </div>
          ))}
          <p>Discovery → Design → Development → Launch → Support</p>
        </div>
      </section>
      <section className="landing-section" id="pricing">
        <p className="eyebrow">CLEAR PRICING. ROOM TO GROW.</p>
        <h2>A plan for your next chapter.</h2>
        <p className="hint">
          Illustrative demo pricing. Final plans and limits agreed during
          onboarding.
        </p>
        <div className="pricing-grid">
          {[
            ["Starter", "199", "Up to 100 members"],
            ["Club", "399", "Up to 600 members"],
            ["Pro", "699", "Up to 1,500 members"],
            ["Enterprise", "Custom", "Your organization, your scope"],
          ].map(([name, price, desc], i) => (
            <article className={i === 1 ? "featured" : ""} key={name}>
              <p className="eyebrow">
                {name}
                {i === 1 ? " / GROWING CLUBS" : ""}
              </p>
              <h3>
                {price === "Custom" ? (
                  "Let’s talk"
                ) : (
                  <>
                    Rp{price}
                    <small>k / month</small>
                  </>
                )}
              </h3>
              <p>{desc}</p>
              <ul>
                <li>
                  <Check size={15} />
                  Members, teams & scheduling
                </li>
                <li>
                  <Check size={15} />
                  Attendance & payments
                </li>
                <li>
                  <Check size={15} />
                  {i > 0 ? "Reports & website tools" : "Essential reports"}
                </li>
                <li>
                  <Check size={15} />
                  {i === 3 ? "Custom integrations" : "Email support"}
                </li>
              </ul>
              <button
                className={"btn " + (i === 1 ? "primary" : "")}
                onClick={contact}
              >
                Discuss {name} <ArrowUpRight size={15} />
              </button>
            </article>
          ))}
        </div>
        <div className="fee-note">
          <Wallet />
          <div>
            <b>0.5% per successful payment · min Rp1.000 · max Rp7.500</b>
            <p>
              Gateway fees are separate and depend on the provider and payment
              method. The demo assumes the club absorbs processing costs.
            </p>
          </div>
        </div>
      </section>
      <section className="faq-section">
        <div>
          <p className="eyebrow">GOOD QUESTIONS. CLEAR ANSWERS.</p>
          <h2>Before you jump in.</h2>
        </div>
        <div>
          {[
            [
              "Can we use Courvix for any sport?",
              "The core platform supports configurable sports, teams, and programs. Specialized scoring and competition formats depend on the configured modules.",
            ],
            [
              "How do payments work?",
              "Invoices connect to payment records and fee breakdowns. This demo simulates payments; a real gateway requires merchant onboarding and server-side verification.",
            ],
            [
              "Can our club have its own website?",
              "Yes. Courvix includes a demo content editor and offers custom website development. Domain connection is part of production setup.",
            ],
            [
              "Is this demo connected to a real account?",
              "No. Records are synthetic and changes stay in this browser. Role switching demonstrates different experiences, not production authentication.",
            ],
            [
              "Can coaches have restricted access?",
              "The coach demo shows an assigned team. Production permissions must also be enforced on the server.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={18} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="final-cta">
        <h2>Ready to build a better club?</h2>
        <button className="btn primary" onClick={contact}>
          Let’s make it happen <ArrowUpRight size={18} />
        </button>
      </section>
      <footer>
        {brand}
        <p>Sports Club Management & Digital Infrastructure</p>
        <div>
          <a href="#product">Platform</a>
          <a href="#custom">Custom development</a>
          <button onClick={legal}>Privacy & terms</button>
        </div>
        <small>© 2026 Courvix · Demo experience</small>
      </footer>
    </div>
  );
}

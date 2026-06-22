import {
  ArrowRight,
  Check,
  CheckCircle2,
  Cloud,
  Code2,
  Container,
  CreditCard,
  Globe2,
  Rocket,
  Server,
  ShieldCheck,
  TerminalSquare,
  UploadCloud,
  UserPlus
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getStoredUser } from "../lib/api";

const badges = ["Docker Container", "SSH Access", "Xendit Payment", "HTTPS Ready"];

const features = [
  {
    icon: TerminalSquare,
    title: "SSH Container",
    text: "User mendapatkan akses SSH ke container Linux pribadi, bukan VPS utama."
  },
  {
    icon: Globe2,
    title: "Static Web Deploy",
    text: "Upload HTML, CSS, dan JavaScript ke public_html lalu akses melalui domain."
  },
  {
    icon: CreditCard,
    title: "Xendit Sandbox Payment",
    text: "Order layanan terhubung dengan invoice Xendit sandbox untuk simulasi pembayaran."
  },
  {
    icon: ShieldCheck,
    title: "Safe Cloud Sandbox",
    text: "Resource container dibatasi agar aman untuk praktikum dan demo cloud computing."
  }
];

const steps = [
  { icon: UserPlus, title: "Register" },
  { icon: Server, title: "Choose Student Box" },
  { icon: CreditCard, title: "Pay with Xendit" },
  { icon: TerminalSquare, title: "SSH to Container" },
  { icon: UploadCloud, title: "Deploy Static Website" }
];

const architecture = [
  { icon: Code2, label: "User Browser / Terminal" },
  { icon: Cloud, label: "KloudBox Dashboard" },
  { icon: CreditCard, label: "Xendit Invoice" },
  { icon: Container, label: "Docker Container" },
  { icon: Globe2, label: "Static Website Online" }
];

const benefits = [
  "Belajar alur cloud hosting dari order sampai website online.",
  "SSH, SCP, Docker, Nginx, dan payment gateway dalam satu simulasi.",
  "Cocok untuk praktikum cloud computing tanpa memberi akses ke VPS utama."
];

const PACKAGE_FEATURES = {
  "demo-box": ["100MB RAM, 0.1 CPU", "Aktif 1 hari", "SSH siap pakai"],
  "student-box": ["128MB RAM, 0.2 CPU", "Aktif 7 hari", "SSH + folder web"],
  "pro-box": ["256MB RAM, 0.25 CPU", "Aktif 30 hari", "SSH + folder web"]
};

function formatPrice(value) {
  if (!value || value === 0) return "Gratis";
  return `Rp${Number(value).toLocaleString("id-ID")}`;
}

export function Landing() {
  const user = getStoredUser();
  const dashboardTarget = user ? "/dashboard" : "/login";
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    api("/packages")
      .then((data) => setPackages(data.packages || []))
      .catch(() => setPackages([]));
  }, []);

  return (
    <main className="landing-page">
      <div className="landing-aurora" aria-hidden="true"></div>
      <div className="landing-blob blob-one" aria-hidden="true"></div>
      <div className="landing-blob blob-two" aria-hidden="true"></div>
      <div className="landing-blob blob-three" aria-hidden="true"></div>

      <section className="landing-hero">
        <div className="hero-copy premium-hero-copy">
          <p className="eyebrow landing-eyebrow hero-reveal reveal-1">SaaS cloud sandbox untuk static deployment</p>
          <h1 className="hero-reveal reveal-2">Mini VPS Experience for Static Web Deployment</h1>
          <p className="hero-subtitle hero-reveal reveal-3">
            KloudBox memberikan pengalaman seperti VPS mini melalui Docker container. Login via SSH,
            upload file ke public_html, dan lihat websitemu online melalui domain HTTPS.
          </p>

          <div className="badge-row hero-reveal reveal-4" aria-label="KloudBox capabilities">
            {badges.map((badge) => (
              <span className="glass-badge premium-badge" key={badge}>
                <CheckCircle2 size={15} />
                {badge}
              </span>
            ))}
          </div>

          <div className="hero-actions hero-reveal reveal-5">
            <Link className="button landing-primary" to="/pricing">
              Mulai Sekarang <Rocket size={18} />
            </Link>
            <Link className="secondary-button landing-secondary" to={dashboardTarget}>
              Lihat Dashboard <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="hero-visual hero-reveal reveal-6">
          <div className="terminal-panel landing-terminal premium-terminal" aria-label="KloudBox SSH preview">
            <div className="terminal-bar">
              <span></span><span></span><span></span>
              <strong>kloudbox terminal</strong>
            </div>
            <div className="terminal-lines" aria-hidden="true">
              <p className="terminal-line line-1"><span>$ ssh student@kloudbox.my.id -p 2201</span></p>
              <p className="terminal-line line-2"><span>$ cd public_html</span></p>
              <p className="terminal-line line-3"><span>$ ls</span></p>
              <p className="terminal-output line-4">index.html&nbsp;&nbsp;style.css&nbsp;&nbsp;script.js</p>
              <p className="terminal-line line-5"><span>$ echo &quot;Hello KloudBox&quot;</span><i></i></p>
            </div>
          </div>

          <aside className="status-card glass-card">
            <div>
              <span>Status</span>
              <strong><i></i>Running</strong>
            </div>
            <div>
              <span>SSH</span>
              <strong>2201</strong>
            </div>
            <div>
              <span>Web</span>
              <strong>HTTPS</strong>
            </div>
            <div>
              <span>RAM</span>
              <strong>128MB</strong>
            </div>
          </aside>
        </div>
      </section>

      <section className="landing-section reveal-section">
        <div className="section-kicker">
          <p className="eyebrow landing-eyebrow">Cloud features</p>
          <h2>Semua yang dibutuhkan untuk belajar deploy dari terminal</h2>
          <p className="hero-subtitle">
            Simulasi cloud hosting lengkap dengan payment flow, container Linux, SSH, dan static website routing.
          </p>
        </div>
        <div className="landing-card-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="glass-card feature-card" key={title}>
              <span className="card-icon"><Icon size={24} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section reveal-section">
        <div className="section-kicker">
          <p className="eyebrow landing-eyebrow">Cara kerja</p>
          <h2>Dari akun baru sampai website online</h2>
        </div>
        <div className="step-grid">
          {steps.map(({ icon: Icon, title }, index) => (
            <article className="glass-card step-card" key={title}>
              <span className="step-number">{index + 1}</span>
              <Icon size={22} />
              <h3>{title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section architecture-section reveal-section">
        <div className="section-kicker">
          <p className="eyebrow landing-eyebrow">Mini architecture</p>
          <h2>Alur KloudBox dari dashboard ke container</h2>
        </div>
        <div className="architecture-flow">
          {architecture.map(({ icon: Icon, label }, index) => (
            <div className="architecture-node" key={label}>
              <div className="glass-card architecture-card">
                <Icon size={24} />
                <span>{label}</span>
              </div>
              {index < architecture.length - 1 ? <span className="flow-arrow" aria-hidden="true"></span> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-pricing-section reveal-section">
        <div className="section-kicker">
          <p className="eyebrow landing-eyebrow">Pricing</p>
          <h2>Pilih paket KloudBox sesuai kebutuhan</h2>
          <p className="hero-subtitle">
            Mulai dari demo gratis hingga VPS mini siap pakai. Bayar sekali, aktif sesuai durasi.
          </p>
        </div>

        <div className="landing-pricing-grid">
          {packages.length === 0 ? (
            <p className="hero-subtitle">Memuat paket…</p>
          ) : (
            packages.map((pkg) => {
              const isFeatured = pkg.slug === "student-box";
              const features = PACKAGE_FEATURES[pkg.slug] || [
                `${pkg.ramLimit} RAM`,
                pkg.cpuLimit,
                `Aktif ${pkg.activeDays} hari`
              ];
              return (
                <article
                  className={`glass-card landing-pricing-card${isFeatured ? " landing-pricing-card-featured" : ""}`}
                  key={pkg.id}
                >
                  {isFeatured ? <span className="landing-pricing-badge">Paling Populer</span> : null}
                  <p className="eyebrow landing-eyebrow">{pkg.name}</p>
                  <h3>{formatPrice(pkg.price)}</h3>
                  <p className="landing-pricing-desc">{pkg.description}</p>
                  <ul className="landing-pricing-features">
                    {features.map((feature) => (
                      <li key={feature}>
                        <Check size={16} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link className="button landing-primary full" to="/pricing">
                    {pkg.price === 0 ? "Coba Gratis" : "Beli Paket"}
                  </Link>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="landing-section landing-split reveal-section">
        <div className="benefit-copy">
          <p className="eyebrow landing-eyebrow">Benefit</p>
          <h2>Belajar deployment cloud tanpa membuka akses ke VPS utama</h2>
          <div className="benefit-list">
            {benefits.map((benefit) => (
              <p key={benefit}>
                <CheckCircle2 size={18} />
                <span>{benefit}</span>
              </p>
            ))}
          </div>
        </div>

        <article className="glass-card pricing-preview">
          <p className="eyebrow landing-eyebrow">Mulai sekarang</p>
          <h3>Login &amp; Beli</h3>
          <ul>
            <li>Login dengan akun KloudBox</li>
            <li>Pilih paket di halaman Pricing</li>
            <li>Bayar via Xendit sandbox</li>
            <li>Container provisioned otomatis</li>
            <li>SSH &amp; deploy website statis</li>
          </ul>
          <Link className="button landing-primary full" to="/pricing">
            Lihat Semua Paket
          </Link>
        </article>
      </section>

      <section className="final-cta">
        <div>
          <p className="eyebrow landing-eyebrow">Mulai deploy</p>
          <h2>Siap deploy website statis dari terminal?</h2>
          <p>
            Belajar SSH, Docker container, dan deployment web statis dalam satu platform cloud mini.
          </p>
        </div>
        <Link className="button landing-primary" to="/pricing">
          Coba KloudBox Sekarang <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}

import { ArrowRight, CheckCircle2, Server, TerminalSquare } from "lucide-react";
import { Link } from "react-router-dom";

export function Landing() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">SaaS mini cloud hosting untuk praktikum</p>
          <h1>KloudBox</h1>
          <p>
            Simulasi VPS mini untuk belajar alur order layanan cloud, pembayaran Xendit,
            dashboard status, dan environment development/production.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/pricing">
              Mulai Sekarang <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" to="/login">Masuk Dashboard</Link>
          </div>
        </div>
        <div className="terminal-panel" aria-label="KloudBox CLI preview">
          <div className="terminal-bar">
            <span></span><span></span><span></span>
          </div>
          <pre>{`$ cloudbox order student-box
Invoice created: PENDING

$ node scripts/check-xendit-invoice.js inv_xxx
Status: PAID
Provisioning: STUB_COMPLETED`}</pre>
        </div>
      </section>

      <section className="feature-band">
        <article>
          <Server />
          <h2>Mini VPS Concept</h2>
          <p>Provisioning container disiapkan sebagai stub untuk fase MID dan dilanjutkan saat UAS.</p>
        </article>
        <article>
          <CheckCircle2 />
          <h2>Xendit Invoice</h2>
          <p>Order Student Box memanggil REST API Xendit dan menyimpan invoice URL ke database.</p>
        </article>
        <article>
          <TerminalSquare />
          <h2>CLI Evidence</h2>
          <p>Script backend mengambil status invoice langsung dari Xendit API untuk bukti integrasi.</p>
        </article>
      </section>
    </main>
  );
}

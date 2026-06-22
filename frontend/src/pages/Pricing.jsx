import { Check, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getToken } from "../lib/api";

const PACKAGE_FEATURES = {
  "demo-box": [
    "100MB RAM, 0.1 CPU",
    "Aktif 1 hari",
    "Akses SSH siap pakai",
    "Tanpa pembayaran"
  ],
  "student-box": [
    "128MB RAM, 0.2 CPU",
    "Aktif 7 hari",
    "Akses SSH + folder web",
    "Payment link Xendit"
  ],
  "pro-box": [
    "256MB RAM, 0.25 CPU",
    "Aktif 30 hari",
    "Akses SSH + folder web",
    "Payment link Xendit"
  ]
};

function formatPrice(value) {
  if (!value || value === 0) return "Gratis";
  return `Rp${Number(value).toLocaleString("id-ID")}`;
}

export function Pricing() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [message, setMessage] = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api("/packages")
      .then((data) => setPackages(data.packages || []))
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  async function buyPackage(packageId) {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    setBuyingId(packageId);
    setMessage("");
    setInvoiceUrl("");

    try {
      const data = await api("/orders", {
        method: "POST",
        body: JSON.stringify({ packageId })
      });
      setInvoiceUrl(data.order?.invoiceUrl || "");
      setMessage(data.message || "Invoice berhasil dibuat. Buka link pembayaran Xendit di bawah.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <main className="page-shell">
      <div className="page-heading">
        <p className="eyebrow">Pricing</p>
        <h1>Pilih paket KloudBox sesuai kebutuhan</h1>
        <p>Dari demo gratis hingga VPS mini siap pakai. Bayar sekali, aktif sesuai durasi.</p>
      </div>

      {loading ? <div className="notice">Loading package...</div> : null}

      <div className="pricing-grid">
        {packages.map((pkg) => {
          const isFeatured = pkg.slug === "student-box";
          const isFree = pkg.price === 0;
          const features = PACKAGE_FEATURES[pkg.slug] || [
            `${pkg.ramLimit} RAM`,
            pkg.cpuLimit,
            `Aktif ${pkg.activeDays} hari`,
            isFree ? "Tanpa pembayaran" : "Payment link Xendit"
          ];

          return (
            <article
              key={pkg.id}
              className={`pricing-card${isFeatured ? " pricing-card-featured" : ""}`}
            >
              {isFeatured ? <span className="pricing-badge">Paling Populer</span> : null}
              <div>
                <p className="eyebrow">KloudBox Package</p>
                <h2>{pkg.name}</h2>
                <p>{pkg.description}</p>
              </div>
              <div className="price">{formatPrice(pkg.price)}</div>
              <ul className="pricing-features">
                {features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className="button full"
                onClick={() => buyPackage(pkg.id)}
                disabled={buyingId === pkg.id}
              >
                {buyingId === pkg.id ? <Loader2 className="spin" size={18} /> : null}
                {isFree ? "Coba Gratis" : "Beli Paket"}
              </button>
            </article>
          );
        })}
      </div>

      {!loading && packages.length === 0 ? (
        <div className="empty-state standalone">
          <p>Paket belum tersedia atau API belum merespons.</p>
        </div>
      ) : null}

      {message ? <div className="notice">{message}</div> : null}
      {invoiceUrl ? (
        <div className="invoice-box">
          <a href={invoiceUrl} target="_blank" rel="noreferrer">
            Buka Invoice Xendit <ExternalLink size={16} />
          </a>
          <Link to="/dashboard">Lihat Dashboard</Link>
        </div>
      ) : null}
    </main>
  );
}

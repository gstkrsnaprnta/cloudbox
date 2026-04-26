import { ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getToken } from "../lib/api";

export function Pricing() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [message, setMessage] = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api("/packages")
      .then((data) => setPackages(data.packages))
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
      setInvoiceUrl(data.order.invoiceUrl || "");
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
        <h1>Student Box untuk fase MID</h1>
        <p>Paket aktif fokus ke pembuktian REST API Xendit dan dashboard order.</p>
      </div>

      {loading ? <div className="notice">Loading package...</div> : null}

      <div className="pricing-grid">
        {packages.map((pkg) => (
          <article className="pricing-card" key={pkg.id}>
            <div>
              <p className="eyebrow">CloudBox Package</p>
              <h2>{pkg.name}</h2>
              <p>{pkg.description}</p>
            </div>
            <div className="price">Rp{pkg.price.toLocaleString("id-ID")}</div>
            <ul>
              <li>{pkg.ramLimit} RAM</li>
              <li>{pkg.cpuLimit}</li>
              <li>Aktif {pkg.activeDays} hari</li>
              <li>Payment link Xendit</li>
            </ul>
            <button className="button full" onClick={() => buyPackage(pkg.id)} disabled={buyingId === pkg.id}>
              {buyingId === pkg.id ? <Loader2 className="spin" size={18} /> : null}
              Beli Paket
            </button>
          </article>
        ))}
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

import { ExternalLink, Play, RefreshCcw, RotateCcw, Square, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getStoredUser, getToken } from "../lib/api";

export function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [box, setBox] = useState(null);
  const [message, setMessage] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const navigate = useNavigate();
  const user = getStoredUser();

  async function loadDashboard() {
    try {
      const [ordersData, boxData] = await Promise.all([api("/orders"), api("/boxes/me")]);
      setOrders(ordersData.orders);
      setBox(boxData.box);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function runBoxAction(action) {
    if (!box) return;

    setBusyAction(action);
    setMessage("");

    try {
      const data = await api(`/boxes/${box.id}/${action}`, { method: "POST" });
      setBox(data.box);
      await loadDashboard();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyAction("");
    }
  }

  async function markPaid(orderId) {
    setBusyAction(`mark-paid-${orderId}`);
    setMessage("");

    try {
      await api(`/orders/${orderId}/mark-paid`, { method: "POST" });
      await loadDashboard();
      setMessage("Order ditandai PAID dan provisioning KloudBox dijalankan.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusyAction("");
    }
  }

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }
    loadDashboard();
  }, [navigate]);

  return (
    <main className="page-shell">
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Halo, {user?.name || "KloudBox User"}</h1>
          <p>Pantau order, invoice, dan kontrol container KloudBox kamu.</p>
        </div>
        <div className="dashboard-actions">
          <button className="secondary-button" onClick={loadDashboard}>
            <RefreshCcw size={16} /> Refresh
          </button>
          <Link className="button" to="/pricing">Beli Student Box</Link>
        </div>
      </div>

      {message ? <div className="notice">{message}</div> : null}

      <section className="table-panel">
        <div className="table-row table-head orders-row">
          <span>Paket</span>
          <span>External ID</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Invoice</span>
          <span>Dev</span>
        </div>
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada order.</p>
            <Link className="button small" to="/pricing">Buat Order</Link>
          </div>
        ) : (
          orders.map((order) => (
            <div className="table-row orders-row" key={order.id}>
              <span>{order.package.name}</span>
              <span className="mono">{order.externalId}</span>
              <span>Rp{order.amount.toLocaleString("id-ID")}</span>
              <span>
                <strong className={`status ${order.status.toLowerCase()}`}>{order.status}</strong>
              </span>
              <span>
                {order.invoiceUrl ? (
                  <a className="inline-link" href={order.invoiceUrl} target="_blank" rel="noreferrer">
                    Buka <ExternalLink size={14} />
                  </a>
                ) : (
                  "-"
                )}
              </span>
              <span>
                {order.status !== "PAID" ? (
                  <button
                    className="secondary-button compact"
                    onClick={() => markPaid(order.id)}
                    disabled={busyAction === `mark-paid-${order.id}`}
                  >
                    <Zap size={14} /> Mark Paid
                  </button>
                ) : (
                  "-"
                )}
              </span>
            </div>
          ))
        )}
      </section>

      <section className="box-panel">
        <div className="section-heading">
          <p className="eyebrow">KloudBox Container</p>
          <h2>SSH dan Static Website</h2>
        </div>

        {!box ? (
          <div className="empty-state standalone">
            <p>Belum ada KloudBox aktif. Buat order lalu tandai paid di development atau tunggu webhook Xendit.</p>
          </div>
        ) : (
          <>
            <div className="box-grid">
              <Info label="Container" value={box.containerName} />
              <Info label="Status" value={box.status} badge />
              <Info label="Username" value={box.username} />
              <Info label="Password Demo" value={box.password} />
              <Info label="Deploy Folder" value={box.webFolder} mono />
              <Info label="Website URL" value={box.publicUrl} link />
            </div>

            <div className="command-list">
              <Command label="SSH Command" value={box.sshCommand} />
              <Command label="SCP Upload Command" value={box.scpCommand} />
            </div>

            <div className="dashboard-actions">
              <button className="secondary-button" onClick={() => runBoxAction("start")} disabled={!!busyAction}>
                <Play size={16} /> Start Box
              </button>
              <button className="secondary-button" onClick={() => runBoxAction("stop")} disabled={!!busyAction}>
                <Square size={16} /> Stop Box
              </button>
              <button className="secondary-button" onClick={() => runBoxAction("restart")} disabled={!!busyAction}>
                <RefreshCcw size={16} /> Restart Box
              </button>
              <button className="secondary-button" onClick={() => runBoxAction("reset")} disabled={!!busyAction}>
                <RotateCcw size={16} /> Reset Box
              </button>
              <a className="button" href={box.publicUrl} target="_blank" rel="noreferrer">
                Buka Website <ExternalLink size={16} />
              </a>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Info({ label, value, badge = false, mono = false, link = false }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noreferrer">{value}</a>
      ) : (
        <strong className={`${badge ? "status running" : ""} ${mono ? "mono" : ""}`}>{value}</strong>
      )}
    </div>
  );
}

function Command({ label, value }) {
  return (
    <div className="command-item">
      <span>{label}</span>
      <code>{value}</code>
    </div>
  );
}

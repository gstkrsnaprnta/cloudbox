import {
  Activity,
  Box,
  CreditCard,
  PlayCircle,
  RefreshCcw,
  StopCircle,
  Trash2,
  Users,
  Webhook
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, getStoredUser, getToken } from "../lib/api";

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "users", label: "Users", icon: Users },
  { id: "orders", label: "Orders", icon: CreditCard },
  { id: "containers", label: "Containers", icon: Box },
  { id: "webhooks", label: "Webhook Logs", icon: Webhook }
];

function formatRupiah(value) {
  const number = Number(value || 0);
  return `Rp${number.toLocaleString("id-ID")}`;
}

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return "-";
  }
}

function StatusBadge({ status }) {
  if (!status) return <span className="status pending">-</span>;
  const lower = String(status).toLowerCase();
  let kind = "pending";
  if (["paid", "running", "settled", "success", "active"].includes(lower)) {
    kind = "paid";
  } else if (["failed", "error", "expired", "stopped"].includes(lower)) {
    kind = "failed";
  } else if (["pending", "creating", "restarting", "not_started", "unknown"].includes(lower)) {
    kind = "pending";
  }
  return <span className={`status ${kind}`}>{status}</span>;
}

export function Admin() {
  const token = getToken();
  const user = getStoredUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [actionId, setActionId] = useState(null);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (user && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [s, u, o, b, l] = await Promise.all([
        api("/admin/stats"),
        api("/admin/users"),
        api("/admin/orders"),
        api("/admin/boxes"),
        api("/admin/webhook-logs")
      ]);
      setStats(s);
      setUsers(u.users || []);
      setOrders(o.orders || []);
      setBoxes(b.boxes || []);
      setLogs(l.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBoxAction(id, verb) {
    setActionId(`${verb}-${id}`);
    setError("");
    try {
      if (verb === "delete") {
        await api(`/admin/boxes/${id}`, { method: "DELETE" });
      } else {
        await api(`/admin/boxes/${id}/${verb}`, { method: "POST" });
      }
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  function confirmDelete(box) {
    if (window.confirm(`Hapus container "${box.containerName}"? Tindakan ini tidak bisa dibatalkan.`)) {
      handleBoxAction(box.id, "delete");
    }
  }

  return (
    <main className="page-shell">
      <div className="page-heading">
        <p className="eyebrow">Admin Panel</p>
        <h1>Dashboard Admin KloudBox</h1>
        <p>Pantau pengguna, pesanan, container, dan webhook log dari satu tempat.</p>
      </div>

      <div className="admin-toolbar">
        <button className="secondary-button compact" onClick={loadAll} disabled={loading}>
          <RefreshCcw size={14} />
          {loading ? "Memuat..." : "Refresh"}
        </button>
      </div>

      <div className="admin-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {error ? <div className="error">{error}</div> : null}

      {activeTab === "overview" ? <OverviewTab stats={stats} /> : null}
      {activeTab === "users" ? <UsersTab users={users} /> : null}
      {activeTab === "orders" ? <OrdersTab orders={orders} /> : null}
      {activeTab === "containers" ? (
        <ContainersTab
          boxes={boxes}
          onAction={handleBoxAction}
          onDelete={confirmDelete}
          actionId={actionId}
        />
      ) : null}
      {activeTab === "webhooks" ? <WebhooksTab logs={logs} /> : null}
    </main>
  );
}

function OverviewTab({ stats }) {
  if (!stats) {
    return <div className="notice">Memuat statistik...</div>;
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers ?? 0, icon: Users },
    { label: "Total Orders", value: stats.totalOrders ?? 0, icon: CreditCard },
    { label: "Paid", value: stats.paidOrders ?? 0, icon: CreditCard },
    { label: "Pending", value: stats.pendingOrders ?? 0, icon: Activity },
    { label: "Containers", value: stats.totalBoxes ?? 0, icon: Box },
    { label: "Running", value: stats.runningBoxes ?? 0, icon: PlayCircle },
    { label: "Revenue", value: formatRupiah(stats.totalRevenue), icon: CreditCard }
  ];

  return (
    <div className="admin-stat-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div className="admin-stat-card" key={card.label}>
            <div className="admin-stat-icon">
              <Icon size={20} />
            </div>
            <div>
              <span className="admin-stat-label">{card.label}</span>
              <strong className="admin-stat-value">{card.value}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UsersTab({ users }) {
  return (
    <div className="table-panel admin-table">
      <div className="admin-users-row admin-table-head">
        <span>ID</span>
        <span>Nama</span>
        <span>Email</span>
        <span>Role</span>
        <span>Orders</span>
        <span>Boxes</span>
        <span>Bergabung</span>
      </div>
      {users.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada user.</p>
        </div>
      ) : (
        users.map((u) => (
          <div className="admin-users-row admin-table-row" key={u.id}>
            <span className="mono">{u.id}</span>
            <span>{u.name}</span>
            <span className="mono">{u.email}</span>
            <span>
              <StatusBadge status={u.role === "admin" ? "paid" : "pending"} />
              <span style={{ marginLeft: 6, fontWeight: 700 }}>{u.role}</span>
            </span>
            <span className="mono">{u._count?.orders ?? 0}</span>
            <span className="mono">{u._count?.cloudBoxes ?? 0}</span>
            <span>{formatDate(u.createdAt)}</span>
          </div>
        ))
      )}
    </div>
  );
}

function OrdersTab({ orders }) {
  return (
    <div className="table-panel admin-table">
      <div className="admin-orders-row admin-table-head">
        <span>ID</span>
        <span>User</span>
        <span>Paket</span>
        <span>External ID</span>
        <span>Jumlah</span>
        <span>Status</span>
        <span>Provision</span>
        <span>Dibuat</span>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada order.</p>
        </div>
      ) : (
        orders.map((o) => (
          <div className="admin-orders-row admin-table-row" key={o.id}>
            <span className="mono">{o.id}</span>
            <span className="mono">{o.user?.email || "-"}</span>
            <span>{o.package?.name || "-"}</span>
            <span className="mono" title={o.externalId}>
              {o.externalId}
            </span>
            <span>{formatRupiah(o.amount)}</span>
            <span>
              <StatusBadge status={o.status} />
            </span>
            <span>
              <StatusBadge status={o.provisionStatus} />
            </span>
            <span>{formatDate(o.createdAt)}</span>
          </div>
        ))
      )}
    </div>
  );
}

function ContainersTab({ boxes, onAction, onDelete, actionId }) {
  return (
    <div className="table-panel admin-table">
      <div className="admin-boxes-row admin-table-head">
        <span>Container</span>
        <span>User</span>
        <span>SSH</span>
        <span>Web</span>
        <span>DB Status</span>
        <span>Live</span>
        <span>Expires</span>
        <span>Aksi</span>
      </div>
      {boxes.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada container.</p>
        </div>
      ) : (
        boxes.map((b) => {
          const starting = actionId === `start-${b.id}`;
          const stopping = actionId === `stop-${b.id}`;
          const deleting = actionId === `delete-${b.id}`;
          const busy = !!actionId;
          return (
            <div className="admin-boxes-row admin-table-row" key={b.id}>
              <span className="mono" style={{ fontWeight: 700 }}>
                {b.containerName}
              </span>
              <span className="mono">{b.user?.email || "-"}</span>
              <span className="mono">{b.sshPort}</span>
              <span className="mono">{b.webPort}</span>
              <span>
                <StatusBadge status={b.status} />
              </span>
              <span>
                <StatusBadge status={b.liveStatus} />
              </span>
              <span>{formatDate(b.expiresAt)}</span>
              <div className="admin-action-cell">
                <button
                  className="secondary-button compact"
                  onClick={() => onAction(b.id, "start")}
                  disabled={busy}
                >
                  <PlayCircle size={14} />
                  {starting ? "..." : "Start"}
                </button>
                <button
                  className="secondary-button compact"
                  onClick={() => onAction(b.id, "stop")}
                  disabled={busy}
                >
                  <StopCircle size={14} />
                  {stopping ? "..." : "Stop"}
                </button>
                <button
                  className="secondary-button compact danger"
                  onClick={() => onDelete(b)}
                  disabled={busy}
                >
                  <Trash2 size={14} />
                  {deleting ? "..." : "Hapus"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function WebhooksTab({ logs }) {
  return (
    <div className="table-panel admin-table">
      <div className="admin-webhooks-row admin-table-head">
        <span>ID</span>
        <span>Event</span>
        <span>Order</span>
        <span>Order Status</span>
        <span>Diterima</span>
        <span>Payload</span>
      </div>
      {logs.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada webhook log.</p>
        </div>
      ) : (
        logs.map((l) => (
          <div className="admin-webhooks-row admin-table-row" key={l.id}>
            <span className="mono">{l.id}</span>
            <span className="mono">{l.eventType || "-"}</span>
            <span className="mono">{l.order?.externalId || "-"}</span>
            <span>
              <StatusBadge status={l.order?.status} />
            </span>
            <span>{formatDate(l.createdAt)}</span>
            <span className="mono admin-payload-preview" title={l.payload}>
              {l.payload?.length > 120 ? `${l.payload.slice(0, 120)}…` : l.payload}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

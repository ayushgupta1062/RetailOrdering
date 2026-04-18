import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const { user } = useAuth();
  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';
  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-icon">🛒</div>
        RetailX
      </div>
      <nav>
        <Link to="/admin/dashboard" className={`admin-nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
          <span className="admin-nav-icon">📊</span> Dashboard
        </Link>
        <Link to="/admin/orders" className={`admin-nav-item ${isActive('/admin/orders') ? 'active' : ''}`}>
          <span className="admin-nav-icon">📋</span> Orders
        </Link>
        <Link to="/admin/inventory" className={`admin-nav-item ${isActive('/admin/inventory') ? 'active' : ''}`}>
          <span className="admin-nav-icon">📦</span> Inventory
        </Link>
      </nav>
      <div style={{ marginTop: 'auto', padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px' }}>
          <div className="rx-avatar" style={{ width: '34px', height: '34px', fontSize: '14px' }}>{getInitials(user?.name)}</div>
          <div><div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{user?.name}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Administrator</div></div>
        </div>
      </div>
    </div>
  );
}

const STATUS_OPTIONS = ['PLACED', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchOrders(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/admin/orders');
      setOrders(res.data.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      showToast(`Order #${orderId} updated to ${newStatus}`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PLACED: { class: 'badge-placed', label: 'Placed' },
      CONFIRMED: { class: 'badge-confirmed', label: 'Confirmed' },
      DELIVERED: { class: 'badge-delivered', label: 'Delivered' },
      CANCELLED: { class: 'badge-cancelled', label: 'Cancelled' },
    };
    return configs[status] || { class: 'badge-primary', label: status };
  };

  const allStatuses = ['ALL', ...STATUS_OPTIONS];
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        {toast && (
          <div className={`rx-toast ${toast.type === 'error' ? 'rx-toast-error' : 'rx-toast-success'}`}>
            {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
          </div>
        )}

        <div className="admin-header">
          <div>
            <h2 style={{ letterSpacing: '-0.03em' }}>All Orders</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '3px', fontSize: '14px' }}>
              {orders.length} total orders • Manage and update status
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="rx-pills" style={{ marginBottom: '20px' }}>
          {allStatuses.map(s => (
            <button key={s} className={`rx-pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'ALL' ? `All (${orders.length})` : `${s.charAt(0) + s.slice(1).toLowerCase()} (${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rx-spinner-wrapper"><div className="rx-spinner"></div><div className="rx-spinner-text">Loading orders...</div></div>
        ) : (
          <div className="rx-table-wrapper">
            <table className="rx-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Coupon</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const cfg = getStatusConfig(order.status);
                  return (
                    <tr key={order.id}>
                      <td><strong>#{order.id}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.user?.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--success)', fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                        {order.discountAmount > 0 && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Saved ₹{order.discountAmount}</div>}
                      </td>
                      <td>
                        {order.couponCode ? (
                          <span className="badge badge-primary">{order.couponCode}</span>
                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td><span className={`badge ${cfg.class}`}>{cfg.label}</span></td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          style={{
                            background: 'var(--bg-base)', color: 'var(--text-primary)',
                            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                            padding: '6px 10px', fontSize: '13px', cursor: 'pointer',
                            outline: 'none', fontFamily: 'Inter, sans-serif'
                          }}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;

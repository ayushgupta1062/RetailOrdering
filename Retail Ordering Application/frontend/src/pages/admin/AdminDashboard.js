import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const { user, logout } = useAuth();
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px', marginBottom: '8px' }}>
          <div className="rx-avatar" style={{ width: '34px', height: '34px', fontSize: '14px' }}>{getInitials(user?.name)}</div>
          <div><div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{user?.name}</div><div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Administrator</div></div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, placed: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await api.get('/api/admin/orders');
        const orders = ordersRes.data.data || [];
        const revenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const placed = orders.filter(o => o.status === 'PLACED').length;
        setStats({ orders: orders.length, revenue, products: 0, placed });
        setRecentOrders(orders.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      PLACED: { class: 'badge-placed', label: 'Placed' },
      CONFIRMED: { class: 'badge-confirmed', label: 'Confirmed' },
      DELIVERED: { class: 'badge-delivered', label: 'Delivered' },
      CANCELLED: { class: 'badge-cancelled', label: 'Cancelled' },
    };
    return configs[status] || { class: 'badge-primary', label: status };
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 style={{ letterSpacing: '-0.03em' }}>Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '3px', fontSize: '14px' }}>
              Welcome back, <strong style={{ color: 'var(--primary-light)' }}>{user?.name}</strong> 👋
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span className="glow-dot"></span> System Online
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="rx-spinner-wrapper"><div className="rx-spinner"></div></div>
        ) : (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon violet">📋</div>
                <div className="admin-stat-val">{stats.orders}</div>
                <div className="admin-stat-label">Total Orders</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon green">💰</div>
                <div className="admin-stat-val">₹{stats.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                <div className="admin-stat-label">Total Revenue</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon amber">⏳</div>
                <div className="admin-stat-val">{stats.placed}</div>
                <div className="admin-stat-label">Pending Orders</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon blue">✅</div>
                <div className="admin-stat-val">{stats.orders - stats.placed}</div>
                <div className="admin-stat-label">Processed Orders</div>
              </div>
            </div>

            {/* Recent Orders */}
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>Recent Orders</div>
              <Link to="/admin/orders" className="btn btn-outline btn-sm">View All →</Link>
            </div>
            <div className="rx-table-wrapper">
              <table className="rx-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => {
                    const cfg = getStatusConfig(order.status);
                    return (
                      <tr key={order.id}>
                        <td><strong>#{order.id}</strong></td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.user?.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                        </td>
                        <td style={{ color: 'var(--success)', fontWeight: 700 }}>₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                        <td><span className={`badge ${cfg.class}`}>{cfg.label}</span></td>
                      </tr>
                    );
                  })}
                  {recentOrders.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

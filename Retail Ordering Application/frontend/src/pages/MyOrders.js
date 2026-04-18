import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders/my-orders');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      PLACED: { class: 'badge-placed', icon: '🕐', label: 'Placed' },
      CONFIRMED: { class: 'badge-confirmed', icon: '✔️', label: 'Confirmed' },
      DELIVERED: { class: 'badge-delivered', icon: '✅', label: 'Delivered' },
      CANCELLED: { class: 'badge-cancelled', icon: '❌', label: 'Cancelled' },
    };
    return configs[status] || { class: 'badge-primary', icon: '📦', label: status };
  };

  const handleReorder = async (orderId) => {
    setReorderingId(orderId);
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      const items = res.data.data.items;

      for (let item of items) {
        const productId = item.product?.id || item.productId;
        if (productId) {
          await api.post('/api/cart/add', { productId: productId, quantity: item.quantity });
        }
      }

      navigate('/cart');
    } catch (err) {
      console.error('Failed to quick reorder', err);
      alert('Failed to reorder items. They may be out of stock.');
    } finally {
      setReorderingId(null);
    }
  };

  const statuses = ['ALL', 'PLACED', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  if (loading) return (
    <div className="page-wrapper"><div className="container"><div className="rx-spinner-wrapper"><div className="rx-spinner"></div><div className="rx-spinner-text">Loading your orders...</div></div></div></div>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ padding: '36px 0 24px' }}>
          <h2 style={{ letterSpacing: '-0.03em' }}>📦 My Orders</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Track and manage all your orders in one place</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 22px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Total Orders</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>{orders.length}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 22px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Total Spent</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 22px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>Loyalty Points</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
              <span style={{ color: '#a78bfa' }}>🏆 {orders.length * 10}</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="rx-pills" style={{ marginBottom: '24px' }}>
          {statuses.map(s => (
            <button key={s} className={`rx-pill ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()} ({s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="rx-empty">
            <div className="rx-empty-icon">📭</div>
            <div className="rx-empty-title">No orders found</div>
            <div className="rx-empty-desc">{filter === 'ALL' ? "You haven't placed any orders yet." : `No orders with status "${filter}".`}</div>
            {filter === 'ALL' && <button className="btn btn-primary mt-16" onClick={() => navigate('/home')}>Start Shopping →</button>}
          </div>
        ) : (
          <div style={{ paddingBottom: '60px' }}>
            {filtered.map((order) => {
              const config = getStatusConfig(order.status);
              return (
                <div key={order.id} className="rx-order-card">
                  {/* Status icon area */}
                  <div style={{
                    width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0
                  }}>
                    {config.icon}
                  </div>

                  {/* Meta */}
                  <div className="rx-order-meta">
                    <div className="rx-order-id">Order #{order.id}</div>
                    <div className="rx-order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: 'right' }}>
                    <div className="rx-order-total">₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    {order.discountAmount > 0 && (
                      <div className="rx-order-discount">Saved ₹{order.discountAmount}</div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`badge ${config.class}`}>{config.label}</span>
                  </div>

                  {/* Action */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={reorderingId === order.id}
                      onClick={() => handleReorder(order.id)}
                    >
                      {reorderingId === order.id ? 'Loading...' : '🔁 Reorder'}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate(`/order/${order.id}`)}>
                      View →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;

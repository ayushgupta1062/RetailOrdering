import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function OrderDetail() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/orders/${id}`);
        setOrderData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const getStatusConfig = (status) => {
    const configs = {
      PLACED: { class: 'badge-placed', icon: '🕐', label: 'Placed' },
      CONFIRMED: { class: 'badge-confirmed', icon: '✔️', label: 'Confirmed' },
      DELIVERED: { class: 'badge-delivered', icon: '✅', label: 'Delivered' },
      CANCELLED: { class: 'badge-cancelled', icon: '❌', label: 'Cancelled' },
    };
    return configs[status] || { class: 'badge-primary', icon: '📦', label: status };
  };

  if (loading) return (
    <div className="page-wrapper"><div className="container"><div className="rx-spinner-wrapper"><div className="rx-spinner"></div><div className="rx-spinner-text">Loading order details...</div></div></div></div>
  );

  if (!orderData) return (
    <div className="page-wrapper"><div className="container"><div className="rx-empty"><div className="rx-empty-icon">❌</div><div className="rx-empty-title">Order not found</div><button className="btn btn-primary mt-16" onClick={() => navigate('/my-orders')}>← Back to Orders</button></div></div></div>
  );

  const { order, items } = orderData;
  const config = getStatusConfig(order.status);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ padding: '36px 0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-orders')} style={{ marginBottom: '10px', padding: '6px 0' }}>
              ← Back to Orders
            </button>
            <h2 style={{ letterSpacing: '-0.03em' }}>Order #{order.id}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`badge ${config.class}`} style={{ padding: '8px 18px', fontSize: '13px' }}>
            {config.icon} {config.label}
          </span>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Total Amount</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Items</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>{items?.length || 0}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              {order.couponCode ? 'Coupon Used' : 'Discount'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {order.couponCode ? (
                <span style={{ color: 'var(--primary-light)' }}>🎟️ {order.couponCode}</span>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>None applied</span>
              )}
            </div>
            {order.discountAmount > 0 && (
              <div style={{ fontSize: '13px', color: 'var(--success)', marginTop: '4px' }}>Saved ₹{order.discountAmount}</div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Items Ordered
        </div>
        <div className="rx-table-wrapper" style={{ marginBottom: '60px' }}>
          <table className="rx-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{index + 1}</td>
                  <td>
                    <strong>{item.product?.name}</strong>
                    {item.product?.brand && <div style={{ fontSize: '12px', color: 'var(--primary-light)' }}>{item.product.brand.name}</div>}
                  </td>
                  <td>₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'white', background: 'var(--bg-elevated)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '13px' }}>
                      {item.quantity}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>₹{(item.unitPrice * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 700, fontSize: '14px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                  Final Amount
                </td>
                <td style={{ padding: '16px 18px', textAlign: 'right', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;

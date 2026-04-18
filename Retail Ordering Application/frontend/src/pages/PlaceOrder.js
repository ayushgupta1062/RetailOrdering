import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function PlaceOrder() {
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/api/cart');
      const cartData = res.data.data;
      setCart(cartData);
      const productDetails = {};
      let total = 0;
      for (const productId of Object.keys(cartData)) {
        const productRes = await api.get(`/api/products/${productId}`);
        productDetails[productId] = productRes.data.data;
        total += productRes.data.data.price * cartData[productId];
      }
      setProducts(productDetails);
      setCartTotal(parseFloat(total.toFixed(2)));
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponMsg('');
    setCouponError('');
    try {
      const res = await api.post('/api/coupons/apply', { cartTotal, couponCode });
      const data = res.data.data;
      setDiscount(data.discountAmount);
      setCouponMsg(`Coupon applied! You save ₹${data.discountAmount.toFixed(2)} (${data.discountPercent}% off)`);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon');
      setDiscount(0);
    } finally {
      setApplying(false);
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      await api.post('/api/orders/place', { couponCode: couponCode || null });
      navigate('/my-orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper"><div className="container"><div className="rx-spinner-wrapper"><div className="rx-spinner"></div><div className="rx-spinner-text">Loading order summary...</div></div></div></div>
  );

  const cartItems = Object.entries(cart);
  const finalAmount = (cartTotal - discount).toFixed(2);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ padding: '36px 0 24px' }}>
          <h2 style={{ letterSpacing: '-0.03em' }}>📋 Order Checkout</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Review your order and complete the purchase</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="rx-empty">
            <div className="rx-empty-icon">🛒</div>
            <div className="rx-empty-title">Your cart is empty</div>
            <button className="btn btn-primary mt-16" onClick={() => navigate('/home')}>← Browse Products</button>
          </div>
        ) : (
          <div className="rx-cart-grid" style={{ paddingBottom: '60px' }}>
            {/* Left: Items review */}
            <div>
              <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Items in Order
              </div>
              <div className="rx-table-wrapper">
                <table className="rx-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(([productId, qty]) => {
                      const product = products[productId];
                      return (
                        <tr key={productId}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '40px', height: '40px', borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-elevated)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0
                              }}>
                                {product?.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '🛍️'; }} />
                                ) : '🛍️'}
                              </div>
                              <div>
                                <strong>{product?.name}</strong>
                                {product?.brand && <div style={{ fontSize: '12px', color: 'var(--primary-light)' }}>{product.brand.name}</div>}
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontWeight: 700, color: 'white', background: 'var(--bg-elevated)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>{qty}</span></td>
                          <td>₹{product?.price?.toLocaleString('en-IN')}</td>
                          <td><strong>₹{product ? (product.price * qty).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}</strong></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Loyalty points note */}
              <div style={{
                marginTop: '16px', padding: '14px 18px',
                background: 'rgba(108,71,255,0.08)', border: '1px solid rgba(108,71,255,0.2)',
                borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                🏆 You'll earn <strong style={{ margin: '0 4px' }}>10 loyalty points</strong> after placing this order
              </div>
            </div>

            {/* Right: Summary & Coupon */}
            <div>
              <div className="rx-cart-summary-card">
                <div className="rx-cart-summary-title">Price Breakdown</div>

                <div className="rx-summary-row">
                  <span>Cart Total</span>
                  <span className="fw-700" style={{ color: 'var(--text-primary)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Coupon Section */}
                <div style={{ margin: '16px 0' }}>
                  <label className="rx-label">Coupon Code</label>
                  <div className="rx-coupon-row">
                    <input
                      type="text"
                      className="rx-input"
                      placeholder="e.g. SAVE20"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); if (couponMsg || couponError) { setCouponMsg(''); setCouponError(''); setDiscount(0); } }}
                    />
                    <button className="btn btn-outline btn-sm" onClick={applyCoupon} disabled={applying || !couponCode.trim()}>
                      {applying ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponMsg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--success)', marginTop: '8px' }}>
                      ✅ {couponMsg}
                    </div>
                  )}
                  {couponError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--danger)', marginTop: '8px' }}>
                      ❌ {couponError}
                    </div>
                  )}
                </div>

                {discount > 0 && (
                  <div className="rx-summary-row">
                    <span>🎟️ Discount</span>
                    <span className="val-green">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="rx-summary-row">
                  <span>Delivery</span>
                  <span className="val-green">FREE 🎉</span>
                </div>

                <div className="rx-summary-row total">
                  <span>Final Amount</span>
                  <span className="val">₹{parseFloat(finalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <button className="btn btn-success btn-full btn-lg" style={{ marginTop: '20px' }} onClick={placeOrder} disabled={placing}>
                  {placing ? (
                    <><span className="rx-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Placing Order...</>
                  ) : '✅ Place Order'}
                </button>

                <button className="btn btn-ghost btn-full btn-sm" style={{ marginTop: '10px' }} onClick={() => navigate('/cart')}>
                  ← Back to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaceOrder;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Cart() {
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/cart');
      const cartData = res.data.data;
      setCart(cartData);
      const productDetails = {};
      for (const productId of Object.keys(cartData)) {
        const productRes = await api.get(`/api/products/${productId}`);
        productDetails[productId] = productRes.data.data;
      }
      setProducts(productDetails);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    setUpdatingId(productId);
    try {
      await api.put('/api/cart/update', { productId: parseInt(productId), quantity: newQty });
      fetchCart();
    } catch (err) {
      alert('Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/api/cart/remove/${productId}`);
      fetchCart();
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    let total = 0;
    for (const [productId, qty] of Object.entries(cart)) {
      if (products[productId]) {
        total += products[productId].price * qty;
      }
    }
    return total;
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartItems = Object.entries(cart);
  const total = calculateTotal();

  if (loading) return (
    <div className="page-wrapper"><div className="container"><div className="rx-spinner-wrapper"><div className="rx-spinner"></div><div className="rx-spinner-text">Loading your cart...</div></div></div></div>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ padding: '36px 0 16px' }}>
          <h2 style={{ letterSpacing: '-0.03em' }}>🛒 Your Cart</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="rx-empty">
            <div className="rx-empty-icon">🛒</div>
            <div className="rx-empty-title">Your cart is empty</div>
            <div className="rx-empty-desc">Add some products to get started with your order</div>
            <button className="btn btn-primary btn-lg mt-16" onClick={() => navigate('/home')}>
              ← Browse Products
            </button>
          </div>
        ) : (
          <div className="rx-cart-grid">
            {/* Left: Items */}
            <div>
              <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Cart Items
              </div>
              {cartItems.map(([productId, qty]) => {
                const product = products[productId];
                return (
                  <div key={productId} className="rx-cart-item">
                    {/* Image */}
                    <div className="rx-cart-item-img">
                      {product?.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '🛍️'; }} />
                      ) : '🛍️'}
                    </div>

                    {/* Info */}
                    <div className="rx-cart-item-info">
                      <div className="rx-cart-item-brand">{product?.brand?.name || 'RetailX'}</div>
                      <div className="rx-cart-item-name">{product ? product.name : `Product #${productId}`}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        ₹{product?.price?.toLocaleString('en-IN')} per unit
                      </div>
                    </div>

                    {/* Qty Stepper */}
                    <div className="rx-qty-stepper">
                      <button className="rx-qty-btn" onClick={() => updateQuantity(productId, qty - 1)} disabled={qty <= 1 || updatingId === productId}>−</button>
                      <span className="rx-qty-val">{qty}</span>
                      <button className="rx-qty-btn" onClick={() => updateQuantity(productId, qty + 1)} disabled={updatingId === productId}>+</button>
                    </div>

                    {/* Subtotal */}
                    <div style={{ textAlign: 'right', minWidth: '90px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>
                        ₹{product ? (product.price * qty).toLocaleString('en-IN') : '-'}
                      </div>
                    </div>

                    {/* Remove */}
                    <button className="btn btn-ghost btn-sm" onClick={() => removeItem(productId)} style={{ color: 'var(--danger)', flexShrink: 0 }}>
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right: Summary */}
            <div>
              <div className="rx-cart-summary-card">
                <div className="rx-cart-summary-title">Order Summary</div>

                <div className="rx-summary-row">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="fw-700" style={{ color: 'var(--text-primary)' }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="rx-summary-row">
                  <span>Delivery</span>
                  <span className="val-green">FREE 🎉</span>
                </div>
                <div className="rx-summary-row">
                  <span>Loyalty Points</span>
                  <span style={{ color: '#a78bfa' }}>🏆 +10 pts</span>
                </div>

                <div className="rx-summary-row total">
                  <span>Total</span>
                  <span className="val">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <button
                  className="btn btn-primary btn-full btn-lg"
                  style={{ marginTop: '20px' }}
                  onClick={() => navigate('/place-order')}
                >
                  Proceed to Checkout →
                </button>

                <button className="btn btn-ghost btn-full btn-sm" style={{ marginTop: '10px' }} onClick={() => navigate('/home')}>
                  ← Continue Shopping
                </button>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  🔒 Secure Checkout • Encrypted
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;

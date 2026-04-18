import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = async () => {
    setAdding(true);
    try {
      await api.post('/api/cart/add', { productId: product.id, quantity });
      showToast(`Added ${quantity} item(s) to cart! 🛒`);
    } catch (err) {
      showToast('Failed to add. Please login first.', 'error');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="container"><div className="rx-spinner-wrapper"><div className="rx-spinner"></div><div className="rx-spinner-text">Loading product...</div></div></div>
    </div>
  );

  if (!product) return (
    <div className="page-wrapper">
      <div className="container"><div className="rx-empty"><div className="rx-empty-icon">❌</div><div className="rx-empty-title">Product not found</div><button className="btn btn-primary mt-16" onClick={() => navigate('/home')}>← Back to Home</button></div></div>
    </div>
  );

  return (
    <div className="page-wrapper">
      {toast && (
        <div className={`rx-toast ${toast.type === 'error' ? 'rx-toast-error' : 'rx-toast-success'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <div className="container">
        {/* Breadcrumb */}
        <div style={{ padding: '24px 0 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', color: 'var(--primary-light)' }} onClick={() => navigate('/home')}>Home</span>
          <span>›</span>
          {product.category && <><span style={{ cursor: 'pointer', color: 'var(--primary-light)' }}>{product.category.name}</span><span>›</span></>}
          <span>{product.name}</span>
        </div>

        <div className="rx-product-detail-grid">
          {/* Left: Image */}
          <div>
            <div className="rx-product-image-main" style={{ position: 'relative' }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="rx-product-image-no-img">🛍️</div>
              )}
              {product.stockQuantity > 0 ? (
                <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  <span className="badge badge-delivered">✓ In Stock ({product.stockQuantity})</span>
                </div>
              ) : (
                <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  <span className="badge badge-cancelled">Out of Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div style={{ paddingTop: '24px' }}>
            {/* Brand */}
            {product.brand && (
              <div style={{ marginBottom: '8px' }}>
                <span className="badge badge-primary">{product.brand.name}</span>
              </div>
            )}

            {/* Name */}
            <h1 style={{ fontSize: '2rem', marginBottom: '12px', letterSpacing: '-0.03em' }}>{product.name}</h1>

            {/* Category */}
            {product.category && (
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                🏷️ {product.category.name}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '24px', color: 'var(--text-secondary)' }}>
                {product.description}
              </p>
            )}

            {/* Price */}
            <div style={{
              padding: '20px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🚚</span> Free delivery available
              </div>
            </div>

            {/* Packaging */}
            {product.packagingInfo && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)'
              }}>
                📦 <span>{product.packagingInfo}</span>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: '20px' }}>
              <label className="rx-label">Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="rx-qty-stepper" style={{ padding: '6px' }}>
                  <button className="rx-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
                  <span className="rx-qty-val" style={{ padding: '0 8px' }}>{quantity}</span>
                  <button className="rx-qty-btn" onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))} disabled={quantity >= product.stockQuantity}>+</button>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{product.stockQuantity} available</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={addToCart}
                disabled={product.stockQuantity === 0 || adding}
              >
                {adding ? '...' : '🛒 Add to Cart'}
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate('/cart')}>
                View Cart
              </button>
            </div>

            {/* Loyalty Hint */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', background: 'rgba(108,71,255,0.08)',
              border: '1px solid rgba(108,71,255,0.2)', borderRadius: 'var(--radius-md)',
              fontSize: '13px', color: 'var(--primary-light)'
            }}>
              🏆 Earn <strong style={{ margin: '0 4px' }}>10 loyalty points</strong> when you order this product
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

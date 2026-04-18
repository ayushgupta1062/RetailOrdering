import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Home() {
  const [products, setProducts] = useState([]);
  const [allCategoryProducts, setAllCategoryProducts] = useState([]); // full set for brand extraction
  const [categories, setCategories] = useState([]);
  const [categoryBrands, setCategoryBrands] = useState([]); // brands available in selected category
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products');
      setProducts(res.data.data);
      setAllCategoryProducts(res.data.data);
      setCategoryBrands([]);
      setSelectedCategory(null);
      setSelectedBrand(null);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  // When a category is selected, fetch its products and extract available brands
  const fetchByCategory = async (categoryId) => {
    setLoading(true);
    setSelectedCategory(categoryId);
    setSelectedBrand(null); // clear brand selection
    try {
      const res = await api.get(`/api/products/category/${categoryId}`);
      const prods = res.data.data;
      setProducts(prods);
      setAllCategoryProducts(prods);

      // Extract unique brands from this category's products
      const brandsMap = {};
      prods.forEach(p => {
        if (p.brand && p.brand.id) {
          brandsMap[p.brand.id] = p.brand;
        }
      });
      setCategoryBrands(Object.values(brandsMap));
    } catch (err) {
      console.error('Failed to fetch by category', err);
    } finally {
      setLoading(false);
    }
  };

  // When a brand is selected within a category
  const fetchByCategoryAndBrand = async (brandId) => {
    setSelectedBrand(brandId);
    
    // Client-side filtering for instantaneous UI updates!
    if (selectedCategory) {
      const filtered = allCategoryProducts.filter(p => p.brand && p.brand.id === brandId);
      setProducts(filtered);
    } else {
      // Fallback if no category selected (not typical in current UI flow)
      try {
        setLoading(true);
        const res = await api.get(`/api/products/brand/${brandId}`);
        setProducts(res.data.data);
      } catch (err) {
        console.error('Failed to filter by brand', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Clear brand filter within current category
  const clearBrandFilter = () => {
    setSelectedBrand(null);
    setProducts(allCategoryProducts);
  };

  const showAll = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setCategoryBrands([]);
    fetchProducts();
  };

  const addToCart = async (productId, e) => {
    e.stopPropagation();
    setAddingId(productId);
    try {
      await api.post('/api/cart/add', { productId, quantity: 1 });
      showToast('Added to cart! 🛒', 'success');
    } catch (err) {
      showToast('Failed to add to cart', 'error');
    } finally {
      setAddingId(null);
    }
  };

  const getCategoryIcon = (name) => {
    const map = {
      'Electronics': '⚡', 'Clothing': '👕', 'Food': '🍕', 'Beverages': '☕',
      'Home': '🏠', 'Kitchen': '🍳', 'Beauty': '✨', 'Sports': '⚽',
      'Books': '📚', 'Toys': '🧸', 'Pizza': '🍕', 'Cold Drinks': '🥤',
      'Breads': '🍞', 'Snacks': '🍟', 'Desserts': '🍰'
    };
    for (const key of Object.keys(map)) {
      if (name?.toLowerCase().includes(key.toLowerCase())) return map[key];
    }
    return '🏷️';
  };

  const getBrandIcon = (name) => {
    const lc = name?.toLowerCase() || '';
    if (lc.includes('domino')) return '🔴';
    if (lc.includes('pizza hut')) return '🏠';
    if (lc.includes('papa')) return '👨';
    if (lc.includes('la pino')) return '🌿';
    if (lc.includes('oven') || lc.includes('story')) return '🔥';
    if (lc.includes('coke') || lc.includes('coca')) return '🥤';
    if (lc.includes('pepsi')) return '💙';
    if (lc.includes('sprite')) return '💚';
    return '🏷️';
  };

  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  return (
    <div className="page-wrapper">
      {/* Toast */}
      {toast && (
        <div className={`rx-toast ${toast.type === 'error' ? 'rx-toast-error' : 'rx-toast-success'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <div className="container">
        {/* Hero Section */}
        <div className="rx-hero">
          <div className="rx-hero-badge">
            <span></span>
            Fresh arrivals every day
          </div>
          <h1 style={{ marginBottom: '16px' }}>
            Shop the{' '}
            <span className="text-gradient">Latest Trends</span>
          </h1>
          <p style={{ fontSize: '16px', marginBottom: '28px', maxWidth: '500px' }}>
            Discover premium products across all categories. Earn loyalty points, apply coupons, and enjoy free delivery.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-full)',
              fontSize: '13px', color: 'var(--text-secondary)'
            }}>
              🚚 Free delivery above ₹500
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-full)',
              fontSize: '13px', color: 'var(--text-secondary)'
            }}>
              🏆 +10 loyalty points per order
            </div>
          </div>
        </div>

        {/* ── SECTION HEADER ── */}
        <div className="rx-section-header">
          <div>
            <div className="rx-section-title">
              {selectedCategory
                ? `${getCategoryIcon(selectedCategoryName)} ${selectedCategoryName}`
                : 'All Products'}
            </div>
            <div className="rx-section-subtitle">
              {products.length} product{products.length !== 1 ? 's' : ''}
              {selectedBrand && categoryBrands.find(b => b.id === selectedBrand)
                ? ` from ${categoryBrands.find(b => b.id === selectedBrand).name}`
                : selectedCategory ? ` in ${selectedCategoryName}` : ' available'}
            </div>
          </div>
        </div>

        {/* ── CATEGORY PILLS ── */}
        <div className="rx-pills">
          <button
            className={`rx-pill ${selectedCategory === null ? 'active' : ''}`}
            onClick={showAll}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`rx-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => fetchByCategory(cat.id)}
            >
              {getCategoryIcon(cat.name)} {cat.name}
            </button>
          ))}
        </div>

        {/* ── BRAND SUB-FILTER (shown only when a category is selected and has multiple brands) ── */}
        {selectedCategory && categoryBrands.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            {/* Section label */}
            <div style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              color: 'var(--text-muted)', textTransform: 'uppercase',
              marginBottom: '10px', paddingLeft: '2px'
            }}>
              {getCategoryIcon(selectedCategoryName)} Filter by Brand
            </div>

            {/* Brand pills row */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                className={`rx-pill ${selectedBrand === null ? 'active' : ''}`}
                onClick={clearBrandFilter}
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                All {selectedCategoryName}
              </button>
              {categoryBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => fetchByCategoryAndBrand(brand.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: selectedBrand === brand.id
                      ? '1px solid var(--primary)'
                      : '1px solid var(--border)',
                    background: selectedBrand === brand.id
                      ? 'rgba(108,71,255,0.18)'
                      : 'var(--bg-elevated)',
                    color: selectedBrand === brand.id ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedBrand === brand.id ? '0 0 16px rgba(108,71,255,0.25)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{getBrandIcon(brand.name)}</span>
                  {brand.name}
                </button>
              ))}
            </div>

            {/* Active brand indicator */}
            {selectedBrand && (
              <div style={{
                marginTop: '14px',
                padding: '10px 16px',
                background: 'rgba(108,71,255,0.07)',
                border: '1px solid rgba(108,71,255,0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: 'var(--primary-light)'
              }}>
                <span>{getBrandIcon(categoryBrands.find(b => b.id === selectedBrand)?.name)}</span>
                Showing <strong style={{ margin: '0 4px' }}>
                  {categoryBrands.find(b => b.id === selectedBrand)?.name}
                </strong> {selectedCategoryName}
                <button
                  onClick={clearBrandFilter}
                  style={{
                    marginLeft: '6px', background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px',
                    padding: '0', lineHeight: 1
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUCTS GRID ── */}
        {loading ? (
          <div className="rx-spinner-wrapper">
            <div className="rx-spinner"></div>
            <div className="rx-spinner-text">
              {selectedBrand
                ? `Loading ${categoryBrands.find(b => b.id === selectedBrand)?.name} products...`
                : 'Loading products...'}
            </div>
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="rx-empty">
                <div className="rx-empty-icon">📭</div>
                <div className="rx-empty-title">No products found</div>
                <div className="rx-empty-desc">
                  {selectedBrand
                    ? `No ${selectedCategoryName} from this brand yet`
                    : 'Try a different category or check back later'}
                </div>
                <button className="btn btn-primary mt-16" onClick={showAll}>
                  Browse All Products
                </button>
              </div>
            ) : (
              <div className="rx-product-grid" style={{ paddingBottom: '60px' }}>
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rx-product-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {/* Image */}
                    <div className="rx-product-image-wrapper">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="rx-product-image-placeholder"
                        style={{ display: product.imageUrl ? 'none' : 'flex' }}
                      >
                        {getCategoryIcon(product.category?.name)}
                      </div>
                      {/* Stock badge */}
                      <div className="rx-product-image-overlay">
                        {product.stockQuantity > 0 ? (
                          <span className="badge badge-stock">In Stock</span>
                        ) : (
                          <span className="badge badge-out">Out of Stock</span>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="rx-product-body">
                      <div className="rx-product-brand">
                        {product.brand?.name || 'RetailX'}
                      </div>
                      <div className="rx-product-name">{product.name}</div>
                      {product.category && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {getCategoryIcon(product.category.name)} {product.category.name}
                        </div>
                      )}
                      <div className="rx-product-price">
                        <span className="rx-price-main">
                          ₹{product.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {product.packagingInfo && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          📦 {product.packagingInfo}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="rx-product-footer">
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={(e) => addToCart(product.id, e)}
                        disabled={product.stockQuantity === 0 || addingId === product.id}
                      >
                        {addingId === product.id ? '...' : '🛒 Add to Cart'}
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`);
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;

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

const EMPTY_FORM = { name: '', description: '', price: '', stockQuantity: '', categoryId: '', brandId: '', packagingInfo: '', imageUrl: '' };

const selectStyle = {
  background: 'var(--bg-base)', color: 'var(--text-primary)',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
  padding: '12px 16px', fontSize: '14px', cursor: 'pointer',
  outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%',
  transition: 'border-color 0.25s'
};

function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchAll = async () => {
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        api.get('/api/admin/inventory'),
        api.get('/api/categories'),
        api.get('/api/brands'),
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
      setBrands(brandRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const openAddForm = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setTimeout(() => document.getElementById('inv-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name, description: product.description || '',
      price: product.price, stockQuantity: product.stockQuantity,
      categoryId: product.category?.id || '', brandId: product.brand?.id || '',
      packagingInfo: product.packagingInfo || '', imageUrl: product.imageUrl || '',
    });
    setShowForm(true);
    setTimeout(() => document.getElementById('inv-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const productData = {
      name: form.name, description: form.description,
      price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity),
      category: { id: parseInt(form.categoryId) }, brand: { id: parseInt(form.brandId) },
      packagingInfo: form.packagingInfo, imageUrl: form.imageUrl,
    };
    try {
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, productData);
        showToast(`"${form.name}" updated successfully!`);
      } else {
        await api.post('/api/products', productData);
        showToast(`"${form.name}" added to inventory!`);
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId, productName) => {
    if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast(`"${productName}" deleted`);
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  if (loading) return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main"><div className="rx-spinner-wrapper"><div className="rx-spinner"></div><div className="rx-spinner-text">Loading inventory...</div></div></div>
    </div>
  );

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
            <h2 style={{ letterSpacing: '-0.03em' }}>Inventory</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '3px', fontSize: '14px' }}>
              {products.length} products • {products.filter(p => p.stockQuantity === 0).length} out of stock
            </p>
          </div>
          <button className="btn btn-primary" onClick={openAddForm}>+ Add Product</button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div id="inv-form" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-hover)',
            borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: '28px'
          }}>
            <h3 style={{ fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '24px' }}>
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ gridColumn: '1 / 2' }}>
                  <label className="rx-label">Product Name *</label>
                  <input name="name" className="rx-input" placeholder="e.g. Wireless Headphones" value={form.name} onChange={handleFormChange} required />
                </div>
                <div>
                  <label className="rx-label">Price (₹) *</label>
                  <input name="price" type="number" step="0.01" className="rx-input" placeholder="999.00" value={form.price} onChange={handleFormChange} required />
                </div>
                <div>
                  <label className="rx-label">Stock Quantity *</label>
                  <input name="stockQuantity" type="number" className="rx-input" placeholder="100" value={form.stockQuantity} onChange={handleFormChange} required />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="rx-label">Description</label>
                <input name="description" className="rx-input" placeholder="Product description..." value={form.description} onChange={handleFormChange} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="rx-label">Category *</label>
                  <select name="categoryId" style={selectStyle} value={form.categoryId} onChange={handleFormChange} required>
                    <option value="">Select Category</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="rx-label">Brand *</label>
                  <select name="brandId" style={selectStyle} value={form.brandId} onChange={handleFormChange} required>
                    <option value="">Select Brand</option>
                    {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="rx-label">Packaging Info</label>
                  <input name="packagingInfo" className="rx-input" placeholder="e.g. Box, Bottle, Kg" value={form.packagingInfo} onChange={handleFormChange} />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="rx-label">Image URL</label>
                <input name="imageUrl" className="rx-input" placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={handleFormChange} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '...' : editingProduct ? '✅ Update Product' : '✅ Save Product'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="rx-table-wrapper">
          <table className="rx-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Packaging</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{product.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-elevated)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0
                      }}>
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '🛍️'; }} />
                        ) : '🛍️'}
                      </div>
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td><span style={{ color: 'var(--success)', fontWeight: 700 }}>₹{product.price?.toLocaleString('en-IN')}</span></td>
                  <td>
                    <span className={`badge ${product.stockQuantity > 0 ? (product.stockQuantity < 10 ? 'badge-placed' : 'badge-delivered') : 'badge-cancelled'}`}>
                      {product.stockQuantity > 0 ? product.stockQuantity : 'Out'}
                    </span>
                  </td>
                  <td>{product.category?.name || '—'}</td>
                  <td>{product.brand?.name || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{product.packagingInfo || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditForm(product)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(product.id, product.name)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No products in inventory</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminInventory;

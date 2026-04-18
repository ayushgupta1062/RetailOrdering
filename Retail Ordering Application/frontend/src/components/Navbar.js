import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="rx-navbar">
      <div className="container">
        <Link to={user ? (user.role === 'ADMIN' ? '/admin/dashboard' : '/home') : '/login'} className="rx-brand">
          <div className="rx-brand-icon">🛒</div>
          RetailX
        </Link>

        <ul className="rx-nav-links" style={{ display: menuOpen ? 'flex' : undefined }}>
          {!user && (
            <>
              <li><Link to="/login" className={isActive('/login') ? 'active' : ''}>🔐 Login</Link></li>
              <li><Link to="/register" className={isActive('/register') ? 'active' : ''}>✨ Register</Link></li>
            </>
          )}

          {user && user.role === 'USER' && (
            <>
              <li><Link to="/home" className={isActive('/home') ? 'active' : ''}>🏠 Home</Link></li>
              <li><Link to="/cart" className={isActive('/cart') ? 'active' : ''}>🛒 Cart</Link></li>
              <li><Link to="/my-orders" className={isActive('/my-orders') ? 'active' : ''}>📦 My Orders</Link></li>
            </>
          )}

          {user && user.role === 'ADMIN' && (
            <>
              <li><Link to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>📊 Dashboard</Link></li>
              <li><Link to="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>📋 Orders</Link></li>
              <li><Link to="/admin/inventory" className={isActive('/admin/inventory') ? 'active' : ''}>📦 Inventory</Link></li>
            </>
          )}
        </ul>

        <div className="rx-nav-right" style={{ position: 'relative' }}>
          {user && (
            <>
              <div
                className="rx-user-chip"
                style={{ cursor: 'pointer', transition: 'var(--transition)' }}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="rx-avatar">{getInitials(user.name)}</div>
                <span style={{ fontSize: '13px' }}>{user.name?.split(' ')[0]}</span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>

              {profileOpen && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: '0',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  width: '260px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 1000,
                  animation: 'slideInUp 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div className="rx-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'white', fontSize: '16px' }}>{user.name}</div>
                      <div className="badge badge-primary" style={{ marginTop: '4px', fontSize: '10px' }}>
                        {user.role}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Address</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{user.email}</div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm btn-full"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

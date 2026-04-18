import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const data = response.data.data;
      login({ name: data.name, email: data.email, role: data.role }, data.token);
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-title">Welcome back 👋</div>
          <div className="auth-form-subtitle">Sign in to your RetailX account</div>

          {error && (
            <div className="rx-alert rx-alert-error">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="rx-form-group">
              <label className="rx-label">Email Address</label>
              <input
                type="email"
                className="rx-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="rx-form-group">
              <label className="rx-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="rx-input"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '48px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    fontSize: '16px', padding: '0'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? (
                <><span className="rx-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Signing in...</>
              ) : '🚀 Sign In'}
            </button>
          </form>

          <div className="auth-switch-text">
            Don't have an account? <Link to="/register">Create one →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

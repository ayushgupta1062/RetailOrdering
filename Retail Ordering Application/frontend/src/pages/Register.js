import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' };
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
    return { strength: s, label: labels[s], color: colors[s] };
  };

  const pwdStrength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/auth/register', { name, email, password });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-title">Create account ✨</div>
          <div className="auth-form-subtitle">Join RetailX and start shopping smarter</div>

          {error && <div className="rx-alert rx-alert-error">⚠️ {error}</div>}
          {success && <div className="rx-alert rx-alert-success">🎉 {success}</div>}

          <form onSubmit={handleRegister}>
            <div className="rx-form-group">
              <label className="rx-label">Full Name</label>
              <input
                type="text"
                className="rx-input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                  placeholder="Create a strong password"
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
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', padding: 0
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password Strength Bar */}
              {password && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        height: '4px', flex: 1, borderRadius: '2px',
                        background: i <= pwdStrength.strength ? pwdStrength.color : 'var(--border)',
                        transition: 'background 0.3s'
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '12px', color: pwdStrength.color, fontWeight: 600 }}>
                    {pwdStrength.label}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? (
                <><span className="rx-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Creating account...</>
              ) : '🚀 Create Account'}
            </button>
          </form>

          <div className="auth-switch-text">
            Already have an account? <Link to="/login">Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

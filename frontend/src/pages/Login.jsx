import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi, registerApi } from '../services/api';
import { saveAuth } from '../services/auth';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'TENANT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const { data } = await loginApi({ username: form.username, password: form.password });
        saveAuth(data);
        navigate('/dashboard');
      } else {
        await registerApi({
          username: form.username,
          name: form.name || form.username,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: form.role,
        });
        setMode('login');
        setError('Registered successfully! Please sign in with your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper
  const handleDemoLogin = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await loginApi({ username, password });
      saveAuth(data);
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <div className={styles.card} role="main">
        <div className={styles.header}>
          <span className={styles.logo}>🏠</span>
          <h1 className={styles.title}>Rental Place</h1>
          <p className={styles.subtitle}>
            {mode === 'login' ? 'Sign in to your rental portal' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {mode === 'register' && (
            <div className={styles.field}>
              <label htmlFor="nameInput">Full Name</label>
              <input
                id="nameInput"
                name="name"
                type="text"
                placeholder="Jane Smith"
                value={form.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="usernameInput">Username</label>
            <input
              id="usernameInput"
              name="username"
              type="text"
              placeholder="e.g. janesmith"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          {mode === 'register' && (
            <>
              <div className={styles.field}>
                <label htmlFor="emailInput">Email Address</label>
                <input
                  id="emailInput"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="roleSelect">Account Type</label>
                <select
                  id="roleSelect"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={styles.selectInput}
                >
                  <option value="TENANT">Tenant (Looking for rentals)</option>
                  <option value="OWNER">Property Owner / Landlord</option>
                  <option value="AGENT">Licensed Real Estate Agent</option>
                </select>
              </div>
            </>
          )}

          <div className={styles.field}>
            <label htmlFor="passwordInput">Password</label>
            <input
              id="passwordInput"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className={`${styles.message} ${error.includes('successfully') ? styles.success : styles.error}`}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          {/* Quick Demo Logins Section */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--surface-border)' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
              ⚡ Instant Demo Profiles
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px' }}
                onClick={() => handleDemoLogin('admin', 'admin123')}
              >
                Admin (admin)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px' }}
                onClick={() => handleDemoLogin('sarah_owner', 'owner123')}
              >
                Owner (sarah)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px' }}
                onClick={() => handleDemoLogin('alex_tenant', 'tenant123')}
              >
                Tenant (alex)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px' }}
                onClick={() => handleDemoLogin('marcus_agent', 'agent123')}
              >
                Agent (marcus)
              </button>
            </div>
          </div>
        </form>

        <p className={styles.toggle}>
          {mode === 'login' ? "New to Rental Place? " : 'Already registered? '}
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Join Now' : 'Sign In instead'}
          </button>
        </p>
      </div>
    </div>
  );
}

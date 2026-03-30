import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi, registerApi } from '../services/api';
import { saveAuth } from '../services/auth';
import styles from './Login.module.css';

export default function Login() {
  const navigate    = useNavigate();
  const [mode, setMode]       = useState('login');   // 'login' | 'register'
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
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
        await registerApi({ username: form.username, email: form.email, password: form.password });
        setMode('login');
        setForm({ username: '', email: '', password: '' });
        setError('Registered! Please log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
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
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="e.g. janesmith"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          {mode === 'register' && (
            <div className={styles.field}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className={`${styles.message} ${error.includes('Registered') ? styles.success : styles.error}`}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button
            type="button"
            className="btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="" style={{ width: '18px' }} />
            Sign in with Google
          </button>
        </form>

        <p className={styles.toggle}>
          {mode === 'login' ? "New here? " : 'Already a member? '}
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

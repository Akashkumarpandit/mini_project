import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, logout, isLoggedIn, isAdmin } from '../services/auth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const authenticated = isLoggedIn();
  const admin = isAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <Link to="/properties" className={styles.brand}>
        <span className={styles.brandIcon}>🏠</span>
        <span className={styles.brandName}>Rental Place</span>
      </Link>

      <div className={styles.links}>
        <Link
          to="/properties"
          className={`${styles.link} ${isActive('/properties') ? styles.active : ''}`}
        >
          Marketplace
        </Link>

        {authenticated && (
          <>
            <Link
              to="/dashboard"
              className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}
            >
              {admin ? 'Admin Panel' : 'Dashboard'}
            </Link>

            <Link
              to="/calendar"
              className={`${styles.link} ${isActive('/calendar') ? styles.active : ''}`}
            >
              Calendar
            </Link>
          </>
        )}
      </div>

      <div className={styles.userArea}>
        {authenticated ? (
          <>
            <div className={styles.userInfo}>
              <div className={styles.avatar} title={user?.username}>
                {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className={styles.nameBlock}>
                <span className={styles.username}>{user?.name || user?.username}</span>
                <span className={styles.roleTag}>{user?.role || 'User'}</span>
              </div>
            </div>
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
              aria-label="Logout"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" className={styles.loginBtn}>
              Sign In
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

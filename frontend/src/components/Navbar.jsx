import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../services/auth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const user       = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🏠</span>
        <span className={styles.brandName}>Rental Place</span>
      </div>

      <div className={styles.links}>
        <Link
          to="/dashboard"
          className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}
        >
          Dashboard
        </Link>
        <Link
          to="/properties"
          className={`${styles.link} ${isActive('/properties') ? styles.active : ''}`}
        >
          Properties
        </Link>
        <Link
          to="/calendar"
          className={`${styles.link} ${isActive('/calendar') ? styles.active : ''}`}
        >
          Calendar
        </Link>
      </div>

      <div className={styles.userArea}>
        {user && (
          <div className={styles.avatar} title={user.username}>
            {user.username?.charAt(0).toUpperCase()}
          </div>
        )}
        <span className={styles.username}>{user?.username}</span>
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

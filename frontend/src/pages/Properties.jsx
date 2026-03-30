import React, { useEffect, useState, useCallback } from 'react';
import PropertyCard from '../components/PropertyCard';
import { MOCK_PROPERTIES, PROPERTY_TYPES } from '../data/mockProperties';
import { fetchPropertiesApi } from '../services/api';
import styles from './Properties.module.css';

export default function Properties() {
  const [properties, setProperties]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [activeType, setActiveType]   = useState('ALL');
  const [showAvailable, setShowAvailable] = useState(false);
  const [sortBy, setSortBy]           = useState('default');
  const [enquired, setEnquired]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchPropertiesApi();
      setProperties(data);
    } catch {
      // backend not running → fall back to mock data
      setProperties(MOCK_PROPERTIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Client-side filtering
  const filtered = properties
    .filter((p) => activeType === 'ALL' || p.type === activeType)
    .filter((p) => !showAvailable || p.available)
    .filter((p) =>
      !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating')     return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const stats = {
    total:     properties.length,
    available: properties.filter((p) => p.available).length,
    avgPrice:  properties.length
      ? Math.round(properties.reduce((s, p) => s + (p.price || 0), 0) / properties.length)
      : 0,
  };

  return (
    <div className={styles.page}>

      {/* ── Hero header ── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>🏠 Rental Properties</h1>
          <p className={styles.heroSub}>
            Discover your perfect rental — apartments, houses, villas, and studios
          </p>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.total}</span>
              <span className={styles.statLabel}>Listings</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.available}</span>
              <span className={styles.statLabel}>Available</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>${stats.avgPrice.toLocaleString()}</span>
              <span className={styles.statLabel}>Avg / mo</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Controls ── */}
      <div className={styles.controls}>
        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search properties"
          />
        </div>

        {/* Type filters */}
        <div className={styles.typeFilters} role="group" aria-label="Property type filter">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t}
              className={`${styles.typeBtn} ${activeType === t ? styles.activeType : ''}`}
              onClick={() => setActiveType(t)}
              aria-pressed={activeType === t}
            >
              {t === 'ALL' ? 'All Types' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className={styles.rightControls}>
          <label className={styles.availToggle}>
            <input
              type="checkbox"
              checked={showAvailable}
              onChange={(e) => setShowAvailable(e.target.checked)}
            />
            Available only
          </label>

          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort properties"
          >
            <option value="default">Sort: Default</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p className={styles.resultsCount}>
          Showing <strong>{filtered.length}</strong> of <strong>{properties.length}</strong> properties
        </p>
      )}

      {/* ── Grid ── */}
      <div className={styles.gridWrap}>
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImg} />
                <div className={styles.skeletonBody}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonSub}`} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonSub}`} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔎</span>
            <h3>No properties found</h3>
            <p>Try adjusting your search or filters.</p>
            <button
              className="btn-secondary"
              onClick={() => { setSearch(''); setActiveType('ALL'); setShowAvailable(false); }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onContact={(prop) => setEnquired(prop)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Enquiry modal ── */}
      {enquired && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Enquire about ${enquired.title}`}
          onClick={(e) => e.target === e.currentTarget && setEnquired(null)}
        >
          <div className={styles.modal}>
            <button
              className={styles.modalClose}
              onClick={() => setEnquired(null)}
              aria-label="Close modal"
            >
              ×
            </button>
            <img src={enquired.imageUrl} alt={enquired.title} className={styles.modalImg} />
            <h2 className={styles.modalTitle}>{enquired.title}</h2>
            <p className={styles.modalLocation}>📍 {enquired.location}</p>
            <p className={styles.modalPrice}>
              ${enquired.price?.toLocaleString()}
              <span>{enquired.priceUnit === 'PER_NIGHT' ? ' / night' : ' / month'}</span>
            </p>
            <p className={styles.modalDesc}>{enquired.description}</p>
            <div className={styles.modalActions}>
              <input
                type="email"
                placeholder="Your email address"
                className={styles.modalInput}
                aria-label="Your email"
              />
              <button className="btn-primary" style={{ width: '100%', padding: '11px' }}>
                Send Enquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

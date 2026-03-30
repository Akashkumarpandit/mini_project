import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchListingsApi, deleteListingApi } from '../services/api';
import ListingsList from '../components/ListingsList';
import styles from './Dashboard.module.css';

const FILTER_OPTIONS = ['Available', 'Booked'];

export default function Dashboard() {
  const navigate = useNavigate();

  const [listings, setListings]             = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(false);
  const [filterOpen, setFilterOpen]   = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);

  const loadListings = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const { data } = await fetchListingsApi({ title: query });
      setListings(data);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => loadListings(search), 300);
    return () => clearTimeout(timer);
  }, [search, loadListings]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await deleteListingApi(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      if (selectedListing?.id === id) setSelectedListing(null);
    } catch { /* noop */ }
  };

  const toggleFilter = (f) =>
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );

  return (
    <div className={styles.page}>
      {/* ── Left: Listings panel ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Admin Dashboard</h2>
          <button
            className={styles.newBtn}
            onClick={() => navigate('/listings/new')}
            aria-label="Create new listing"
            title="New listing"
          >
            + New
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search listings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search listings"
          />
        </div>

        {/* Listings list */}
        <div className={styles.listWrap}>
          {loading ? (
            <div className={styles.loading}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : (
            <ListingsList
              listings={listings}
              selectedId={selectedListing?.id}
              onSelect={(l) => navigate(`/listings/${l.id}`)}
              onDelete={handleDelete}
            />
          )}
        </div>
      </aside>

      {/* ── Right: Preview / Welcome ── */}
      <section className={styles.main}>
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeIcon}>🏠</div>
          <h3 className={styles.welcomeTitle}>Manage your platform</h3>
          <p className={styles.welcomeText}>
            Select or create a <strong>Listing</strong> on the left, or navigate to <strong>Properties</strong> to view the public site.
          </p>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{listings.length}</span>
              <span className={styles.statLabel}>Total Listings</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>{listings.filter(l => l.availabilityStatus === 'AVAILABLE').length}</span>
              <span className={styles.statLabel}>Available</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              className={`btn-primary ${styles.createBtn}`}
              onClick={() => navigate('/listings/new')}
            >
              Create New Listing
            </button>
            <button
              className={`btn-secondary ${styles.createBtn}`}
              onClick={() => navigate('/properties')}
            >
              View Public Site
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

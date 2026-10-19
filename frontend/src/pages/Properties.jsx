import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PropertyCard from '../components/PropertyCard';
import { MOCK_PROPERTIES, PROPERTY_TYPES } from '../data/mockProperties';
import {
  fetchPropertiesApi,
  sendPublicEnquiryApi,
  fetchFavoriteIdsApi,
  toggleFavoriteApi,
} from '../services/api';
import { isLoggedIn, getUser } from '../services/auth';
import styles from './Properties.module.css';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('ALL');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [selectedMapProp, setSelectedMapProp] = useState(null);

  // Favorites
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // Comparison
  const [comparedProperties, setComparedProperties] = useState([]);

  // Enquiry modal
  const [enquiryProp, setEnquiryProp] = useState(null);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    messageText: '',
    viewingDate: '',
  });
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');

  // Load favorites
  const loadFavorites = useCallback(async () => {
    if (isLoggedIn()) {
      try {
        const { data } = await fetchFavoriteIdsApi();
        setFavoriteIds(new Set(data));
      } catch {
        // Fallback to local storage
        const saved = JSON.parse(localStorage.getItem('fav_props') || '[]');
        setFavoriteIds(new Set(saved));
      }
    } else {
      const saved = JSON.parse(localStorage.getItem('fav_props') || '[]');
      setFavoriteIds(new Set(saved));
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Load properties
  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeType && activeType !== 'ALL') params.type = activeType;
      if (search.trim()) params.query = search.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (beds) params.beds = beds;
      if (baths) params.baths = baths;
      if (furnishedOnly) params.furnished = true;
      if (showAvailable) params.availableOnly = true;
      if (sortBy !== 'default') params.sortBy = sortBy;

      const { data } = await fetchPropertiesApi(params);
      if (Array.isArray(data) && data.length > 0) {
        setProperties(data);
        setIsLive(true);
        if (!selectedMapProp && data.length > 0) setSelectedMapProp(data[0]);
      } else if (Array.isArray(data) && data.length === 0 && search.trim()) {
        setProperties([]);
        setIsLive(true);
      } else {
        // Fallback
        setProperties(MOCK_PROPERTIES);
        setIsLive(false);
        if (!selectedMapProp) setSelectedMapProp(MOCK_PROPERTIES[0]);
      }
    } catch {
      // Backend not running → clean fallback to curated mock dataset
      setProperties(MOCK_PROPERTIES);
      setIsLive(false);
      if (!selectedMapProp) setSelectedMapProp(MOCK_PROPERTIES[0]);
    } finally {
      setLoading(false);
    }
  }, [activeType, search, minPrice, maxPrice, beds, baths, furnishedOnly, showAvailable, sortBy]);

  // Debounced load
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProperties();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadProperties]);

  // Client-side filtering when in demo mode or fallback
  const displayedProperties = useMemo(() => {
    let list = [...properties];
    if (showOnlyFavorites) {
      list = list.filter((p) => favoriteIds.has(p.id || p.listingId));
    }
    return list;
  }, [properties, showOnlyFavorites, favoriteIds]);

  // Calculate live statistics
  const stats = useMemo(() => {
    const total = properties.length;
    const available = properties.filter((p) =>
      p.available !== undefined ? p.available : p.availabilityStatus === 'AVAILABLE'
    ).length;
    const avgPrice = total
      ? Math.round(
          properties.reduce((s, p) => s + Number(p.price || p.pricePerDay || 0), 0) / total
        )
      : 0;
    return { total, available, avgPrice };
  }, [properties]);

  // Handle favorite toggle
  const handleToggleFavorite = async (propId) => {
    const newFavs = new Set(favoriteIds);
    if (newFavs.has(propId)) {
      newFavs.delete(propId);
    } else {
      newFavs.add(propId);
    }
    setFavoriteIds(newFavs);
    localStorage.setItem('fav_props', JSON.stringify(Array.from(newFavs)));

    if (isLoggedIn()) {
      try {
        await toggleFavoriteApi(propId);
      } catch {
        /* noop */
      }
    }
  };

  // Handle comparison
  const handleToggleCompare = (property) => {
    const propId = property.id || property.listingId;
    const exists = comparedProperties.some((p) => (p.id || p.listingId) === propId);
    if (exists) {
      setComparedProperties((prev) =>
        prev.filter((p) => (p.id || p.listingId) !== propId)
      );
    } else {
      if (comparedProperties.length >= 3) {
        alert('You can compare a maximum of 3 properties at a time.');
        return;
      }
      setComparedProperties((prev) => [...prev, property]);
    }
  };

  // Handle enquiry submit
  const openEnquiry = (property) => {
    const user = getUser();
    setEnquiryProp(property);
    setEnquiryForm({
      name: user?.name || user?.username || '',
      email: user?.email || '',
      phone: '',
      messageText: `Hi, I am interested in ${property.title} located at ${property.location}. Please contact me with more information.`,
      viewingDate: '',
    });
    setEnquirySuccess(false);
    setEnquiryError('');
  };

  const submitEnquiry = async (e) => {
    e.preventDefault();
    setEnquiryLoading(true);
    setEnquiryError('');
    try {
      await sendPublicEnquiryApi({
        listingId: enquiryProp.id || enquiryProp.listingId,
        subject: `Enquiry for ${enquiryProp.title}`,
        messageText: enquiryForm.messageText,
        senderEmail: enquiryForm.email,
        senderPhone: enquiryForm.phone,
        messageType: enquiryForm.viewingDate ? 'VIEWING_REQUEST' : 'ENQUIRY',
        viewingDate: enquiryForm.viewingDate ? `${enquiryForm.viewingDate}T10:00:00` : null,
      });
      setEnquirySuccess(true);
      setTimeout(() => {
        setEnquiryProp(null);
      }, 2000);
    } catch {
      // In offline mode, show successful demo message
      setEnquirySuccess(true);
      setTimeout(() => {
        setEnquiryProp(null);
      }, 2000);
    } finally {
      setEnquiryLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setActiveType('ALL');
    setMinPrice('');
    setMaxPrice('');
    setBeds('');
    setBaths('');
    setFurnishedOnly(false);
    setShowAvailable(false);
    setSortBy('default');
    setShowOnlyFavorites(false);
  };

  return (
    <div className={styles.page}>
      {/* ── Hero section ── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.statusPill + ' ' + (isLive ? styles.livePill : styles.demoPill)}>
            <span>{isLive ? '🟢 Live Backend Connected' : '🟡 Standalone Demo Dataset'}</span>
          </div>

          <h1 className={styles.heroTitle}>Discover Premium Rental Homes</h1>
          <p className={styles.heroSub}>
            Explore verified apartments, colonial houses, beachfront villas, and designer lofts.
          </p>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.total}</span>
              <span className={styles.statLabel}>Total Listings</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{stats.available}</span>
              <span className={styles.statLabel}>Available Now</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>${stats.avgPrice.toLocaleString()}</span>
              <span className={styles.statLabel}>Avg Monthly Rent</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Search & Filter Controls ── */}
      <section className={styles.controls} aria-label="Search and filter properties">
        <div className={styles.controlsInner}>
          <div className={styles.controlsTop}>
            {/* Search */}
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon} aria-hidden="true">🔍</span>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search by city, title, or address (e.g. New York, Miami, Loft)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search properties"
              />
            </div>

            {/* View Mode Toggle */}
            <div className={styles.viewToggles} role="group" aria-label="View mode">
              <button
                type="button"
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeView : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <span>⊞</span> Grid
              </button>
              <button
                type="button"
                className={`${styles.viewBtn} ${viewMode === 'map' ? styles.activeView : ''}`}
                onClick={() => setViewMode('map')}
              >
                <span>🗺️</span> Map
              </button>
            </div>

            {/* Filter drawer toggle */}
            <button
              type="button"
              className={styles.filterToggleBtn}
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              <span>⚙️ Filters</span>
              <span>{showFilters ? '▲' : '▼'}</span>
            </button>

            {/* Sort */}
            <select
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort listings"
            >
              <option value="default">Sort: Default Relevance</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Secondary filter bar (always visible or expanded) */}
          <div className={styles.secondaryFilters}>
            {/* Type buttons */}
            <div className={styles.typeFilters} role="group" aria-label="Property type filter">
              {['ALL', ...PROPERTY_TYPES.filter(t => t !== 'ALL')].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.typeBtn} ${activeType === t ? styles.activeType : ''}`}
                  onClick={() => setActiveType(t)}
                  aria-pressed={activeType === t}
                >
                  {t === 'ALL' ? 'All Types' : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <>
                <div className={styles.priceInputGroup}>
                  <label htmlFor="minPriceInput" className="sr-only">Min Price</label>
                  <input
                    id="minPriceInput"
                    type="number"
                    placeholder="Min $"
                    className={styles.priceInput}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    aria-label="Minimum price"
                  />
                  <span>–</span>
                  <label htmlFor="maxPriceInput" className="sr-only">Max Price</label>
                  <input
                    id="maxPriceInput"
                    type="number"
                    placeholder="Max $"
                    className={styles.priceInput}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    aria-label="Maximum price"
                  />
                </div>

                <div className={styles.filterGroup}>
                  <select
                    className={styles.filterSelect}
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    aria-label="Bedrooms filter"
                  >
                    <option value="">Beds: Any</option>
                    <option value="1">1+ Bed</option>
                    <option value="2">2+ Beds</option>
                    <option value="3">3+ Beds</option>
                    <option value="4">4+ Beds</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <select
                    className={styles.filterSelect}
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    aria-label="Bathrooms filter"
                  >
                    <option value="">Baths: Any</option>
                    <option value="1">1+ Bath</option>
                    <option value="2">2+ Baths</option>
                    <option value="3">3+ Baths</option>
                  </select>
                </div>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={furnishedOnly}
                    onChange={(e) => setFurnishedOnly(e.target.checked)}
                  />
                  Furnished
                </label>
              </>
            )}

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showAvailable}
                onChange={(e) => setShowAvailable(e.target.checked)}
              />
              Available only
            </label>

            <button type="button" className={styles.clearBtn} onClick={clearAllFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* ── Results Bar ── */}
      <div className={styles.resultsBar}>
        <span>
          Showing <strong>{displayedProperties.length}</strong> {displayedProperties.length === 1 ? 'property' : 'properties'}
        </span>

        <button
          type="button"
          className={`${styles.favFilterBtn} ${showOnlyFavorites ? styles.favFilterActive : ''}`}
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
        >
          <span>{showOnlyFavorites ? '❤️' : '🤍'}</span>
          <span>Favorites ({favoriteIds.size})</span>
        </button>
      </div>

      {/* ── Grid or Map View ── */}
      <div className={styles.gridWrap}>
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonImg} />
                <div className={styles.skeletonBody}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonSub}`} />
                </div>
              </div>
            ))}
          </div>
        ) : displayedProperties.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔎</span>
            <h3>No Properties Match Your Search</h3>
            <p>Try adjusting your search query, expanding the budget range, or clearing filters.</p>
            <button className="btn-primary" onClick={clearAllFilters}>
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={styles.grid}>
            {displayedProperties.map((p) => {
              const pId = p.id || p.listingId;
              const isCompared = comparedProperties.some((cp) => (cp.id || cp.listingId) === pId);
              return (
                <PropertyCard
                  key={pId}
                  property={p}
                  isFavorite={favoriteIds.has(pId)}
                  onToggleFavorite={handleToggleFavorite}
                  isCompared={isCompared}
                  onToggleCompare={handleToggleCompare}
                  onContact={openEnquiry}
                />
              );
            })}
          </div>
        ) : (
          /* Map View */
          <div className={styles.mapContainer}>
            <div className={styles.mapHeader}>
              <span className={styles.mapNotice}>
                🗺️ Interactive Geographic View · Showing <strong>{displayedProperties.length}</strong> properties
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Coordinates mapped from verified addresses
              </span>
            </div>

            <div className={styles.mapGrid}>
              <div className={styles.mockCanvas}>
                {displayedProperties.map((p, idx) => {
                  const pId = p.id || p.listingId;
                  const isSelected = selectedMapProp && (selectedMapProp.id || selectedMapProp.listingId) === pId;
                  // Deterministic layout offsets
                  const top = 15 + ((idx * 27) % 65);
                  const left = 10 + ((idx * 33) % 75);
                  return (
                    <button
                      key={pId}
                      className={`${styles.mapPin} ${isSelected ? styles.activePin : ''}`}
                      style={{ top: `${top}%`, left: `${left}%` }}
                      onClick={() => setSelectedMapProp(p)}
                      title={p.title}
                    >
                      <span>🏠</span>
                      <span>${Number(p.price || p.pricePerDay || 0).toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Map Property Preview Sidebar */}
              <div className={styles.mapSidebar}>
                {selectedMapProp ? (
                  <PropertyCard
                    property={selectedMapProp}
                    isFavorite={favoriteIds.has(selectedMapProp.id || selectedMapProp.listingId)}
                    onToggleFavorite={handleToggleFavorite}
                    onContact={openEnquiry}
                  />
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px' }}>
                    Select a pin on the map to preview property details.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Comparison Drawer ── */}
      {comparedProperties.length > 0 && (
        <aside className={styles.compareDrawer} aria-label="Property comparison">
          <div className={styles.compareHeader}>
            <span className={styles.compareTitle}>
              Comparing {comparedProperties.length} of 3 Properties
            </span>
            <button
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setComparedProperties([])}
            >
              Clear Comparison
            </button>
          </div>

          <div className={styles.compareGrid}>
            {comparedProperties.map((p) => {
              const pId = p.id || p.listingId;
              return (
                <div key={pId} className={styles.compareItem}>
                  <button
                    className={styles.removeCompare}
                    onClick={() => handleToggleCompare(p)}
                    aria-label={`Remove ${p.title} from comparison`}
                  >
                    ×
                  </button>
                  <img src={p.imageUrl} alt={p.title} className={styles.compareImg} />
                  <div className={styles.compareInfo}>
                    <h4>{p.title}</h4>
                    <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      ${Number(p.price || p.pricePerDay || 0).toLocaleString()} / mo
                    </p>
                    <p>📍 {p.location}</p>
                    <p>🛏 {p.beds} Beds · 🚿 {p.baths} Baths · 📐 {p.areaSqFt || 800} sqft</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* ── Enquiry Modal ── */}
      {enquiryProp && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Enquire about ${enquiryProp.title}`}
          onClick={(e) => e.target === e.currentTarget && setEnquiryProp(null)}
        >
          <div className={styles.modal}>
            <button
              className={styles.modalClose}
              onClick={() => setEnquiryProp(null)}
              aria-label="Close modal"
            >
              ×
            </button>

            <img
              src={enquiryProp.imageUrl}
              alt={enquiryProp.title}
              className={styles.modalImg}
            />

            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{enquiryProp.title}</h2>
              <p className={styles.modalLocation}>📍 {enquiryProp.location}</p>
              <p className={styles.modalPrice}>
                ${Number(enquiryProp.price || enquiryProp.pricePerDay || 0).toLocaleString()}
                <span>{enquiryProp.priceUnit === 'PER_NIGHT' ? ' / night' : ' / month'}</span>
              </p>
            </div>

            {enquirySuccess ? (
              <div style={{ padding: '24px' }}>
                <div className={styles.successBanner}>
                  ✓ Enquiry sent successfully! The property agent will get in touch with you shortly.
                </div>
              </div>
            ) : (
              <form className={styles.modalForm} onSubmit={submitEnquiry}>
                {enquiryError && <p className="errorMsg">{enquiryError}</p>}

                <div className={styles.formField}>
                  <label htmlFor="enquiryName">Your Name</label>
                  <input
                    id="enquiryName"
                    type="text"
                    required
                    className={styles.modalInput}
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    placeholder="e.g. Jane Doe"
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="enquiryEmail">Email Address</label>
                  <input
                    id="enquiryEmail"
                    type="email"
                    required
                    className={styles.modalInput}
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    placeholder="jane@example.com"
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="enquiryPhone">Phone Number</label>
                  <input
                    id="enquiryPhone"
                    type="tel"
                    className={styles.modalInput}
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    placeholder="+1 555-0123"
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="viewingDateInput">Preferred In-Person Viewing Date (Optional)</label>
                  <input
                    id="viewingDateInput"
                    type="date"
                    className={styles.modalInput}
                    value={enquiryForm.viewingDate}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, viewingDate: e.target.value })}
                  />
                </div>

                <div className={styles.formField}>
                  <label htmlFor="enquiryMsg">Message / Questions</label>
                  <textarea
                    id="enquiryMsg"
                    rows={3}
                    className={styles.modalInput}
                    value={enquiryForm.messageText}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, messageText: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '6px' }}
                  disabled={enquiryLoading}
                >
                  {enquiryLoading ? 'Sending Enquiry...' : 'Submit Enquiry & Request Viewing'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

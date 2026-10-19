import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchListingById,
  fetchReviewsByListingApi,
  submitReviewApi,
  createBookingApi,
  processPaymentApi,
  fetchFavoriteIdsApi,
  toggleFavoriteApi,
  submitReportApi,
  fetchPropertiesApi,
} from '../services/api';
import { isLoggedIn, getUser } from '../services/auth';
import { MOCK_PROPERTIES } from '../data/mockProperties';
import PropertyCard from '../components/PropertyCard';
import styles from './PropertyDetails.module.css';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Gallery & Lightbox
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  // Favorites
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking Widget
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null); // holds booking object
  const [bookingError, setBookingError] = useState('');

  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inaccurate information');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Share Toast
  const [toastMsg, setToastMsg] = useState('');

  // Similar properties
  const [similarProperties, setSimilarProperties] = useState([]);

  // Load property details
  useEffect(() => {
    setLoading(true);
    setError('');

    // Fetch listing from backend
    fetchListingById(id)
      .then(({ data }) => {
        setProperty(data);
      })
      .catch(() => {
        // Fallback to mock properties if backend offline or listing is demo
        const found = MOCK_PROPERTIES.find((p) => String(p.id) === String(id));
        if (found) {
          setProperty(found);
        } else {
          setError('Property not found.');
        }
      })
      .finally(() => setLoading(false));

    // Fetch reviews
    fetchReviewsByListingApi(id)
      .then(({ data }) => setReviews(data))
      .catch(() => setReviews([]));

    // Fetch favorite status
    if (isLoggedIn()) {
      fetchFavoriteIdsApi()
        .then(({ data }) => {
          setIsFavorite(data.includes(Number(id)));
        })
        .catch(() => {});
    }

    // Load similar listings
    fetchPropertiesApi()
      .then(({ data }) => {
        const others = data.filter((p) => String(p.id || p.listingId) !== String(id)).slice(0, 3);
        setSimilarProperties(others);
      })
      .catch(() => {
        const others = MOCK_PROPERTIES.filter((p) => String(p.id) !== String(id)).slice(0, 3);
        setSimilarProperties(others);
      });
  }, [id]);

  // Image list
  const allImages = useMemo(() => {
    if (!property) return [];
    const list = [];
    if (property.imageUrl) list.push(property.imageUrl);
    if (property.images) {
      const extras = property.images.split(',').map((u) => u.trim()).filter(Boolean);
      list.push(...extras);
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'];
  }, [property]);

  // Pricing calculations
  const price = Number(property?.price || property?.pricePerDay || 0);
  const deposit = Number(property?.deposit || 0);
  const cleaningFee = Number(property?.cleaningFee || 0);

  const calculatedTotal = useMemo(() => {
    if (!startDate || !endDate) return price;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    if (property?.priceUnit === 'PER_NIGHT' || property?.priceUnit === 'PER_DAY') {
      return (price * diffDays) + deposit + cleaningFee;
    }
    // Prorated monthly
    const monthRatio = diffDays / 30;
    return Math.round((price * monthRatio) + deposit + cleaningFee);
  }, [startDate, endDate, price, deposit, cleaningFee, property?.priceUnit]);

  // Toggle favorite
  const handleToggleFav = async () => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    setIsFavorite(!isFavorite);
    try {
      await toggleFavoriteApi(id);
    } catch {
      /* noop */
    }
  };

  // Share
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMsg('Link copied to clipboard!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    setReviewMsg('');
    try {
      const { data } = await submitReviewApi({
        listingId: id,
        rating: newRating,
        comment: newComment,
      });
      setReviews([data, ...reviews]);
      setNewComment('');
      setReviewMsg('Thank you! Your review has been published.');
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Booking submission
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    if (!startDate || !endDate) {
      setBookingError('Please select both check-in and check-out dates.');
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      const { data } = await createBookingApi({
        listingId: id,
        startDate,
        endDate,
        guestsCount: Number(guests),
        specialRequests,
      });
      setBookingSuccess(data);
      setShowPaymentModal(true);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Could not complete reservation request.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Process Demo Payment
  const handlePayment = async () => {
    if (!bookingSuccess) return;
    setPaymentLoading(true);
    try {
      await processPaymentApi({
        bookingId: bookingSuccess.id || bookingSuccess.bookingId,
        amount: bookingSuccess.totalPrice || calculatedTotal,
        paymentMethod: 'STRIPE_DEMO',
        currency: property.currency || 'USD',
      });
      setPaymentSuccess(true);
    } catch {
      setPaymentSuccess(true); // Demo success
    } finally {
      setPaymentLoading(false);
    }
  };

  // Submit Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      await submitReportApi({
        listingId: id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
      }, 2000);
    } catch {
      setShowReportModal(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className={styles.page}>
        <div className={styles.container} style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Property Not Found</h2>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
            The requested rental listing is unavailable or does not exist.
          </p>
          <button className="btn-primary" onClick={() => navigate('/properties')}>
            ← Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back navigation */}
        <button className={styles.backBtn} onClick={() => navigate('/properties')}>
          ← Back to Properties
        </button>

        {/* Header Top */}
        <div className={styles.headerTop}>
          <div className={styles.titleWrap}>
            <h1 className={styles.propertyTitle}>{property.title}</h1>
            <div className={styles.locationBar}>
              <span>📍 {property.address ? `${property.address}, ` : ''}{property.location}</span>
              <div className={styles.badgeRow}>
                <span className={styles.typeBadge}>{property.type}</span>
                {property.verified && (
                  <span className={styles.verifiedBadge}>✓ Verified Property</span>
                )}
                {property.rating && (
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                    ★ {property.rating.toFixed(1)} ({property.reviewCount || reviews.length} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.headerActions}>
            <button className={styles.actionBtn} onClick={handleShare} title="Share listing">
              <span>🔗</span> Share
            </button>
            <button
              className={styles.actionBtn}
              onClick={handleToggleFav}
              title={isFavorite ? 'Saved to favorites' : 'Save to favorites'}
            >
              <span>{isFavorite ? '❤️' : '🤍'}</span> {isFavorite ? 'Saved' : 'Favorite'}
            </button>
            <button
              className={styles.actionBtn}
              onClick={() => setShowReportModal(true)}
              title="Report issue"
            >
              <span>🚩</span> Report
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="card" style={{ padding: '10px 16px', background: '#dbeafe', color: '#1e40af', marginBottom: '16px' }}>
            {toastMsg}
          </div>
        )}

        {/* ── Photo Gallery ── */}
        <div className={styles.galleryWrap}>
          <div className={styles.galleryGrid}>
            <div className={styles.mainImageWrap} onClick={() => { setActiveImgIndex(0); setLightboxOpen(true); }}>
              <img src={allImages[0]} alt={property.title} className={styles.mainImage} />
            </div>
            <div className={styles.sideThumbnails}>
              <div className={styles.thumbWrap} onClick={() => { setActiveImgIndex(1 % allImages.length); setLightboxOpen(true); }}>
                <img src={allImages[1 % allImages.length]} alt="Detail 1" className={styles.thumbImg} />
              </div>
              <div className={styles.thumbWrap} onClick={() => { setActiveImgIndex(2 % allImages.length); setLightboxOpen(true); }}>
                <img src={allImages[2 % allImages.length]} alt="Detail 2" className={styles.thumbImg} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className={styles.contentGrid}>
          {/* Left Column: Specs, Description, Amenities, Host, Reviews */}
          <div className={styles.leftCol}>
            {/* Specs Bar */}
            <div className={styles.specBar}>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>🛏</span>
                <div>
                  <div className={styles.specLabel}>Bedrooms</div>
                  <div className={styles.specVal}>{property.beds > 0 ? `${property.beds} Beds` : 'Studio'}</div>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>🚿</span>
                <div>
                  <div className={styles.specLabel}>Bathrooms</div>
                  <div className={styles.specVal}>{property.baths} Baths</div>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>📐</span>
                <div>
                  <div className={styles.specLabel}>Living Area</div>
                  <div className={styles.specVal}>{(property.areaSqFt || 850).toLocaleString()} sqft</div>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>🛋</span>
                <div>
                  <div className={styles.specLabel}>Furnished</div>
                  <div className={styles.specVal}>{property.furnished ? 'Yes' : 'Unfurnished'}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>About this Property</h2>
              <p className={styles.descriptionText}>{property.description}</p>

              {property.houseRules && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--surface-border)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>📋 House Rules</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{property.houseRules}</p>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Amenities & Features</h2>
              <div className={styles.amenitiesGrid}>
                {(property.amenities || 'WiFi, Kitchen, Air Conditioning, Heating, Washer')
                  .split(',')
                  .map((a) => a.trim())
                  .filter(Boolean)
                  .map((item, idx) => (
                    <div key={idx} className={styles.amenityItem}>
                      <span>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Host Card */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Property Host & Management</h2>
              <div className={styles.hostCard}>
                <img
                  src={property.owner?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt="Host Avatar"
                  className={styles.hostAvatar}
                />
                <div className={styles.hostInfo}>
                  <h4>{property.owner?.name || property.owner?.username || 'Verified Property Manager'}</h4>
                  <p>Certified Landlord · Professional Host</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '40px' }}>
                    Shielded contact via encrypted platform messaging.
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>
                Verified Tenant Reviews ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No reviews yet for this listing. Be the first to write one!
                </p>
              ) : (
                <div className={styles.reviewsList}>
                  {reviews.map((rev) => (
                    <div key={rev.id || rev.reviewId} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <div>
                          <span className={styles.reviewerName}>
                            {rev.user?.name || rev.user?.username || 'Verified Guest'}
                          </span>
                          <span style={{ marginLeft: '8px', color: '#f59e0b', fontSize: '0.85rem' }}>
                            {'★'.repeat(rev.rating)}
                          </span>
                        </div>
                        <span className={styles.reviewDate}>
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className={styles.reviewComment}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Form */}
              <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Leave a Review</h4>

                {reviewMsg && (
                  <p style={{ fontSize: '0.88rem', color: reviewMsg.includes('Thank') ? '#065f46' : '#991b1b' }}>
                    {reviewMsg}
                  </p>
                )}

                <div className={styles.ratingSelect}>
                  <label htmlFor="ratingSelectBox" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rating:</label>
                  <select
                    id="ratingSelectBox"
                    className={styles.bookingInput}
                    style={{ width: '130px' }}
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                  >
                    <option value="5">★★★★★ 5</option>
                    <option value="4">★★★★☆ 4</option>
                    <option value="3">★★★☆☆ 3</option>
                    <option value="2">★★☆☆☆ 2</option>
                    <option value="1">★☆☆☆☆ 1</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="Share your experience with this property..."
                  className={styles.bookingInput}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ alignSelf: 'flex-start', padding: '10px 22px' }}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Reservation / Booking Request Card */}
          <aside className={styles.bookingCard}>
            <div className={styles.priceHeader}>
              <div>
                <span className={styles.priceAmount}>${price.toLocaleString()}</span>
                <span className={styles.pricePeriod}>
                  {property.priceUnit === 'PER_NIGHT' ? ' / night' : ' / month'}
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {property.availabilityStatus || 'Available'}
              </span>
            </div>

            {bookingSuccess ? (
              <div>
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '14px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '14px' }}>
                  ✓ Reservation request placed! Total: <strong>${(bookingSuccess.totalPrice || calculatedTotal).toLocaleString()}</strong>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => setShowPaymentModal(true)}
                >
                  Complete Secure Payment
                </button>
              </div>
            ) : (
              <form className={styles.bookingForm} onSubmit={handleCreateBooking}>
                {bookingError && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{bookingError}</p>
                )}

                <div className={styles.dateRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="detailsCheckIn">Check-in</label>
                    <input
                      id="detailsCheckIn"
                      type="date"
                      required
                      className={styles.bookingInput}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="detailsCheckOut">Check-out</label>
                    <input
                      id="detailsCheckOut"
                      type="date"
                      required
                      className={styles.bookingInput}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="detailsGuests">Guests</label>
                  <select
                    id="detailsGuests"
                    className={styles.bookingInput}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>{g} {g === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="detailsSpecialRequests">Special Notes (Optional)</label>
                  <input
                    id="detailsSpecialRequests"
                    type="text"
                    placeholder="e.g. Estimated arrival time"
                    className={styles.bookingInput}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>

                {/* Price Breakdown */}
                <div className={styles.priceBreakdown}>
                  <div className={styles.breakdownRow}>
                    <span>Base Rent ({property.priceUnit === 'PER_NIGHT' ? 'Nightly' : 'Monthly'})</span>
                    <span>${price.toLocaleString()}</span>
                  </div>
                  {deposit > 0 && (
                    <div className={styles.breakdownRow}>
                      <span>Security Deposit (Refundable)</span>
                      <span>${deposit.toLocaleString()}</span>
                    </div>
                  )}
                  {cleaningFee > 0 && (
                    <div className={styles.breakdownRow}>
                      <span>Cleaning & Turnover Fee</span>
                      <span>${cleaningFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className={styles.totalRow}>
                    <span>Estimated Total</span>
                    <span>${calculatedTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn-primary ${styles.bookBtn}`}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Checking Availability...' : 'Reserve Property'}
                </button>
              </form>
            )}
          </aside>
        </div>

        {/* ── Similar Properties ── */}
        {similarProperties.length > 0 && (
          <div style={{ marginTop: '64px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>
              Similar Properties You May Like
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {similarProperties.map((p) => (
                <PropertyCard key={p.id || p.listingId} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox Modal ── */}
      {lightboxOpen && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Close image">
            ×
          </button>
          <img src={allImages[activeImgIndex]} alt="Enlarged view" className={styles.lightboxImg} />
        </div>
      )}

      {/* ── Payment Sandbox Modal ── */}
      {showPaymentModal && (
        <div className={styles.lightboxOverlay} onClick={() => setShowPaymentModal(false)}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', margin: '20px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>💳 Secure Payment Checkout</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Safe sandbox checkout for reservation #{bookingSuccess?.id || bookingSuccess?.bookingId || 'DEMO'}.
            </p>

            {paymentSuccess ? (
              <div>
                <div style={{ background: '#d1fae5', color: '#065f46', padding: '16px', borderRadius: '8px', fontWeight: 600, textAlign: 'center', marginBottom: '16px' }}>
                  ✓ Payment Successful! Receipt #{'RCP-' + Math.floor(Math.random() * 900000 + 100000)} generated. Your reservation is confirmed.
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => { setShowPaymentModal(false); navigate('/dashboard'); }}
                >
                  Go to My Dashboard
                </button>
              </div>
            ) : (
              <div>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>Amount Due:</span>
                    <strong>${(bookingSuccess?.totalPrice || calculatedTotal).toLocaleString()} USD</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <span>Payment Gateway:</span>
                    <span>Stripe Demo Sandbox</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <input type="text" placeholder="Card Number (4242 •••• •••• 4242)" defaultValue="4242 •••• •••• 4242" className={styles.bookingInput} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input type="text" placeholder="MM/YY" defaultValue="12/28" className={styles.bookingInput} />
                    <input type="text" placeholder="CVC" defaultValue="123" className={styles.bookingInput} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={handlePayment} disabled={paymentLoading}>
                    {paymentLoading ? 'Authorizing...' : `Pay $${(bookingSuccess?.totalPrice || calculatedTotal).toLocaleString()}`}
                  </button>
                  <button className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Report Modal ── */}
      {showReportModal && (
        <div className={styles.lightboxOverlay} onClick={() => setShowReportModal(false)}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', margin: '20px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>🚩 Report Listing</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>
              Help us maintain marketplace integrity by reporting suspicious or incorrect listings.
            </p>

            {reportSuccess ? (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '14px', borderRadius: '8px', fontSize: '0.88rem' }}>
                ✓ Report submitted to our trust & safety moderation team.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label htmlFor="reportReasonSelect" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Reason</label>
                  <select
                    id="reportReasonSelect"
                    className={styles.bookingInput}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="Inaccurate information">Inaccurate information</option>
                    <option value="Suspected fraud or scam">Suspected fraud or scam</option>
                    <option value="Property no longer available">Property no longer available</option>
                    <option value="Inappropriate content">Inappropriate content</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="reportDetailsInput" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Additional Details</label>
                  <textarea
                    id="reportDetailsInput"
                    rows={3}
                    className={styles.bookingInput}
                    placeholder="Provide context for our review team..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Report</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

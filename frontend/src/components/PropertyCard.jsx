import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PropertyCard.module.css';

const TYPE_LABELS = {
  APARTMENT: 'Apartment',
  HOUSE:     'House',
  VILLA:     'Villa',
  STUDIO:    'Studio',
  COMMERCIAL: 'Commercial',
  CONDO:     'Condo',
};

const PRICE_UNIT_LABELS = {
  PER_MONTH: '/ mo',
  PER_NIGHT: '/ night',
  PER_DAY:   '/ day',
};

function StarRating({ value, count }) {
  if (!value) return null;
  return (
    <span className={styles.stars} aria-label={`Rating: ${value} out of 5 with ${count || 0} reviews`}>
      <span className={styles.starIcon}>★</span>
      <span className={styles.ratingNum}>{value.toFixed(1)}</span>
      {count !== undefined && count !== null && (
        <span className={styles.reviewCount}>({count})</span>
      )}
    </span>
  );
}

export default function PropertyCard({
  property,
  onContact,
  isFavorite = false,
  onToggleFavorite,
  isCompared = false,
  onToggleCompare,
}) {
  const navigate = useNavigate();

  const {
    id, listingId, title, description, type, location, price, pricePerDay, priceUnit,
    beds, baths, areaSqFt, rating, reviewCount, imageUrl, available, availabilityStatus, verified,
  } = property;

  const propId = id || listingId;
  const isAvailable = available !== undefined ? available : (availabilityStatus === 'AVAILABLE');
  const displayPrice = price !== undefined && price !== null ? price : pricePerDay;
  const unitLabel = PRICE_UNIT_LABELS[priceUnit] || '/ mo';

  const handleCardClick = (e) => {
    // Avoid triggering navigation when clicking buttons
    if (e.target.closest('button') || e.target.closest('input')) return;
    if (propId) {
      navigate(`/properties/${propId}`);
    }
  };

  return (
    <article
      className={styles.card}
      aria-label={`Property: ${title}`}
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className={styles.imageWrap}>
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'}
          alt={title}
          className={styles.image}
          loading="lazy"
        />

        {/* Favorite button */}
        <button
          type="button"
          className={`${styles.favBtn} ${isFavorite ? styles.favorited : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(propId);
          }}
          title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>

        {/* Availability badge */}
        <span
          className={`${styles.availBadge} ${isAvailable ? styles.available : styles.occupied}`}
          aria-label={isAvailable ? 'Available' : 'Occupied'}
        >
          {isAvailable ? '✓ Available' : '✗ Reserved'}
        </span>

        {/* Type & Verified badge */}
        <div className={styles.badgesLeft}>
          <span className={`${styles.typeBadge} ${styles[`type_${type}`] || ''}`}>
            {TYPE_LABELS[type] || type || 'Property'}
          </span>
          {verified && (
            <span className={styles.verifiedBadge} title="Verified Property Listing">
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.topRow}>
          <h3 className={styles.title} title={title}>{title}</h3>
          <StarRating value={rating} count={reviewCount} />
        </div>

        <p className={styles.location}>
          <span aria-hidden="true">📍</span> {location || 'Prime Location'}
        </p>

        <p className={styles.description}>{description}</p>

        {/* Features row */}
        <div className={styles.features}>
          {beds > 0 ? (
            <span className={styles.feat} title="Bedrooms">
              🛏 {beds} Bed{beds !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className={styles.feat} title="Studio">
              🛋 Studio
            </span>
          )}
          <span className={styles.feat} title="Bathrooms">
            🚿 {baths || 1} Bath{(baths && baths !== 1) ? 's' : ''}
          </span>
          {areaSqFt && (
            <span className={styles.feat} title="Square feet">
              📐 {areaSqFt.toLocaleString()} sqft
            </span>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.price}>
              ${Number(displayPrice || 0).toLocaleString()}
            </span>
            <span className={styles.priceUnit}>{unitLabel}</span>
          </div>

          <div className={styles.actions}>
            {onToggleCompare && (
              <label className={styles.compareLabel} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isCompared}
                  onChange={() => onToggleCompare(property)}
                  aria-label="Compare property"
                />
                <span>Compare</span>
              </label>
            )}

            <button
              className={`btn-primary ${styles.contactBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                onContact?.(property);
              }}
              aria-label={`Enquire about ${title}`}
            >
              Enquire
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

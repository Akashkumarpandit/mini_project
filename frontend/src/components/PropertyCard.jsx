import React from 'react';
import styles from './PropertyCard.module.css';

const TYPE_LABELS = {
  APARTMENT: 'Apartment',
  HOUSE:     'House',
  VILLA:     'Villa',
  STUDIO:    'Studio',
  CONDO:     'Condo',
};

const PRICE_UNIT_LABELS = {
  PER_MONTH: '/ mo',
  PER_NIGHT: '/ night',
};

function StarRating({ value }) {
  return (
    <span className={styles.stars} aria-label={`Rating: ${value} out of 5`}>
      {'★'.repeat(Math.floor(value))}{'☆'.repeat(5 - Math.floor(value))}
      <span className={styles.ratingNum}>{value?.toFixed(1)}</span>
    </span>
  );
}

export default function PropertyCard({ property, onContact }) {
  const {
    title, description, type, location, price, priceUnit,
    beds, baths, rating, imageUrl, available,
  } = property;

  const unitLabel = PRICE_UNIT_LABELS[priceUnit] || '/ mo';

  return (
    <article className={styles.card} aria-label={`Property: ${title}`}>
      {/* Image */}
      <div className={styles.imageWrap}>
        <img
          src={imageUrl}
          alt={title}
          className={styles.image}
          loading="lazy"
        />

        {/* Availability badge */}
        <span
          className={`${styles.availBadge} ${available ? styles.available : styles.occupied}`}
          aria-label={available ? 'Available' : 'Not available'}
        >
          {available ? '✓ Available' : '✗ Occupied'}
        </span>

        {/* Type badge */}
        <span className={`${styles.typeBadge} ${styles[`type_${type}`]}`}>
          {TYPE_LABELS[type] || type}
        </span>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.topRow}>
          <h3 className={styles.title}>{title}</h3>
          {rating && <StarRating value={rating} />}
        </div>

        <p className={styles.location}>
          <span aria-hidden="true">📍</span> {location}
        </p>

        <p className={styles.description}>{description}</p>

        {/* Features row */}
        <div className={styles.features}>
          {beds > 0 && (
            <span className={styles.feat} title="Bedrooms">
              🛏 {beds} Bed{beds !== 1 ? 's' : ''}
            </span>
          )}
          {beds === 0 && (
            <span className={styles.feat} title="Studio">
              🛋 Studio
            </span>
          )}
          <span className={styles.feat} title="Bathrooms">
            🚿 {baths} Bath{baths !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.price}>
              ${price?.toLocaleString()}
            </span>
            <span className={styles.priceUnit}>{unitLabel}</span>
          </div>

          <button
            className={`btn-primary ${styles.contactBtn}`}
            onClick={() => onContact?.(property)}
            disabled={!available}
            aria-label={available ? `Contact about ${title}` : `${title} is not available`}
          >
            {available ? 'Enquire' : 'Notify Me'}
          </button>
        </div>
      </div>
    </article>
  );
}

import React from 'react';
import styles from './ListingsList.module.css';

const TAG_COLORS = ['blue', 'orange', 'red', 'green'];

function getTagColor(tag, idx) {
  return TAG_COLORS[idx % TAG_COLORS.length];
}

export default function ListingsList({ listings = [], selectedId, onSelect, onDelete }) {
  if (listings.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🏠</span>
        <p>No listings yet. Create your first listing!</p>
      </div>
    );
  }

  return (
    <ul className={styles.list} role="list">
      {listings.map((listing) => {
        const tags = listing.tags ? listing.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
        return (
          <li
            key={listing.id}
            className={`${styles.item} ${listing.id === selectedId ? styles.selected : ''}`}
            onClick={() => onSelect(listing)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(listing)}
            aria-pressed={listing.id === selectedId}
          >
            <div className={styles.itemHeader}>
              <span className={styles.title}>{listing.title}</span>
              <button
                className={styles.deleteBtn}
                onClick={(e) => { e.stopPropagation(); onDelete(listing.id); }}
                aria-label={`Delete listing: ${listing.title}`}
                title="Delete listing"
              >
                ×
              </button>
            </div>

            <p className={styles.price}>
              ${listing.pricePerDay} / day · {listing.location}
            </p>

            {listing.description && (
              <p className={styles.excerpt}>
                {listing.description.length > 80
                  ? listing.description.slice(0, 80) + '…'
                  : listing.description}
              </p>
            )}

            {tags.length > 0 && (
              <div className={styles.tags}>
                {tags.map((tag, idx) => (
                  <span key={tag} className={`tag-pill ${getTagColor(tag, idx)}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

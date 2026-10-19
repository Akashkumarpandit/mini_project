import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchListingById,
  createListingApi,
  updateListingApi,
  deleteListingApi,
  fetchCategoriesApi,
} from '../services/api';
import styles from './ListingDetails.module.css';

const TABS = ['General', 'Location', 'Pricing', 'Specs & Amenities', 'Media', 'Tags'];

const ALL_AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Heating',
  'Kitchen',
  'Washer/Dryer',
  'Elevator',
  'Swimming Pool',
  'Fitness Center',
  'Parking / Garage',
  'Balcony / Terrace',
  'Dishwasher',
  'Concierge / Security',
  'Pet Friendly',
  'EV Charger',
  'Fireplace',
];

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [activeTab, setActiveTab] = useState('General');
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'APARTMENT',
    categoryId: '',
    status: 'PUBLISHED',
    availabilityStatus: 'AVAILABLE',
    // Location
    address: '',
    city: '',
    state: '',
    country: 'USA',
    zipCode: '',
    location: '',
    // Pricing
    price: '',
    priceUnit: 'PER_MONTH',
    deposit: '',
    cleaningFee: '',
    currency: 'USD',
    // Specs
    beds: 1,
    baths: 1,
    areaSqFt: 750,
    furnished: true,
    amenities: 'WiFi, Air Conditioning, Kitchen',
    houseRules: 'No smoking. Quiet hours 10 PM - 7 AM.',
    // Media
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000',
    images: '',
    // Tags
    tags: 'Modern, Renovated',
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load categories and existing listing
  useEffect(() => {
    fetchCategoriesApi()
      .then(({ data }) => setCategories(data))
      .catch(() => {});

    if (!isNew) {
      setLoading(true);
      fetchListingById(id)
        .then(({ data }) => {
          setForm({
            title: data.title || '',
            description: data.description || '',
            type: data.type || 'APARTMENT',
            categoryId: data.category?.id || '',
            status: data.status || 'PUBLISHED',
            availabilityStatus: data.availabilityStatus || 'AVAILABLE',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || 'USA',
            zipCode: data.zipCode || '',
            location: data.location || '',
            price: data.price !== undefined ? data.price : (data.pricePerDay || ''),
            priceUnit: data.priceUnit || 'PER_MONTH',
            deposit: data.deposit || '',
            cleaningFee: data.cleaningFee || '',
            currency: data.currency || 'USD',
            beds: data.beds !== undefined ? data.beds : 1,
            baths: data.baths !== undefined ? data.baths : 1,
            areaSqFt: data.areaSqFt || 750,
            furnished: data.furnished !== undefined ? data.furnished : true,
            amenities: data.amenities || '',
            houseRules: data.houseRules || '',
            imageUrl: data.imageUrl || '',
            images: data.images || '',
            tags: data.tags || '',
          });
        })
        .catch(() => setError('Could not load listing details.'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Amenities toggle
  const toggleAmenity = (amenity) => {
    const current = form.amenities ? form.amenities.split(',').map((a) => a.trim()).filter(Boolean) : [];
    let updated;
    if (current.includes(amenity)) {
      updated = current.filter((a) => a !== amenity);
    } else {
      updated = [...current, amenity];
    }
    setForm((f) => ({ ...f, amenities: updated.join(', ') }));
  };

  // Tags
  const addTag = () => {
    if (!tagInput.trim()) return;
    const current = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    if (!current.includes(tagInput.trim())) {
      setForm((f) => ({ ...f, tags: [...current, tagInput.trim()].join(', ') }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    const current = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    setForm((f) => ({ ...f, tags: current.filter((t) => t !== tag).join(', ') }));
  };

  // Form submission
  const handleSave = async (statusOverride = null) => {
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      ...form,
      price: Number(form.price) || 0,
      pricePerDay: Number(form.price) || 0,
      deposit: Number(form.deposit) || 0,
      cleaningFee: Number(form.cleaningFee) || 0,
      beds: Number(form.beds) || 1,
      baths: Number(form.baths) || 1,
      areaSqFt: Number(form.areaSqFt) || 500,
      location: form.location || (form.city ? `${form.city}, ${form.state || form.country}` : 'Downtown'),
      status: statusOverride || form.status,
    };

    try {
      if (isNew) {
        await createListingApi(payload);
        setSuccess('Listing created and published successfully!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        await updateListingApi(id, payload);
        setSuccess('Listing updated successfully!');
        setTimeout(() => setSuccess(''), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save listing. Please check required fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await deleteListingApi(id);
      navigate('/dashboard');
    } catch {
      setError('Failed to delete listing.');
    }
  };

  const currentAmenities = form.amenities ? form.amenities.split(',').map((a) => a.trim()) : [];
  const tagsList = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <p>Loading listing details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </button>
            <h1 className={styles.pageTitle}>{isNew ? 'Create New Rental Listing' : 'Edit Listing'}</h1>
          </div>
          {!isNew && (
            <button
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '6px 14px' }}
              onClick={() => navigate(`/properties/${id}`)}
            >
              Preview Public Page ↗
            </button>
          )}
        </div>

        {/* Tab Headers */}
        <div className={styles.tabs} role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: General */}
        {activeTab === 'General' && (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label htmlFor="listingTitle">Listing Title *</label>
              <input
                id="listingTitle"
                name="title"
                type="text"
                required
                className={styles.titleInput}
                placeholder="e.g. Skyline Luxury Apartment with Panoramic Views"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.field}>
                <label htmlFor="listingType">Property Type</label>
                <select
                  id="listingType"
                  name="type"
                  className={styles.titleInput}
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="STUDIO">Studio</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="listingCategory">Category</label>
                <select
                  id="listingCategory"
                  name="categoryId"
                  className={styles.titleInput}
                  value={form.categoryId}
                  onChange={handleChange}
                >
                  <option value="">Standard Residential</option>
                  {categories.map((c) => (
                    <option key={c.id || c.categoryId} value={c.id || c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="listingDesc">Description</label>
              <textarea
                id="listingDesc"
                name="description"
                rows={5}
                className={styles.textarea}
                placeholder="Describe your property, highlights, neighborhood, transport links, and ambiance..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.field}>
                <label htmlFor="listingStatus">Listing Status</label>
                <select
                  id="listingStatus"
                  name="status"
                  className={styles.titleInput}
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="PUBLISHED">PUBLISHED (Active on marketplace)</option>
                  <option value="DRAFT">DRAFT (Hidden)</option>
                  <option value="PAUSED">PAUSED (Temporarily unavailable)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="listingAvail">Availability Status</label>
                <select
                  id="listingAvail"
                  name="availabilityStatus"
                  className={styles.titleInput}
                  value={form.availabilityStatus}
                  onChange={handleChange}
                >
                  <option value="AVAILABLE">AVAILABLE (Accepting reservations)</option>
                  <option value="BOOKED">BOOKED (Occupied)</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Location */}
        {activeTab === 'Location' && (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label htmlFor="listingAddress">Street Address</label>
              <input
                id="listingAddress"
                name="address"
                type="text"
                className={styles.titleInput}
                placeholder="e.g. 450 Lexington Avenue"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.field}>
                <label htmlFor="listingCity">City</label>
                <input
                  id="listingCity"
                  name="city"
                  type="text"
                  className={styles.titleInput}
                  placeholder="New York"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="listingState">State / Region</label>
                <input
                  id="listingState"
                  name="state"
                  type="text"
                  className={styles.titleInput}
                  placeholder="NY"
                  value={form.state}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="listingZip">Zip / Postal Code</label>
                <input
                  id="listingZip"
                  name="zipCode"
                  type="text"
                  className={styles.titleInput}
                  placeholder="10017"
                  value={form.zipCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="listingLocation">Display Location Headline</label>
              <input
                id="listingLocation"
                name="location"
                type="text"
                className={styles.titleInput}
                placeholder="e.g. Downtown, New York or Beachfront, Miami"
                value={form.location}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Pricing */}
        {activeTab === 'Pricing' && (
          <div className={styles.tabContent}>
            <div className={styles.formGrid2}>
              <div className={styles.field}>
                <label htmlFor="listingPrice">Rent Amount *</label>
                <input
                  id="listingPrice"
                  name="price"
                  type="number"
                  required
                  className={styles.titleInput}
                  placeholder="3200"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="listingPriceUnit">Billing Unit</label>
                <select
                  id="listingPriceUnit"
                  name="priceUnit"
                  className={styles.titleInput}
                  value={form.priceUnit}
                  onChange={handleChange}
                >
                  <option value="PER_MONTH">Per Month (/ mo)</option>
                  <option value="PER_NIGHT">Per Night (/ night)</option>
                  <option value="PER_DAY">Per Day (/ day)</option>
                </select>
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.field}>
                <label htmlFor="listingDeposit">Security Deposit ($)</label>
                <input
                  id="listingDeposit"
                  name="deposit"
                  type="number"
                  className={styles.titleInput}
                  placeholder="Refundable deposit amount"
                  value={form.deposit}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="listingCleaning">Cleaning / Turnover Fee ($)</label>
                <input
                  id="listingCleaning"
                  name="cleaningFee"
                  type="number"
                  className={styles.titleInput}
                  placeholder="One-time cleaning fee"
                  value={form.cleaningFee}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Specs & Amenities */}
        {activeTab === 'Specs & Amenities' && (
          <div className={styles.tabContent}>
            <div className={styles.formGrid3}>
              <div className={styles.field}>
                <label htmlFor="listingBeds">Bedrooms</label>
                <input
                  id="listingBeds"
                  name="beds"
                  type="number"
                  className={styles.titleInput}
                  min="0"
                  value={form.beds}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="listingBaths">Bathrooms</label>
                <input
                  id="listingBaths"
                  name="baths"
                  type="number"
                  className={styles.titleInput}
                  min="1"
                  value={form.baths}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="listingArea">Area (Square Feet)</label>
                <input
                  id="listingArea"
                  name="areaSqFt"
                  type="number"
                  className={styles.titleInput}
                  placeholder="e.g. 1200"
                  value={form.areaSqFt}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                name="furnished"
                checked={form.furnished}
                onChange={handleChange}
              />
              Fully Furnished
            </label>

            <div className={styles.field}>
              <label>Select Included Amenities</label>
              <div className={styles.amenitiesList}>
                {ALL_AMENITIES.map((item) => (
                  <label key={item} className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={currentAmenities.includes(item)}
                      onChange={() => toggleAmenity(item)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="listingRules">House Rules & Terms</label>
              <textarea
                id="listingRules"
                name="houseRules"
                rows={2}
                className={styles.textarea}
                placeholder="e.g. No smoking indoors. Maximum 2 pets allowed with deposit."
                value={form.houseRules}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Tab 5: Media */}
        {activeTab === 'Media' && (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label htmlFor="listingCoverImg">Primary Cover Image URL *</label>
              <input
                id="listingCoverImg"
                name="imageUrl"
                type="url"
                required
                className={styles.titleInput}
                placeholder="https://images.unsplash.com/photo-..."
                value={form.imageUrl}
                onChange={handleChange}
              />
            </div>

            {form.imageUrl && (
              <div className={styles.imagePreviewBox}>
                <img src={form.imageUrl} alt="Cover Preview" className={styles.previewImg} />
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="listingGalleryImgs">Additional Gallery Photos (Comma-separated URLs)</label>
              <textarea
                id="listingGalleryImgs"
                name="images"
                rows={3}
                className={styles.textarea}
                placeholder="https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
                value={form.images}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* Tab 6: Tags */}
        {activeTab === 'Tags' && (
          <div className={styles.tabContent}>
            <div className={styles.field}>
              <label htmlFor="tagInputBox">Add Property Search Tags</label>
              <div className={styles.tagInputRow}>
                <input
                  id="tagInputBox"
                  type="text"
                  placeholder="e.g. Luxury, Downtown, Ocean View, Garden..."
                  className={styles.tagInput}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button type="button" className="btn-secondary" onClick={addTag}>
                  + Add Tag
                </button>
              </div>
            </div>

            <div className={styles.tagsList}>
              {tagsList.length === 0 ? (
                <p className={styles.noTags}>No tags added yet.</p>
              ) : (
                tagsList.map((tag) => (
                  <span key={tag} className="tag-pill blue">
                    {tag}
                    <button
                      type="button"
                      className={styles.removeTag}
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Feedback banners */}
        {error && <p className={styles.errorMsg}>{error}</p>}
        {success && <p className={styles.successMsg}>{success}</p>}

        {/* Actions */}
        <div className={styles.actions}>
          <div>
            {!isNew && (
              <button
                type="button"
                className="btn-secondary"
                style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                onClick={handleDelete}
              >
                Delete Listing
              </button>
            )}
          </div>

          <div className={styles.actionGroup}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleSave('DRAFT')}
              disabled={saving}
            >
              Save as Draft
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleSave('PUBLISHED')}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Publish Listing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchListingById, createListingApi, updateListingApi } from '../services/api';
import styles from './ListingDetails.module.css';

const TABS = ['Title', 'Tags', 'Reminders'];

export default function ListingDetails() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isNew     = !id || id === 'new';

  const [activeTab, setActiveTab] = useState('Title');
  const [form, setForm]           = useState({ title: '', description: '', tags: '', pricePerDay: 0, location: '', availabilityStatus: 'AVAILABLE' });
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({ email: '', reminderType: 'EMAIL', sendTime: '' });
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    if (!isNew) {
      setLoading(true);
      fetchListingById(id)
        .then(({ data }) => {
          setForm({
            title:               data.title || '',
            description:         data.description || '',
            tags:                data.tags || '',
            pricePerDay:         data.pricePerDay || 0,
            location:            data.location || '',
            availabilityStatus:  data.availabilityStatus || 'AVAILABLE',
          });
          setReminders(data.reminders || []);
        })
        .catch(() => setError('Could not load listing.'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (isNew) {
        await createListingApi(form);
        setSuccess('Listing created!');
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        await updateListingApi(id, form);
        setSuccess('Saved!');
        setTimeout(() => setSuccess(''), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const addTag = (tag) => {
    const existing = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    if (tag && !existing.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...existing, tag].join(', ') }));
    }
  };

  const removeTag = (tag) => {
    const existing = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    setForm((f) => ({ ...f, tags: existing.filter((t) => t !== tag).join(', ') }));
  };

  const tags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingCard}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)}
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
            <button
              className={styles.backBtn}
              onClick={() => navigate('/dashboard')}
              aria-label="Back to dashboard"
            >
              ← Back
            </button>
            <h2 className={styles.pageTitle}>{isNew ? 'New Listing' : 'Listing Details'}</h2>
          </div>
          <div className={styles.headerRight}>
            {!isNew && (
              <span className={styles.bellIcon} title="Reminders" aria-label="Reminders">
                🔔
                {reminders.length > 0 && (
                  <span className={styles.badge}>{reminders.length}</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Listing sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} noValidate>
          {/* ── Tab: Title ── */}
          {activeTab === 'Title' && (
            <div className={styles.tabContent} role="tabpanel" aria-label="Title tab">
              <div className={styles.field}>
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Enter listing title…"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className={styles.titleInput}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Enter location…"
                  value={form.location}
                  onChange={handleChange}
                  className={styles.titleInput}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="pricePerDay">Price Per Day ($)</label>
                <input
                  id="pricePerDay"
                  name="pricePerDay"
                  type="number"
                  placeholder="0.00"
                  value={form.pricePerDay}
                  onChange={handleChange}
                  className={styles.titleInput}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Write your listing description here…"
                  value={form.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={7}
                />
              </div>
            </div>
          )}

          {/* ── Tab: Tags ── */}
          {activeTab === 'Tags' && (
            <div className={styles.tabContent} role="tabpanel" aria-label="Tags tab">
              <div className={styles.field}>
                <label htmlFor="tagInput">Add Tag</label>
                <div className={styles.tagInputRow}>
                  <input
                    id="tagInput"
                    type="text"
                    placeholder="Type a tag and press Enter…"
                    className={styles.tagInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              <div className={styles.tagsList}>
                {tags.length === 0 ? (
                  <p className={styles.noTags}>No tags yet.</p>
                ) : (
                  tags.map((tag, idx) => {
                    const colors = ['blue', 'orange', 'red', 'green'];
                    return (
                      <span key={tag} className={`tag-pill ${colors[idx % colors.length]}`}>
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
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Reminders ── */}
          {activeTab === 'Reminders' && (
            <div className={styles.tabContent} role="tabpanel" aria-label="Reminders tab">
              {reminders.length === 0 ? (
                <p className={styles.noTags}>No reminders set.</p>
              ) : (
                <ul className={styles.reminderList}>
                  {reminders.map((r) => (
                    <li key={r.id} className={styles.reminderItem}>
                      <span className={styles.reminderIcon}>⏰</span>
                      <div>
                        <p className={styles.reminderEmail}>{r.email}</p>
                        <p className={styles.reminderMeta}>
                          {r.reminderType} · {r.sendTime ? new Date(r.sendTime).toLocaleString() : '-'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Feedback */}
          {error   && <p className={styles.errorMsg}  role="alert">{error}</p>}
          {success && <p className={styles.successMsg} role="status">{success}</p>}

          {/* Actions */}
          <div className={styles.actions}>
            <button
              type="submit"
              className={`btn-primary ${styles.saveBtn}`}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Listing'}
            </button>
            <button
              type="button"
              className={`btn-secondary ${styles.cancelBtn}`}
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

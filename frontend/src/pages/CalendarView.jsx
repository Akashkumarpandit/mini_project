import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchRemindersApi,
  createReminderApi,
  toggleReminderStatusApi,
  deleteReminderApi,
  fetchBookings,
  fetchMyListingsApi,
} from '../services/api';
import styles from './CalendarView.module.css';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // Backend data
  const [reminders, setReminders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [typeFilter, setTypeFilter] = useState('ALL');

  // New Reminder Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('INSPECTION');
  const [newListingId, setNewListingId] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newNotes, setNewNotes] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Load reminders, bookings, and user's listings
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [remRes, bookRes, listRes] = await Promise.allSettled([
        fetchRemindersApi(),
        fetchBookings(),
        fetchMyListingsApi(),
      ]);
      if (remRes.status === 'fulfilled') setReminders(remRes.value.data || []);
      if (bookRes.status === 'fulfilled') setBookings(bookRes.value.data || []);
      if (listRes.status === 'fulfilled') setListings(listRes.value.data || []);
    } catch {
      // Fallback
      setReminders([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const cells = useMemo(() => buildCalendarDays(year, month), [year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // Selected date object
  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  // Check if a day has events
  const getDayEvents = (day) => {
    if (!day) return { hasInspection: false, hasViewing: false, hasBooking: false };
    const datePrefix = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const hasInspection = reminders.some(
      (r) => (r.dueAt || r.sendAt || '').startsWith(datePrefix) && r.reminderType === 'INSPECTION'
    );
    const hasViewing = reminders.some(
      (r) => (r.dueAt || r.sendAt || '').startsWith(datePrefix) && r.reminderType === 'VIEWING'
    );
    const hasBooking = bookings.some(
      (b) => b.startDate <= datePrefix && b.endDate >= datePrefix
    );

    return { hasInspection, hasViewing, hasBooking };
  };

  // Events for selected day
  const selectedDayEvents = useMemo(() => {
    const list = [];

    // Reminders
    reminders.forEach((r) => {
      const datePart = (r.dueAt || r.sendAt || '').substring(0, 10);
      if (datePart === selectedDateStr) {
        list.push({
          id: r.id || r.reminderId,
          type: r.reminderType || 'INSPECTION',
          title: r.title || 'Scheduled Reminder',
          subtitle: r.listing?.title || 'General Property Reminder',
          notes: r.messageText || '',
          status: r.status || 'PENDING',
          isReminder: true,
        });
      }
    });

    // Bookings
    bookings.forEach((b) => {
      if (b.startDate <= selectedDateStr && b.endDate >= selectedDateStr) {
        list.push({
          id: b.id || b.bookingId,
          type: 'BOOKING',
          title: `Reservation: ${b.listing?.title || 'Property'}`,
          subtitle: `Guest: ${b.user?.name || b.user?.username || 'Verified Guest'}`,
          notes: `Check-in: ${b.startDate} · Check-out: ${b.endDate} · Status: ${b.bookingStatus}`,
          status: b.bookingStatus,
          isReminder: false,
        });
      }
    });

    if (typeFilter !== 'ALL') {
      return list.filter((e) => e.type === typeFilter);
    }
    return list;
  }, [reminders, bookings, selectedDateStr, typeFilter]);

  // Handle Reminder toggle
  const handleToggleReminder = async (id) => {
    try {
      const { data } = await toggleReminderStatusApi(id);
      setReminders((prev) =>
        prev.map((r) => ((r.id || r.reminderId) === id ? data : r))
      );
    } catch {
      alert('Could not update reminder.');
    }
  };

  // Handle Reminder delete
  const handleDeleteReminder = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await deleteReminderApi(id);
      setReminders((prev) => prev.filter((r) => (r.id || r.reminderId) !== id));
    } catch {
      alert('Could not delete reminder.');
    }
  };

  // Handle create reminder
  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setModalLoading(true);

    const dueAt = `${selectedDateStr}T${newTime}:00`;
    try {
      const { data } = await createReminderApi({
        title: newTitle.trim(),
        reminderType: newType,
        listingId: newListingId ? Number(newListingId) : null,
        messageText: newNotes.trim(),
        dueAt,
        status: 'PENDING',
      });
      setReminders([...reminders, data]);
      setShowAddModal(false);
      setNewTitle('');
      setNewNotes('');
    } catch {
      alert('Failed to save reminder.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.calendarCard}>
          {/* Header */}
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.heading}>Calendar & Property Reminders</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Track property inspections, tenant viewing appointments, and active reservations.
              </p>
            </div>

            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              + New Reminder
            </button>
          </div>

          <div className={styles.calendarLayout}>
            {/* ── Left: Calendar Grid ── */}
            <div>
              <div className={styles.calendarWrap}>
                {/* Month navigator */}
                <div className={styles.nav}>
                  <button className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">
                    ‹
                  </button>
                  <span className={styles.monthLabel}>
                    {MONTHS[month]} {year}
                  </span>
                  <button className={styles.navBtn} onClick={nextMonth} aria-label="Next month">
                    ›
                  </button>
                </div>

                {/* Day headers */}
                <div className={styles.grid}>
                  {DAYS.map((d) => (
                    <div key={d} className={styles.dayName}>{d}</div>
                  ))}

                  {/* Day cells */}
                  {cells.map((day, idx) => {
                    const { hasInspection, hasViewing, hasBooking } = getDayEvents(day);
                    return (
                      <div
                        key={idx}
                        className={`
                          ${styles.cell}
                          ${!day ? styles.empty : ''}
                          ${isToday(day) ? styles.today : ''}
                          ${day === selectedDay && !isToday(day) ? styles.selected : ''}
                        `}
                        onClick={() => day && setSelectedDay(day)}
                      >
                        {day ? <span>{day}</span> : ''}
                        {day && (
                          <div className={styles.dotRow}>
                            {hasInspection && <span className={`${styles.dot} ${styles.dotInspection}`} />}
                            {hasViewing && <span className={`${styles.dot} ${styles.dotViewing}`} />}
                            {hasBooking && <span className={`${styles.dot} ${styles.dotBooking}`} />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`${styles.dot} ${styles.dotInspection}`} /> Inspection
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`${styles.dot} ${styles.dotViewing}`} /> Viewing
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`${styles.dot} ${styles.dotBooking}`} /> Active Booking
                </span>
              </div>
            </div>

            {/* ── Right: Agenda Panel ── */}
            <div className={styles.agendaPanel}>
              <div className={styles.selectedHeader}>
                <span className={styles.selectedDateText}>
                  📅 {selectedDay} {MONTHS[month]} {year}
                </span>

                <select
                  className={styles.filterSelect}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="ALL">All Types</option>
                  <option value="INSPECTION">Inspections</option>
                  <option value="VIEWING">Viewings</option>
                  <option value="BOOKING">Bookings</option>
                  <option value="FOLLOWUP">Follow-ups</option>
                </select>
              </div>

              {loading ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading schedule...</p>
              ) : selectedDayEvents.length === 0 ? (
                <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '1.8rem', marginBottom: '8px' }}>☕</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>No Events Scheduled</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Click "+ New Reminder" to add an inspection or follow-up note.</p>
                </div>
              ) : (
                <div className={styles.eventsList}>
                  {selectedDayEvents.map((event) => (
                    <div key={event.id} className={styles.eventCard}>
                      <div className={styles.eventHeader}>
                        <span className={styles.eventTitle}>{event.title}</span>
                        <span className={`${styles.eventTypeBadge} ${styles['badge' + event.type] || styles.badgeFollowup}`}>
                          {event.type}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {event.subtitle}
                      </p>

                      {event.notes && (
                        <p className={styles.eventNotes}>{event.notes}</p>
                      )}

                      {event.isReminder && (
                        <div className={styles.eventFooter}>
                          <button
                            type="button"
                            className={`${styles.statusToggle} ${event.status === 'COMPLETED' ? styles.statusCompleted : styles.statusPending}`}
                            onClick={() => handleToggleReminder(event.id)}
                          >
                            {event.status === 'COMPLETED' ? '✓ Completed' : '○ Mark Complete'}
                          </button>

                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteReminder(event.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── New Reminder Modal ── */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Add Calendar Reminder</h3>

            <form className={styles.modalForm} onSubmit={handleCreateReminder}>
              <div>
                <label htmlFor="calendarReminderTitle" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Title *</label>
                <input
                  id="calendarReminderTitle"
                  type="text"
                  required
                  placeholder="e.g. Smoke detector inspection or key handover"
                  className={styles.modalInput}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="calendarReminderType" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Reminder Type</label>
                <select
                  id="calendarReminderType"
                  className={styles.modalInput}
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                >
                  <option value="INSPECTION">Inspection</option>
                  <option value="VIEWING">Viewing Appointment</option>
                  <option value="FOLLOWUP">Follow-up</option>
                  <option value="EMAIL">Email Alert</option>
                </select>
              </div>

              {listings.length > 0 && (
                <div>
                  <label htmlFor="calendarReminderProperty" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Property (Optional)</label>
                  <select
                    id="calendarReminderProperty"
                    className={styles.modalInput}
                    value={newListingId}
                    onChange={(e) => setNewListingId(e.target.value)}
                  >
                    <option value="">General Platform Reminder</option>
                    {listings.map((l) => (
                      <option key={l.id || l.listingId} value={l.id || l.listingId}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="calendarReminderTime" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Time</label>
                <input
                  id="calendarReminderTime"
                  type="time"
                  className={styles.modalInput}
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="calendarReminderNotes" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Notes / Instructions</label>
                <textarea
                  id="calendarReminderNotes"
                  rows={3}
                  placeholder="Details for the inspection or client contact notes..."
                  className={styles.modalInput}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={modalLoading}>
                  {modalLoading ? 'Saving...' : 'Save to Calendar'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

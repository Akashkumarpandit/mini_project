import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchMyListingsApi,
  deleteListingApi,
  updateListingStatusApi,
  fetchMyBookingsApi,
  fetchOwnerBookingsApi,
  updateBookingStatusApi,
  fetchInboxApi,
  fetchSentApi,
  updateLeadStatusApi,
  fetchFavoritesApi,
  toggleFavoriteApi,
  fetchAdminStatsApi,
  fetchAdminUsersApi,
  updateUserRoleApi,
  toggleUserVerificationApi,
  moderateListingApi,
  fetchAdminReportsApi,
  resolveReportApi,
  fetchAuditLogsApi,
  processPaymentApi,
} from '../services/api';
import { getUser, isAdmin, isOwner } from '../services/auth';
import PropertyCard from '../components/PropertyCard';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const admin = isAdmin();
  const owner = isOwner();

  // Role detection
  const primaryRole = user?.role || (admin ? 'ADMIN' : (owner ? 'OWNER' : 'TENANT'));

  // Active Tab
  const defaultTab = admin ? 'admin_stats' : (owner ? 'listings' : 'my_bookings');
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Data states
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Owner/Agent data
  const [myListings, setMyListings] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);

  // Tenant data
  const [myBookings, setMyBookings] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Admin data
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Load dashboard data based on role
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      if (admin) {
        const [statsRes, usersRes, reportsRes, logsRes, listingsRes] = await Promise.allSettled([
          fetchAdminStatsApi(),
          fetchAdminUsersApi(),
          fetchAdminReportsApi(),
          fetchAuditLogsApi(),
          fetchMyListingsApi(),
        ]);
        if (statsRes.status === 'fulfilled') setAdminStats(statsRes.value.data);
        if (usersRes.status === 'fulfilled') setAdminUsers(usersRes.value.data);
        if (reportsRes.status === 'fulfilled') setAdminReports(reportsRes.value.data);
        if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value.data);
        if (listingsRes.status === 'fulfilled') setMyListings(listingsRes.value.data);
      } else if (owner) {
        const [listingsRes, bookingsRes, messagesRes] = await Promise.allSettled([
          fetchMyListingsApi(),
          fetchOwnerBookingsApi(),
          fetchInboxApi(),
        ]);
        if (listingsRes.status === 'fulfilled') setMyListings(listingsRes.value.data);
        if (bookingsRes.status === 'fulfilled') setOwnerBookings(bookingsRes.value.data);
        if (messagesRes.status === 'fulfilled') setInboxMessages(messagesRes.value.data);
      } else {
        // Tenant
        const [bookingsRes, sentRes, favsRes] = await Promise.allSettled([
          fetchMyBookingsApi(),
          fetchSentApi(),
          fetchFavoritesApi(),
        ]);
        if (bookingsRes.status === 'fulfilled') setMyBookings(bookingsRes.value.data);
        if (sentRes.status === 'fulfilled') setSentMessages(sentRes.value.data);
        if (favsRes.status === 'fulfilled') setFavorites(favsRes.value.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, [admin, owner]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Listing mutations
  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await deleteListingApi(id);
      setMyListings((prev) => prev.filter((l) => (l.id || l.listingId) !== id));
    } catch {
      alert('Failed to delete listing.');
    }
  };

  const handleToggleListingStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED';
    try {
      await updateListingStatusApi(id, nextStatus);
      setMyListings((prev) =>
        prev.map((l) => ((l.id || l.listingId) === id ? { ...l, status: nextStatus } : l))
      );
    } catch {
      alert('Failed to update status.');
    }
  };

  // Booking status mutations
  const handleUpdateBooking = async (bookingId, status, reason = '') => {
    try {
      const { data } = await updateBookingStatusApi(bookingId, status, reason);
      if (owner || admin) {
        setOwnerBookings((prev) =>
          prev.map((b) => ((b.id || b.bookingId) === bookingId ? data : b))
        );
      }
      setMyBookings((prev) =>
        prev.map((b) => ((b.id || b.bookingId) === bookingId ? data : b))
      );
    } catch {
      alert('Failed to update booking status.');
    }
  };

  // Demo payment for tenant
  const handlePayBooking = async (booking) => {
    try {
      await processPaymentApi({
        bookingId: booking.id || booking.bookingId,
        amount: booking.totalPrice,
        paymentMethod: 'STRIPE_DEMO',
        currency: 'USD',
      });
      alert('Payment processed successfully! Your reservation is confirmed.');
      loadDashboardData();
    } catch {
      alert('Payment failed.');
    }
  };

  // Message status
  const handleUpdateLeadStatus = async (messageId, status) => {
    try {
      await updateLeadStatusApi(messageId, status);
      setInboxMessages((prev) =>
        prev.map((m) => ((m.id || m.messageId) === messageId ? { ...m, status } : m))
      );
    } catch {
      alert('Failed to update lead status.');
    }
  };

  // Admin user mutation
  const handleChangeRole = async (userId, newRole) => {
    try {
      const { data } = await updateUserRoleApi(userId, newRole);
      setAdminUsers((prev) => prev.map((u) => (u.id === userId ? data : u)));
    } catch {
      alert('Failed to update role.');
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      const { data } = await toggleUserVerificationApi(userId);
      setAdminUsers((prev) => prev.map((u) => (u.id === userId ? data : u)));
    } catch {
      alert('Failed to toggle verification.');
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      const { data } = await resolveReportApi(reportId, status);
      setAdminReports((prev) => prev.map((r) => (r.id === reportId ? data : r)));
    } catch {
      alert('Failed to resolve report.');
    }
  };

  // Filtered listings
  const filteredListings = myListings.filter((l) =>
    !search.trim() ||
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.dashHeader}>
          <div>
            <h1 className={styles.dashTitle}>
              Welcome back, {user?.name || user?.username || 'User'}
              <span className={styles.roleBadge}>{primaryRole}</span>
            </h1>
            <p className={styles.dashSub}>
              {admin
                ? 'Full system management, analytics, user administration, and listing moderation.'
                : owner
                ? 'Manage your rental properties, booking inquiries, and tenants.'
                : 'Manage your active reservations, saved favorite homes, and inquiries.'}
            </p>
          </div>

          <div className={styles.headerActions}>
            {(owner || admin) && (
              <button className="btn-primary" onClick={() => navigate('/listings/new')}>
                + Create New Listing
              </button>
            )}
            <button className="btn-secondary" onClick={() => navigate('/properties')}>
              View Marketplace
            </button>
          </div>
        </div>

        {/* ── Metrics Cards Grid ── */}
        <div className={styles.metricsGrid}>
          {admin ? (
            <>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🏠</div>
                <div>
                  <div className={styles.metricNum}>{adminStats?.totalListings ?? myListings.length}</div>
                  <div className={styles.metricLabel}>Total Properties</div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>👥</div>
                <div>
                  <div className={styles.metricNum}>{adminStats?.totalUsers ?? adminUsers.length}</div>
                  <div className={styles.metricLabel}>Registered Users</div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📅</div>
                <div>
                  <div className={styles.metricNum}>{adminStats?.confirmedBookings ?? 0}</div>
                  <div className={styles.metricLabel}>Confirmed Bookings</div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>💰</div>
                <div>
                  <div className={styles.metricNum}>
                    ${Number(adminStats?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <div className={styles.metricLabel}>Total Revenue (USD)</div>
                </div>
              </div>
            </>
          ) : owner ? (
            <>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🏠</div>
                <div>
                  <div className={styles.metricNum}>{myListings.length}</div>
                  <div className={styles.metricLabel}>My Listings</div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>✓</div>
                <div>
                  <div className={styles.metricNum}>
                    {myListings.filter((l) => l.status === 'PUBLISHED').length}
                  </div>
                  <div className={styles.metricLabel}>Published</div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📩</div>
                <div>
                  <div className={styles.metricNum}>
                    {ownerBookings.filter((b) => b.bookingStatus === 'PENDING').length}
                  </div>
                  <div className={styles.metricLabel}>Pending Requests</div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>💬</div>
                <div>
                  <div className={styles.metricNum}>{inboxMessages.length}</div>
                  <div className={styles.metricLabel}>Leads & Enquiries</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📅</div>
                <div>
                  <div className={styles.metricNum}>{myBookings.length}</div>
                  <div className={styles.metricLabel}>My Reservations</div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>❤️</div>
                <div>
                  <div className={styles.metricNum}>{favorites.length}</div>
                  <div className={styles.metricLabel}>Saved Favorites</div>
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>💬</div>
                <div>
                  <div className={styles.metricNum}>{sentMessages.length}</div>
                  <div className={styles.metricLabel}>Inquiries Sent</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Tab Navigation ── */}
        <div className={styles.tabNav} role="tablist">
          {admin && (
            <>
              <button
                className={`${styles.tabBtn} ${activeTab === 'admin_stats' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('admin_stats')}
              >
                📊 Platform Overview
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'admin_users' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('admin_users')}
              >
                👥 Users ({adminUsers.length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'listings' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('listings')}
              >
                🏠 Listing Moderation ({myListings.length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'admin_reports' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('admin_reports')}
              >
                🚩 Reports ({adminReports.filter((r) => r.status === 'OPEN').length})
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'admin_logs' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('admin_logs')}
              >
                📜 Audit Logs
              </button>
            </>
          )}

          {owner && !admin && (
            <>
              <button
                className={`${styles.tabBtn} ${activeTab === 'listings' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('listings')}
              >
                🏠 My Listings <span className={styles.tabCount}>{myListings.length}</span>
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'bookings' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                📅 Booking Requests <span className={styles.tabCount}>{ownerBookings.length}</span>
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'enquiries' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('enquiries')}
              >
                💬 Enquiries & Viewings <span className={styles.tabCount}>{inboxMessages.length}</span>
              </button>
            </>
          )}

          {!admin && !owner && (
            <>
              <button
                className={`${styles.tabBtn} ${activeTab === 'my_bookings' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('my_bookings')}
              >
                📅 My Reservations <span className={styles.tabCount}>{myBookings.length}</span>
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'my_favorites' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('my_favorites')}
              >
                ❤️ Saved Properties <span className={styles.tabCount}>{favorites.length}</span>
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'my_enquiries' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('my_enquiries')}
              >
                💬 My Inquiries <span className={styles.tabCount}>{sentMessages.length}</span>
              </button>
            </>
          )}
        </div>

        {/* ── Tab Content Panels ── */}

        {/* 1. Listings Panel (Owner & Admin) */}
        {activeTab === 'listings' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <div className={styles.panelSearch}>
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search listings by title or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="btn-primary" onClick={() => navigate('/listings/new')}>
                + Add Listing
              </button>
            </div>

            {loading ? (
              <p>Loading listings...</p>
            ) : filteredListings.length === 0 ? (
              <div className={styles.emptyPanel}>
                <div className={styles.emptyPanelIcon}>🏠</div>
                <h3>No Listings Found</h3>
                <p>Create your first rental listing to start receiving booking requests.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Availability</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredListings.map((l) => {
                      const lId = l.id || l.listingId;
                      return (
                        <tr key={lId}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={l.imageUrl || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100'}
                                alt=""
                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                              />
                              <div>
                                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>
                                  {l.title}
                                </strong>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  {l.location}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>{l.type}</td>
                          <td>${Number(l.price || l.pricePerDay || 0).toLocaleString()} / mo</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles['status' + l.status]}`}>
                              {l.status}
                            </span>
                          </td>
                          <td>{l.availabilityStatus || 'AVAILABLE'}</td>
                          <td>
                            <div className={styles.rowActions}>
                              <button
                                className={styles.miniBtn}
                                onClick={() => navigate(`/properties/${lId}`)}
                              >
                                View
                              </button>
                              <button
                                className={styles.miniBtn}
                                onClick={() => navigate(`/listings/${lId}`)}
                              >
                                Edit
                              </button>
                              <button
                                className={styles.miniBtn}
                                onClick={() => handleToggleListingStatus(lId, l.status)}
                              >
                                {l.status === 'PUBLISHED' ? 'Pause' : 'Publish'}
                              </button>
                              <button
                                className={`${styles.miniBtn} ${styles.dangerBtn}`}
                                onClick={() => handleDeleteListing(lId)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. Bookings Panel (Owner) */}
        {activeTab === 'bookings' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tenant Booking Requests</h3>
            </div>

            {ownerBookings.length === 0 ? (
              <div className={styles.emptyPanel}>
                <div className={styles.emptyPanelIcon}>📅</div>
                <h3>No Booking Requests Yet</h3>
                <p>Incoming reservation requests from verified tenants will appear here.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Guest</th>
                      <th>Dates</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerBookings.map((b) => {
                      const bId = b.id || b.bookingId;
                      return (
                        <tr key={bId}>
                          <td><strong>{b.listing?.title}</strong></td>
                          <td>
                            <div>{b.user?.name || b.user?.username}</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email}</span>
                          </td>
                          <td>{b.startDate} to {b.endDate}</td>
                          <td><strong>${Number(b.totalPrice || 0).toLocaleString()}</strong></td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles['status' + b.bookingStatus]}`}>
                              {b.bookingStatus}
                            </span>
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              {b.bookingStatus === 'PENDING' && (
                                <>
                                  <button
                                    className={styles.miniBtn}
                                    style={{ color: '#065f46', borderColor: '#a7f3d0' }}
                                    onClick={() => handleUpdateBooking(bId, 'CONFIRMED')}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    className={`${styles.miniBtn} ${styles.dangerBtn}`}
                                    onClick={() => {
                                      const reason = prompt('Rejection reason (optional):');
                                      handleUpdateBooking(bId, 'REJECTED', reason);
                                    }}
                                  >
                                    Decline
                                  </button>
                                </>
                              )}
                              {b.bookingStatus === 'CONFIRMED' && (
                                <button
                                  className={`${styles.miniBtn} ${styles.dangerBtn}`}
                                  onClick={() => handleUpdateBooking(bId, 'CANCELLED', 'Cancelled by owner')}
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. Enquiries Panel (Owner) */}
        {activeTab === 'enquiries' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inquiries & Viewing Leads</h3>
            </div>

            {inboxMessages.length === 0 ? (
              <div className={styles.emptyPanel}>
                <div className={styles.emptyPanelIcon}>💬</div>
                <h3>No Inquiries Yet</h3>
                <p>When prospective tenants enquire or book viewings, they will appear here.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Prospect</th>
                      <th>Message</th>
                      <th>Viewing Date</th>
                      <th>Lead Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inboxMessages.map((m) => {
                      const mId = m.id || m.messageId;
                      return (
                        <tr key={mId}>
                          <td><strong>{m.listing?.title || 'General'}</strong></td>
                          <td>
                            <div>{m.senderEmail || m.sender?.email}</div>
                            {m.senderPhone && <span style={{ fontSize: '0.75rem' }}>📞 {m.senderPhone}</span>}
                          </td>
                          <td style={{ maxWidth: '240px' }}>{m.messageText}</td>
                          <td>{m.viewingDate ? new Date(m.viewingDate).toLocaleDateString() : '—'}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles['status' + m.status]}`}>
                              {m.status}
                            </span>
                          </td>
                          <td>
                            <select
                              className={styles.miniBtn}
                              value={m.status}
                              onChange={(e) => handleUpdateLeadStatus(mId, e.target.value)}
                            >
                              <option value="NEW">NEW</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="SCHEDULED">SCHEDULED</option>
                              <option value="CLOSED">CLOSED</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. Tenant: My Reservations */}
        {activeTab === 'my_bookings' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Property Reservations</h3>
              <button className="btn-primary" onClick={() => navigate('/properties')}>
                Browse Properties
              </button>
            </div>

            {myBookings.length === 0 ? (
              <div className={styles.emptyPanel}>
                <div className={styles.emptyPanelIcon}>📅</div>
                <h3>No Active Reservations</h3>
                <p>Explore properties and submit a booking request to secure your next rental home.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Dates</th>
                      <th>Guests</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBookings.map((b) => {
                      const bId = b.id || b.bookingId;
                      return (
                        <tr key={bId}>
                          <td>
                            <strong>{b.listing?.title}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.listing?.location}</div>
                          </td>
                          <td>{b.startDate} to {b.endDate}</td>
                          <td>{b.guestsCount || 1}</td>
                          <td><strong>${Number(b.totalPrice || 0).toLocaleString()}</strong></td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles['status' + b.bookingStatus]}`}>
                              {b.bookingStatus}
                            </span>
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              {b.bookingStatus === 'PENDING' && (
                                <button
                                  className="btn-primary"
                                  style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                                  onClick={() => handlePayBooking(b)}
                                >
                                  Pay & Confirm
                                </button>
                              )}
                              {b.bookingStatus === 'CONFIRMED' && (
                                <span style={{ color: '#065f46', fontSize: '0.8rem', fontWeight: 700 }}>
                                  ✓ Paid & Confirmed
                                </span>
                              )}
                              {b.bookingStatus !== 'CANCELLED' && (
                                <button
                                  className={`${styles.miniBtn} ${styles.dangerBtn}`}
                                  onClick={() => handleUpdateBooking(bId, 'CANCELLED')}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. Tenant: Saved Favorites */}
        {activeTab === 'my_favorites' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Saved Favorite Homes</h3>
            </div>

            {favorites.length === 0 ? (
              <div className={styles.emptyPanel}>
                <div className={styles.emptyPanelIcon}>❤️</div>
                <h3>No Saved Properties</h3>
                <p>Click the heart icon on any property in the marketplace to save it here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {favorites.map((p) => {
                  const pId = p.id || p.listingId;
                  return (
                    <PropertyCard
                      key={pId}
                      property={p}
                      isFavorite={true}
                      onToggleFavorite={async () => {
                        await toggleFavoriteApi(pId);
                        setFavorites((prev) => prev.filter((item) => (item.id || item.listingId) !== pId));
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 6. Tenant: My Inquiries */}
        {activeTab === 'my_enquiries' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inquiries Sent</h3>
            </div>

            {sentMessages.length === 0 ? (
              <div className={styles.emptyPanel}>
                <div className={styles.emptyPanelIcon}>💬</div>
                <h3>No Messages Sent</h3>
                <p>When you contact property agents or request viewings, copies will appear here.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Message</th>
                      <th>Viewing Date</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentMessages.map((m) => (
                      <tr key={m.id || m.messageId}>
                        <td><strong>{m.listing?.title || 'General'}</strong></td>
                        <td style={{ maxWidth: '300px' }}>{m.messageText}</td>
                        <td>{m.viewingDate ? new Date(m.viewingDate).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles['status' + m.status]}`}>
                            {m.status}
                          </span>
                        </td>
                        <td>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 7. Admin: Users Management */}
        {admin && activeTab === 'admin_users' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Platform User Management</h3>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Verified</th>
                    <th>Change Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name || u.username}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={styles.roleBadge}>{u.role}</span>
                      </td>
                      <td>{u.verified ? '✓ Verified' : '—'}</td>
                      <td>
                        <select
                          className={styles.miniBtn}
                          value={u.role}
                          onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        >
                          <option value="TENANT">TENANT</option>
                          <option value="OWNER">OWNER</option>
                          <option value="AGENT">AGENT</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className={styles.miniBtn}
                          onClick={() => handleToggleVerification(u.id)}
                        >
                          {u.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. Admin: Reports Moderation */}
        {admin && activeTab === 'admin_reports' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Marketplace Violation Reports</h3>
            </div>

            {adminReports.length === 0 ? (
              <div className={styles.emptyPanel}>
                <div className={styles.emptyPanelIcon}>✓</div>
                <h3>All Clear</h3>
                <p>No open violation or spam reports on the marketplace.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Reason</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminReports.map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.listing?.title}</strong></td>
                        <td style={{ color: '#ef4444', fontWeight: 600 }}>{r.reason}</td>
                        <td>{r.details || '—'}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles['status' + r.status]}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            {r.status === 'OPEN' && (
                              <>
                                <button
                                  className={styles.miniBtn}
                                  style={{ color: '#065f46' }}
                                  onClick={() => handleResolveReport(r.id, 'RESOLVED')}
                                >
                                  Mark Resolved
                                </button>
                                <button
                                  className={styles.miniBtn}
                                  onClick={() => handleResolveReport(r.id, 'DISMISSED')}
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 9. Admin: Audit Logs */}
        {admin && activeTab === 'admin_logs' && (
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>System Audit Trail</h3>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Entity</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                      </td>
                      <td><strong>{log.action}</strong></td>
                      <td>{log.actorUsername}</td>
                      <td>{log.entityType} #{log.entityId}</td>
                      <td>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

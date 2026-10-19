import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 (excluding public endpoints)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicGet = error.config?.method === 'get' && (
      error.config?.url?.startsWith('/listings') ||
      error.config?.url?.startsWith('/categories') ||
      error.config?.url?.startsWith('/reviews')
    );
    const isAuthRequest = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/register');

    if (error.response?.status === 401 && !isPublicGet && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const loginApi            = (data) => api.post('/auth/login', data);
export const registerApi         = (data) => api.post('/auth/register', data);
export const fetchCurrentUserApi = ()     => api.get('/auth/me');

// ── Listings / Properties ─────────────────────────────────
export const fetchListingsApi       = (params) => api.get('/listings', { params });
export const fetchPropertiesApi     = (params) => api.get('/listings', { params });
export const fetchMyListingsApi     = ()       => api.get('/listings/my');
export const fetchListingById       = (id)     => api.get(`/listings/${id}`);
export const createListingApi       = (data)   => api.post('/listings', data);
export const updateListingApi       = (id, d)  => api.put(`/listings/${id}`, d);
export const deleteListingApi       = (id)     => api.delete(`/listings/${id}`);
export const updateListingStatusApi = (id, st) => api.patch(`/listings/${id}/status`, { status: st });

// ── Categories ────────────────────────────────────────────
export const fetchCategoriesApi     = () => api.get('/categories');

// ── Bookings ──────────────────────────────────────────────
export const fetchBookings          = ()             => api.get('/bookings');
export const fetchMyBookingsApi     = ()             => api.get('/bookings');
export const fetchOwnerBookingsApi  = ()             => api.get('/bookings/owner');
export const fetchBookingById       = (id)           => api.get(`/bookings/${id}`);
export const createBookingApi       = (data)         => api.post('/bookings', data);
export const updateBookingStatusApi = (id, st, r)    => api.patch(`/bookings/${id}/status`, { status: st, reason: r });
export const updateBookingApi       = (id, data)     => api.patch(`/bookings/${id}/status`, data);
export const deleteBookingApi       = (id)           => api.patch(`/bookings/${id}/status`, { status: 'CANCELLED' });

// ── Payments ──────────────────────────────────────────────
export const fetchPaymentsApi          = ()       => api.get('/payments');
export const fetchPaymentForBookingApi = (bkId)   => api.get(`/payments/booking/${bkId}`);
export const processPaymentApi         = (data)   => api.post('/payments', data);

// ── Reviews ───────────────────────────────────────────────
export const fetchReviewsApi          = ()       => api.get('/reviews');
export const fetchReviewsByListingApi = (listId) => api.get(`/reviews/listing/${listId}`);
export const submitReviewApi          = (data)   => api.post('/reviews', data);

// ── Messages / Enquiries ──────────────────────────────────
export const fetchMessagesApi    = ()         => api.get('/messages/inbox');
export const fetchInboxApi       = ()         => api.get('/messages/inbox');
export const fetchSentApi        = ()         => api.get('/messages/sent');
export const sendPublicEnquiryApi = (data)     => api.post('/messages/enquire', data);
export const markMessageReadApi  = (id)       => api.patch(`/messages/${id}/read`);
export const updateLeadStatusApi = (id, st)   => api.patch(`/messages/${id}/status`, { status: st });

// ── Reminders ─────────────────────────────────────────────
export const fetchRemindersApi       = ()       => api.get('/reminders');
export const createReminderApi       = (data)   => api.post('/reminders', data);
export const updateReminderApi       = (id, d)  => api.put(`/reminders/${id}`, d);
export const toggleReminderStatusApi = (id)     => api.patch(`/reminders/${id}/toggle`);
export const deleteReminderApi       = (id)     => api.delete(`/reminders/${id}`);

// ── Favorites ─────────────────────────────────────────────
export const fetchFavoritesApi  = ()       => api.get('/favorites');
export const fetchFavoriteIdsApi = ()      => api.get('/favorites/ids');
export const toggleFavoriteApi  = (listId) => api.post(`/favorites/${listId}/toggle`);

// ── Reports ───────────────────────────────────────────────
export const submitReportApi    = (data)   => api.post('/reports', data);

// ── Admin ─────────────────────────────────────────────────
export const fetchAdminStatsApi         = ()           => api.get('/admin/stats');
export const fetchAdminUsersApi         = ()           => api.get('/admin/users');
export const updateUserRoleApi          = (uId, role)  => api.patch(`/admin/users/${uId}/role`, { role });
export const toggleUserVerificationApi  = (uId)        => api.patch(`/admin/users/${uId}/verify`);
export const moderateListingApi         = (id, status) => api.patch(`/admin/listings/${id}/moderate`, { status });
export const fetchAdminReportsApi       = ()           => api.get('/admin/reports');
export const resolveReportApi           = (id, status) => api.patch(`/admin/reports/${id}/resolve`, { status });
export const fetchAuditLogsApi          = ()           => api.get('/admin/audit-logs');

export default api;

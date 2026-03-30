import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const loginApi    = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);

// ── Listings / Properties ──────────────────────────────────────────────
export const fetchListingsApi    = (params) => api.get('/listings', { params });
export const fetchPropertiesApi  = (params) => api.get('/listings', { params });
export const fetchListingById     = (id)     => api.get(`/listings/${id}`);
export const createListingApi     = (data)   => api.post('/listings', data);
export const updateListingApi     = (id, d)  => api.put(`/listings/${id}`, d);
export const deleteListingApi     = (id)     => api.delete(`/listings/${id}`);

// ── Bookings ──────────────────────────────────────────────
export const fetchBookings       = ()           => api.get('/bookings');
export const fetchBookingById    = (id)         => api.get(`/bookings/${id}`);
export const createBookingApi    = (data)       => api.post('/bookings', data);
export const updateBookingApi    = (id, data)   => api.put(`/bookings/${id}`, data);
export const deleteBookingApi    = (id)         => api.delete(`/bookings/${id}`);

// ── Payments, Reviews, Messages ──────────────
export const fetchPaymentsApi    = () => api.get('/payments');
export const fetchReviewsApi     = () => api.get('/reviews');
export const fetchMessagesApi    = () => api.get('/messages');
export const fetchCategoriesApi  = () => api.get('/categories');
export const fetchRemindersApi   = () => api.get('/reminders');

export default api;

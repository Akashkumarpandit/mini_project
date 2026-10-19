import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './services/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import ListingDetails from './pages/ListingDetails';
import CalendarView from './pages/CalendarView';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '64px', minHeight: '100vh' }}>
        {children}
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/properties"
          element={
            <AppLayout>
              <Properties />
            </AppLayout>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <AppLayout>
              <PropertyDetails />
            </AppLayout>
          }
        />

        {/* Protected Authenticated Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/listings/new"
          element={
            <PrivateRoute>
              <AppLayout>
                <ListingDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/listings/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <ListingDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <AppLayout>
                <CalendarView />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/properties" replace />} />
        <Route path="*" element={<Navigate to="/properties" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

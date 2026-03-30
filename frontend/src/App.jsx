import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './services/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ListingDetails from './pages/ListingDetails';
import CalendarView from './pages/CalendarView';
import Navbar from './components/Navbar';
import Properties from './pages/Properties';

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
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout><Dashboard /></AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/listings/:id"
          element={
            <PrivateRoute>
              <AppLayout><ListingDetails /></AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/listings/new"
          element={
            <PrivateRoute>
              <AppLayout><ListingDetails /></AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/properties"
          element={
            <PrivateRoute>
              <AppLayout><Properties /></AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <AppLayout><CalendarView /></AppLayout>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to={isLoggedIn() ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

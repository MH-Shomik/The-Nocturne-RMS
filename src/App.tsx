// Main App component with routing and authentication
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store';
import { authService } from './services/authService';

// Page components
import LandingPage from './pages/Landing/LandingPage';
import DietaryMenuPage from './pages/DietaryMenu/DietaryMenuPage';
import ReservationPage from './pages/Reservation/ReservationPage';
import KitchenDisplayPage from './pages/KitchenDisplay/KitchenDisplayPage';
import ManagementPage from './pages/Management/ManagementPage';
import LoginPage from './pages/Auth/LoginPage';

// Layout components
import MainLayout from './components/MainLayout';
import BrandedLoader from './components/ui/BrandedLoader';
import ErrorBoundary from './components/ErrorBoundary';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { user, setUser, isLoading, setLoading } = useAppStore();

  // Initialize authentication state
  useEffect(() => {
    setLoading(true);

    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [setUser, setLoading]);


  // Show branded loading experience
  if (isLoading) {
    return <BrandedLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-deep-black text-light-gray">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/menu" element={
                <Navigate to="/" replace />
              } />

              <Route path="/dietary-menu" element={<DietaryMenuPage />} />

              <Route path="/reservations" element={<ReservationPage />} />

              {/* Authentication */}
              <Route
                path="/login"
                element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
              />

              {/* Protected routes */}
              <Route path="/kitchen" element={
                <ProtectedRoute requiredRole={['admin', 'kitchen']}>
                  <KitchenDisplayPage />
                </ProtectedRoute>
              } />

              <Route path="/management" element={
                <ProtectedRoute requiredRole="admin">
                  <ManagementPage />
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardRedirect />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

// Dashboard redirect based on user role
const DashboardRedirect: React.FC = () => {
  const { user } = useAppStore();

  if (!user) return <Navigate to="/login" replace />;

  // Redirect based on user role
  switch (user.role) {
    case 'kitchen':
      return <Navigate to="/kitchen" replace />;
    case 'admin':
      return <Navigate to="/management" replace />;
    case 'host':
      return <Navigate to="/reservations" replace />;
    default:
      return <Navigate to="/menu" replace />;
  }
};

// Protected route component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: 'admin' | 'kitchen' | 'host' | Array<'admin' | 'kitchen' | 'host'>;
}> = ({ children, requiredRole }) => {
  const { user } = useAppStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const hasAccess = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role as 'admin' | 'kitchen' | 'host')
      : user.role === requiredRole || user.role === 'admin'; // Admin has access to everything

    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default App;
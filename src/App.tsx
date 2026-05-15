import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SiteDataProvider } from './contexts/SiteDataContext';
import { AnalyticsProvider, useAnalytics } from './contexts/AnalyticsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';
import RequestPage from './pages/RequestPage';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import ContentPage from './pages/admin/ContentPage';
import PagesPage from './pages/admin/PagesPage';
import MessagesPage from './pages/admin/MessagesPage';
import UsersPage from './pages/admin/UsersPage';
import SettingsPage from './pages/admin/SettingsPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SocialNetworksPage from './pages/admin/SocialNetworksPage';
import CategoryEditor from './pages/admin/CategoryEditor';

// Protected admin route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

// Component to track page visits
function PageTracker() {
  const { trackVisit } = useAnalytics();
  const location = useLocation();

  // Track page visits when location changes
  useEffect(() => {
    // Map route paths to readable page names
    const pageNames: Record<string, string> = {
      '/': 'Главная',
      '/catalog': 'Каталог',
      '/about': 'О нас',
      '/contacts': 'Контакты',
      '/request': 'Заявка',
    };

    const pageName = pageNames[location.pathname] || location.pathname;
    trackVisit(pageName);
  }, [location.pathname, trackVisit]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <PageTracker />
      <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <>
            <Header />
            <HomePage />
            <Footer />
          </>
        }
      />
      <Route
        path="/catalog"
        element={
          <>
            <Header />
            <CatalogPage />
            <Footer />
          </>
        }
      />
      <Route
        path="/about"
        element={
          <>
            <Header />
            <AboutPage />
            <Footer />
          </>
        }
      />
      <Route
        path="/contacts"
        element={
          <>
            <Header />
            <ContactsPage />
            <Footer />
          </>
        }
      />
      <Route
        path="/request"
        element={
          <>
            <Header />
            <RequestPage />
            <Footer />
          </>
        }
      />

      {/* Admin routes */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <DashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <ProductsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/pages"
        element={
          <AdminRoute>
            <PagesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <AdminRoute>
            <MessagesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/content"
        element={
          <AdminRoute>
            <ContentPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <AnalyticsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/socials"
        element={
          <AdminRoute>
            <SocialNetworksPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <SettingsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <CategoryEditor />
          </AdminRoute>
        }
      />
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AnalyticsProvider>
          <SiteDataProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <AppRoutes />
              </div>
            </AuthProvider>
          </SiteDataProvider>
        </AnalyticsProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

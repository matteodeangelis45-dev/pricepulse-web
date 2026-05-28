import { useState, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { AddProductModal } from './components/products/AddProductModal';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MarketOverviewPage } from './pages/MarketOverviewPage';
import { ProductComparisonPage } from './pages/ProductComparisonPage';
import { CategoryMarketPage } from './pages/CategoryMarketPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import type { Product } from './lib/database.types';

type Page = 'dashboard' | 'products' | 'market' | 'compare' | 'categories' | 'alerts' | 'settings';

export default function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [productRefreshKey, setProductRefreshKey] = useState(0);

  const handleProductAdded = useCallback((_product: Product) => {
    setProductRefreshKey(k => k + 1);
  }, []);

  const handleViewProduct = useCallback((id: string) => {
    setSelectedProductId(id);
  }, []);

  const handleBackFromProduct = useCallback(() => {
    setSelectedProductId(null);
  }, []);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
    setSelectedProductId(null);
  }, []);

  // Global loading state while session is being restored
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-text-muted">Loading PricePulse...</p>
        </div>
      </div>
    );
  }

  // Protected routes: redirect to auth if not logged in
  if (!user) return <AuthPage />;

  const renderPage = () => {
    if (selectedProductId) {
      return (
        <ProductDetailPage
          productId={selectedProductId}
          onBack={handleBackFromProduct}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            onAddProduct={() => setShowAddModal(true)}
            onViewProduct={handleViewProduct}
            refreshKey={productRefreshKey}
          />
        );
      case 'products':
        return (
          <ProductsPage
            onAddProduct={() => setShowAddModal(true)}
            onViewProduct={handleViewProduct}
            refreshKey={productRefreshKey}
          />
        );
      case 'alerts':
        return <AlertsPage onAlertsChange={setUnreadAlerts} />;
      case 'market':
        return <MarketOverviewPage />;
      case 'compare':
        return <ProductComparisonPage />;
      case 'categories':
        return <CategoryMarketPage />;
      case 'settings':
        return <SettingsPage />;
    }
  };

  return (
    <>
      <AppLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onAddProduct={() => setShowAddModal(true)}
        unreadAlerts={unreadAlerts}
      >
        {renderPage()}
      </AppLayout>

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdded={handleProductAdded}
        />
      )}
    </>
  );
}

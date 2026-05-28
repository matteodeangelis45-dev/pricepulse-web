import { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

type Page = 'dashboard' | 'products' | 'market' | 'compare' | 'categories' | 'alerts' | 'settings';

interface AppLayoutProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onAddProduct: () => void;
  unreadAlerts: number;
}

export function AppLayout({ children, currentPage, onNavigate, onAddProduct, unreadAlerts }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        unreadAlerts={unreadAlerts}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentPage={currentPage}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
          onAddProduct={onAddProduct}
          unreadAlerts={unreadAlerts}
          onNavigate={onNavigate}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

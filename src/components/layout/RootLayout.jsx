/**
 * RootLayout - Master Layout kết hợp Sidebar + Header + Content Area
 * Responsive: Sidebar ẩn trên mobile, toggle bằng nút menu
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from '../auth/ProtectedRoute';

export default function RootLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="lg:ml-64 min-h-screen flex flex-col">
          {/* Header */}
          <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

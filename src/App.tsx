/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RouterProvider, useRouter } from './router/Router';
import { CafeProvider } from './context/CafeContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { TableModal } from './components/common/TableModal';
import { Footer } from './components/layout/Footer';
import { BottomCartBar } from './components/cart/BottomCartBar';
import { CustomerMenuPage } from './pages/CustomerMenuPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { CashierPage } from './pages/CashierPage';

const AppContent: React.FC = () => {
  const { currentRoute } = useRouter();
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // If cashier route, display cashier dashboard full screen
  if (currentRoute === '/cashier') {
    return <CashierPage />;
  }

  // Customer facing layout (Desktop & Mobile optimized)
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      <Navbar onOpenTableModal={() => setIsTableModalOpen(true)} />

      <main className="flex-1 pb-24 md:pb-8">
        {currentRoute === '/' && <CustomerMenuPage />}
        {currentRoute === '/cart' && <CartPage />}
        {currentRoute === '/checkout' && <CheckoutPage />}
        {currentRoute === '/order-success' && <OrderSuccessPage />}
      </main>

      {/* Floating active cart/order status bar */}
      <BottomCartBar />

      {/* Mobile thumb-friendly bottom navigation bar */}
      <MobileBottomNav onOpenTableModal={() => setIsTableModalOpen(true)} />

      {/* Shared Table QR Modal */}
      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <RouterProvider>
      <CafeProvider>
        <AppContent />
      </CafeProvider>
    </RouterProvider>
  );
}

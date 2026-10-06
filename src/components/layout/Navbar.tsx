import React, { useState } from 'react';
import { useCafe } from '../../context/CafeContext';
import { useRouter, Link } from '../../router/Router';
import { ShoppingBag, Utensils, QrCode, Shield, Check, Clock, ChefHat, BellRing, CheckCheck } from 'lucide-react';

export const Navbar: React.FC<{ onOpenTableModal?: () => void }> = ({ onOpenTableModal }) => {
  const { tableNumber, setTableNumber, cartItemCount, currentOrder, tableOrders } = useCafe();
  const { currentRoute, navigate } = useRouter();
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tempTable, setTempTable] = useState(tableNumber);

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTable.trim()) {
      setTableNumber(tempTable.trim());
      setIsTableModalOpen(false);
    }
  };

  // Helper for live order status badge styling in navbar
  const getStatusBadge = () => {
    if (!currentOrder) return null;
    switch (currentOrder.status) {
      case 'new':
        return {
          label: 'Received',
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'preparing':
        return {
          label: 'Preparing',
          bg: 'bg-blue-100 text-blue-900 border-blue-200',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'ready':
        return {
          label: 'Ready to Serve!',
          bg: 'bg-purple-100 text-purple-900 border-purple-200 font-bold',
          dot: 'bg-purple-600 animate-ping',
        };
      case 'completed':
        return {
          label: 'Served',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          dot: 'bg-emerald-500',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Zone 1: Single text wordmark */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-50 flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-stone-900 font-serif leading-none">
                CafeOrder
              </span>
              <span className="text-[10px] uppercase tracking-wider text-stone-500 font-sans mt-0.5">
                Table QR Ordering
              </span>
            </div>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link
              to="/"
              className={`transition-colors hover:text-stone-950 ${
                currentRoute === '/' ? 'text-stone-950 font-semibold' : ''
              }`}
            >
              Menu
            </Link>

            {/* Placed Order Tracker Link (shows live status if order exists) */}
            <Link
              to="/order-success"
              className={`flex items-center gap-1.5 transition-colors hover:text-stone-950 ${
                currentRoute === '/order-success' ? 'text-stone-950 font-semibold' : ''
              }`}
            >
              <span>Track Order</span>
              {statusBadge && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${statusBadge.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                  <span>{statusBadge.label}</span>
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className={`transition-colors hover:text-stone-950 ${
                currentRoute === '/cart' ? 'text-stone-950 font-semibold' : ''
              }`}
            >
              Cart
            </Link>

            <Link
              to="/cashier"
              className="text-stone-500 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              <span>Cashier Terminal</span>
            </Link>
          </nav>

          {/* Zone 3: Actions (Active Order Chip + Table Pill + Cart CTA) */}
          <div className="flex items-center gap-2">
            {/* Mobile/Compact Live Order Tracker Pill */}
            {currentOrder && (
              <button
                type="button"
                onClick={() => navigate('/order-success')}
                className={`flex sm:hidden items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] text-xs font-semibold rounded-xl border transition-all touch-manipulation cursor-pointer ${
                  statusBadge?.bg || 'bg-stone-100 text-stone-800'
                }`}
                title="View live order status"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge?.dot || 'bg-amber-500'}`} />
                <span className="truncate max-w-[80px]">#{currentOrder.orderCode}</span>
              </button>
            )}

            {/* Table Number Button */}
            <button
              type="button"
              onClick={() => {
                if (onOpenTableModal) {
                  onOpenTableModal();
                } else {
                  setTempTable(tableNumber);
                  setIsTableModalOpen(true);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-colors border border-stone-200 cursor-pointer active:scale-95 touch-manipulation"
              title="Click to change table"
            >
              <QrCode className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              <span>Table {tableNumber}</span>
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className={`relative flex items-center gap-2 px-3.5 py-2 min-h-[44px] text-xs font-semibold rounded-xl transition-all cursor-pointer active:scale-95 touch-manipulation ${
                cartItemCount > 0
                  ? 'bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 border border-stone-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-amber-400 text-stone-950 text-[11px] font-bold px-1.5 py-0.2 rounded-md font-mono">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Table Change Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-800">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-stone-900">Your Table Number</h3>
              </div>
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-xl font-medium leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Detected from QR code. If you changed tables, enter the updated table number below.
            </p>

            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Table Number
                </label>
                <input
                  type="text"
                  value={tempTable}
                  onChange={(e) => setTempTable(e.target.value)}
                  placeholder="e.g. 12, 04, T-09"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 font-mono font-medium"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsTableModalOpen(false)}
                  className="flex-1 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

import React from 'react';
import { useRouter } from '../../router/Router';
import { useCafe } from '../../context/CafeContext';
import { Utensils, BellRing, ShoppingBag, QrCode } from 'lucide-react';

export const MobileBottomNav: React.FC<{ onOpenTableModal: () => void }> = ({ onOpenTableModal }) => {
  const { currentRoute, navigate } = useRouter();
  const { cartItemCount, currentOrder, tableNumber } = useCafe();

  // Hide on Cashier Terminal
  if (currentRoute === '/cashier') {
    return null;
  }

  const isMenu = currentRoute === '/';
  const isOrder = currentRoute === '/order-success';
  const isCart = currentRoute === '/cart' || currentRoute === '/checkout';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg pb-safe"
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
        {/* Tab 1: Menu */}
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors cursor-pointer ${
            isMenu ? 'text-stone-950 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Utensils className={`w-5 h-5 ${isMenu ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {isMenu && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-900" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Menu</span>
        </button>

        {/* Tab 2: Track Order */}
        <button
          onClick={() => navigate('/order-success')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative cursor-pointer ${
            isOrder ? 'text-stone-950 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <BellRing className={`w-5 h-5 ${isOrder ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {currentOrder && (
              <span
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  currentOrder.status === 'ready'
                    ? 'bg-purple-600 animate-ping'
                    : currentOrder.status === 'preparing'
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }`}
              />
            )}
            {isOrder && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-900" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">
            {currentOrder ? 'Live Order' : 'Track Order'}
          </span>
        </button>

        {/* Tab 3: Cart */}
        <button
          onClick={() => navigate('/cart')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors relative cursor-pointer ${
            isCart ? 'text-stone-950 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${isCart ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-stone-950 font-mono text-[9px] font-bold px-1 rounded-full min-w-[15px] h-[15px] flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
            {isCart && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-stone-900" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Cart</span>
        </button>

        {/* Tab 4: Table */}
        <button
          onClick={onOpenTableModal}
          className="flex flex-col items-center justify-center min-h-[48px] py-1 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          title="View or change table"
        >
          <div className="relative">
            <QrCode className="w-5 h-5 stroke-2" />
          </div>
          <span className="text-[10px] tracking-tight mt-1 font-mono font-medium">
            T-{tableNumber}
          </span>
        </button>
      </div>
    </nav>
  );
};

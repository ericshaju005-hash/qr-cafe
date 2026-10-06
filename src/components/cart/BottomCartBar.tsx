import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { useRouter } from '../../router/Router';
import { ShoppingBag, ArrowRight, BellRing, ChefHat, Clock, CheckCircle2 } from 'lucide-react';

export const BottomCartBar: React.FC = () => {
  const { cartItemCount, cartTotal, tableNumber, currentOrder } = useCafe();
  const { navigate, currentRoute } = useRouter();

  // Hide on cart, checkout or order-success, or cashier routes
  if (currentRoute !== '/') {
    return null;
  }

  // STATE A: Unplaced items in shopping bag
  if (cartItemCount > 0) {
    return (
      <aside
        aria-label="Active Cart Summary"
        className="fixed bottom-[74px] md:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 max-w-md mx-auto sm:mx-0 z-40 animate-in slide-in-from-bottom-3 duration-200"
      >
        <div className="bg-stone-900 text-stone-50 rounded-2xl p-3 shadow-2xl border border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-amber-400 relative shrink-0">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-950 font-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-stone-400 flex items-center gap-1.5 font-sans truncate">
                <span>Table {tableNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</span>
              </div>
              <div className="text-base font-bold font-mono tabular-nums text-white">
                ₹{cartTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap touch-manipulation"
          >
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // STATE B: Cart is 0 items, BUT an active order exists for this table
  if (currentOrder) {
    const isReady = currentOrder.status === 'ready';
    const isPreparing = currentOrder.status === 'preparing';
    const isNew = currentOrder.status === 'new';

    return (
      <aside
        aria-label="Active Order Live Tracker"
        className="fixed bottom-[74px] md:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 max-w-md mx-auto sm:mx-0 z-40 animate-in slide-in-from-bottom-3 duration-200"
      >
        <div
          className={`rounded-2xl p-3 shadow-2xl border flex items-center justify-between gap-3 transition-colors ${
            isReady
              ? 'bg-purple-950 text-purple-100 border-purple-800 ring-2 ring-purple-400'
              : 'bg-stone-900 text-stone-50 border-stone-800'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isReady
                  ? 'bg-purple-800 text-amber-300 animate-bounce'
                  : isPreparing
                  ? 'bg-blue-900 text-blue-200'
                  : 'bg-stone-800 text-amber-400'
              }`}
            >
              {isReady && <BellRing className="w-5 h-5" />}
              {isPreparing && <ChefHat className="w-5 h-5" />}
              {isNew && <Clock className="w-5 h-5" />}
              {currentOrder.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            </div>

            <div className="min-w-0">
              <div className="text-[11px] flex items-center gap-1.5 font-sans opacity-80 truncate">
                <span>Table {currentOrder.tableNumber}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">#{currentOrder.orderCode}</span>
              </div>
              <div className="text-xs font-bold font-sans truncate">
                {isReady && 'Ready to Serve! 🎉'}
                {isPreparing && 'Preparing in Kitchen...'}
                {isNew && 'Order Received'}
                {currentOrder.status === 'completed' && 'Order Completed'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/order-success')}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer whitespace-nowrap touch-manipulation active:scale-95 ${
              isReady
                ? 'bg-amber-400 text-stone-950 hover:bg-amber-300 font-bold'
                : 'bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700'
            }`}
          >
            <span>Track Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return null;
};

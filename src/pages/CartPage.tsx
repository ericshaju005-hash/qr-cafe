import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import { useRouter } from '../router/Router';
import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MessageSquare,
  QrCode,
  Clock,
  ChefHat,
  BellRing,
  CheckCircle2,
  Utensils,
  CreditCard,
  Shield,
  AlertCircle,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartItemCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    tableNumber,
    currentOrder,
    tableOrders,
  } = useCafe();

  const { navigate } = useRouter();
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [itemNoteInput, setItemNoteInput] = useState<string>('');

  const handleOpenNote = (cartItemId: string, currentNote?: string) => {
    setEditingNotesId(cartItemId);
    setItemNoteInput(currentNote || '');
  };

  const handleSaveNote = (cartItemId: string) => {
    const targetItem = cart.find((i) => i.id === cartItemId);
    if (targetItem) {
      targetItem.notes = itemNoteInput.trim() || undefined;
    }
    setEditingNotesId(null);
  };

  // Stepper definition for placed order
  const steps = [
    { key: 'new', label: 'Received', icon: Clock, desc: 'Ticket printed' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'Brewing & cooking' },
    { key: 'ready', label: 'Ready', icon: BellRing, desc: 'Serving to table' },
    { key: 'completed', label: 'Served', icon: CheckCircle2, desc: 'Complete' },
  ];

  // Helper for live order status badge
  const getStatusVisuals = (status: string) => {
    switch (status) {
      case 'new':
        return {
          title: 'Order Received',
          desc: 'Your ticket is registered and queued for the kitchen.',
          color: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'preparing':
        return {
          title: 'Preparing in Kitchen',
          desc: 'Baristas & kitchen staff are preparing your items fresh.',
          color: 'bg-blue-100 text-blue-900 border-blue-300',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'ready':
        return {
          title: 'Ready to Serve!',
          desc: 'Your food & coffee are ready for Table ' + tableNumber + '!',
          color: 'bg-purple-100 text-purple-900 border-purple-300 font-bold',
          dot: 'bg-purple-600 animate-ping',
        };
      case 'completed':
        return {
          title: 'Order Served & Completed',
          desc: 'Thank you for dining with us! Hope you enjoyed your meal.',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-500',
        };
      default:
        return {
          title: status,
          desc: '',
          color: 'bg-stone-100 text-stone-800 border-stone-200',
          dot: 'bg-stone-400',
        };
    }
  };

  // CASE 1: Shopping cart has 0 unplaced items BUT an order is already placed for this table!
  if (cartItemCount === 0 && currentOrder) {
    const currentStepIndex = steps.findIndex((s) => s.key === currentOrder.status);
    const visuals = getStatusVisuals(currentOrder.status);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors cursor-pointer min-h-[40px] touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-950 rounded-xl text-xs font-semibold">
            <QrCode className="w-3.5 h-3.5 text-amber-800" />
            <span>Table {currentOrder.tableNumber}</span>
          </div>
        </div>

        {/* Live Status Notification Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 mb-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  Order #{currentOrder.orderCode}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${visuals.color}`}
                >
                  <span className={`w-2 h-2 rounded-full ${visuals.dot}`} />
                  <span>{visuals.title}</span>
                </span>
              </div>
              <p className="text-xs text-stone-500">{visuals.desc}</p>
            </div>

            <div className="text-right sm:border-l sm:border-stone-100 sm:pl-4">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">
                Last Updated
              </span>
              <span className="text-xs font-mono font-semibold text-stone-800">
                {new Date(currentOrder.updatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Stepper */}
          <div className="pt-2">
            <div className="grid grid-cols-4 gap-2 relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-all ${
                        isCurrent
                          ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-100 font-bold'
                          : isCompleted
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] font-semibold leading-tight ${
                        isCompleted ? 'text-stone-900' : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-stone-400 hidden sm:block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Itemized Order Details Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 mb-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-serif text-base font-bold text-stone-900">
              Items Ordered for Table {currentOrder.tableNumber}
            </h2>
            <span className="text-xs text-stone-500 font-mono">
              {currentOrder.items.length} {currentOrder.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {currentOrder.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded">
                    {item.quantity}x
                  </span>
                  <div>
                    <span className="text-stone-900 font-medium">{item.name}</span>
                    {item.notes && (
                      <p className="text-[11px] text-amber-800 italic">"{item.notes}"</p>
                    )}
                  </div>
                </div>
                <span className="font-mono tabular-nums font-semibold text-stone-900">
                  ₹{item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Bill summary */}
          <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs text-stone-600 font-sans">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">₹{currentOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="font-mono tabular-nums">₹{currentOrder.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-100">
              <span>Total Bill</span>
              <span className="font-mono tabular-nums text-lg">₹{currentOrder.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-2 p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-stone-500" />
              <span className="text-stone-700">
                Payment ({currentOrder.paymentMethod.replace('_', ' ').toUpperCase()}):
              </span>
            </div>
            <span
              className={`font-semibold px-2.5 py-0.5 rounded-md text-[11px] uppercase tracking-wider ${
                currentOrder.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {currentOrder.paymentStatus === 'paid' ? 'Paid' : 'Unpaid (Pay at Counter)'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>Order Additional Food / Coffee</span>
          </button>

          <button
            onClick={() => navigate('/cashier')}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs tracking-wide transition-all border border-stone-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Open cashier terminal to update order status"
          >
            <Shield className="w-3.5 h-3.5 text-stone-600" />
            <span>Test via Cashier Terminal</span>
          </button>
        </div>
      </div>
    );
  }

  // CASE 2: No cart items and no active order yet
  if (cartItemCount === 0 && !currentOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
          Your cart is currently empty
        </h2>
        <p className="text-sm text-stone-500 mb-6 max-w-sm mx-auto">
          You haven't added any coffee or bites yet. Explore our handcrafted menu to start your order.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Café Menu</span>
        </button>
      </div>
    );
  }

  // CASE 3: Cart has unplaced items
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28">
      {/* Back and Title Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors cursor-pointer min-h-[40px] touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-xl text-xs font-semibold text-stone-800 border border-stone-200">
          <QrCode className="w-3.5 h-3.5 text-stone-600" />
          <span>Table {tableNumber}</span>
        </div>
      </div>

      {/* Active Order Notice if table already has an order being prepared */}
      {currentOrder && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div>
              <span className="font-bold text-amber-950">
                Active Order #{currentOrder.orderCode} ({currentOrder.status.toUpperCase()})
              </span>
              <p className="text-amber-800 text-[11px]">
                Your kitchen order is being prepared. Items in this cart will be added as an additional round.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/order-success')}
            className="px-3.5 py-2 min-h-[40px] bg-amber-200/90 hover:bg-amber-300 font-semibold text-amber-950 rounded-xl transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto touch-manipulation"
          >
            Track Active Order
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Items list */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Your Cart Selection ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
            </h1>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="divide-y divide-stone-200 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            {cart.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-3.5 items-start">
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200/60"
                  />

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-stone-900 leading-snug">
                        {item.name}
                      </h3>
                    </div>

                    <div className="text-xs font-mono tabular-nums text-stone-600">
                      ₹{item.price} each
                    </div>

                    {item.notes ? (
                      <div className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-amber-200/60 mt-1">
                        <MessageSquare className="w-3 h-3 text-amber-600" />
                        <span>"{item.notes}"</span>
                        <button
                          type="button"
                          onClick={() => handleOpenNote(item.id, item.notes)}
                          className="text-[10px] text-amber-700 underline ml-1 cursor-pointer"
                        >
                          edit
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenNote(item.id)}
                        className="text-[11px] text-stone-400 hover:text-stone-700 flex items-center gap-1 cursor-pointer pt-0.5"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Add kitchen note</span>
                      </button>
                    )}

                    {/* Note editor popup input */}
                    {editingNotesId === item.id && (
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={itemNoteInput}
                          onChange={(e) => setItemNoteInput(e.target.value)}
                          placeholder="e.g. Oat milk, extra hot, no sugar"
                          className="text-base sm:text-xs px-3 py-1.5 rounded-lg border border-stone-300 w-full max-w-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNote(item.id)}
                          className="text-xs font-semibold px-3 py-2 bg-stone-900 text-white rounded-lg cursor-pointer min-h-[36px]"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Quantity controls & Item total */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-stone-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>

                  <div className="flex items-center gap-1.5 bg-stone-100 rounded-xl p-1 border border-stone-200">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer active:scale-90 touch-manipulation"
                      title="Decrease"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold font-mono px-1 tabular-nums min-w-[1.2rem] text-center select-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer active:scale-90 touch-manipulation"
                      title="Increase"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-rose-100 text-stone-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer active:scale-90 touch-manipulation"
                      title="Remove"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add more items to order</span>
            </button>
          </div>
        </div>

        {/* Right: Order Summary Breakdown Card */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
            <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Bill Summary
            </h2>

            <div className="space-y-2.5 text-xs text-stone-600 font-sans">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums font-medium text-stone-900">
                  ₹{cartSubtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>GST (5% Café Tax)</span>
                <span className="font-mono tabular-nums font-medium text-stone-900">
                  ₹{cartTax.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-stone-200 pt-3 flex items-baseline justify-between">
                <span className="text-sm font-bold text-stone-900">Total Payable</span>
                <span className="text-lg font-bold font-mono tabular-nums text-stone-950">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-stone-400 text-center leading-relaxed">
              Serving to Table {tableNumber} · You can choose to pay at counter or via UPI on next step
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

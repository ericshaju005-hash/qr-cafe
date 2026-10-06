import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import { useRouter } from '../router/Router';
import { PaymentMethod } from '../types/cafe';
import {
  ArrowLeft,
  QrCode,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  UtensilsCrossed,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartItemCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    tableNumber,
    placeOrder,
  } = useCafe();

  const { navigate } = useRouter();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('counter_upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If cart is empty, redirect back to menu
  if (cartItemCount === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">No items to checkout</h2>
        <p className="text-xs text-stone-500 mb-4">Please add items from the menu first.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError('Please enter your name so the barista can identify your order.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Place order into context state
      const newOrder = placeOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        specialInstructions: specialInstructions.trim() || undefined,
        paymentMethod,
      });

      // Navigate to order success screen
      navigate('/order-success');
    } catch (err) {
      console.error(err);
      setFormError('Failed to submit order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors cursor-pointer min-h-[40px] touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-950 rounded-xl text-xs font-semibold">
          <QrCode className="w-3.5 h-3.5 text-amber-800" />
          <span>Table {tableNumber}</span>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 mb-1">
          Complete Your Order
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Confirm your table details and select how you would like to settle the bill.
        </p>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Dining Info & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Information Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-sans flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-mono">1</span>
                <span>Dining Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Eric S."
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-stone-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Mobile Number (optional)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-stone-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Kitchen or Dietary Requests (optional)
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Extra napkins, serve beverages first, mild spice"
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-stone-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 transition-colors"
                />
              </div>
            </div>

            {/* Payment Method Selection Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-sans flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-mono">2</span>
                <span>Choose Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Counter UPI */}
                <label
                  className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all touch-manipulation min-h-[96px] ${
                    paymentMethod === 'counter_upi'
                      ? 'border-stone-900 bg-stone-900/5 ring-1 ring-stone-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="counter_upi"
                    checked={paymentMethod === 'counter_upi'}
                    onChange={() => setPaymentMethod('counter_upi')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <Smartphone className="w-5 h-5 text-stone-800" />
                    {paymentMethod === 'counter_upi' && (
                      <CheckCircle2 className="w-4 h-4 text-stone-900" />
                    )}
                  </div>
                  <span className="font-semibold text-xs text-stone-900 mb-0.5">UPI QR</span>
                  <span className="text-[11px] text-stone-500 leading-snug">
                    Scan UPI QR directly at table or counter
                  </span>
                </label>

                {/* Counter Cash */}
                <label
                  className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all touch-manipulation min-h-[96px] ${
                    paymentMethod === 'counter_cash'
                      ? 'border-stone-900 bg-stone-900/5 ring-1 ring-stone-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="counter_cash"
                    checked={paymentMethod === 'counter_cash'}
                    onChange={() => setPaymentMethod('counter_cash')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <Banknote className="w-5 h-5 text-stone-800" />
                    {paymentMethod === 'counter_cash' && (
                      <CheckCircle2 className="w-4 h-4 text-stone-900" />
                    )}
                  </div>
                  <span className="font-semibold text-xs text-stone-900 mb-0.5">Pay at Counter</span>
                  <span className="text-[11px] text-stone-500 leading-snug">
                    Pay cash or card when collecting or leaving
                  </span>
                </label>

                {/* Card at Table POS */}
                <label
                  className={`relative flex flex-col p-4 rounded-xl border cursor-pointer transition-all touch-manipulation min-h-[96px] ${
                    paymentMethod === 'card_pos'
                      ? 'border-stone-900 bg-stone-900/5 ring-1 ring-stone-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card_pos"
                    checked={paymentMethod === 'card_pos'}
                    onChange={() => setPaymentMethod('card_pos')}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="w-5 h-5 text-stone-800" />
                    {paymentMethod === 'card_pos' && (
                      <CheckCircle2 className="w-4 h-4 text-stone-900" />
                    )}
                  </div>
                  <span className="font-semibold text-xs text-stone-900 mb-0.5">Card / POS</span>
                  <span className="text-[11px] text-stone-500 leading-snug">
                    Wireless handheld swipe machine to table
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary & Checkout Action */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-sans flex items-center gap-2 border-b border-stone-100 pb-3">
                <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-mono">3</span>
                <span>Order Summary ({cartItemCount} items)</span>
              </h2>

              <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="font-mono font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">
                        {item.quantity}x
                      </span>
                      <span className="text-stone-800 font-medium truncate">{item.name}</span>
                      {item.notes && (
                        <span className="text-[11px] text-amber-700 italic shrink-0">({item.notes})</span>
                      )}
                    </div>
                    <span className="font-mono tabular-nums font-semibold text-stone-900 shrink-0">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums font-medium text-stone-900">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-mono tabular-nums font-medium text-stone-900">₹{cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-100">
                  <span>Grand Total</span>
                  <span className="font-mono tabular-nums text-lg">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Order Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 min-h-[48px] rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70 touch-manipulation"
                >
                  <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  <span>{isSubmitting ? 'Sending to Kitchen...' : `Send Order to Kitchen (₹${cartTotal.toFixed(2)})`}</span>
                </button>
                <p className="text-[11px] text-stone-400 text-center mt-2.5">
                  Your ticket will immediately appear on the barista & kitchen terminal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

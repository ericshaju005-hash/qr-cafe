import React, { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import { useRouter } from '../router/Router';
import {
  CheckCircle2,
  Clock,
  QrCode,
  Utensils,
  ChefHat,
  BellRing,
  ArrowRight,
  Shield,
  CreditCard,
  RefreshCw,
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { currentOrder, tableOrders, orders, tableNumber, setCurrentOrder } = useCafe();
  const { navigate } = useRouter();

  // Find the selected order or most recent order for this table
  const activeOrder = currentOrder || tableOrders[0] || orders[0];

  if (!activeOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">No active order found</h2>
        <p className="text-xs text-stone-500 mb-4">You can browse our menu and place a fresh order.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg cursor-pointer"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const steps = [
    { key: 'new', label: 'Received', icon: Clock, desc: 'Ticket printed in kitchen' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'Brewing & cooking' },
    { key: 'ready', label: 'Ready', icon: BellRing, desc: 'Serving to your table' },
    { key: 'completed', label: 'Served', icon: CheckCircle2, desc: 'Enjoy your meal!' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === activeOrder.status);

  // Dynamic header configuration based on status
  const getHeaderInfo = () => {
    switch (activeOrder.status) {
      case 'new':
        return {
          icon: Clock,
          iconBg: 'bg-amber-100 text-amber-700',
          title: 'Order Sent to Kitchen!',
          desc: `Thank you, ${activeOrder.customer.name}! Your ticket is queued and barista has received it.`,
          statusTag: 'Received · Queued in Kitchen',
          tagClass: 'bg-amber-100 text-amber-900 border-amber-300',
        };
      case 'preparing':
        return {
          icon: ChefHat,
          iconBg: 'bg-blue-100 text-blue-700',
          title: 'Order is Being Prepared!',
          desc: `The kitchen & espresso bar are preparing your items fresh for Table ${activeOrder.tableNumber}.`,
          statusTag: 'In Kitchen · Preparing Fresh',
          tagClass: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'ready':
        return {
          icon: BellRing,
          iconBg: 'bg-purple-100 text-purple-700 ring-4 ring-purple-200 animate-bounce',
          title: 'Your Order is Ready to Serve! 🎉',
          desc: `Your items are ready at the pass and being served straight to Table ${activeOrder.tableNumber}!`,
          statusTag: 'Ready to Serve · Table ' + activeOrder.tableNumber,
          tagClass: 'bg-purple-100 text-purple-900 border-purple-300 font-bold',
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          iconBg: 'bg-emerald-100 text-emerald-700',
          title: 'Order Served & Completed',
          desc: `Hope you had a wonderful dining experience at Table ${activeOrder.tableNumber}!`,
          statusTag: 'Served & Settled',
          tagClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      default:
        return {
          icon: Clock,
          iconBg: 'bg-stone-100 text-stone-700',
          title: 'Order Status Update',
          desc: '',
          statusTag: activeOrder.status,
          tagClass: 'bg-stone-100 text-stone-800 border-stone-200',
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-28">
      {/* If table has multiple orders placed (e.g. initial round + dessert round) */}
      {tableOrders.length > 1 && (
        <div className="mb-6 bg-stone-100 border border-stone-200 p-2 rounded-xl flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-stone-500 pl-2 whitespace-nowrap">
            Table {tableNumber} Orders:
          </span>
          {tableOrders.map((ord) => (
            <button
              key={ord.id}
              onClick={() => setCurrentOrder(ord)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                ord.id === activeOrder.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200'
              }`}
            >
              #{ord.orderCode} ({ord.status.toUpperCase()})
            </button>
          ))}
        </div>
      )}

      {/* Dynamic Success Badge & Headline */}
      <div className="text-center space-y-3 mb-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-xs ${headerInfo.iconBg}`}>
          <HeaderIcon className="w-8 h-8" />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          {headerInfo.title}
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          {headerInfo.desc}
        </p>

        {/* Order Identifier & Table Pill */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 pt-1">
          <div className="inline-flex items-center gap-2.5 bg-stone-100 border border-stone-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-stone-800 font-mono">
            <span>Order #{activeOrder.orderCode}</span>
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1 text-stone-700 font-sans">
              <QrCode className="w-3.5 h-3.5 text-stone-500" />
              Table {activeOrder.tableNumber}
            </span>
          </div>

          <span className={`inline-flex items-center text-xs px-3 py-1.5 rounded-xl border ${headerInfo.tagClass}`}>
            {headerInfo.statusTag}
          </span>
        </div>
      </div>

      {/* Live Kitchen Status Stepper */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 mb-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Live Kitchen Tracker
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="text-xs font-mono font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
            Est. ~{activeOrder.estimatedPrepMinutes} mins
          </span>
        </div>

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
                      ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-100 font-bold scale-105'
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

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
          <span>Status updates automatically as cashier updates the terminal</span>
          <span className="font-mono">
            Updated: {new Date(activeOrder.updatedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Order Itemized Receipt Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 mb-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-serif text-base font-bold text-stone-900">
            Itemized Order Details
          </h2>
          <span className="text-xs text-stone-400 font-mono">
            {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {activeOrder.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-stone-900 w-5">
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

        {/* Payment Summary */}
        <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs text-stone-600 font-sans">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">₹{activeOrder.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span className="font-mono tabular-nums">₹{activeOrder.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-stone-950 pt-2 border-t border-stone-100">
            <span>Total Amount</span>
            <span className="font-mono tabular-nums text-lg">₹{activeOrder.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Status Notice */}
        <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-stone-500" />
            <span className="text-stone-700">
              Payment ({activeOrder.paymentMethod.replace('_', ' ').toUpperCase()}):
            </span>
          </div>
          <span
            className={`font-semibold px-2.5 py-0.5 rounded-md text-[11px] uppercase tracking-wider ${
              activeOrder.paymentStatus === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {activeOrder.paymentStatus === 'paid' ? 'Paid' : 'Unpaid (Pay at Counter)'}
          </span>
        </div>
      </div>

      {/* Navigation and Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full sm:flex-1 py-3 px-4 min-h-[44px] rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-98"
        >
          <Utensils className="w-4 h-4 text-amber-400" />
          <span>Order More Food & Coffee</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/cashier')}
          className="w-full sm:w-auto py-3 px-4 min-h-[44px] rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs tracking-wide transition-all border border-stone-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap touch-manipulation active:scale-98"
          title="Switch to Cashier Terminal to advance order status and verify live sync"
        >
          <Shield className="w-3.5 h-3.5 text-stone-600" />
          <span>Cashier Terminal (Test Sync)</span>
        </button>
      </div>
    </div>
  );
};

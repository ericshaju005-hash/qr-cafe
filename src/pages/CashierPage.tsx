import React, { useState, useMemo } from 'react';
import { useCafe } from '../context/CafeContext';
import { useRouter } from '../router/Router';
import { Order, OrderStatus, PaymentStatus } from '../types/cafe';
import { GoogleSheetModal } from '../components/sheets/GoogleSheetModal';
import {
  Shield,
  Search,
  PlusCircle,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  BellRing,
  CheckCheck,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  X,
  ArrowRight,
  LogOut,
  ArrowLeft,
  Filter,
  DollarSign,
  Utensils,
  Receipt,
  User,
  Coffee,
} from 'lucide-react';

export const CashierPage: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    updateOrderPaymentStatus,
    cashierAuth,
    loginCashier,
    logoutCashier,
    simulateIncomingOrder,
  } = useCafe();

  const { navigate } = useRouter();

  // Login Screen State
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [mobileActiveStage, setMobileActiveStage] = useState<'all' | 'new' | 'preparing' | 'ready' | 'completed'>('all');
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setLoginError('PIN must be at least 4 digits');
      return;
    }
    const success = loginCashier(pin);
    if (!success) {
      setLoginError('Invalid PIN. Use 1234 or click Quick Staff Demo.');
    } else {
      setLoginError(null);
      setPin('');
    }
  };

  const handleQuickLogin = () => {
    loginCashier('1234', 'Sarah Jenkins');
    setLoginError(null);
  };

  // Filter orders by search code / table / customer name and payment status
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Payment filter
      if (selectedPaymentFilter !== 'all' && ord.paymentStatus !== selectedPaymentFilter) {
        return false;
      }
      // Search query (order code, table number, or customer name)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesCode = ord.orderCode.toLowerCase().includes(query);
        const matchesTable = ord.tableNumber.toLowerCase().includes(query) || `table ${ord.tableNumber}`.includes(query);
        const matchesName = ord.customer.name.toLowerCase().includes(query);
        return matchesCode || matchesTable || matchesName;
      }
      return true;
    });
  }, [orders, searchQuery, selectedPaymentFilter]);

  // Group orders by section
  const newOrders = useMemo(() => filteredOrders.filter((o) => o.status === 'new'), [filteredOrders]);
  const preparingOrders = useMemo(() => filteredOrders.filter((o) => o.status === 'preparing'), [filteredOrders]);
  const readyOrders = useMemo(() => filteredOrders.filter((o) => o.status === 'ready'), [filteredOrders]);
  const completedOrders = useMemo(() => filteredOrders.filter((o) => o.status === 'completed'), [filteredOrders]);

  // Summary Metrics
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0),
    [orders]
  );
  const totalUnpaid = useMemo(
    () => orders.reduce((sum, o) => sum + (o.paymentStatus === 'unpaid' ? o.total : 0), 0),
    [orders]
  );

  // Sync selected order with latest state in orders
  const activeDetailOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find((o) => o.id === selectedOrder.id) || selectedOrder;
  }, [selectedOrder, orders]);

  // ----------------------------------------------------
  // LOGIN SCREEN (Placeholder & Authentication Portal)
  // ----------------------------------------------------
  if (!cashierAuth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
              Cashier Terminal
            </h1>
            <p className="text-xs text-stone-400">
              Staff POS & Kitchen Management System · Terminal POS-T1
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Enter 4-Digit Staff PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-[0.5em] text-2xl py-3 rounded-xl bg-stone-950 border border-stone-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                autoFocus
              />
            </div>

            {/* Quick Numpad Buttons for Tablet Friendly POS */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') setPin('');
                    else if (k === '⌫') setPin((p) => p.slice(0, -1));
                    else if (pin.length < 6) setPin((p) => p + k);
                  }}
                  className="py-3 text-sm font-semibold rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer active:scale-95"
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Sign In to Terminal
              </button>

              <button
                type="button"
                onClick={handleQuickLogin}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors cursor-pointer border border-stone-700"
              >
                Quick Staff Demo Login (Sarah J.)
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-stone-800 text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Menu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // CASHIER DASHBOARD (Desktop & Tablet Optimized)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F6F6F4] text-stone-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* POS Top Bar */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left Brand & Station Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-serif text-lg font-bold">
                C
              </div>
              <span className="font-serif text-lg font-bold text-white tracking-tight">
                CafeOrder POS
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-stone-400 pl-4 border-l border-stone-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{cashierAuth.terminalId}</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-300 font-sans">{cashierAuth.cashierName}</span>
              <span aria-hidden="true">·</span>
              <span>{cashierAuth.shift}</span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Google Sheets Menu & Pricing Manager Button */}
            <button
              type="button"
              onClick={() => setIsSheetsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-semibold text-emerald-950 bg-emerald-300 hover:bg-emerald-200 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95 touch-manipulation"
              title="Manage menu items and prices via Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-900 shrink-0" />
              <span><span className="hidden sm:inline">Google Sheets </span>Menu</span>
            </button>

            {/* Simulate Incoming Order Button */}
            <button
              type="button"
              onClick={() => {
                const sim = simulateIncomingOrder();
                showToast(`New QR order received: #${sim.orderCode} at Table ${sim.tableNumber}`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95 touch-manipulation"
              title="Add a sample QR order to test workflow"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Simulate</span> Order
            </button>

            {/* Exit to Customer View */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-2.5 sm:px-3 py-1.5 min-h-[36px] text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700 cursor-pointer touch-manipulation flex items-center gap-1"
              title="Return to customer menu view"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:hidden" />
              <span className="hidden sm:inline">Customer View</span>
              <span className="sm:hidden">Exit</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={logoutCashier}
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer touch-manipulation"
              title="Logout terminal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Metric Counters Ribbon */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3.5 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">
                New Tickets
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-stone-900">
                {orders.filter((o) => o.status === 'new').length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">
                In Kitchen
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-stone-900">
                {orders.filter((o) => o.status === 'preparing').length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">
                Ready to Serve
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-stone-900">
                {orders.filter((o) => o.status === 'ready').length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium block">
                Today's Settled
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-stone-900">
                ₹{totalRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Filter and Search Bar */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input: Order Code, Table, Customer */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code (e.g. CO-9102), Table (12), or name..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 text-stone-900 font-sans shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
            >
              &times;
            </button>
          )}
        </div>

        {/* Filters and View Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Payment Status Filter */}
          <div className="flex items-center bg-stone-200/80 p-1 rounded-xl text-xs font-semibold text-stone-600">
            <button
              onClick={() => setSelectedPaymentFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedPaymentFilter === 'all' ? 'bg-white text-stone-950 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              All Payments
            </button>
            <button
              onClick={() => setSelectedPaymentFilter('unpaid')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedPaymentFilter === 'unpaid' ? 'bg-white text-amber-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              Unpaid ({orders.filter((o) => o.paymentStatus === 'unpaid').length})
            </button>
            <button
              onClick={() => setSelectedPaymentFilter('paid')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedPaymentFilter === 'paid' ? 'bg-white text-emerald-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              Paid
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: 4 Columns (New, Preparing, Ready, Completed) */}
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 pb-12 flex-1">
        {/* Mobile Stage Selector Tabs (visible on mobile / small screens < lg) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-2">
          <button
            type="button"
            onClick={() => setMobileActiveStage('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-manipulation min-h-[38px] flex items-center gap-1.5 cursor-pointer ${
              mobileActiveStage === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300'
            }`}
          >
            <span>All Stages</span>
            <span className="font-mono text-[10px] opacity-80">({filteredOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveStage('new')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-manipulation min-h-[38px] flex items-center gap-1.5 cursor-pointer ${
              mobileActiveStage === 'new'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>New</span>
            <span className="font-mono text-[10px]">({newOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveStage('preparing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-manipulation min-h-[38px] flex items-center gap-1.5 cursor-pointer ${
              mobileActiveStage === 'preparing'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Prep</span>
            <span className="font-mono text-[10px]">({preparingOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveStage('ready')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-manipulation min-h-[38px] flex items-center gap-1.5 cursor-pointer ${
              mobileActiveStage === 'ready'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Ready</span>
            <span className="font-mono text-[10px]">({readyOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveStage('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors touch-manipulation min-h-[38px] flex items-center gap-1.5 cursor-pointer ${
              mobileActiveStage === 'completed'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Done</span>
            <span className="font-mono text-[10px]">({completedOrders.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {/* SECTION 1: NEW ORDERS */}
          <section
            className={`bg-stone-200/60 rounded-2xl p-3 sm:p-4 border border-stone-300/80 flex-col min-h-[500px] ${
              mobileActiveStage !== 'all' && mobileActiveStage !== 'new' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  New Orders
                </h2>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                {newOrders.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {newOrders.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-300 rounded-xl text-stone-400 text-xs">
                  <Coffee className="w-6 h-6 mb-1 text-stone-300" />
                  <span>No new incoming orders</span>
                </div>
              ) : (
                newOrders.map((ord) => (
                  <OrderCard
                    key={ord.id}
                    order={ord}
                    onSelect={() => setSelectedOrder(ord)}
                    onAdvance={() => {
                      updateOrderStatus(ord.id, 'preparing');
                      showToast(`Order #${ord.orderCode} sent to Kitchen`);
                    }}
                    advanceLabel="Start Preparing"
                  />
                ))
              )}
            </div>
          </section>

          {/* SECTION 2: PREPARING ORDERS */}
          <section
            className={`bg-stone-200/60 rounded-2xl p-3 sm:p-4 border border-stone-300/80 flex-col min-h-[500px] ${
              mobileActiveStage !== 'all' && mobileActiveStage !== 'preparing' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Preparing
                </h2>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                {preparingOrders.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {preparingOrders.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-300 rounded-xl text-stone-400 text-xs">
                  <ChefHat className="w-6 h-6 mb-1 text-stone-300" />
                  <span>No orders in prep</span>
                </div>
              ) : (
                preparingOrders.map((ord) => (
                  <OrderCard
                    key={ord.id}
                    order={ord}
                    onSelect={() => setSelectedOrder(ord)}
                    onAdvance={() => {
                      updateOrderStatus(ord.id, 'ready');
                      showToast(`Order #${ord.orderCode} is ready for serving`);
                    }}
                    advanceLabel="Mark as Ready"
                  />
                ))
              )}
            </div>
          </section>

          {/* SECTION 3: READY ORDERS */}
          <section
            className={`bg-stone-200/60 rounded-2xl p-3 sm:p-4 border border-stone-300/80 flex-col min-h-[500px] ${
              mobileActiveStage !== 'all' && mobileActiveStage !== 'ready' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Ready to Serve
                </h2>
              </div>
              <span className="text-xs font-mono font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md">
                {readyOrders.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {readyOrders.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-300 rounded-xl text-stone-400 text-xs">
                  <BellRing className="w-6 h-6 mb-1 text-stone-300" />
                  <span>No orders waiting pickup</span>
                </div>
              ) : (
                readyOrders.map((ord) => (
                  <OrderCard
                    key={ord.id}
                    order={ord}
                    onSelect={() => setSelectedOrder(ord)}
                    onAdvance={() => {
                      updateOrderStatus(ord.id, 'completed');
                      showToast(`Order #${ord.orderCode} completed and closed`);
                    }}
                    advanceLabel="Complete Order"
                  />
                ))
              )}
            </div>
          </section>

          {/* SECTION 4: COMPLETED ORDERS */}
          <section
            className={`bg-stone-200/60 rounded-2xl p-3 sm:p-4 border border-stone-300/80 flex-col min-h-[500px] ${
              mobileActiveStage !== 'all' && mobileActiveStage !== 'completed' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Completed
                </h2>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                {completedOrders.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {completedOrders.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-stone-300 rounded-xl text-stone-400 text-xs">
                  <CheckCheck className="w-6 h-6 mb-1 text-stone-300" />
                  <span>No completed orders yet</span>
                </div>
              ) : (
                completedOrders.map((ord) => (
                  <OrderCard
                    key={ord.id}
                    order={ord}
                    onSelect={() => setSelectedOrder(ord)}
                    isCompleted
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ORDER DETAILS INSPECTOR MODAL / SLIDEOUT PANEL */}
      {activeDetailOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-stone-950">
                    #{activeDetailOrder.orderCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 text-xs font-bold">
                    Table {activeDetailOrder.tableNumber}
                  </span>
                </div>
                <span className="text-xs text-stone-500">
                  Created {new Date(activeDetailOrder.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-lg hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scrollable Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              {/* Customer & Dining Info */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 font-medium">Customer Name:</span>
                  <span className="font-bold text-stone-900">{activeDetailOrder.customer.name}</span>
                </div>
                {activeDetailOrder.customer.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Mobile Phone:</span>
                    <span className="font-mono text-stone-800">{activeDetailOrder.customer.phone}</span>
                  </div>
                )}
                {activeDetailOrder.customer.specialInstructions && (
                  <div className="pt-2 border-t border-stone-200">
                    <span className="text-stone-500 font-medium block mb-0.5">Special Instructions:</span>
                    <p className="text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200/60 font-medium">
                      "{activeDetailOrder.customer.specialInstructions}"
                    </p>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                  Ordered Items ({activeDetailOrder.items.length})
                </h3>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
                  {activeDetailOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 text-xs flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded">
                            {it.quantity}x
                          </span>
                          <span className="font-semibold text-stone-900">{it.name}</span>
                        </div>
                        {it.notes && (
                          <p className="text-[11px] text-amber-800 italic mt-0.5 ml-7">
                            Note: "{it.notes}"
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-semibold text-stone-900">
                          ₹{it.subtotal.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-stone-400 font-mono">
                          (₹{it.unitPrice} ea)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill & Totals Breakdown */}
              <div className="p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{activeDetailOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>GST (5%)</span>
                  <span className="font-mono">₹{activeDetailOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-950 pt-2 border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="font-mono text-base">₹{activeDetailOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Status & Toggle */}
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">Payment Status</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase font-mono ${
                      activeDetailOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-200 text-emerald-950'
                        : 'bg-amber-200 text-amber-950'
                    }`}
                  >
                    {activeDetailOrder.paymentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Payment Method:</span>
                  <span className="font-mono font-semibold uppercase">
                    {activeDetailOrder.paymentMethod.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  {activeDetailOrder.paymentStatus === 'unpaid' ? (
                    <button
                      onClick={() => {
                        updateOrderPaymentStatus(activeDetailOrder.id, 'paid');
                        showToast(`Marked #${activeDetailOrder.orderCode} as Paid`);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Collect & Mark as Paid (₹{activeDetailOrder.total.toFixed(2)})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        updateOrderPaymentStatus(activeDetailOrder.id, 'unpaid');
                        showToast(`Reverted #${activeDetailOrder.orderCode} to Unpaid`);
                      }}
                      className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Revert to Unpaid
                    </button>
                  )}
                </div>
              </div>

              {/* Order Status Transition Controls */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                  Move Order Status
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      updateOrderStatus(activeDetailOrder.id, 'new');
                      showToast(`Order #${activeDetailOrder.orderCode} set to New`);
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold border cursor-pointer ${
                      activeDetailOrder.status === 'new'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    1. New Ticket
                  </button>
                  <button
                    onClick={() => {
                      updateOrderStatus(activeDetailOrder.id, 'preparing');
                      showToast(`Order #${activeDetailOrder.orderCode} set to Preparing`);
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold border cursor-pointer ${
                      activeDetailOrder.status === 'preparing'
                        ? 'bg-blue-100 border-blue-300 text-blue-900 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    2. In Kitchen
                  </button>
                  <button
                    onClick={() => {
                      updateOrderStatus(activeDetailOrder.id, 'ready');
                      showToast(`Order #${activeDetailOrder.orderCode} set to Ready`);
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold border cursor-pointer ${
                      activeDetailOrder.status === 'ready'
                        ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    3. Ready to Serve
                  </button>
                  <button
                    onClick={() => {
                      updateOrderStatus(activeDetailOrder.id, 'completed');
                      showToast(`Order #${activeDetailOrder.orderCode} Completed`);
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold border cursor-pointer ${
                      activeDetailOrder.status === 'completed'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    4. Completed
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  showToast(`Printed Kitchen KOT / Receipt for #${activeDetailOrder.orderCode}`);
                }}
                className="py-2.5 px-4 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 rounded-lg border border-stone-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print KOT</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="py-2.5 px-5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Menu Modal */}
      <GoogleSheetModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
      />
    </div>
  );
};

// Subcomponent for each order card in the columns
interface OrderCardProps {
  order: Order;
  onSelect: () => void;
  onAdvance?: () => void;
  advanceLabel?: string;
  isCompleted?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onSelect,
  onAdvance,
  advanceLabel,
  isCompleted = false,
}) => {
  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / (60 * 1000)
  );

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl border border-stone-200/90 p-3.5 shadow-xs hover:border-stone-400 hover:shadow-sm transition-all cursor-pointer space-y-2.5"
    >
      {/* Top Card Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-xs text-stone-900">
            #{order.orderCode}
          </span>
          <span className="text-[10px] font-bold bg-stone-100 text-stone-800 px-1.5 py-0.2 rounded font-sans">
            T-{order.tableNumber}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono">
          <Clock className="w-3 h-3 text-stone-400" />
          <span>{elapsedMinutes < 1 ? 'Just now' : `${elapsedMinutes}m ago`}</span>
        </div>
      </div>

      {/* Customer Name & Item Summary */}
      <div>
        <div className="text-xs font-semibold text-stone-800 truncate">
          {order.customer.name}
        </div>
        <div className="text-[11px] text-stone-500 truncate mt-0.5">
          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
        </div>
      </div>

      {/* Payment & Total Amount */}
      <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
            order.paymentStatus === 'paid'
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-amber-50 text-amber-800'
          }`}
        >
          {order.paymentStatus}
        </span>

        <span className="font-mono font-bold text-stone-900 tabular-nums">
          ₹{order.total.toFixed(2)}
        </span>
      </div>

      {/* Quick Advance Button */}
      {onAdvance && advanceLabel && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdvance();
          }}
          className="w-full mt-2 py-2 min-h-[38px] text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-900 hover:text-white active:scale-98 rounded-xl transition-all border border-stone-200 cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
        >
          <span>{advanceLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

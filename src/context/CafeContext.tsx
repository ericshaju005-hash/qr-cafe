import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { MenuItem, CartItem, Order, OrderStatus, PaymentStatus, PaymentMethod } from '../types/cafe';
import { INITIAL_ORDERS } from '../data/initialOrders';
import { MENU_ITEMS } from '../data/menuItems';
import { googleSignIn, logoutGoogle, initAuth } from '../services/googleAuth';
import {
  createMenuSpreadsheet,
  fetchMenuFromSpreadsheet,
  updateItemPriceInSpreadsheet,
  extractSpreadsheetId,
} from '../services/googleSheets';

interface PlaceOrderPayload {
  customerName: string;
  customerPhone?: string;
  specialInstructions?: string;
  paymentMethod: PaymentMethod;
}

interface CashierAuth {
  isAuthenticated: boolean;
  cashierName: string;
  shift: string;
  terminalId: string;
}

interface CafeContextType {
  // Menu State (live, can be updated via Google Sheets)
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;

  // Table State
  tableNumber: string;
  setTableNumber: (table: string) => void;

  // Cart State
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;

  // Active Order State
  currentOrder: Order | null;
  tableOrders: Order[];
  activeOrderId: string | null;
  setCurrentOrder: (order: Order | null) => void;
  placeOrder: (payload: PlaceOrderPayload) => Order;

  // Cashier State
  orders: Order[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;
  cashierAuth: CashierAuth;
  loginCashier: (pin: string, name?: string) => boolean;
  logoutCashier: () => void;
  simulateIncomingOrder: () => Order;

  // Google Sheets Integration
  googleUser: User | null;
  googleToken: string | null;
  isLoggingInGoogle: boolean;
  loginWithGoogle: () => Promise<void>;
  logoutFromGoogle: () => Promise<void>;
  sheetId: string | null;
  sheetUrl: string | null;
  sheetLastSync: string | null;
  isSyncingSheet: boolean;
  createAndConnectSheet: () => Promise<string>;
  connectExistingSheet: (idOrUrl: string) => Promise<void>;
  syncMenuFromConnectedSheet: () => Promise<number>;
  updatePriceInConnectedSheet: (itemId: string, newPrice: number) => Promise<void>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

// Generate friendly order code e.g. CO-8421
function generateOrderCode(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CO-${randomNum}`;
}

export const CafeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Dynamic Menu Items (Defaults to MENU_ITEMS, but can sync with Google Sheets)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);

  // Google Auth & Sheets State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [sheetLastSync, setSheetLastSync] = useState<string | null>(null);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    setIsLoggingInGoogle(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
      }
    } finally {
      setIsLoggingInGoogle(false);
    }
  };

  const logoutFromGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleToken(null);
  };

  // Google Sheets operations
  const createAndConnectSheet = async (): Promise<string> => {
    if (!googleToken) {
      throw new Error('Please sign in with Google first.');
    }
    setIsSyncingSheet(true);
    try {
      const info = await createMenuSpreadsheet(googleToken, menuItems);
      setSheetId(info.spreadsheetId);
      setSheetUrl(info.spreadsheetUrl);
      setSheetLastSync(new Date().toLocaleTimeString());
      return info.spreadsheetUrl;
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const connectExistingSheet = async (idOrUrl: string) => {
    if (!googleToken) {
      throw new Error('Please sign in with Google first.');
    }
    const cleanId = extractSpreadsheetId(idOrUrl);
    if (!cleanId) {
      throw new Error('Please provide a valid Google Spreadsheet ID or URL');
    }
    setIsSyncingSheet(true);
    try {
      const { items } = await fetchMenuFromSpreadsheet(googleToken, cleanId);
      setSheetId(cleanId);
      setSheetUrl(`https://docs.google.com/spreadsheets/d/${cleanId}/edit`);
      setMenuItems(items);
      setSheetLastSync(new Date().toLocaleTimeString());
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const syncMenuFromConnectedSheet = async (): Promise<number> => {
    if (!googleToken) {
      throw new Error('Please sign in with Google first.');
    }
    if (!sheetId) {
      throw new Error('No Google Sheet connected. Please connect or create one first.');
    }
    setIsSyncingSheet(true);
    try {
      const { items } = await fetchMenuFromSpreadsheet(googleToken, sheetId);
      setMenuItems(items);
      setSheetLastSync(new Date().toLocaleTimeString());
      return items.length;
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const updatePriceInConnectedSheet = async (itemId: string, newPrice: number) => {
    // Optimistically update local menu item price
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, price: newPrice } : item))
    );

    if (googleToken && sheetId) {
      setIsSyncingSheet(true);
      try {
        await updateItemPriceInSpreadsheet(googleToken, sheetId, 'CafeOrder Menu & Pricing', itemId, newPrice);
        setSheetLastSync(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn('Could not update price directly in sheet:', err);
      } finally {
        setIsSyncingSheet(false);
      }
    }
  };

  // 1. Table Number detection from URL search query (e.g., ?table=12)
  const [tableNumber, setTableNumberState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table');
      if (urlTable && urlTable.trim()) {
        return urlTable.trim();
      }
    }
    return '12';
  });

  const setTableNumber = (table: string) => {
    const cleanTable = table.trim() || '12';
    setTableNumberState(cleanTable);
    if (typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.set('table', cleanTable);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTable = params.get('table');
      if (urlTable && urlTable.trim() && urlTable !== tableNumber) {
        setTableNumberState(urlTable.trim());
      }
    }
  }, []);

  // 2. In-memory Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem, quantity = 1, notes?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (ci) => ci.menuItemId === item.id && (ci.notes || '') === (notes || '')
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      const newCartItem: CartItem = {
        id: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity,
        notes: notes?.trim() || undefined,
        dietary: item.dietary,
        image: item.image,
      };
      return [...prev, newCartItem];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const cartTax = useMemo(() => Math.round(cartSubtotal * 0.05 * 100) / 100, [cartSubtotal]);

  const cartTotal = useMemo(() => cartSubtotal + cartTax, [cartSubtotal, cartTax]);

  // 3. Customer Active Order State
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // 4. Cashier In-Memory Orders (Starts empty - NO fake orders!)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Reactively compute currentOrder so it ALWAYS stays in sync with cashier updates
  const currentOrder = useMemo(() => {
    if (activeOrderId) {
      const match = orders.find((o) => o.id === activeOrderId);
      if (match) return match;
    }
    const tableMatch = orders.find((o) => o.tableNumber === tableNumber);
    return tableMatch || null;
  }, [orders, activeOrderId, tableNumber]);

  // All orders for this table
  const tableOrders = useMemo(() => {
    return orders.filter((o) => o.tableNumber === tableNumber);
  }, [orders, tableNumber]);

  const setCurrentOrder = (order: Order | null) => {
    setActiveOrderId(order ? order.id : null);
  };

  // Cashier Auth
  const [cashierAuth, setCashierAuth] = useState<CashierAuth>({
    isAuthenticated: false,
    cashierName: '',
    shift: 'Morning Shift',
    terminalId: 'POS-T1',
  });

  const loginCashier = (pin: string, name = 'Sarah Jenkins'): boolean => {
    if (pin.length >= 4) {
      setCashierAuth({
        isAuthenticated: true,
        cashierName: name,
        shift: 'Floor Shift A',
        terminalId: 'POS-T1',
      });
      return true;
    }
    return false;
  };

  const logoutCashier = () => {
    setCashierAuth({
      isAuthenticated: false,
      cashierName: '',
      shift: '',
      terminalId: '',
    });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status, updatedAt: new Date().toISOString() }
          : ord
      )
    );
  };

  const updateOrderPaymentStatus = (orderId: string, paymentStatus: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, paymentStatus, updatedAt: new Date().toISOString() }
          : ord
      )
    );
  };

  // Place Order from Customer
  const placeOrder = (payload: PlaceOrderPayload): Order => {
    const orderItems = cart.map((ci) => ({
      menuItemId: ci.menuItemId,
      name: ci.name,
      quantity: ci.quantity,
      unitPrice: ci.price,
      subtotal: ci.price * ci.quantity,
      notes: ci.notes,
      dietary: ci.dietary,
    }));

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderCode: generateOrderCode(),
      tableNumber: tableNumber,
      status: 'new',
      items: orderItems,
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      customer: {
        name: payload.customerName || `Guest at Table ${tableNumber}`,
        phone: payload.customerPhone,
        specialInstructions: payload.specialInstructions,
      },
      paymentMethod: payload.paymentMethod,
      paymentStatus:
        payload.paymentMethod === 'instant_upi' || payload.paymentMethod === 'card_pos'
          ? 'paid'
          : 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedPrepMinutes: Math.max(8, cart.length * 3),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);
    clearCart();

    return newOrder;
  };

  // Optional simulator for testing
  const simulateIncomingOrder = (): Order => {
    const randomTables = ['03', '08', '11', '14', '16', '21'];
    const selectedTable = randomTables[Math.floor(Math.random() * randomTables.length)];
    const picked = menuItems.slice(0, 2);

    const items = picked.map((item) => ({
      menuItemId: item.id,
      name: item.name,
      quantity: 1,
      unitPrice: item.price,
      subtotal: item.price,
      dietary: item.dietary,
    }));

    const sub = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const tax = Math.round(sub * 0.05 * 100) / 100;

    const simOrder: Order = {
      id: `ord_sim_${Date.now()}`,
      orderCode: generateOrderCode(),
      tableNumber: selectedTable,
      status: 'new',
      items,
      subtotal: sub,
      tax,
      total: sub + tax,
      customer: {
        name: `Guest (${selectedTable})`,
        phone: '+91 98000 12345',
      },
      paymentMethod: 'counter_upi',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedPrepMinutes: 10,
    };

    setOrders((prev) => [simOrder, ...prev]);
    return simOrder;
  };

  return (
    <CafeContext.Provider
      value={{
        menuItems,
        setMenuItems,
        tableNumber,
        setTableNumber,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartItemCount,
        cartSubtotal,
        cartTax,
        cartTotal,
        currentOrder,
        tableOrders,
        activeOrderId,
        setCurrentOrder,
        placeOrder,
        orders,
        updateOrderStatus,
        updateOrderPaymentStatus,
        cashierAuth,
        loginCashier,
        logoutCashier,
        simulateIncomingOrder,
        // Google Sheets
        googleUser,
        googleToken,
        isLoggingInGoogle,
        loginWithGoogle,
        logoutFromGoogle,
        sheetId,
        sheetUrl,
        sheetLastSync,
        isSyncingSheet,
        createAndConnectSheet,
        connectExistingSheet,
        syncMenuFromConnectedSheet,
        updatePriceInConnectedSheet,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = (): CafeContextType => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};

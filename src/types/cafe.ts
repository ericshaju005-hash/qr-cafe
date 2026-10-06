export type DietaryType = 'veg' | 'non-veg' | 'vegan';

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number; // in INR (₹)
  description: string;
  dietary: DietaryType;
  image: string;
  popular?: boolean;
  preparationTimeMinutes: number;
  tags?: string[];
  customizable?: boolean;
}

export interface CartItem {
  id: string; // unique item cart key (e.g. `${menuItemId}-${optionsHash}`)
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  dietary: DietaryType;
  image: string;
}

export type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed';

export type PaymentMethod = 'counter_cash' | 'counter_upi' | 'card_pos' | 'instant_upi';

export type PaymentStatus = 'unpaid' | 'paid';

export interface OrderCustomerInfo {
  name: string;
  phone?: string;
  specialInstructions?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  dietary: DietaryType;
}

export interface Order {
  id: string; // Internal id (e.g. "ord_1742080001")
  orderCode: string; // Unique human-readable code e.g. "CO-4821"
  tableNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number; // 5% GST
  total: number;
  customer: OrderCustomerInfo;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string; // ISO string or display time
  updatedAt: string;
  estimatedPrepMinutes: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
}

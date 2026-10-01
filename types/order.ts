export enum PaymentStatus {
  UNPAID = "UNPAID",
  COD = "COD",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELED = "CANCELED",
}

export interface OrderItem {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  pricePerUnit?: number;
}

export interface OrderResponseItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  sku: string;
  productTitle: string;
  variantTitle: string;
  unitPrice: number;
  quantity: number;
  options: Record<string, string> | null;
}

export interface CreateOrderInput {
  paymentStatus: PaymentStatus;
  items?: {
    variantId: string;
    quantity: number;
  }[];
  customerName?: string;
  customerPhone?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  note?: string;
}

export interface UpdateOrderInput extends CreateOrderInput {
  status: OrderStatus;
}

interface SystemActor {
  id: string;
  firstName: string;
  lastName: string;
}

interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeUserId: string | null;
  storeUser: SystemUser | null;
  createdById: string | null;
  confirmedById: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  shippingOptionId: string | null;
  paymentId: string | null;
  note: string | null;
  customerName: string | null;
  customerPhone: string | null;
  shippingAddress1: string | null;
  shippingAddress2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: SystemActor | null;
  confirmedBy: SystemActor | null;
  _count: {
    items: number;
  };
  items?: OrderResponseItem[];
}

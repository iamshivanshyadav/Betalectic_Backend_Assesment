export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Cart {
  id: string;
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
  items: CartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DiscountRule {
  id: string;
  name: string;
  type: 'QUANTITY_BASED' | 'TOTAL_BASED';
  productId?: string;
  minQuantity?: number;
  minTotalAmount?: number;
  discountType: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'BUNDLE_PRICE';
  discountValue: number;
  bundlePrice?: number;
  isActive: boolean;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppliedDiscount {
  ruleId: string;
  ruleName: string;
  discountAmount: number;
  appliedTo: 'ITEM' | 'CART';
  itemId?: string;
}

export interface CheckoutSummary {
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
  }>;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  appliedDiscounts: AppliedDiscount[];
}

export interface IPromotionRule {
  apply(items: Map<string, number>, products: Map<string, Product>): {
    discountAmount: number;
    appliedTo: string;
  };
  getPriority(): number;
  isApplicable(items: Map<string, number>, products: Map<string, Product>): boolean;
}

export interface ICheckout {
  scan(item: string): void;
  total(): number;
  totalDiscounts(): number;
  getItems(): Map<string, number>;
  getSummary(): CheckoutSummary;
}

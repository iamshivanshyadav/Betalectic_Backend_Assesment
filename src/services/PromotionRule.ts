import { IPromotionRule, Product } from '../types';

export abstract class PromotionRule implements IPromotionRule {
  protected priority: number;
  protected name: string;

  constructor(priority: number, name: string) {
    this.priority = priority;
    this.name = name;
  }

  abstract apply(items: Map<string, number>, products: Map<string, Product>): {
    discountAmount: number;
    appliedTo: string;
  };

  abstract isApplicable(items: Map<string, number>, products: Map<string, Product>): boolean;

  getPriority(): number {
    return this.priority;
  }

  getName(): string {
    return this.name;
  }
}

export class QuantityDiscountRule extends PromotionRule {
  private productId: string;
  private requiredQuantity: number;
  private bundlePrice: number;

  constructor(productId: string, requiredQuantity: number, bundlePrice: number, priority: number = 1) {
    super(priority, `${requiredQuantity} of ${productId} for Rs ${bundlePrice}`);
    this.productId = productId;
    this.requiredQuantity = requiredQuantity;
    this.bundlePrice = bundlePrice;
  }

  isApplicable(items: Map<string, number>, products: Map<string, Product>): boolean {
    const quantity = items.get(this.productId) || 0;
    return quantity >= this.requiredQuantity;
  }

  apply(items: Map<string, number>, products: Map<string, Product>): {
    discountAmount: number;
    appliedTo: string;
  } {
    const quantity = items.get(this.productId) || 0;
    const product = products.get(this.productId);
    
    if (!product || quantity < this.requiredQuantity) {
      return { discountAmount: 0, appliedTo: this.productId };
    }

    const bundleCount = Math.floor(quantity / this.requiredQuantity);
    const originalPrice = bundleCount * this.requiredQuantity * product.price;
    const discountedPrice = bundleCount * this.bundlePrice;
    const discountAmount = originalPrice - discountedPrice;

    return { discountAmount, appliedTo: this.productId };
  }
}

export class TotalBasedDiscountRule extends PromotionRule {
  private minAmount: number;
  private discountAmount: number;

  constructor(minAmount: number, discountAmount: number, priority: number = 2) {
    super(priority, `Rs ${discountAmount} off when total over Rs ${minAmount}`);
    this.minAmount = minAmount;
    this.discountAmount = discountAmount;
  }

  isApplicable(items: Map<string, number>, products: Map<string, Product>): boolean {
    let total = 0;
    
    for (const [productId, quantity] of items) {
      const product = products.get(productId);
      if (product) {
        total += product.price * quantity;
      }
    }

    return total > this.minAmount;
  }

  apply(items: Map<string, number>, products: Map<string, Product>): {
    discountAmount: number;
    appliedTo: string;
  } {
    if (this.isApplicable(items, products)) {
      return { discountAmount: this.discountAmount, appliedTo: 'TOTAL' };
    }
    return { discountAmount: 0, appliedTo: 'TOTAL' };
  }
}

import { ICheckout, IPromotionRule, Product, CheckoutSummary, AppliedDiscount } from '../types';

export class Checkout implements ICheckout {
  private items: Map<string, number> = new Map();
  private products: Map<string, Product> = new Map();
  private promotionRules: IPromotionRule[] = [];
  private appliedDiscounts: AppliedDiscount[] = [];

  constructor(rules: IPromotionRule[], products: Product[]) {
    this.promotionRules = rules.sort((a, b) => a.getPriority() - b.getPriority());
    products.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  scan(item: string): void {
    if (!this.products.has(item)) {
      throw new Error(`Product ${item} not found`);
    }
    
    const currentQuantity = this.items.get(item) || 0;
    this.items.set(item, currentQuantity + 1);
  }

  total(): number {
    const subtotal = this.calculateSubtotal();
    const discount = this.totalDiscounts();
    return subtotal - discount;
  }

  totalDiscounts(): number {
    this.appliedDiscounts = [];
    let totalDiscount = 0;
    
    // Apply quantity-based discounts first (priority 1)
    for (const rule of this.promotionRules) {
      if (rule.getPriority() === 1 && rule.isApplicable(this.items, this.products)) {
        const result = rule.apply(this.items, this.products);
        if (result.discountAmount > 0) {
          totalDiscount += result.discountAmount;
          this.appliedDiscounts.push({
            ruleId: rule.constructor.name,
            ruleName: (rule as any).getName(),
            discountAmount: result.discountAmount,
            appliedTo: 'ITEM',
            itemId: result.appliedTo
          });
        }
      }
    }

    // Calculate total after quantity discounts for total-based rules
    const subtotalAfterQuantityDiscounts = this.calculateSubtotal() - totalDiscount;
    
    // Apply total-based discounts (priority 2)
    for (const rule of this.promotionRules) {
      if (rule.getPriority() === 2 && subtotalAfterQuantityDiscounts > 150) {
        const result = rule.apply(this.items, this.products);
        if (result.discountAmount > 0) {
          totalDiscount += result.discountAmount;
          this.appliedDiscounts.push({
            ruleId: rule.constructor.name,
            ruleName: (rule as any).getName(),
            discountAmount: result.discountAmount,
            appliedTo: 'CART'
          });
        }
      }
    }

    return totalDiscount;
  }

  getItems(): Map<string, number> {
    return new Map(this.items);
  }

  getSummary(): CheckoutSummary {
    const totalDiscount = this.totalDiscounts();
    const subtotal = this.calculateSubtotal();
    const finalTotal = subtotal - totalDiscount;

    const items = Array.from(this.items.entries()).map(([productId, quantity]) => {
      const product = this.products.get(productId)!;
      const totalPrice = product.price * quantity;
      
      // Calculate item-specific discount
      let itemDiscount = 0;
      const itemDiscountInfo = this.appliedDiscounts.find(
        d => d.appliedTo === 'ITEM' && d.itemId === productId
      );
      if (itemDiscountInfo) {
        itemDiscount = itemDiscountInfo.discountAmount;
      }

      return {
        productId,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        totalPrice,
        discountAmount: itemDiscount,
        finalPrice: totalPrice - itemDiscount
      };
    });

    return {
      items,
      subtotal,
      totalDiscount,
      finalTotal,
      appliedDiscounts: this.appliedDiscounts
    };
  }

  private calculateSubtotal(): number {
    let subtotal = 0;
    for (const [productId, quantity] of this.items) {
      const product = this.products.get(productId);
      if (product) {
        subtotal += product.price * quantity;
      }
    }
    return subtotal;
  }
}

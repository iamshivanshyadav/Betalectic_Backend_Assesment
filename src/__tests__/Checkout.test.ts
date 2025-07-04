import { Checkout } from '../services/Checkout';
import { QuantityDiscountRule, TotalBasedDiscountRule } from '../services/PromotionRule';
import { Product } from '../types';

describe('Checkout System', () => {
  let products: Product[];
  let rules: any[];

  beforeEach(() => {
    products = [
      { id: 'A', name: 'Product A', price: 30 },
      { id: 'B', name: 'Product B', price: 20 },
      { id: 'C', name: 'Product C', price: 50 },
      { id: 'D', name: 'Product D', price: 15 }
    ];

    rules = [
      new QuantityDiscountRule('A', 3, 85, 1),
      new QuantityDiscountRule('B', 2, 35, 1),
      new TotalBasedDiscountRule(150, 20, 2)
    ];
  });

  describe('Basic functionality', () => {
    test('should create a checkout instance', () => {
      const checkout = new Checkout(rules, products);
      expect(checkout).toBeDefined();
      expect(checkout.total()).toBe(0);
      expect(checkout.totalDiscounts()).toBe(0);
    });

    test('should scan items and calculate total', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('A');
      checkout.scan('B');
      checkout.scan('C');
      
      expect(checkout.total()).toBe(100); // 30 + 20 + 50 = 100
      expect(checkout.totalDiscounts()).toBe(0);
    });

    test('should throw error for unknown product', () => {
      const checkout = new Checkout(rules, products);
      expect(() => checkout.scan('X')).toThrow('Product X not found');
    });
  });

  describe('Promotion Rules', () => {
    test('should apply quantity discount for product A (3 for 85)', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('A');
      checkout.scan('A');
      checkout.scan('A');
      
      expect(checkout.totalDiscounts()).toBe(5); // 90 - 85 = 5
      expect(checkout.total()).toBe(85);
    });

    test('should apply quantity discount for product B (2 for 35)', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('B');
      checkout.scan('B');
      
      expect(checkout.totalDiscounts()).toBe(5); // 40 - 35 = 5
      expect(checkout.total()).toBe(35);
    });

    test('should apply total-based discount when over 150', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('C'); // 50
      checkout.scan('C'); // 50
      checkout.scan('C'); // 50
      checkout.scan('A'); // 30
      
      // Total: 180, should get Rs 20 off
      expect(checkout.totalDiscounts()).toBe(20);
      expect(checkout.total()).toBe(160);
    });

    test('should apply multiple discounts correctly', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('A'); // 30
      checkout.scan('A'); // 30
      checkout.scan('A'); // 30 (3 A's = 85 instead of 90, discount = 5)
      checkout.scan('B'); // 20
      checkout.scan('B'); // 20 (2 B's = 35 instead of 40, discount = 5)
      checkout.scan('C'); // 50
      
      // Subtotal: 180, Quantity discounts: 10, After discounts: 170
      // Since 170 > 150, additional 20 off
      // Total discounts: 10 + 20 = 30
      expect(checkout.totalDiscounts()).toBe(30);
      expect(checkout.total()).toBe(150); // 180 - 30 = 150
    });
  });

  describe('Test Data Examples', () => {
    test('should calculate A, B, C = Rs 100', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('A');
      checkout.scan('B');
      checkout.scan('C');
      
      expect(checkout.total()).toBe(100);
    });

    test('should calculate B, A, B, A, A = Rs 120', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('B');
      checkout.scan('A');
      checkout.scan('B');
      checkout.scan('A');
      checkout.scan('A');
      
      // 3 A's = 85, 2 B's = 35, total = 120
      expect(checkout.total()).toBe(120);
    });

    test('should calculate C, B, A, A, D, A, B = Rs 165', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('C');
      checkout.scan('B');
      checkout.scan('A');
      checkout.scan('A');
      checkout.scan('D');
      checkout.scan('A');
      checkout.scan('B');
      
      // 3 A's = 85, 2 B's = 35, C = 50, D = 15
      // Subtotal = 185, quantity discounts = 10, after = 175
      // 175 > 150, so additional 20 off
      // Final = 185 - 10 - 20 = 155... wait, let me recalculate
      
      // Items: C(50) + B(20) + A(30) + A(30) + D(15) + A(30) + B(20) = 195
      // Discounts: 3A bundle (90->85, save 5) + 2B bundle (40->35, save 5) = 10 total discount
      // After discounts: 195 - 10 = 185
      // Since 185 > 150, additional 20 off
      // Final: 195 - 10 - 20 = 165
      expect(checkout.total()).toBe(165);
    });

    test('should calculate C, A, D, A, A = Rs 150', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('C');
      checkout.scan('A');
      checkout.scan('D');
      checkout.scan('A');
      checkout.scan('A');
      
      // 3 A's = 85, C = 50, D = 15
      // Subtotal = 180, quantity discount = 5, after = 175
      // 175 > 150, so additional 20 off
      // Final = 180 - 5 - 20 = 155... 
      
      // Let me recalculate: C(50) + A(30) + D(15) + A(30) + A(30) = 155
      // 3A bundle discount: 90 -> 85, save 5
      // After discount: 155 - 5 = 150
      // 150 is not > 150, so no additional discount
      expect(checkout.total()).toBe(150);
    });
  });

  describe('Summary functionality', () => {
    test('should provide detailed summary', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('A');
      checkout.scan('A');
      checkout.scan('A');
      checkout.scan('B');
      
      const summary = checkout.getSummary();
      expect(summary.subtotal).toBe(110); // 3*30 + 20
      expect(summary.totalDiscount).toBe(5); // Only A discount
      expect(summary.finalTotal).toBe(105);
      expect(summary.items).toHaveLength(2);
      expect(summary.appliedDiscounts).toHaveLength(1);
    });

    test('should show item-level discount details', () => {
      const checkout = new Checkout(rules, products);
      checkout.scan('A');
      checkout.scan('A');
      checkout.scan('A');
      
      const summary = checkout.getSummary();
      const itemA = summary.items.find(item => item.productId === 'A');
      
      expect(itemA).toBeDefined();
      expect(itemA?.quantity).toBe(3);
      expect(itemA?.totalPrice).toBe(90);
      expect(itemA?.discountAmount).toBe(5);
      expect(itemA?.finalPrice).toBe(85);
    });
  });
});

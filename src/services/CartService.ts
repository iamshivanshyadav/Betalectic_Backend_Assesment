import Cart, { ICart } from '../models/Cart';
import CartItem, { ICartItem } from '../models/CartItem';
import Product from '../models/Product';
import { Checkout } from './Checkout';
import { QuantityDiscountRule, TotalBasedDiscountRule } from './PromotionRule';
import { CheckoutSummary } from '../types';

export class CartService {
  async createCart(): Promise<ICart> {
    const cart = new Cart({
      totalPrice: 0,
      totalDiscount: 0,
      finalPrice: 0
    });
    return await cart.save();
  }

  async addItemToCart(cartId: string, productId: string, quantity: number = 1): Promise<ICartItem> {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    const product = await Product.findOne({ id: productId });
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({ cartId: cart._id, productId });

    if (cartItem) {
      // Update existing item
      cartItem.quantity += quantity;
      cartItem.totalPrice = cartItem.quantity * cartItem.unitPrice;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = new CartItem({
        cartId: cart._id,
        productId,
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
        discountAmount: 0
      });
      await cartItem.save();
    }

    // Recalculate cart totals
    await this.recalculateCart(cartId);

    return cartItem;
  }

  async getCartWithItems(cartId: string): Promise<ICart | null> {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const items = await CartItem.find({ cartId: cart._id });
    
    // Attach items to cart object
    (cart as any).items = items;
    return cart;
  }

  async getCartSummary(cartId: string): Promise<CheckoutSummary> {
    const cart = await this.getCartWithItems(cartId);
    if (!cart) {
      throw new Error('Cart not found');
    }

    const products = await Product.find();
    const productMap = new Map(products.map(p => [p.id, { id: p.id, name: p.name, price: p.price }]));

    // Create promotion rules
    const rules = [
      new QuantityDiscountRule('A', 3, 85, 1),
      new QuantityDiscountRule('B', 2, 35, 1),
      new TotalBasedDiscountRule(150, 20, 2)
    ];

    // Create checkout instance
    const checkout = new Checkout(rules, Array.from(productMap.values()));

    // Scan items from cart
    const cartItems = (cart as any).items as any[];
    for (const cartItem of cartItems) {
      for (let i = 0; i < cartItem.quantity; i++) {
        checkout.scan(cartItem.productId);
      }
    }

    return checkout.getSummary();
  }

  private async recalculateCart(cartId: string): Promise<void> {
    const summary = await this.getCartSummary(cartId);
    
    await Cart.findByIdAndUpdate(cartId, {
      totalPrice: summary.subtotal,
      totalDiscount: summary.totalDiscount,
      finalPrice: summary.finalTotal
    });

    // Update individual cart items with discount information
    for (const item of summary.items) {
      await CartItem.findOneAndUpdate(
        { cartId, productId: item.productId },
        { discountAmount: item.discountAmount }
      );
    }
  }

  async removeItemFromCart(cartId: string, productId: string): Promise<boolean> {
    const cart = await Cart.findById(cartId);
    if (!cart) return false;

    const result = await CartItem.deleteOne({ cartId: cart._id, productId });

    if (result.deletedCount > 0) {
      await this.recalculateCart(cartId);
      return true;
    }

    return false;
  }

  async clearCart(cartId: string): Promise<void> {
    const cart = await Cart.findById(cartId);
    if (!cart) return;

    await CartItem.deleteMany({ cartId: cart._id });

    await Cart.findByIdAndUpdate(cartId, {
      totalPrice: 0,
      totalDiscount: 0,
      finalPrice: 0
    });
  }
}

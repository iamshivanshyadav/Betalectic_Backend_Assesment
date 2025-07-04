import { Request, Response } from 'express';
import { CartService } from '../services/CartService';

export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  async createCart(req: Request, res: Response): Promise<void> {
    try {
      const cart = await this.cartService.createCart();

      res.status(201).json({
        success: true,
        data: cart,
        message: 'Cart created successfully'
      });
    } catch (error) {
      console.error('Error creating cart:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addItemToCart(req: Request, res: Response): Promise<void> {
    try {
      const { cartId } = req.params;
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
        return;
      }

      if (quantity <= 0) {
        res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
        return;
      }

      const cartItem = await this.cartService.addItemToCart(cartId, productId, quantity);

      res.status(200).json({
        success: true,
        data: cartItem,
        message: 'Item added to cart successfully'
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      
      if (error instanceof Error) {
        if (error.message === 'Cart not found' || error.message === 'Product not found') {
          res.status(404).json({
            success: false,
            message: error.message
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const { cartId } = req.params;
      const cart = await this.cartService.getCartWithItems(cartId);

      if (!cart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cart,
        message: 'Cart retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getCartSummary(req: Request, res: Response): Promise<void> {
    try {
      const { cartId } = req.params;
      const summary = await this.cartService.getCartSummary(cartId);

      res.status(200).json({
        success: true,
        data: summary,
        message: 'Cart summary retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      
      if (error instanceof Error && error.message === 'Cart not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async removeItemFromCart(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, productId } = req.params;
      const removed = await this.cartService.removeItemFromCart(cartId, productId);

      if (!removed) {
        res.status(404).json({
          success: false,
          message: 'Item not found in cart'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const { cartId } = req.params;
      await this.cartService.clearCart(cartId);

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

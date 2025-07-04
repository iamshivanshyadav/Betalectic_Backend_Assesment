import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { CartController } from '../controllers/CartController';

const router = Router();
const productController = new ProductController();
const cartController = new CartController();

// Product routes
router.get('/products', productController.getAllProducts.bind(productController));
router.get('/products/:id', productController.getProductById.bind(productController));
router.post('/products', productController.createProduct.bind(productController));

// Cart routes
router.post('/carts', cartController.createCart.bind(cartController));
router.get('/carts/:cartId', cartController.getCart.bind(cartController));
router.post('/carts/:cartId/items', cartController.addItemToCart.bind(cartController));
router.get('/carts/:cartId/summary', cartController.getCartSummary.bind(cartController));
router.delete('/carts/:cartId/items/:productId', cartController.removeItemFromCart.bind(cartController));
router.delete('/carts/:cartId', cartController.clearCart.bind(cartController));

export default router;

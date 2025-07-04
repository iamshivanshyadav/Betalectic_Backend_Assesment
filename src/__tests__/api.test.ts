import request from 'supertest';
import app from '../app';
import connectDB from '../database/connection';
import Product from '../models/Product';
import Cart from '../models/Cart';
import CartItem from '../models/CartItem';
import mongoose from 'mongoose';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await connectDB();
    
    // Clear existing data
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await CartItem.deleteMany({});
    
    // Create test products
    const products = [
      { id: 'A', name: 'Product A', price: 30 },
      { id: 'B', name: 'Product B', price: 20 },
      { id: 'C', name: 'Product C', price: 50 },
      { id: 'D', name: 'Product D', price: 15 }
    ];
    
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up carts and cart items between tests
    await CartItem.deleteMany({});
    await Cart.deleteMany({});
  });

  describe('Health Check', () => {
    test('GET /health should return OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('Checkout System API is running');
    });
  });

  describe('Products API', () => {
    test('GET /api/products should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(4);
      expect(response.body.data[0]).toMatchObject({
        id: 'A',
        name: 'Product A',
        price: 30
      });
    });

    test('GET /api/products/:id should return specific product', async () => {
      const response = await request(app)
        .get('/api/products/A')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: 'A',
        name: 'Product A',
        price: 30
      });
    });

    test('GET /api/products/:id should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/X')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('Cart API', () => {
    let cartId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/carts')
        .expect(201);
      
      cartId = response.body.data.id;
    });

    test('POST /api/carts should create a new cart', async () => {
      const response = await request(app)
        .post('/api/carts')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.totalPrice).toBe(0);
    });

    test('POST /api/carts/:cartId/items should add item to cart', async () => {
      const response = await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send({ productId: 'A', quantity: 1 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.productId).toBe('A');
      expect(response.body.data.quantity).toBe(1);
    });

    test('GET /api/carts/:cartId should return cart with items', async () => {
      // Add items to cart
      await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send({ productId: 'A', quantity: 2 });

      const response = await request(app)
        .get(`/api/carts/${cartId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].productId).toBe('A');
    });

    test('GET /api/carts/:cartId/summary should return detailed summary with discounts', async () => {
      // Add items that should trigger discounts: 3 A's + 2 B's + C + D
      await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send({ productId: 'A', quantity: 3 });
      
      await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send({ productId: 'B', quantity: 2 });
        
      await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send({ productId: 'C', quantity: 1 });
        
      await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send({ productId: 'D', quantity: 1 });

      const response = await request(app)
        .get(`/api/carts/${cartId}/summary`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const summary = response.body.data;
      
      // Expected: 3A(85) + 2B(35) + C(50) + D(15) = 185, then -20 for total discount = 165
      expect(summary.finalTotal).toBe(165);
      expect(summary.totalDiscount).toBe(30); // 5 + 5 + 20
      expect(summary.appliedDiscounts).toHaveLength(3);
    });

    test('DELETE /api/carts/:cartId/items/:productId should remove item from cart', async () => {
      // Add item first
      await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send({ productId: 'A', quantity: 1 });

      const response = await request(app)
        .delete(`/api/carts/${cartId}/items/A`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item removed from cart successfully');
    });

    test('DELETE /api/carts/:cartId should clear cart', async () => {
      // Add items first
      await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send({ productId: 'A', quantity: 2 });

      const response = await request(app)
        .delete(`/api/carts/${cartId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cart cleared successfully');
    });

    test('should handle 404 for non-existent cart', async () => {
      const fakeCartId = '123e4567-e89b-12d3-a456-426614174000';
      
      const response = await request(app)
        .get(`/api/carts/${fakeCartId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cart not found');
    });

    test('should handle invalid product when adding to cart', async () => {
      const response = await request(app)
        .post(`/api/carts/${cartId}/items`)
        .send({ productId: 'X', quantity: 1 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Product not found');
    });
  });

  describe('Business Logic Validation', () => {
    let cartId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/carts')
        .expect(201);
      
      cartId = response.body.data.id;
    });

    test('should match test case: A, B, C = Rs 100', async () => {
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'A' });
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'B' });
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'C' });

      const response = await request(app).get(`/api/carts/${cartId}/summary`);
      expect(response.body.data.finalTotal).toBe(100);
    });

    test('should match test case: B, A, B, A, A = Rs 120', async () => {
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'B' });
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'A' });
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'B' });
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'A' });
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'A' });

      const response = await request(app).get(`/api/carts/${cartId}/summary`);
      expect(response.body.data.finalTotal).toBe(120);
    });

    test('should match test case: C, A, D, A, A = Rs 150', async () => {
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'C' });
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'A' });
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'D' });
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'A' });
      await request(app).post(`/api/carts/${cartId}/items`).send({ productId: 'A' });

      const response = await request(app).get(`/api/carts/${cartId}/summary`);
      expect(response.body.data.finalTotal).toBe(150);
    });
  });
});

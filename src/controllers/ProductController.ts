import { Request, Response } from 'express';
import Product from '../models/Product';

export class ProductController {
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await Product.find().sort({ id: 1 });

      res.status(200).json({
        success: true,
        data: products,
        message: 'Products retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await Product.findOne({ id });

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
        message: 'Product retrieved successfully'
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id, name, price } = req.body;

      if (!id || !name || !price) {
        res.status(400).json({
          success: false,
          message: 'ID, name, and price are required'
        });
        return;
      }

      const existingProduct = await Product.findOne({ id });
      if (existingProduct) {
        res.status(409).json({
          success: false,
          message: 'Product with this ID already exists'
        });
        return;
      }

      const product = new Product({ id, name, price });
      await product.save();

      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

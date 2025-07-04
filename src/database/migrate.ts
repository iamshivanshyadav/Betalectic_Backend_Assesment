import connectDB from './connection';
import Product from '../models/Product';
import Cart from '../models/Cart';
import CartItem from '../models/CartItem';
import mongoose from 'mongoose';

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Database connection established');

    // Create indexes for better performance
    await Product.createIndexes();
    await Cart.createIndexes();
    await CartItem.createIndexes();
    console.log('✅ Database indexes created successfully');

    // Optionally drop existing collections (use with caution in production)
    if (process.env.NODE_ENV === 'development' && mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      console.log('✅ Database cleared for development');
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

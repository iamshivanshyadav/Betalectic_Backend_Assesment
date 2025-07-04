import connectDB from './connection';
import Product from '../models/Product';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Database connection established');

    // Create sample products
    const products = [
      { id: 'A', name: 'Product A', price: 30 },
      { id: 'B', name: 'Product B', price: 20 },
      { id: 'C', name: 'Product C', price: 50 },
      { id: 'D', name: 'Product D', price: 15 }
    ];

    for (const productData of products) {
      const existingProduct = await Product.findOne({ id: productData.id });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Created product: ${productData.id} - ${productData.name} (Rs ${productData.price})`);
      } else {
        console.log(`ℹ️  Product ${productData.id} already exists, skipping...`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📦 Sample Products Created:');
    console.log('┌─────┬───────────┬───────┐');
    console.log('│ ID  │ Name      │ Price │');
    console.log('├─────┼───────────┼───────┤');
    products.forEach(p => {
      console.log(`│ ${p.id}   │ ${p.name.padEnd(9)} │ Rs ${p.price.toString().padStart(2)} │`);
    });
    console.log('└─────┴───────────┴───────┘');
    
    console.log('\n🏷️  Promotion Rules:');
    console.log('• 3 of Item A = Rs 85 (instead of Rs 90)');
    console.log('• 2 of Item B = Rs 35 (instead of Rs 40)');
    console.log('• Rs 20 off when total > Rs 150 (after other discounts)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();

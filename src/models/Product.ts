import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  id: string;
  name: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'products'
});

// Create virtual for id to return the custom id field instead of _id
ProductSchema.virtual('productId').get(function() {
  return this.id;
});

// Ensure virtual fields are serialised
ProductSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Product = model<IProduct>('Product', ProductSchema);

export default Product;

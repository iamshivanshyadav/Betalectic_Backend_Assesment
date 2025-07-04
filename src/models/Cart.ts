import { Schema, model, Document, Types } from 'mongoose';

export interface ICart extends Document {
  _id: Types.ObjectId;
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>({
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalDiscount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  finalPrice: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'carts'
});

// Ensure virtual fields are serialised
CartSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Cart = model<ICart>('Cart', CartSchema);

export default Cart;

import { Schema, model, Document, Types } from 'mongoose';

export interface ICartItem extends Document {
  _id: Types.ObjectId;
  cartId: Types.ObjectId;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  cartId: {
    type: Schema.Types.ObjectId,
    ref: 'Cart',
    required: true
  },
  productId: {
    type: String,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'cart_items'
});

// Compound index for efficient queries
CartItemSchema.index({ cartId: 1, productId: 1 }, { unique: true });

// Ensure virtual fields are serialised
CartItemSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    ret.cartId = ret.cartId.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const CartItem = model<ICartItem>('CartItem', CartItemSchema);

export default CartItem;

// src/models/Product.ts
import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a Product document in MongoDB.
 * @interface IProduct
 * @extends Document
 */
export interface IProduct extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  isOnSale?: boolean;
  salePrice?: number;
}

/**
 * Mongoose Schema for the Product model.
 * @constant productSchema
 * @type {Schema<IProduct>}
 */
const productSchema: Schema<IProduct> = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    price: { type: Number, required: true },
    isOnSale: { type: Boolean },
    salePrice: { type: Number },
  },
  { timestamps: true }
);

/**
 * Mongoose Model for Products.
 * @constant Product
 * @type {Model<IProduct>}
 */
const Product = model<IProduct>('Product', productSchema);

export default Product;

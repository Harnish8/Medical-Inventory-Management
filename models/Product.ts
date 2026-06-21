import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  productId: string;
  productName: string;
  genericName?: string;
  categoryId: mongoose.Types.ObjectId;
  hsnCode: string;
  gstPercentage: number;
  unitType: string;
  minStockLevel: number;
  manufacturer?: string;
  description?: string;
  imageUrl?: string;
  status: 'Active' | 'Inactive';
}

const ProductSchema: Schema = new Schema(
  {
    productId: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    genericName: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'ProductCategory', required: true },
    hsnCode: { type: String, required: true },
    gstPercentage: { type: Number, required: true },
    unitType: { type: String, required: true },
    minStockLevel: { type: Number, required: true, default: 0 },
    manufacturer: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

ProductSchema.index({ status: 1 });

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductCategory extends Document {
  categoryName: string;
  description?: string;
  status: 'Active' | 'Inactive';
}

const ProductCategorySchema: Schema = new Schema(
  {
    categoryName: { type: String, required: true, unique: true },
    description: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

export const ProductCategory: Model<IProductCategory> = mongoose.models.ProductCategory || mongoose.model<IProductCategory>('ProductCategory', ProductCategorySchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBatch extends Document {
  batchId: string;
  productId: mongoose.Types.ObjectId;
  dealerId: mongoose.Types.ObjectId;
  costPricePerUnit: number;
  sellingPricePerUnit: number;
  quantityReceived: number;
  quantityCurrent: number;
  expiryDate: Date;
  manufacturingDate?: Date;
  batchLotNumber?: string;
  invoiceDate: Date;
  invoiceNumber?: string;
  storageLocation?: string;
  qualityStatus: 'Good' | 'Damaged';
  comments?: string;
  createdByUserId: mongoose.Types.ObjectId;
  status: 'Active' | 'Expired' | 'SoldOut';
}

const BatchSchema: Schema = new Schema(
  {
    batchId: { type: String, required: true, unique: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    dealerId: { type: Schema.Types.ObjectId, ref: 'Dealer', required: true },
    costPricePerUnit: { type: Number, required: true },
    sellingPricePerUnit: { type: Number, required: true, default: 0 },
    quantityReceived: { type: Number, required: true },
    quantityCurrent: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    manufacturingDate: { type: Date },
    batchLotNumber: { type: String },
    invoiceDate: { type: Date, required: true },
    invoiceNumber: { type: String },
    storageLocation: { type: String },
    qualityStatus: { type: String, enum: ['Good', 'Damaged'], default: 'Good' },
    comments: { type: String },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Active', 'Expired', 'SoldOut'], default: 'Active' },
  },
  { timestamps: true }
);

export const Batch: Model<IBatch> = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

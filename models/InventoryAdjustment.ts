import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryAdjustment extends Document {
  batchId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  adjustmentType: 'Stock Correction' | 'Damage/Expiry/Loss' | 'Return to Dealer' | 'Sample Distribution' | 'Other';
  quantityAdjusted: number;
  reason: string;
  adjustedByUserId: mongoose.Types.ObjectId;
  documentUrl?: string;
}

const InventoryAdjustmentSchema: Schema = new Schema(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    adjustmentType: { 
      type: String, 
      enum: ['Stock Correction', 'Damage/Expiry/Loss', 'Return to Dealer', 'Sample Distribution', 'Other'], 
      required: true 
    },
    quantityAdjusted: { type: Number, required: true },
    reason: { type: String, required: true },
    adjustedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    documentUrl: { type: String },
  },
  { timestamps: true }
);

export const InventoryAdjustment: Model<IInventoryAdjustment> = mongoose.models.InventoryAdjustment || mongoose.model<IInventoryAdjustment>('InventoryAdjustment', InventoryAdjustmentSchema);

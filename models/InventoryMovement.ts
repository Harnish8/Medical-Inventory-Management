import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryMovement extends Document {
  batchId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  movementType: 'In' | 'Out';
  quantityChanged: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceId?: string;
  userId: mongoose.Types.ObjectId;
  reason?: string;
}

const InventoryMovementSchema: Schema = new Schema(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    movementType: { type: String, enum: ['In', 'Out'], required: true },
    quantityChanged: { type: Number, required: true },
    quantityBefore: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    referenceId: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const InventoryMovement: Model<IInventoryMovement> = mongoose.models.InventoryMovement || mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);

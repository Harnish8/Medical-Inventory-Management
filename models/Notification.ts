import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  notificationType: 'low_stock' | 'expiry' | 'out_of_stock';
  batchId?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    notificationType: { type: String, enum: ['low_stock', 'expiry', 'out_of_stock'], required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], required: true },
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

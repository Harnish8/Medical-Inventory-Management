import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  entityType: 'batch' | 'product' | 'bill' | 'dealer' | 'user' | 'category';
  entityId: mongoose.Types.ObjectId | string;
  oldValue?: string;
  newValue?: string;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, enum: ['batch', 'product', 'bill', 'dealer', 'user', 'category'], required: true },
    entityId: { type: Schema.Types.Mixed, required: true },
    oldValue: { type: String },
    newValue: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

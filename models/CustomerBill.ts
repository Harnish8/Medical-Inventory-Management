import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBillItem {
  productId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  taxAmount: number;
  lineTotal: number;
}

export interface ICustomerBill extends Document {
  billId: string;
  customerName: string;
  customerType: 'Individual' | 'Hospital' | 'Clinic' | 'Other';
  customerPhone?: string;
  customerEmail?: string;
  customerGst?: string;
  paymentMethod: 'Cash' | 'Card' | 'Online Transfer' | 'Cheque';
  totalAmount: number;
  discount: number;
  taxAmount: number;
  generatedByUserId: mongoose.Types.ObjectId;
  notes?: string;
  items: IBillItem[];
  createdAt: Date;
}

const BillItemSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  lineTotal: { type: Number, required: true },
});

const CustomerBillSchema: Schema = new Schema(
  {
    billId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerType: { type: String, enum: ['Individual', 'Hospital', 'Clinic', 'Other'], required: true },
    customerPhone: { type: String },
    customerEmail: { type: String },
    customerGst: { type: String },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Online Transfer', 'Cheque'], required: true },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, required: true },
    generatedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
    items: [BillItemSchema],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CustomerBill: Model<ICustomerBill> = mongoose.models.CustomerBill || mongoose.model<ICustomerBill>('CustomerBill', CustomerBillSchema);

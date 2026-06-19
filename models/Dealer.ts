import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDealer extends Document {
  dealerName: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  gstNumber?: string;
  bankDetails?: string;
  notes?: string;
  status: 'Active' | 'Inactive';
}

const DealerSchema: Schema = new Schema(
  {
    dealerName: { type: String, required: true },
    contactPerson: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    gstNumber: { type: String },
    bankDetails: { type: String },
    notes: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

export const Dealer: Model<IDealer> = mongoose.models.Dealer || mongoose.model<IDealer>('Dealer', DealerSchema);

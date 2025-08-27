import { decrypt, encrypt } from '@/lib/encryption';
import mongoose from 'mongoose';

export type SaleStatus =
  | 'In Progress'
  | 'Closed Won'
  | 'Closed Lost'
  | 'Negotiation';
export type SalePriority = 'Low' | 'Medium' | 'High';

const SaleSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true }, // Clerk User ID to associate sales with a user
    organizationId: { type: String, required: false }, // Making it optional for backward compatibility
    customerName: {
      type: String,
      required: true,
      set: encrypt,
      get: decrypt,
    },
    dealValue: { type: String, required: true, set: encrypt, get: decrypt },
    status: {
      type: String,
      enum: ['In Progress', 'Closed Won', 'Closed Lost', 'Negotiation'],
      required: true,
    },
    contactDate: { type: String, required: true, set: encrypt, get: decrypt },
    salesperson: { type: String, required: true, set: encrypt, get: decrypt },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    note: {
      type: String,
      required: false,
      set: (value: string | undefined | null) => {
        if (!value) return value;
        return encrypt(value);
      },
      get: (value: string | undefined | null) => {
        if (!value) return value;
        return decrypt(value);
      },
    },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

const Sale = mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
export default Sale;

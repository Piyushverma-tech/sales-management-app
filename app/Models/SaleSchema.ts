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
    customerName: { type: String, required: true },
    dealValue: { type: String, required: true },
    status: {
      type: String,
      enum: ['In Progress', 'Closed Won', 'Closed Lost', 'Negotiation'],
      required: true,
    },
    contactDate: { type: String, required: true },
    salesperson: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  },
  { timestamps: true }
);

const Sale = mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
export default Sale;

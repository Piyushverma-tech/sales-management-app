import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    organizationId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { 
      type: String, 
      enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
      required: true 
    },
    paymentId: { type: String },
    orderId: { type: String },
    receiptId: { type: String },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },
    invoiceId: { type: String },
    paidAt: { type: Date },
    plan: { 
      type: String, 
      enum: ['starter', 'professional', 'enterprise'],
      required: true 
    },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    metadata: { type: Object }
  },
  { timestamps: true }
);

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

export default Payment; 
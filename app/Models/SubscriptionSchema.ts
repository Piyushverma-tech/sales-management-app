import mongoose from 'mongoose';

export type PlanType = 'starter' | 'professional' | 'enterprise' | 'trial';

const SubscriptionSchema = new mongoose.Schema(
  {
    organizationId: { type: String, required: true, unique: true },
    plan: { 
      type: String, 
      enum: ['starter', 'professional', 'enterprise', 'trial'],
      required: true 
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'trialing', 'past_due', 'canceled'],
      default: 'trialing' 
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    paymentId: { type: String },
    razorpaySubscriptionId: { type: String },
    customerId: { type: String },
    priceId: { type: String },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    // Store usage metrics
    teamMembersUsed: { type: Number, default: 0 },
    dealsCreated: { type: Number, default: 0 },
    // Payment history reference
    paymentHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }]
  },
  { timestamps: true }
);

const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);

export default Subscription; 
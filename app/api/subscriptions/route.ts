import { NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import connect from '@/app/lib/connect';
import Subscription from '@/app/Models/SubscriptionSchema';
import {
  FREE_TRIAL_DAYS,
  SUBSCRIPTION_PLANS,
} from '@/app/lib/subscription-constants';
import { createCustomer, createOrder } from '@/app/lib/razorpay';
import { nanoid } from 'nanoid';

// Get subscription status
export async function GET() {
  try {
    await connect();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId } = await auth();

    // If no organization, return default trial info
    if (!orgId) {
      return NextResponse.json({
        plan: 'personal',
        status: 'active',
        features: {
          maxTeamMembers: 1,
          maxDeals: 100,
          hasAdvancedAnalytics: false,
        },
      });
    }

    // Check if subscription exists
    const subscription = await Subscription.findOne({ organizationId: orgId });

    // If no subscription exists, return trial info
    if (!subscription) {
      // Create a trial subscription for the organization
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + FREE_TRIAL_DAYS);

      const newSubscription = await Subscription.create({
        organizationId: orgId,
        plan: 'trial',
        status: 'trialing',
        startDate: new Date(),
        endDate: trialEndDate,
      });

      return NextResponse.json({
        plan: 'trial',
        status: 'trialing',
        startDate: newSubscription.startDate,
        endDate: newSubscription.endDate,
        features: SUBSCRIPTION_PLANS.TRIAL,
      });
    }

    // Return subscription details
    const planDetails =
      SUBSCRIPTION_PLANS[
        subscription.plan.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS
      ];

    if (subscription.status === 'trialing') {
      const endDate = new Date(subscription.endDate);
      const today = new Date();

      if (today > endDate) {
        // Update the subscription status to inactive
        subscription.status = 'inactive';
        await subscription.save();

        return NextResponse.json({
          plan: subscription.plan,
          status: 'inactive', // Return the updated status
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          features: planDetails,
          paymentId: subscription.paymentId,
          razorpaySubscriptionId: subscription.razorpaySubscriptionId,
        });
      }
    }

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      features: planDetails,
      paymentId: subscription.paymentId,
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
    });
  } catch (error) {
    console.error('Error in GET /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Create or update subscription
export async function POST(req: Request) {
  try {
    await connect();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization required' },
        { status: 400 }
      );
    }

    const { plan, billingCycle } = await req.json();

    // Validate plan
    if (!['starter', 'professional', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Validate billing cycle
    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      );
    }

    // Get plan details with proper type assertion
    const planKey = plan.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS;
    const planDetails = SUBSCRIPTION_PLANS[planKey];

    // For enterprise plan, return custom quote process
    if (plan === 'enterprise') {
      return NextResponse.json({
        status: 'quote_required',
        message: 'Please contact sales for a custom quote',
      });
    }

    // Get price based on billing cycle with proper type handling
    let price: number | null = null;

    // Check if the plan has price properties before accessing them
    if (planKey === 'STARTER' || planKey === 'PROFESSIONAL') {
      if ('price' in planDetails && 'yearlyPrice' in planDetails) {
        price =
          billingCycle === 'monthly'
            ? planDetails.price
            : planDetails.yearlyPrice;
      }
    }

    if (price === null) {
      return NextResponse.json(
        { error: 'Price not defined for plan' },
        { status: 400 }
      );
    }

    // Create or get customer
    const customer = await createCustomer(
      user.firstName + ' ' + user.lastName,
      user.emailAddresses[0].emailAddress,
      user.phoneNumbers?.[0]?.phoneNumber || '',
      { orgId, userId: user.id }
    );

    // Create receipt ID
    const receiptId = `order_${nanoid(8)}`;

    // Create order
    const order = await createOrder(price, 'INR', receiptId, {
      plan,
      billingCycle,
      orgId,
      userId: user.id,
      customerId: customer.id,
    });

    console.log('Razorpay order created successfully', { orderId: order.id });

    // Return order details for frontend payment processing
    return NextResponse.json({
      order_id: order.id,
      amount: Number(order.amount) / 100,
      currency: order.currency,
      receipt: order.receipt,
      plan,
      billingCycle,
      key_id: process.env.RAZORPAY_TEST_KEY,
    });
  } catch (error) {
    console.error('Error in POST /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

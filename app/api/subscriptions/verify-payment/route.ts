import { NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import connect from '@/app/lib/connect';
import Subscription from '@/app/Models/SubscriptionSchema';
import Payment from '@/app/Models/PaymentSchema';
import { validatePayment } from '@/app/lib/razorpay';

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

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      plan,
      billingCycle,
    } = await req.json();

    // Validate the payment
    const isValid = validatePayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Save payment
    const payment = await Payment.create({
      organizationId: orgId,
      amount:
        billingCycle === 'monthly'
          ? plan === 'starter'
            ? 499
            : 999
          : plan === 'starter'
          ? 4990
          : 9990,
      currency: 'INR',
      status: 'captured',
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      plan,
      billingCycle,
      paidAt: new Date(),
    });

    // Calculate subscription end date
    const endDate = new Date();
    if (billingCycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update or create subscription
    const existingSubscription = await Subscription.findOne({
      organizationId: orgId,
    });

    if (existingSubscription) {
      existingSubscription.plan = plan;
      existingSubscription.status = 'active';
      existingSubscription.startDate = new Date();
      existingSubscription.endDate = endDate;
      existingSubscription.paymentId = payment._id;
      existingSubscription.billingCycle = billingCycle;

      // Push payment to history
      existingSubscription.paymentHistory.push(payment._id);

      await existingSubscription.save();
    } else {
      await Subscription.create({
        organizationId: orgId,
        plan,
        status: 'active',
        startDate: new Date(),
        endDate,
        paymentId: payment._id,
        billingCycle,
        paymentHistory: [payment._id],
      });
    }

    return NextResponse.json({
      success: true,
      plan,
      status: 'active',
      billingCycle,
      endDate,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

import Razorpay from 'razorpay';
import * as crypto from 'crypto';

// Define interfaces for Razorpay entities

interface RazorpayCustomer {
  id: string;
  name: string;
  email: string;
  contact?: string;
  created_at: number;
}

interface RazorpayCustomersList {
  entity: string;
  count: number;
  items: RazorpayCustomer[];
}

interface RazorpayError {
  statusCode?: number;
  error?: {
    code?: string;
    description?: string;
    step?: string;
    reason?: string;
    source?: string;
    [key: string]: unknown;
  };
  rawBody?: string;
  [key: string]: unknown;
}

// Initialize Razorpay
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY || '',
  key_secret: process.env.RAZORPAY_TEST_KEY_SECRET || '',
});

// Create an order for a one-time payment
export const createOrder = async (
  amount: number,
  currency: string = 'INR',
  receipt: string,
  notes: Record<string, string | number> = {}
) => {
  try {
    if (
      !process.env.RAZORPAY_TEST_KEY ||
      !process.env.RAZORPAY_TEST_KEY_SECRET
    ) {
      throw new Error('Razorpay API keys are not configured');
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    // Properly structure the error details
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    let errorDetails = {};

    if (error instanceof Error) {
      const razorpayError = error as unknown as RazorpayError;
      if (razorpayError.rawBody) {
        try {
          errorDetails = JSON.parse(razorpayError.rawBody);
        } catch {
          // If parsing fails, use an empty object
        }
      }
    }

    console.error('Razorpay error details:', {
      message: errorMessage,
      details: errorDetails,
    });

    throw error;
  }
};

// Validate a payment
export const validatePayment = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  try {
    // Creating the HMAC signature using the secret key
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_TEST_KEY_SECRET || '')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // Compare the generated signature with the signature received
    const isValid = expectedSignature === razorpaySignature;
    return isValid;
  } catch (error) {
    console.error('Error validating payment:', error);
    throw error;
  }
};

// Create a plan in Razorpay
export const createPlan = async (
  planName: string,
  amount: number,
  interval: 'weekly' | 'monthly' | 'yearly',
  description: string
) => {
  try {
    const plan = await razorpay.plans.create({
      period: interval,
      interval: 1,
      item: {
        name: planName,
        amount: amount * 100, // amount in smallest currency unit (paise)
        currency: 'INR',
        description,
      },
    });
    return plan;
  } catch (error) {
    console.error('Error creating Razorpay plan:', error);
    throw error;
  }
};

// Create a subscription for a customer
export const createSubscription = async (
  planId: string,
  totalCount: number,
  customerId: string,
  startAt: number,
  notes: Record<string, string | number> = {}
) => {
  try {
    // Store customerId in notes for reference
    const subscriptionNotes = { ...notes };
    if (customerId) {
      subscriptionNotes.customer_reference_id = customerId;
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: totalCount, // number of billing cycles
      customer_notify: 1, // notify the customer
      start_at: startAt, // subscription start time
      notes: subscriptionNotes,
      // Removed the invalid customer_id and notify_info properties
    });

    return subscription;
  } catch (error) {
    console.error('Error creating Razorpay subscription:', error);
    throw error;
  }
};

// Cancel a subscription
export const cancelSubscription = async (
  subscriptionId: string,
  cancelAtCycleEnd: boolean = false
) => {
  try {
    // Convert cancelAtCycleEnd to a number (1 or 0)
    const cancelValue = cancelAtCycleEnd ? 1 : 0;

    const subscription = await razorpay.subscriptions.cancel(
      subscriptionId,
      cancelValue
    );
    return subscription;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

// Create a customer in Razorpay
export const createCustomer = async (
  name: string,
  email: string,
  contactNumber: string = '',
  notes: Record<string, string | number> = {}
) => {
  try {
    if (
      !process.env.RAZORPAY_TEST_KEY ||
      !process.env.RAZORPAY_TEST_KEY_SECRET
    ) {
      throw new Error('Razorpay API keys are not configured');
    }

    try {
      const customer = await razorpay.customers.create({
        name,
        email,
        contact: contactNumber,
        notes,
      });
      return customer;
    } catch (error) {
      const razorpayError = error as RazorpayError;
      // If customer already exists error
      if (
        razorpayError?.error?.description ===
          'Customer already exists for the merchant' ||
        (error instanceof Error &&
          error.message.includes('Customer already exists'))
      ) {
        console.log(
          'Customer already exists, trying to fetch existing customer'
        );

        // Try to fetch existing customers
        const customers = (await razorpay.customers.all({
          count: 100,
        })) as RazorpayCustomersList;

        // Find the matching customer by email
        const existingCustomer = customers.items.find(
          (cust) => cust.email.toLowerCase() === email.toLowerCase()
        );

        if (existingCustomer) {
          console.log('Found existing customer:', existingCustomer.id);
          return existingCustomer;
        } else {
          // If we can't find the customer but Razorpay says it exists,
          // create a new one with slightly modified email to avoid collision
          console.log(
            'Customer exists but not found, creating with modified email'
          );
          const timestamp = Date.now();
          const modifiedEmail = `${email.split('@')[0]}+${timestamp}@${
            email.split('@')[1]
          }`;

          const newCustomer = await razorpay.customers.create({
            name,
            email: modifiedEmail,
            contact: contactNumber,
            notes,
          });

          return newCustomer;
        }
      }

      // Re-throw any other errors
      throw error;
    }
  } catch (error) {
    console.error('Error creating Razorpay customer:', error);
    // Properly structure the error details
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    let errorDetails = {};

    if (error instanceof Error) {
      const razorpayError = error as unknown as RazorpayError;
      if (razorpayError.rawBody) {
        try {
          errorDetails = JSON.parse(razorpayError.rawBody);
        } catch {
          // If parsing fails, use an empty object
        }
      }
    }

    console.error('Razorpay error details:', {
      message: errorMessage,
      details: errorDetails,
    });

    throw error;
  }
};

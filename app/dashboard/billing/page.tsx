'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/nextjs';
import { Loader2, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

interface SubscriptionData {
  plan: string;
  status: string;
  startDate?: string;
  endDate?: string;
  features?: {
    maxTeamMembers: number;
    maxDeals: number;
    hasAdvancedAnalytics: boolean;
    [key: string]: number | boolean | string;
  };
}

interface PaymentData {
  order_id: string;
  amount: number;
  currency: string;
  receipt: string;
  plan: string;
  billingCycle: string;
  key_id: string;
  status?: string;
}

// Add TypeScript interface for Razorpay instance and response
interface RazorpayInstance {
  new (options: RazorpayOptions): RazorpayCheckout;
}

interface RazorpayCheckout {
  open(): void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly'
  );
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { organization } = useOrganization();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayError, setRazorpayError] = useState<string | null>(null);

  // Fetch current subscription
  useEffect(() => {
    async function fetchSubscription() {
      try {
        if (!organization) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/subscriptions');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription data');
        }

        const data = await response.json();
        if (data.status == 'inactive') {
          setSubscription(null);
          setSelectedPlan('starter');
        } else {
          setSubscription(data);
          // Pre-select current plan if active
          if (data.plan && data.plan !== 'trial' && data.status === 'active') {
            setSelectedPlan(data.plan);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [organization]);

  // Handle plan selection
  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
  };

  // Handle Razorpay script load
  const handleRazorpayLoad = () => {
    setRazorpayLoaded(true);
    console.log('Razorpay SDK loaded successfully');
  };

  // Handle Razorpay script error
  const handleRazorpayError = () => {
    setRazorpayError(
      'Failed to load payment gateway. Please refresh the page or try again later.'
    );
    console.error('Failed to load Razorpay SDK');
  };

  // Handle payment
  const handlePayment = async () => {
    if (!organization) return;

    try {
      setProcessingPayment(true);
      setPaymentError(null);

      // Create order
      const orderResponse = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          billingCycle,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Order creation error:', {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.error ||
            `Failed to create order: ${orderResponse.status} ${orderResponse.statusText}`
        );
      }

      const paymentData: PaymentData = await orderResponse.json();
      console.log('Order created successfully:', paymentData);

      // For enterprise plan, show contact info
      if (paymentData.status === 'quote_required') {
        // Handle enterprise quote
        return;
      }

      // Inside handlePayment function, replace the Razorpay initialization code:
      // Initialize Razorpay
      if (!razorpayLoaded) {
        throw new Error(
          'Razorpay SDK is not loaded yet. Please try again in a moment.'
        );
      }

      const razorpay = (window as Window & { Razorpay?: RazorpayInstance })
        .Razorpay;
      if (!razorpay) {
        throw new Error(
          'Razorpay SDK failed to load. Please refresh the page and try again.'
        );
      }

      const options: RazorpayOptions = {
        key: paymentData.key_id,
        amount: paymentData.amount * 100, // in paisa
        currency: paymentData.currency,
        name: 'SaleX',
        description: `${
          selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)
        } Plan - ${billingCycle}`,
        order_id: paymentData.order_id,
        handler: async function (response: RazorpaySuccessResponse) {
          try {
            console.log('Payment successful, verifying:', response);
            // Verify payment
            const verifyResponse = await fetch(
              '/api/subscriptions/verify-payment',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  plan: selectedPlan,
                  billingCycle,
                }),
              }
            );

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              console.error('Verification error:', {
                status: verifyResponse.status,
                statusText: verifyResponse.statusText,
                error: errorData,
              });
              throw new Error(errorData.error || 'Payment verification failed');
            }

            // Refresh subscription data
            const refreshResponse = await fetch('/api/subscriptions');
            const refreshData = await refreshResponse.json();

            setSubscription(refreshData);

            // Show success message
            alert('Payment successful! Your subscription has been updated.');
          } catch (err) {
            console.error('Verification error:', err);
            setPaymentError(
              err instanceof Error
                ? err.message
                : 'Payment verification failed. Please contact support.'
            );
          }
        },
        prefill: {
          name: organization?.name || '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const razorpayInstance = new razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(
        err instanceof Error ? err.message : 'Payment processing failed'
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  if (!organization) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Organization Required</h1>
        <p className="mb-4">
          You need to be in an organization to manage billing.
        </p>
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-12 poppins">
      {/* Load Razorpay SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={handleRazorpayLoad}
        onError={handleRazorpayError}
      />

      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard">
          <ArrowLeft />
        </Link>
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-wide mb-2">
            Subscription Management
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your business needs and scale with
            confidence
          </p>
        </div>

        {/* Current subscription info */}
        {subscription && (
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/60 rounded-lg p-4 mb-12 border border-gray-700">
            <h2 className="text-lg font-medium mb-2">Current Plan</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div>
                <span className="inline-block bg-blue-900/50 text-blue-400 px-3 py-1 rounded text-sm font-medium">
                  {subscription.plan.charAt(0).toUpperCase() +
                    subscription.plan.slice(1)}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span
                  className={`text-sm font-medium ${
                    subscription.status === 'active'
                      ? 'text-green-400'
                      : subscription.status === 'trialing'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </span>
              </div>

              {subscription.endDate && (
                <div className="text-sm text-gray-400">
                  {subscription.status === 'trialing' ? 'Trial ends' : 'Renews'}{' '}
                  on{' '}
                  {new Date(subscription.endDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              )}
            </div>

            {subscription.features && (
              <div className="bg-gray-900 rounded p-3 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span>Team Members</span>
                  <span>{subscription.features.maxTeamMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deals</span>
                  <span>{subscription.features.maxDeals.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Advanced Analytics</span>
                  <span>
                    {subscription.features.hasAdvancedAnalytics ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Billing cycle toggle */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 tracking-wider">
            Billing Cycle
          </h2>
          <div className="inline-flex bg-gray-800 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly{' '}
              <span className="text-blue-300 text-xs ml-1">Save 16%</span>
            </button>
          </div>
        </div>

        {/* Plan selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Starter plan */}
          <div
            className={`relative bg-gradient-to-br from-gray-800/60 to-transparent backdrop-blur-sm rounded-2xl p-8 border-2 cursor-pointer transition-all duration-300   group ${
              selectedPlan === 'starter'
                ? 'border-blue-400'
                : 'border-gray-600/30 hover:border-gray-500/50'
            }`}
            onClick={() => handlePlanSelect('starter')}
          >
            {selectedPlan === 'starter' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Selected
                </div>
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold tracking-wide text-white mb-2 group-hover:text-blue-300 transition-colors">
                  Starter
                </h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">
                    {billingCycle === 'monthly' ? '₹499' : '₹4,990'}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="text-sm text-green-400 mt-1">
                    ₹499/month when paid yearly
                  </div>
                )}
              </div>
              {selectedPlan === 'starter' && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full shadow-lg">
                  <Check size={20} />
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {[
                { icon: '👥', text: 'Up to 5 team members' },
                { icon: '📊', text: '1,000 deals' },
                { icon: '📈', text: 'Basic analytics' },
                { icon: '📧', text: 'Trend charts' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Check size={16} className="text-green-400" />
                  </div>
                  <span className="text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-600/30 pt-4">
              <div className="text-sm text-gray-400">
                Perfect for small teams getting started
              </div>
            </div>
          </div>

          {/* Professional plan */}
          <div
            className={`relative bg-gradient-to-br from-gray-800/60 to-transparent backdrop-blur-sm rounded-2xl p-8 border-2 cursor-pointer transition-all duration-300   group ${
              selectedPlan === 'professional'
                ? 'border-blue-400'
                : 'border-gray-600/30 hover:border-gray-500/50'
            }`}
            onClick={() => handlePlanSelect('professional')}
          >
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                Most Popular
              </div>
            </div>

            {selectedPlan === 'professional' && (
              <div className="absolute top-4 right-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded-full shadow-lg">
                  <Check size={20} />
                </div>
              </div>
            )}

            <div className="mb-6 mt-4">
              <h3 className="text-2xl font-bold tracking-wide text-white mb-2 group-hover:text-blue-300 transition-colors">
                Professional
              </h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-white">
                  {billingCycle === 'monthly' ? '₹999' : '₹9,990'}
                </span>
                <span className="text-gray-400 text-sm ml-2">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <div className="text-sm text-green-400 mt-1">
                  ₹832/month when paid yearly
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {[
                { text: 'Up to 15 team members' },
                { text: '10,000 deals' },
                { text: 'Advanced analytics with AI' },
                { text: 'Priority support' },
                { text: 'API access' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Check size={16} className="text-green-400" />
                  </div>
                  <span className="text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-600/30 pt-4">
              <div className="text-sm text-gray-400">
                Best for growing businesses
              </div>
            </div>
          </div>

          {/* Enterprise plan */}
          <div
            className={`relative bg-gradient-to-br from-gray-800/60 to-transparent backdrop-blur-sm rounded-2xl p-8 border-2 cursor-pointer transition-all duration-300   group ${
              selectedPlan === 'enterprise'
                ? 'border-purple-400'
                : 'border-gray-600/30 hover:border-gray-500/50'
            }`}
            onClick={() => handlePlanSelect('enterprise')}
          >
            {selectedPlan === 'enterprise' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Selected
                </div>
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold tracking-wide text-white mb-2 group-hover:text-purple-300 transition-colors">
                  Enterprise
                </h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold tracking-wide bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Custom
                  </span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  Tailored to your needs
                </div>
              </div>
              {selectedPlan === 'enterprise' && (
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-2 rounded-full shadow-lg">
                  <Check size={20} />
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {[
                { text: 'Unlimited team members' },
                { text: 'Unlimited deals' },
                { text: 'Custom reporting' },
                { text: 'Dedicated account manager' },
                { text: 'SSO integration' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Check size={16} className="text-green-400" />
                  </div>
                  <span className="text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-600/30 pt-4">
              <div className="text-sm text-gray-400">
                For large organizations with complex needs
              </div>
            </div>
          </div>
        </div>

        {/* Payment error message */}
        {paymentError && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 mb-6 rounded-lg flex items-start">
            <AlertCircle className="mr-2 flex-shrink-0 h-5 w-5" />
            <span>{paymentError}</span>
          </div>
        )}

        {/* Display Razorpay loading error if any */}
        {razorpayError && (
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 mb-6 rounded-lg flex items-start">
            <AlertCircle className="mr-2 flex-shrink-0 h-5 w-5" />
            <span>{razorpayError}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Link>

          <button
            onClick={handlePayment}
            disabled={
              processingPayment ||
              (subscription?.status === 'active' &&
                selectedPlan === subscription?.plan)
            }
            className={`px-6 py-2 rounded-md font-medium ${
              selectedPlan === 'enterprise'
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {processingPayment ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Processing...
              </span>
            ) : selectedPlan === 'enterprise' ? (
              <Link href={'/contact'}>Contact Sales</Link>
            ) : selectedPlan === subscription?.plan ? (
              'Current Plan'
            ) : subscription?.status === 'inactive' ? (
              'Renew Plan'
            ) : (
              `Upgrade to ${
                selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)
              }`
            )}
          </button>
        </div>
        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center text-gray-400 text-sm">
            <svg
              className="w-4 h-4 mr-2 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            To test payments, use the test card number 2305 3242 5784 8228,
            random CVV, any future date
          </div>
        </div>
      </div>
    </div>
  );
}

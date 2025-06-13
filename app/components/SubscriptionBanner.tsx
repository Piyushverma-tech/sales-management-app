import { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/nextjs';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { X } from 'lucide-react';

interface SubscriptionData {
  plan: string;
  status: string;
  startDate?: string;
  endDate?: string;
  features?: {
    maxTeamMembers: number;
    maxDeals: number;
    hasAdvancedAnalytics: boolean;
  };
}

export default function SubscriptionBanner() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBannerClosed, setIsBannerClosed] = useState(false);
  const { organization } = useOrganization();
  const { theme } = useTheme();

  const textColor = theme === 'dark' ? 'text-blue-200' : 'text-white';
  const bgColor = theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-500';

  useEffect(() => {
    // Check if banner was previously closed
    if (organization?.id) {
      const isClosed = localStorage.getItem(
        `subscription-banner-closed-${organization.id}`
      );
      if (isClosed === 'true') {
        setIsBannerClosed(true);
      }
    }
  }, [organization?.id]);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        // Only fetch subscription data if in an organization
        if (!organization) {
          setLoading(false);
          return;
        }

        const response = await fetch('/api/subscriptions');
        if (!response.ok) {
          throw new Error('Failed to fetch subscription data');
        }

        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError('Could not load subscription information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [organization]);

  const handleCloseBanner = () => {
    if (organization?.id) {
      localStorage.setItem(
        `subscription-banner-closed-${organization.id}`,
        'true'
      );
      setIsBannerClosed(true);
    }
  };

  // Don't show banner for personal (non-organization)
  if (!organization || loading || isBannerClosed) {
    return null;
  }

  if (error) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 p-3 mb-4 rounded-lg">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!subscription) return null;

  // Trial banner
  if (subscription.status === 'trialing') {
    const endDate = subscription.endDate
      ? new Date(subscription.endDate)
      : null;
    const today = new Date();
    const daysLeft = endDate
      ? Math.max(
          0,
          Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
        )
      : 0;

    // check for expired trial
    const isTrialExpired = endDate ? today > endDate : false;

    return (
      <div
        className={`${
          isTrialExpired ? 'bg-red-900/30 border-red-600' : bgColor
        } border text-blue-100 p-4 mb-5 mx-4 rounded-lg`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className={`font-medium ${textColor}`}>
              {isTrialExpired
                ? 'Trial Period - Expired'
                : `Trial Period - ${daysLeft} ${
                    daysLeft === 1 ? 'day' : 'days'
                  } left`}
            </h3>
            <p className="text-sm mt-1">
              {isTrialExpired
                ? 'Your trial has expired. Please choose a plan to continue using all features.'
                : "You're currently on a free trial of our Professional plan. To avoid service interruption, please choose a plan."}
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium whitespace-nowrap"
          >
            Choose a Plan
          </Link>
        </div>
      </div>
    );
  }

  // Expired/Inactive subscription banner
  if (
    subscription.status === 'inactive' ||
    subscription.status === 'past_due' ||
    subscription.status === 'canceled'
  ) {
    return (
      <div className="bg-red-900/30 border border-red-600 text-red-100 p-4 mb-5  mx-4 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-medium text-red-200">Subscription Inactive</h3>
            <p className="text-sm mt-1">
              Your subscription has expired. Some features may be limited.
              Please renew your subscription to continue using all features.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium whitespace-nowrap"
          >
            Renew Now
          </Link>
        </div>
      </div>
    );
  }

  // Active subscription
  if (subscription.features && subscription.status === 'active') {
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 mb-4 mx-4 rounded-lg relative">
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 pr-8">
          <span className="text-green-400 font-medium">
            {subscription.plan.charAt(0).toUpperCase() +
              subscription.plan.slice(1)}{' '}
            Plan
          </span>
          <span>Team members: {subscription.features.maxTeamMembers}</span>
          <span>Deals: {subscription.features.maxDeals.toLocaleString()}</span>
          {subscription.features.hasAdvancedAnalytics && (
            <span className="text-blue-400">Advanced Analytics</span>
          )}
        </div>
        <button
          onClick={handleCloseBanner}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-100 transition-colors"
          aria-label="Close banner"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return null;
}

import { getPlanLimits } from './subscription-constants';

export interface SubscriptionData {
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

/**
 * Check if a feature is available for a subscription plan
 */
export function hasFeature(
  subscription: SubscriptionData | null,
  featureName: 'hasAdvancedAnalytics' | 'api' | 'custom_dashboard'
): boolean {
  // If no subscription data, assume trial
  if (!subscription) return false;

  // If not active or trialing, no features
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return false;
  }

  // Get feature from plan details
  const planFeatures =
    subscription.features || getPlanLimits(subscription.plan);

  if (featureName === 'hasAdvancedAnalytics') {
    return !!planFeatures.hasAdvancedAnalytics;
  }

  // For other features, check against plan names
  const professionalOrHigher = ['professional', 'enterprise'].includes(
    subscription.plan
  );
  // const enterpriseOnly = ['enterprise'].includes(subscription.plan);

  switch (featureName) {
    case 'api':
      return professionalOrHigher;
    case 'custom_dashboard':
      return professionalOrHigher;
    default:
      return false;
  }
}

/**
 * Check if a user is within their subscription limits
 */
export function isWithinLimits(
  subscription: SubscriptionData | null,
  limitType: 'team_members' | 'deals',
  currentCount: number
): {
  withinLimits: boolean;
  current: number;
  maximum: number;
  usagePercentage: number;
} {
  // If no subscription data, assume trial
  if (!subscription) {
    const trialLimits = getPlanLimits('trial');
    const max =
      limitType === 'team_members'
        ? trialLimits.maxTeamMembers
        : trialLimits.maxDeals;

    return {
      withinLimits: currentCount < max,
      current: currentCount,
      maximum: max,
      usagePercentage: Math.round((currentCount / max) * 100),
    };
  }

  // Get limits from subscription
  const planFeatures =
    subscription.features || getPlanLimits(subscription.plan);
  const max =
    limitType === 'team_members'
      ? planFeatures.maxTeamMembers
      : planFeatures.maxDeals;

  return {
    withinLimits: currentCount < max,
    current: currentCount,
    maximum: max,
    usagePercentage: Math.round((currentCount / max) * 100),
  };
}

/**
 * Calculate days remaining in trial or subscription period
 */
export function getDaysRemaining(
  subscription: SubscriptionData | null
): number {
  if (!subscription || !subscription.endDate) return 0;

  const endDate = new Date(subscription.endDate);
  const today = new Date();

  // Calculate difference in days
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays); // Don't return negative days
}

/**
 * Check if subscription is active or in trial period
 */
export function isSubscriptionActive(
  subscription: SubscriptionData | null
): boolean {
  if (!subscription) return false;
  return subscription.status === 'active' || subscription.status === 'trialing';
}

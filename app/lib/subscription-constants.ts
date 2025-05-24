export const SUBSCRIPTION_PLANS = {
  TRIAL: {
    name: 'Trial',
    maxTeamMembers: 5,
    maxDeals: 100, // Limited for trial
    hasAdvancedAnalytics: true, // Letting them try everything
    durationDays: 14,
  },
  STARTER: {
    name: 'Starter',
    price: 499, // INR monthly
    yearlyPrice: 4990, // INR yearly (2 months free)
    maxTeamMembers: 5,
    maxDeals: 1000,
    hasAdvancedAnalytics: false,
    features: [
      'Up to 5 team members',
      '1,000 deals',
      'Basic analytics',
      'Email support',
      'CSV exports',
    ],
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 999, // INR monthly
    yearlyPrice: 9990, // INR yearly (2 months free)
    maxTeamMembers: 15,
    maxDeals: 10000,
    hasAdvancedAnalytics: true,
    features: [
      'Up to 15 team members',
      '10,000 deals',
      'Advanced analytics with trends',
      'Priority support',
      'API access',
      'Custom dashboard',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: null, // Custom pricing
    yearlyPrice: null,
    maxTeamMembers: Infinity,
    maxDeals: Infinity,
    hasAdvancedAnalytics: true,
    features: [
      'Unlimited team members',
      'Unlimited deals',
      'Custom reporting',
      'Dedicated account manager',
      'SSO integration',
      'Data retention policy',
    ],
  },
};

export const RAZORPAY_PLAN_IDS = {
  starter_monthly: 'plan_STARTER_MONTHLY',
  starter_yearly: 'plan_STARTER_YEARLY',
  professional_monthly: 'plan_PROFESSIONAL_MONTHLY',
  professional_yearly: 'plan_PROFESSIONAL_YEARLY',
};

// Free trial duration in days
export const FREE_TRIAL_DAYS = 14;

// Helper to get plan limits
export function getPlanLimits(plan: string) {
  switch (plan) {
    case 'trial':
      return SUBSCRIPTION_PLANS.TRIAL;
    case 'starter':
      return SUBSCRIPTION_PLANS.STARTER;
    case 'professional':
      return SUBSCRIPTION_PLANS.PROFESSIONAL;
    case 'enterprise':
      return SUBSCRIPTION_PLANS.ENTERPRISE;
    default:
      return SUBSCRIPTION_PLANS.TRIAL;
  }
}

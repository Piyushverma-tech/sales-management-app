import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useOrganization } from '@clerk/nextjs';
import {
  SubscriptionData,
  isWithinLimits,
  getDaysRemaining,
  hasFeature,
} from '@/app/lib/subscription-utils';
import { AlertCircle } from 'lucide-react';
import { ReactNode } from 'react';
import Link from 'next/link';
import StatsCards from './StatsCard';
import SalesTrendsChart from './SalesTrendChart/SalesTrendsChart';
import AdvancedAnalytics from './AdvancedAnalytics';
import { DashboardShimmer } from '@/app/components/DashboardShimmer';

type SubscriptionCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  helpText?: string;
  progress?: {
    value: number;
    max: number;
    percentage: number;
    color: 'default' | 'warning' | 'critical';
  };
};

export default function DashboardMetrics() {
  const [activeTab, setActiveTab] = useState<string>('stats');
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null
  );
  const [dealCount, setDealCount] = useState<number>(0);
  const [teamMemberCount, setTeamMemberCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { organization, isLoaded } = useOrganization();
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const showNotice = (message: string) => {
    setNoticeMessage(message);
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNoticeMessage(null);
      noticeTimerRef.current = null;
    }, 3000);
  };

  // Check if advanced analytics are available
  const hasAdvancedAnalytics = hasFeature(subscription, 'hasAdvancedAnalytics');
  const hasTrendCharts = hasFeature(subscription, 'TrendCharts');

  // Access rules
  const canAccessTrends = !organization || hasTrendCharts; // Personal user always gets Trends
  const canAccessAdvanced = !!organization && hasAdvancedAnalytics; // Advanced for professional or higher plan
  const canAccessSubscription = !!organization; // Subscription tab only for orgs

  // Keep user on accessible tab if current becomes unavailable
  useEffect(() => {
    if (activeTab === 'trends' && !canAccessTrends) {
      setActiveTab('stats');
    }
    if (activeTab === 'advanced' && !canAccessAdvanced) {
      setActiveTab('stats');
    }
    if (activeTab === 'subscription' && !canAccessSubscription) {
      setActiveTab('stats');
    }
  }, [
    subscription,
    activeTab,
    canAccessTrends,
    canAccessAdvanced,
    canAccessSubscription,
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch subscription data (for both personal and organization)
        const subResponse = await fetch('/api/subscriptions');
        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscription(subData);
        }

        // Org-only usage metrics
        if (organization) {
          const salesResponse = await fetch('/api/sales-data/count');
          if (salesResponse.ok) {
            const { count } = await salesResponse.json();
            setDealCount(count);
          }

          const teamResponse = await fetch('/api/sales-persons');
          if (teamResponse.ok) {
            const data = await teamResponse.json();
            if (Array.isArray(data.salesPersons)) {
              setTeamMemberCount(data.salesPersons.length);
            } else if (data.limits) {
              setTeamMemberCount(data.limits.current);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    // Only fetch data once the organization state is loaded
    if (isLoaded) {
      fetchData();
    }
  }, [organization, isLoaded]);

  // Prepare subscription metrics
  let subscriptionMetrics: SubscriptionCardProps[] = [];

  if (subscription) {
    const dealLimits = isWithinLimits(subscription, 'deals', dealCount);
    const teamLimits = isWithinLimits(
      subscription,
      'team_members',
      teamMemberCount
    );
    const daysRemaining = getDaysRemaining(subscription);
    const isTrialing = subscription.status === 'trialing';

    subscriptionMetrics = [
      {
        title: 'Deals',
        value: `${dealLimits.current} / ${dealLimits.maximum}`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
            <line x1="16" y1="8" x2="2" y2="22"></line>
            <line x1="17.5" y1="15" x2="9" y2="15"></line>
          </svg>
        ),
        helpText: !dealLimits.withinLimits
          ? 'You have reached your deal limit. Please upgrade your plan.'
          : dealLimits.usagePercentage > 90
          ? 'You are near your deal limit. Consider upgrading soon.'
          : `${dealLimits.usagePercentage}% of your deal limit used.`,
        progress: {
          value: dealLimits.current,
          max: dealLimits.maximum,
          percentage: dealLimits.usagePercentage,
          color:
            dealLimits.usagePercentage > 90
              ? 'critical'
              : dealLimits.usagePercentage > 75
              ? 'warning'
              : 'default',
        },
      },
      {
        title: 'Team Members',
        value: `${teamLimits.current} / ${teamLimits.maximum}`,
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        helpText: !teamLimits.withinLimits
          ? 'You have reached your team member limit. Please upgrade your plan.'
          : teamLimits.usagePercentage > 90
          ? 'You are near your team member limit. Consider upgrading soon.'
          : `${teamLimits.usagePercentage}% of your team member limit used.`,
        progress: {
          value: teamLimits.current,
          max: teamLimits.maximum,
          percentage: teamLimits.usagePercentage,
          color:
            teamLimits.usagePercentage > 90
              ? 'critical'
              : teamLimits.usagePercentage > 75
              ? 'warning'
              : 'default',
        },
      },
      {
        title: isTrialing ? 'Trial Period' : 'Subscription',
        value: isTrialing
          ? `${daysRemaining} days left`
          : subscription.status.charAt(0).toUpperCase() +
            subscription.status.slice(1),
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
            <line x1="6" x2="6.01" y1="15" y2="15" />
            <line x1="10" x2="10.01" y1="15" y2="15" />
          </svg>
        ),
        helpText: isTrialing
          ? daysRemaining <= 0
            ? 'Your trial has expired. Please select a plan to continue.'
            : `Your trial will expire soon. Choose a plan to continue.`
          : `Renews on ${new Date(subscription.endDate!).toLocaleDateString(
              'en-IN',
              { day: '2-digit', month: '2-digit', year: 'numeric' }
            )}`,
        progress: isTrialing
          ? {
              value: 14 - daysRemaining,
              max: 14,
              percentage: Math.max(
                0,
                Math.min(100, 100 - (daysRemaining / 14) * 100)
              ),
              color:
                daysRemaining < 3
                  ? 'critical'
                  : daysRemaining < 7
                  ? 'warning'
                  : 'default',
            }
          : undefined,
      },
      {
        title: 'Plan',
        value:
          subscription.status == 'inactive'
            ? 'N/A'
            : subscription.plan.charAt(0).toUpperCase() +
              subscription.plan.slice(1),
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        ),
        helpText:
          subscription.plan === 'trial' || subscription.status === 'inactive'
            ? 'You are not on subscription, buy a plan to get more benefits.'
            : `You're on the ${subscription.plan} plan.`,
      },
    ];
  }

  return (
    <Card className="p-4 shadow-none sm:m-5 my-6">
      {loading ? (
        <DashboardShimmer />
      ) : (
        <div className="mb-4">
          <Tabs
            defaultValue="stats"
            value={activeTab}
            onValueChange={(val) => {
              if (val === 'trends') {
                if (!canAccessTrends) {
                  showNotice('Upgrade to Starter to use Sales Trend.');
                  return;
                }
              }
              if (val === 'advanced') {
                if (!canAccessAdvanced) {
                  showNotice(
                    !organization
                      ? 'This feature is only available for Organizations.'
                      : 'Upgrade to Professional Plan to use Advanced Analytics.'
                  );
                  return;
                }
              }
              if (val === 'subscription') {
                if (!canAccessSubscription) {
                  showNotice('Create an organization to manage subscription.');
                  return;
                }
              }
              setActiveTab(val);
            }}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <TabsList className="w-full h-auto sm:w-auto grid grid-cols-8 sm:flex sm:grid-cols-none gap-1">
                <TabsTrigger
                  value="stats"
                  className="flex items-center gap-2 px-4 py-1 col-span-2 sm:col-span-1"
                >
                  <span className="hidden sm:inline">Sales Stats</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger
                  value="trends"
                  className={`flex items-center gap-2 px-4 py-1 col-span-2 sm:col-span-1 ${
                    canAccessTrends ? '' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">Sales Trend</span>
                  <span className="sm:hidden">Trends</span>
                </TabsTrigger>

                <TabsTrigger
                  value="advanced"
                  className={`flex items-center gap-2 px-4 py-1 col-span-2 sm:col-span-1 ${
                    canAccessAdvanced ? '' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">Advanced Analytics</span>
                  <span className="sm:hidden">Analytics</span>
                </TabsTrigger>

                <TabsTrigger
                  value="subscription"
                  className={`flex items-center gap-2 px-4 py-1 col-span-2 sm:col-span-1 ${
                    canAccessSubscription ? '' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">Subscription</span>
                  <span className="sm:hidden">Plan</span>
                </TabsTrigger>
              </TabsList>

              {organization && activeTab === 'subscription' && (
                <Link
                  href="/dashboard/billing"
                  className="text-sm text-primary hover:underline whitespace-nowrap"
                >
                  {subscription?.status === 'inactive'
                    ? 'Reactivate Now'
                    : 'Manage Subscription'}
                </Link>
              )}
              {noticeMessage && (
                <div className="w-full text-xs  flex items-center gap-2 text-blue-500 bg-blue-600/20 rounded px-3 py-2">
                  <AlertCircle size={16} /> {noticeMessage}
                </div>
              )}
            </div>

            {/* Sales Stats Tab */}
            <TabsContent value="stats" className="mt-6">
              <StatsCards />
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <SalesTrendsChart />
            </TabsContent>

            {/* Advanced Analytics Tab - Only shown if subscription allows */}
            {hasAdvancedAnalytics && (
              <TabsContent value="advanced" className="mt-6">
                <AdvancedAnalytics />
              </TabsContent>
            )}

            {/* Subscription Tab - Only for organization users */}
            {organization && (
              <TabsContent value="subscription" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {subscriptionMetrics.map((metric, index) => (
                    <SubscriptionCard key={index} {...metric} />
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </Card>
  );
}

function SubscriptionCard({
  title,
  value,
  icon,
  helpText,
  progress,
}: SubscriptionCardProps) {
  return (
    <Card className="p-4 flex flex-col gap-2 shadow-none">
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600">{title}</span>
        <div className="size-7 rounded-md flex items-center justify-center text-sm bg-primary/25 font-bold text-primary">
          {icon}
        </div>
      </div>

      {/* amount */}
      <div className="text-2xl  font-mono font-bold">{value}</div>

      {/* Progress bar for subscription metrics */}
      {progress && (
        <div className="mt-2">
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                progress.color === 'critical'
                  ? 'bg-red-500'
                  : progress.color === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, progress.percentage)}%` }}
            />
          </div>
          {helpText && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {helpText}
            </p>
          )}
        </div>
      )}

      {/* Help text without progress bar */}
      {!progress && helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {helpText}
        </p>
      )}
    </Card>
  );
}

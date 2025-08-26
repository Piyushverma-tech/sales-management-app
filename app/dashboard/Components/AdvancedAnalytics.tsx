'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  DollarSign,
  Loader2,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

import { FaRobot } from 'react-icons/fa';

type Aggregates = {
  totalDeals: number;
  totalDealValue: number;
  byStatus: Record<string, { count: number; value: number }>;
  bySalesperson: Record<string, { count: number; value: number }>;
  last30DaysDeals: number;
  last30DaysValue: number;
};

type AiResult = {
  summary: string;
  forecast_next_30_days_amount: number;
  risks: string[];
  recommendations: string[];
};

export default function AdvancedAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aggregates, setAggregates] = useState<Aggregates | null>(null);
  const [ai, setAi] = useState<AiResult | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/ai/advanced-analytics');
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const message =
            (data && (data.error || data.message)) || `Error ${res.status}`;
          throw new Error(message);
        }
        setAggregates(data.aggregates);
        setAi(data.ai);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 shadow-none">
        <div className="flex justify-center items-center py-10">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 shadow-none">
        <p className="text-sm text-red-600">{error}</p>
        <p className="text-xs text-slate-500 mt-2">
          Tips: ensure you are signed in, have an active org selected, and set
          GEMINI_API_KEY on the server. Restart dev server after changing envs.
        </p>
      </Card>
    );
  }

  if (!aggregates) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Deals</p>
              <p className="text-2xl font-bold">{aggregates.totalDeals}</p>
            </div>
            <div className="bg-blue-600/25 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">
                {aggregates.totalDealValue.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="bg-blue-600/25 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last 30 Days</p>
              <p className="text-2xl font-bold">{aggregates.last30DaysDeals}</p>
              <p className="text-xs text-muted-foreground">
                {aggregates.last30DaysValue.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="bg-blue-600/25 p-2 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Forecast (30d)</p>
              <p className="text-2xl font-bold">
                {ai?.forecast_next_30_days_amount?.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }) || '-'}
              </p>
            </div>
            <div className="bg-blue-600/25 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* AI Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600/25 p-2 rounded-lg">
            <FaRobot className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold">AI Summary</h2>
        </div>
        <p className="text-sm leading-relaxed">
          {ai?.summary || 'No summary available.'}
        </p>
      </Card>

      {/* Risks and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-600/25 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-base font-semibold">Key Risks</h3>
          </div>
          {ai?.risks?.length ? (
            <ul className="space-y-2">
              {ai.risks.slice(0, 6).map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0" />
                  <span className="leading-relaxed ">{risk}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No risks identified.
            </p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-600/25 p-2 rounded-lg">
              <Target className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="text-base font-semibold">Recommendations</h3>
          </div>
          {ai?.recommendations?.length ? (
            <ul className="space-y-2">
              {ai.recommendations.slice(0, 6).map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recommendations available.
            </p>
          )}
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600/25 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold">By Status</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(aggregates.byStatus).map(([status, data]) => (
              <div
                key={status}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm font-medium">{status}</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{data.count} deals</div>
                  <div className="text-xs text-muted-foreground">
                    {data.value.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600/25 p-2 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold">By Salesperson</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(aggregates.bySalesperson).map(([person, data]) => (
              <div
                key={person}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm font-medium">{person}</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{data.count} deals</div>
                  <div className="text-xs text-muted-foreground">
                    {data.value.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

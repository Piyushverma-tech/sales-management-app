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
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FaRobot } from 'react-icons/fa';
import { GrAnalytics } from 'react-icons/gr';

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
          Tips: ensure you are signed in, have an active org selected.
        </p>
      </Card>
    );
  }

  if (!aggregates) return null;

  // Prepare chart data
  const statusChartData = Object.entries(aggregates.byStatus).map(
    ([status, data]) => ({
      name: status,
      value: data.count,
      amount: data.value,
    })
  );

  const salespersonChartData = Object.entries(aggregates.bySalesperson)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 8)
    .map(([name, data]) => ({
      name: name.length > 15 ? name.slice(0, 15) + '...' : name,
      deals: data.count,
      value: data.value,
    }));

  const COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#84cc16',
    '#f97316',
  ];

  return (
    <>
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
                <p className="text-2xl font-bold">
                  {aggregates.last30DaysDeals}
                </p>
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Chart and Breakdown */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600/25 p-2 rounded-lg">
                <GrAnalytics className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold">Deals by Status</h3>
            </div>

            {/* Pie Chart */}
            <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} deals`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Status Breakdown */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                {Object.entries(aggregates.byStatus).map(([status, data]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-sm font-medium">{status}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {data.count} deals
                      </div>
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
            </div>
          </Card>

          {/* Team Performance */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600/25 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold">Team Performance</h3>
            </div>

            {/* Bar Chart */}
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salespersonChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    textAnchor="end"
                    height={50}
                    fontSize={10}
                  />
                  <YAxis fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      color: 'white',
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                    formatter={(value, name) => [
                      name === 'value'
                        ? `₹${Number(value).toLocaleString('en-IN')}`
                        : `${value} deals`,
                      name === 'value' ? 'Deal Value' : 'Deal Count',
                    ]}
                  />
                  <Bar dataKey="deals" fill="#3b82f6" name="deals" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Team Performance List */}
            <div className="border-t pt-4">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(aggregates.bySalesperson)
                  .sort((a, b) => b[1].value - a[1].value)
                  .map(([person, data]) => (
                    <div
                      key={person}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm font-medium truncate">
                        {person}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {data.count} deals
                        </div>
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
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

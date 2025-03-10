import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  TooltipProps,
} from 'recharts';
import { useSalesStore } from '@/app/useSalesStore';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import StatsCards from '../StatsCard';
import { SaleType } from '@/app/types';

interface SalesPeriodData {
  period: string;
  totalSales: number;
  dealCount: number;
  wonDeals: number;
}

export default function SalesTrendsChart() {
  const { allSales } = useSalesStore();
  const [timeRange, setTimeRange] = useState<
    'weekly' | 'monthly' | 'quarterly'
  >('monthly');
  const [isExpanded, setIsExpanded] = useState(false);
  const { setOpenDealDialog } = useSalesStore();

  const hasData = allSales.length > 0;

  // Process data based on the selected time range
  const chartData = useMemo(() => {
    if (!allSales.length) return [];

    // Helper function to format dates
    const getDateKey = (date: string, range: string): string => {
      const dateObj = new Date(date);
      if (range === 'weekly') {
        // Get week number and year
        const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1);
        const pastDaysOfYear =
          (dateObj.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil(
          (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
        );
        return `Week ${weekNum}, ${dateObj.getFullYear()}`;
      } else if (range === 'monthly') {
        return `${dateObj.toLocaleString('default', {
          month: 'short',
        })} ${dateObj.getFullYear()}`;
      } else {
        // quarterly
        const quarter = Math.floor(dateObj.getMonth() / 3) + 1;
        return `Q${quarter} ${dateObj.getFullYear()}`;
      }
    };

    // Group sales by time period
    const salesByPeriod: Record<string, SalesPeriodData> = {};

    allSales.forEach((sale: SaleType) => {
      const date = sale.contactDate;
      if (!date) return;

      const key = getDateKey(date, timeRange);
      const value = parseFloat(
        sale.dealValue.toString().replace(/[^0-9.-]+/g, '')
      );

      if (!salesByPeriod[key]) {
        salesByPeriod[key] = {
          period: key,
          totalSales: 0,
          dealCount: 0,
          wonDeals: 0,
        };
      }

      salesByPeriod[key].totalSales += value;
      salesByPeriod[key].dealCount += 1;
      if (sale.status === 'Closed Won') {
        salesByPeriod[key].wonDeals += 1;
      }
    });

    // Convert to array and sort chronologically
    return Object.values(salesByPeriod).sort((a, b) => {
      // Extract data for proper chronological sorting
      if (timeRange === 'weekly') {
        // Extract week number and year from format "Week X, YYYY"
        const [aWeek, aYear] = a.period
          .replace('Week ', '')
          .split(', ')
          .map(Number);
        const [bWeek, bYear] = b.period
          .replace('Week ', '')
          .split(', ')
          .map(Number);

        // Compare years first
        if (aYear !== bYear) return aYear - bYear;
        // Then compare weeks
        return aWeek - bWeek;
      } else if (timeRange === 'monthly') {
        // Extract from format "MMM YYYY"
        const aDate = new Date(a.period);
        const bDate = new Date(b.period);
        return aDate.getTime() - bDate.getTime();
      } else {
        // Extract quarter and year from format "QX YYYY"
        const [aQuarter, aYear] = a.period
          .replace('Q', '')
          .split(' ')
          .map(Number);
        const [bQuarter, bYear] = b.period
          .replace('Q', '')
          .split(' ')
          .map(Number);

        // Compare years first
        if (aYear !== bYear) return aYear - bYear;
        // Then compare quarters
        return aQuarter - bQuarter;
      }
    });
  }, [allSales, timeRange]);

  const revenueGrowth = useMemo(() => {
    if (chartData.length < 2) return null;
    const firstValue = chartData[0].totalSales;
    const lastValue = chartData[chartData.length - 1].totalSales;
    return ((lastValue - firstValue) / firstValue) * 100;
  }, [chartData]);

  // Custom tooltip for line chart
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-4 rounded-md border border-slate-700 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(payload[0].value as number)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-slate-800/50 rounded-full p-4 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-400"
        >
          <path d="M3 3v18h18"></path>
          <path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
      </div>
      <h3 className="text-xl font-medium text-slate-200 mb-2">
        No sales data yet
      </h3>
      <p className="text-slate-400 max-w-md mb-6">
        Once you start adding sales records, your trends will appear here
        automatically.
      </p>
      <Button
        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white"
        onClick={() => setOpenDealDialog(true)}
      >
        Create Your First Sale
      </Button>
    </div>
  );

  return (
    <Card className="shadow-none sm:m-6 max-sm:border-none  poppins px-2 my-6">
      <StatsCards />
      <CardHeader className="pb-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <div>
              <CardTitle
                onClick={() => setIsExpanded(!isExpanded)}
                className={`font-semibold flex items-center text-xl mb-6 tracking-normal  ${
                  isExpanded ? 'text-primary ' : 'text-slate-500  '
                } hover:text-primary cursor-pointer`}
              >
                Sales Trends
                <span
                  className="ml-1"
                  aria-label={isExpanded ? 'Collapse charts' : 'Expand charts'}
                >
                  {isExpanded ? (
                    <ChevronUp className="size-6 " />
                  ) : (
                    <ChevronDown className="size-6" />
                  )}
                </span>
              </CardTitle>

              {revenueGrowth !== null && isExpanded && (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {revenueGrowth >= 0 ? '↑' : '↓'}{' '}
                    {Math.abs(revenueGrowth).toFixed(1)}%
                  </span>
                  <span className="text-slate-400 text-sm">
                    from {chartData[0].period} to{' '}
                    {chartData[chartData.length - 1].period}
                  </span>
                </div>
              )}
            </div>
          </div>
          {isExpanded && hasData && (
            <div className="flex space-x-2 p-1 rounded-lg">
              <Button
                variant="ghost"
                onClick={() => setTimeRange('weekly')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  timeRange === 'weekly'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md'
                    : 'text-slate-400 '
                }`}
              >
                Weekly
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTimeRange('monthly')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  timeRange === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md'
                    : 'text-slate-400'
                }`}
              >
                Monthly
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTimeRange('quarterly')}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  timeRange === 'quarterly'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-md'
                    : 'text-slate-400 '
                }`}
              >
                Quarterly
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-6">
          {!hasData ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Revenue Trend Chart */}
              <div className="p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Revenue Trend</h3>
                  {chartData.length > 0 && (
                    <span className="text-sm text-slate-400">
                      Last:{' '}
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      }).format(chartData[chartData.length - 1].totalSales)}
                    </span>
                  )}
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="period"
                        tick={{ fill: '#94a3b8' }}
                        axisLine={{ stroke: '#475569' }}
                        tickLine={{ stroke: '#475569' }}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            notation: 'compact',
                            maximumFractionDigits: 1,
                          }).format(Number(value))
                        }
                        tick={{ fill: '#94a3b8' }}
                        axisLine={{ stroke: '#475569' }}
                        tickLine={{ stroke: '#475569' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="totalSales"
                        name="Revenue"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: '#1e3a8a',
                          strokeWidth: 2,
                          stroke: '#3b82f6',
                        }}
                        activeDot={{ r: 6, fill: '#60a5fa', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Deal Count Chart */}
              <div className="p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Deal Count</h3>
                  {chartData.length > 0 && (
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-slate-400">Total</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-slate-400">Won</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
                      barGap={8}
                      barSize={24}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="period"
                        tick={{ fill: '#94a3b8' }}
                        axisLine={{ stroke: '#475569' }}
                        tickLine={{ stroke: '#475569' }}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8' }}
                        axisLine={{ stroke: '#475569' }}
                        tickLine={{ stroke: '#475569' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#334155',
                          color: 'white',
                        }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                      />
                      <Bar
                        dataKey="dealCount"
                        name="Total Deals"
                        fill="#60a5fa"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="wonDeals"
                        name="Won Deals"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

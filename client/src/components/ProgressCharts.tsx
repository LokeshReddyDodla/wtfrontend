import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from 'recharts';
import { format } from 'date-fns';
import { TrendingDown, TrendingUp, Minus, ArrowRight } from 'lucide-react';

interface DataPoint {
  date: string;
  weight?: number;
  bmi?: number;
  bodyFat?: number;
}

interface ProgressChartsProps {
  data: DataPoint[];
  onRangeChange?: (range: string) => void;
}

const timeRanges = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'All', value: 'all' },
];

export default function ProgressCharts({ data, onRangeChange }: ProgressChartsProps) {
  const [selectedRange, setSelectedRange] = useState('30d');

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    onRangeChange?.(range);
    console.log('Range changed to:', range);
  };

  // Calculate comparison between latest and previous data points
  const hasMultipleDataPoints = data.length >= 2;
  const latestData = data.length > 0 ? data[data.length - 1] : null;
  const previousData = data.length > 1 ? data[data.length - 2] : null;

  const getComparison = (current: number | undefined, previous: number | undefined) => {
    if (!current || !previous) return null;
    const change = current - previous;
    const percentChange = ((change / previous) * 100).toFixed(1);
    return {
      change: Math.abs(change),
      percentChange: Math.abs(parseFloat(percentChange)),
      trend: change < 0 ? 'down' : change > 0 ? 'up' : 'neutral',
      isPositive: change < 0, // For weight/BMI, decrease is positive
    };
  };

  const weightComparison = getComparison(latestData?.weight, previousData?.weight);
  const bmiComparison = getComparison(latestData?.bmi, previousData?.bmi);
  const bodyFatComparison = getComparison(latestData?.bodyFat, previousData?.bodyFat);

  const ComparisonBadge = ({ comparison, metric, unit }: { comparison: ReturnType<typeof getComparison>, metric: string, unit: string }) => {
    if (!comparison) return null;
    
    const Icon = comparison.trend === 'down' ? TrendingDown : comparison.trend === 'up' ? TrendingUp : Minus;
    const colorClass = comparison.isPositive 
      ? 'text-chart-1 bg-chart-1/10 border-chart-1/20' 
      : 'text-destructive bg-destructive/10 border-destructive/20';

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-semibold">
          {comparison.change.toFixed(1)}{unit}
        </span>
        <span className="text-xs opacity-80">
          ({comparison.percentChange}%)
        </span>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-popover-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">
            {format(new Date(label), 'MMM dd, yyyy')}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-semibold text-foreground">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Comparison Summary Card - Only show if multiple data points exist */}
      {hasMultipleDataPoints && (latestData && previousData) && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-chart-2/5 border-primary/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Latest Report Comparison</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Changes since your previous report
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Previous</p>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(previousData.date), 'MMM dd, yyyy')}
                </p>
                <ArrowRight className="w-4 h-4 mx-auto my-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Latest</p>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(latestData.date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Weight Comparison */}
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Weight</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {latestData.weight?.toFixed(1) || '--'}
                    </span>
                    <span className="text-sm text-muted-foreground">kg</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    from {previousData.weight?.toFixed(1) || '--'} kg
                  </p>
                </div>
                <ComparisonBadge comparison={weightComparison} metric="Weight" unit="kg" />
              </div>

              {/* BMI Comparison */}
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">BMI</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {latestData.bmi?.toFixed(1) || '--'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    from {previousData.bmi?.toFixed(1) || '--'}
                  </p>
                </div>
                <ComparisonBadge comparison={bmiComparison} metric="BMI" unit="" />
              </div>

              {/* Body Fat Comparison */}
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Body Fat</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {latestData.bodyFat?.toFixed(1) || '--'}
                    </span>
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    from {previousData.bodyFat?.toFixed(1) || '--'}%
                  </p>
                </div>
                <ComparisonBadge comparison={bodyFatComparison} metric="Body Fat" unit="%" />
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6" data-testid="card-weight-chart">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Weight Progress</h3>
            <p className="text-sm text-muted-foreground mt-1">Track your weight over time</p>
          </div>
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRangeChange(range.value)}
                data-testid={`button-range-${range.value}`}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#colorWeight)"
              name="Weight (kg)"
              dot={(props: any) => {
                const { cx, cy, index } = props;
                // Highlight last two points
                if (hasMultipleDataPoints && (index === data.length - 1 || index === data.length - 2)) {
                  const isLatest = index === data.length - 1;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isLatest ? 8 : 6}
                      fill={isLatest ? "hsl(var(--chart-1))" : "hsl(var(--background))"}
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={isLatest ? 3 : 2}
                    />
                  );
                }
                return null;
              }}
            />
            {/* Add labels for last two points */}
            {hasMultipleDataPoints && previousData && (
              <ReferenceDot
                x={previousData.date}
                y={previousData.weight}
                r={0}
                label={{ value: 'Previous', position: 'top', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
            )}
            {latestData && (
              <ReferenceDot
                x={latestData.date}
                y={latestData.weight}
                r={0}
                label={{ value: 'Latest', position: 'top', fill: 'hsl(var(--chart-1))', fontSize: 10, fontWeight: 'bold' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" data-testid="card-bmi-chart">
          <h3 className="text-lg font-semibold text-foreground mb-1">BMI Trend</h3>
          <p className="text-sm text-muted-foreground mb-6">Body Mass Index tracking</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="bmi"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="BMI"
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  if (hasMultipleDataPoints && (index === data.length - 1 || index === data.length - 2)) {
                    const isLatest = index === data.length - 1;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isLatest ? 7 : 5}
                        fill={isLatest ? "hsl(var(--chart-2))" : "hsl(var(--background))"}
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={isLatest ? 3 : 2}
                      />
                    );
                  }
                  return <circle cx={cx} cy={cy} r={4} fill="hsl(var(--chart-2))" />;
                }}
              />
              {hasMultipleDataPoints && previousData && (
                <ReferenceDot
                  x={previousData.date}
                  y={previousData.bmi}
                  r={0}
                  label={{ value: 'Prev', position: 'top', fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                />
              )}
              {latestData && (
                <ReferenceDot
                  x={latestData.date}
                  y={latestData.bmi}
                  r={0}
                  label={{ value: 'Latest', position: 'top', fill: 'hsl(var(--chart-2))', fontSize: 9, fontWeight: 'bold' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6" data-testid="card-bodyfat-chart">
          <h3 className="text-lg font-semibold text-foreground mb-1">Body Fat %</h3>
          <p className="text-sm text-muted-foreground mb-6">Body composition analysis</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="bodyFat"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                name="Body Fat %"
                dot={(props: any) => {
                  const { cx, cy, index } = props;
                  if (hasMultipleDataPoints && (index === data.length - 1 || index === data.length - 2)) {
                    const isLatest = index === data.length - 1;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isLatest ? 7 : 5}
                        fill={isLatest ? "hsl(var(--chart-3))" : "hsl(var(--background))"}
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={isLatest ? 3 : 2}
                      />
                    );
                  }
                  return <circle cx={cx} cy={cy} r={4} fill="hsl(var(--chart-3))" />;
                }}
              />
              {hasMultipleDataPoints && previousData && (
                <ReferenceDot
                  x={previousData.date}
                  y={previousData.bodyFat}
                  r={0}
                  label={{ value: 'Prev', position: 'top', fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                />
              )}
              {latestData && (
                <ReferenceDot
                  x={latestData.date}
                  y={latestData.bodyFat}
                  r={0}
                  label={{ value: 'Latest', position: 'top', fill: 'hsl(var(--chart-3))', fontSize: 9, fontWeight: 'bold' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

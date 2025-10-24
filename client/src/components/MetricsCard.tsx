import { LucideIcon, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MetricsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  subtitle?: string;
  gradient?: string;
  trendIsPositive?: boolean; // Override: true = up is good, false = down is good
}

export default function MetricsCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  subtitle,
  gradient = 'from-chart-1/10 to-chart-2/10',
  trendIsPositive,
}: MetricsCardProps) {
  const getTrendIcon = () => {
    if (trend === 'down') return TrendingDown;
    if (trend === 'up') return TrendingUp;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'neutral') return 'text-muted-foreground';
    
    // If trendIsPositive is explicitly set, use it
    if (trendIsPositive !== undefined) {
      const isGood = (trend === 'up' && trendIsPositive) || (trend === 'down' && !trendIsPositive);
      return isGood ? 'text-chart-1' : 'text-destructive';
    }
    
    // Default: down is good (for weight/BMI), up is bad
    if (trend === 'down') return 'text-chart-1';
    if (trend === 'up') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className={`p-6 bg-gradient-to-br ${gradient} hover-elevate transition-all duration-300`} data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </h3>
            {unit && <span className="text-lg font-medium text-muted-foreground">{unit}</span>}
          </div>
          {(trendValue || subtitle) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && trendValue && (
                <div className={`flex items-center gap-1 ${getTrendColor()}`} data-testid={`trend-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{trendValue}</span>
                </div>
              )}
              {subtitle && (
                <span className="text-sm text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}

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
    <Card className={`p-3 sm:p-6 bg-gradient-to-br ${gradient} hover-elevate transition-all duration-300`} data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5 sm:mb-1 truncate">{title}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <h3 className="text-xl sm:text-3xl font-bold text-foreground" data-testid={`text-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </h3>
            {unit && <span className="text-sm sm:text-lg font-medium text-muted-foreground">{unit}</span>}
          </div>
          {(trendValue || subtitle) && (
            <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
              {trend && trendValue && (
                <div className={`flex items-center gap-1 ${getTrendColor()}`} data-testid={`trend-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{trendValue}</span>
                </div>
              )}
              {subtitle && (
                <span className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20 flex-shrink-0 ml-2">
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, TrendingDown, TrendingUp, Activity, Heart, Zap } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface HealthIndicator {
  indicator_id: string;
  indicator_name: string;
  indicator_type: string;
  value: number;
  unit: string;
  is_abnormal: boolean;
  abnormality_level?: string;
  normal_range_min?: number;
  normal_range_max?: number;
  analysis_explanation?: string;
  recommendations?: string;
}

interface HealthIndicatorsProps {
  indicators: HealthIndicator[];
}

const getIndicatorIcon = (type: string) => {
  if (type.toLowerCase().includes('body')) return Activity;
  if (type.toLowerCase().includes('muscle')) return Zap;
  return Heart;
};

const getSeverityColor = (level?: string) => {
  if (!level) return 'default';
  switch (level.toLowerCase()) {
    case 'mild':
      return 'text-chart-4 bg-chart-4/10';
    case 'moderate':
      return 'text-destructive bg-destructive/10';
    case 'severe':
      return 'text-destructive bg-destructive/20';
    default:
      return 'text-chart-1 bg-chart-1/10';
  }
};

const calculateProgress = (
  value: number,
  min?: number,
  max?: number
): number => {
  if (!min || !max) return 50;
  const range = max - min;
  const position = ((value - min) / range) * 100;
  return Math.max(0, Math.min(100, position));
};

export default function HealthIndicators({ indicators }: HealthIndicatorsProps) {
  const categorizedIndicators = indicators.reduce((acc, indicator) => {
    const category = indicator.indicator_type || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(indicator);
    return acc;
  }, {} as Record<string, HealthIndicator[]>);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Health Indicators</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Latest measurements and analysis
          </p>
        </div>
        <Badge variant="secondary" data-testid="badge-indicator-count" className="text-xs">
          {indicators.length} Indicators
        </Badge>
      </div>

      <Accordion type="multiple" className="space-y-2 sm:space-y-3" defaultValue={Object.keys(categorizedIndicators)}>
        {Object.entries(categorizedIndicators).map(([category, categoryIndicators]) => {
          const Icon = getIndicatorIcon(category);
          const abnormalCount = categoryIndicators.filter((i) => i.is_abnormal).length;

          return (
            <AccordionItem key={category} value={category} className="border-none">
              <Card>
                <AccordionTrigger className="px-3 sm:px-6 py-3 sm:py-4 hover:no-underline" data-testid={`accordion-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center justify-between w-full pr-2 sm:pr-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm sm:text-base font-semibold text-foreground">{category}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {categoryIndicators.length} measurements
                        </p>
                      </div>
                    </div>
                    {abnormalCount > 0 && (
                      <Badge variant="destructive" className="ml-auto mr-1 sm:mr-2 text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {abnormalCount}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                  <div className="space-y-3 sm:space-y-4 pt-2">
                    {categoryIndicators.map((indicator) => {
                      const progress = calculateProgress(
                        indicator.value,
                        indicator.normal_range_min,
                        indicator.normal_range_max
                      );

                      return (
                        <div
                          key={indicator.indicator_id}
                          className="p-3 sm:p-4 rounded-lg bg-card border border-card-border"
                          data-testid={`indicator-${indicator.indicator_id}`}
                        >
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                <h5 className="text-sm sm:text-base font-medium text-foreground" data-testid={`text-indicator-name-${indicator.indicator_id}`}>
                                  {indicator.indicator_name}
                                </h5>
                                {indicator.is_abnormal && indicator.abnormality_level && (
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${getSeverityColor(indicator.abnormality_level)}`}
                                    data-testid={`badge-severity-${indicator.indicator_id}`}
                                  >
                                    {indicator.abnormality_level}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-baseline gap-1 sm:gap-2">
                                <span className="text-xl sm:text-2xl font-bold text-foreground" data-testid={`text-value-${indicator.indicator_id}`}>
                                  {indicator.value}
                                </span>
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {indicator.unit}
                                </span>
                              </div>
                            </div>
                          </div>

                          {indicator.normal_range_min !== undefined &&
                            indicator.normal_range_max !== undefined && (
                              <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-3">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Min: {indicator.normal_range_min}</span>
                                  <span className="hidden sm:inline">Normal Range</span>
                                  <span>Max: {indicator.normal_range_max}</span>
                                </div>
                                <div className="relative">
                                  <Progress value={100} className="h-2 bg-muted" />
                                  <div
                                    className="absolute top-0 w-1 h-2 bg-foreground rounded-full"
                                    style={{ left: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                          {indicator.analysis_explanation && (
                            <div className="mb-2">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {indicator.analysis_explanation}
                              </p>
                            </div>
                          )}

                          {indicator.recommendations && (
                            <div className="p-2 sm:p-3 rounded-md bg-primary/5 border border-primary/20">
                              <p className="text-xs sm:text-sm text-foreground">
                                <strong>Recommendation:</strong> {indicator.recommendations}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

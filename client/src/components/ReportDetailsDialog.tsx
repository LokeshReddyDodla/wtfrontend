import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface Measurement {
  measurement_id: string;
  measurement_type: string;
  value: number;
  unit: string;
  confidence_score: number;
}

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

interface InBodyReport {
  report_id: string;
  report_date: string;
  processed: boolean;
  extraction_confidence?: number;
  measurements_count?: number;
  abnormal_indicators_count?: number;
  ai_summary?: string;
  original_filename?: string;
  measurements?: Measurement[];
  health_indicators?: HealthIndicator[];
}

interface ReportDetailsDialogProps {
  report: InBodyReport | null;
  open: boolean;
  onClose: () => void;
}

export default function ReportDetailsDialog({ report, open, onClose }: ReportDetailsDialogProps) {
  if (!report) return null;

  const getIndicatorIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const getIndicatorColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-destructive/20 bg-destructive/5';
      case 'warning':
        return 'border-orange-500/20 bg-orange-500/5';
      default:
        return 'border-green-500/20 bg-green-500/5';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {report.original_filename || 'InBody Report Details'}
          </DialogTitle>
          <DialogDescription>
            Report Date: {format(new Date(report.report_date), 'MMMM dd, yyyy')}
            {report.extraction_confidence && (
              <span className="ml-4">
                AI Confidence: {Math.round(report.extraction_confidence * 100)}%
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Processing Status */}
          <div className="flex items-center gap-2">
            <Badge variant={report.processed ? 'default' : 'secondary'}>
              {report.processed ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Processed
                </>
              ) : (
                <>
                  Processing...
                </>
              )}
            </Badge>
            {report.measurements_count !== undefined && (
              <span className="text-sm text-muted-foreground">
                {report.measurements_count} measurements
              </span>
            )}
            {report.abnormal_indicators_count !== undefined && report.abnormal_indicators_count > 0 && (
              <span className="text-sm text-destructive">
                {report.abnormal_indicators_count} alerts
              </span>
            )}
          </div>

          {/* AI Summary */}
          {report.ai_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {report.ai_summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Measurements */}
          {report.measurements && report.measurements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.measurements.map((measurement) => (
                    <div
                      key={measurement.measurement_id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div>
                        <p className="font-medium text-sm">{measurement.measurement_type}</p>
                        <p className="text-xs text-muted-foreground">
                          Confidence: {Math.round(measurement.confidence_score * 100)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {measurement.value} {measurement.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Health Indicators */}
          {report.health_indicators && report.health_indicators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Health Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.health_indicators.map((indicator) => (
                  <Card
                    key={indicator.indicator_id}
                    className={`border-2 ${getIndicatorColor(indicator.indicator_type)}`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {getIndicatorIcon(indicator.indicator_type)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-sm">
                              {indicator.indicator_name}
                            </h4>
                            <Badge variant={indicator.is_abnormal ? 'destructive' : 'default'}>
                              {indicator.is_abnormal ? 'Abnormal' : 'Normal'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Value:</span>
                              <span className="text-lg font-bold">
                                {indicator.value} {indicator.unit}
                              </span>
                            </div>
                            
                            {indicator.normal_range_min !== null && indicator.normal_range_max !== null && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <span>Normal Range:</span>
                                <span>
                                  {indicator.normal_range_min} - {indicator.normal_range_max} {indicator.unit}
                                </span>
                              </div>
                            )}
                            
                            {indicator.analysis_explanation && (
                              <p className="text-muted-foreground mt-2">
                                <span className="font-medium">Analysis:</span> {indicator.analysis_explanation}
                              </p>
                            )}
                            
                            {indicator.recommendations && (
                              <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <p className="text-blue-700 dark:text-blue-300">
                                  <span className="font-medium">💡 Recommendation:</span> {indicator.recommendations}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* No data message */}
          {(!report.measurements || report.measurements.length === 0) &&
           (!report.health_indicators || report.health_indicators.length === 0) &&
           !report.ai_summary && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>Report is still processing or no detailed data available yet.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


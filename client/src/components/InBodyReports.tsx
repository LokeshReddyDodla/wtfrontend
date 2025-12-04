import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Eye, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { InBodyReport } from '@/lib/api';

interface InBodyReportsProps {
  reports: InBodyReport[];
  onUpload?: (file: File) => void;
  onView?: (reportId: string) => void;
  onDownload?: (reportId: string) => void;
  isUploading?: boolean;
}

export default function InBodyReports({
  reports,
  onUpload,
  onView,
  onDownload,
  isUploading = false,
}: InBodyReportsProps) {
  const [dragActive, setDragActive] = useState(false);
  const isFirstReport = reports.length === 0;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload?.(e.dataTransfer.files[0]);
      console.log('File dropped:', e.dataTransfer.files[0].name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload?.(e.target.files[0]);
      console.log('File selected:', e.target.files[0].name);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card 
        className={`p-4 sm:p-8 border-2 border-dashed transition-all ${
          dragActive ? 'border-primary bg-primary/5' : 
          isFirstReport ? 'border-chart-1 bg-chart-1/5 animate-pulse-slow' : 
          'border-border'
        }`} 
        data-testid="card-upload-zone"
      >
        <div
          className="flex flex-col items-center justify-center gap-3 sm:gap-4"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10">
            {isUploading ? (
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin" />
            ) : (
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            )}
          </div>
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
              {isUploading ? 'Uploading Report...' : 
               isFirstReport ? '📄 Upload Your First InBody Report' : 
               'Upload InBody Report'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isFirstReport 
                ? 'Start your health journey by uploading your InBody scan' 
                : 'Drag and drop your InBody scan or click to browse'}
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileInput}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
            data-testid="button-browse-files"
          >
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, JPG, PNG (max 10MB)
          </p>
        </div>
      </Card>

      <div>
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {reports.length === 0 ? (
            <Card className="p-6 sm:p-8">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-foreground text-sm sm:text-base">No reports yet</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Upload your first InBody report to start tracking
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.report_id} className="p-3 sm:p-4 hover-elevate transition-all" data-testid={`card-report-${report.report_id}`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex-shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm sm:text-base truncate" data-testid={`text-report-filename-${report.report_id}`}>
                          {report.original_filename || 'InBody Report'}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {format(new Date(report.report_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge
                        variant={report.processed ? 'default' : 'secondary'}
                        data-testid={`badge-status-${report.report_id}`}
                        className={`self-start text-xs ${!report.processed ? 'animate-pulse' : ''}`}
                      >
                        {report.processed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Processed
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Processing... (AI analyzing)
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      {!report.processed ? (
                        <div className="text-xs text-muted-foreground">
                          <p>⏳ AI is analyzing your report...</p>
                          <p className="mt-1 hidden sm:block">This usually takes 30-60 seconds. If stuck, check backend logs.</p>
                        </div>
                      ) : (
                        <>
                          <span>{report.measurements_count || 0} measurements</span>
                          {(report.abnormal_indicators_count || 0) > 0 && (
                            <span className="flex items-center gap-1 text-destructive">
                              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              {report.abnormal_indicators_count} alerts
                            </span>
                          )}
                          {report.extraction_confidence && (
                            <span className="hidden sm:inline">
                              {Math.round(report.extraction_confidence * 100)}% confidence
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {report.ai_summary && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                        {report.ai_summary}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onView?.(report.report_id);
                          console.log('View report:', report.report_id);
                        }}
                        data-testid={`button-view-${report.report_id}`}
                        className="text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onDownload?.(report.report_id);
                          console.log('Download report:', report.report_id);
                        }}
                        data-testid={`button-download-${report.report_id}`}
                        className="text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

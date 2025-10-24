import { useState, useEffect } from 'react';
import Header from './Header';
import MetricsCard from './MetricsCard';
import ProgressCharts from './ProgressCharts';
import InBodyReports from './InBodyReports';
import HealthIndicators from './HealthIndicators';
import ChatInterface from './ChatInterface';
import EnrollmentSetup from './EnrollmentSetup';
import ReportDetailsDialog from './ReportDetailsDialog';
import { Weight, Activity, TrendingDown, Target, MessageCircle, X, Loader2, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState('reports'); // Start with reports tab
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasEnrollment, setHasEnrollment] = useState(api.hasEnrollmentId());
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false); // Track if first time setup
  const [progressData, setProgressData] = useState<api.ProgressDataPoint[]>([]);
  const [reports, setReports] = useState<api.InBodyReport[]>([]);
  const [indicators, setIndicators] = useState<api.HealthIndicator[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<api.WeightLossProgressReport | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [conversationId] = useState(`chat_${Date.now()}`);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: string}>>([
    {
      role: 'assistant' as const,
      content: 'Hello! I\'m your AI health assistant. How can I help you today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [selectedReport, setSelectedReport] = useState<api.InBodyReport | null>(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const { toast } = useToast();

  // Check if user has at least one report
  const hasReports = reports.length > 0;

  // Check for enrollment ID on mount
  useEffect(() => {
    if (hasEnrollment) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [hasEnrollment]);

  // Handle enrollment ID setup
  const handleEnrollmentSet = (enrollmentId: string) => {
    api.setEnrollmentId(enrollmentId);
    setHasEnrollment(true);
    setIsFirstTime(true); // Mark as first time setup
    setSelectedTab('reports'); // Force to reports tab
    toast({
      title: 'Enrollment ID saved',
      description: 'Loading your health data...',
    });
  };

  // Handle logout (clear enrollment)
  const handleLogout = () => {
    api.clearEnrollmentId();
    setHasEnrollment(false);
    setShowLogoutDialog(false);
    setProgressData([]);
    setReports([]);
    setIndicators([]);
    setEnrollmentData(null);
    toast({
      title: 'Logged out',
      description: 'Your enrollment ID has been cleared.',
    });
  };

  // Show enrollment setup if no enrollment ID
  if (!hasEnrollment) {
    return <EnrollmentSetup onEnrollmentSet={handleEnrollmentSet} />;
  }

  async function loadData() {
    try {
      setIsLoading(true);
      
      // Fetch progress data
      const progress = await api.getWeightLossProgress();
      setEnrollmentData(progress);
      setProgressData(progress.progress_data || []);
      
      // Fetch InBody reports
      const reportsData = await api.getInBodyReports();
      setReports(reportsData || []);
      
      // Fetch health indicators from the latest processed report
      if (reportsData && reportsData.length > 0) {
        const latestProcessedReport = reportsData.find(r => r.processed);
        if (latestProcessedReport) {
          try {
            const indicatorsData = await api.getHealthIndicators(
              latestProcessedReport.enrollment_id,
              latestProcessedReport.report_id
            );
            setIndicators(indicatorsData || []);
          } catch (error) {
            console.error('Failed to load health indicators:', error);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error loading data',
        description: error.message || 'Failed to connect to the backend',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Auto-refresh reports if any are still processing
  useEffect(() => {
    const hasProcessingReports = reports.some(r => !r.processed);
    
    if (hasProcessingReports && hasEnrollment) {
      const intervalId = setInterval(async () => {
        try {
          const reportsData = await api.getInBodyReports();
          setReports(reportsData || []);
          
          // If all reports are now processed, load health indicators
          const allProcessed = reportsData?.every(r => r.processed);
          if (allProcessed && reportsData && reportsData.length > 0) {
            const latestReport = reportsData[0];
            try {
              const indicatorsData = await api.getHealthIndicators(
                latestReport.enrollment_id,
                latestReport.report_id
              );
              setIndicators(indicatorsData || []);
            } catch (error) {
              console.error('Failed to load health indicators:', error);
            }
          }
        } catch (error) {
          console.error('Failed to refresh reports:', error);
        }
      }, 5000); // Poll every 5 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [reports, hasEnrollment]);

  async function handleUploadReport(file: File) {
    try {
      setIsUploading(true);
      const enrollmentId = api.getEnrollmentId();
      await api.uploadInBodyReport(enrollmentId, file);
      
      toast({
        title: 'Report uploaded successfully',
        description: 'Your InBody report has been uploaded and is being processed.',
      });
      
      // Reload reports
      const reportsData = await api.getInBodyReports();
      setReports(reportsData || []);
      
      // If this was first time and now they have reports, show success and enable other tabs
      if (isFirstTime && reportsData && reportsData.length > 0) {
        setIsFirstTime(false);
        toast({
          title: '🎉 All set!',
          description: 'You can now explore your dashboard and chat with the AI assistant.',
        });
      }
      
      // Reload health indicators from the new report
      if (reportsData && reportsData.length > 0) {
        const latestReport = reportsData[0];
        try {
          const indicatorsData = await api.getHealthIndicators(
            latestReport.enrollment_id,
            latestReport.report_id
          );
          setIndicators(indicatorsData || []);
        } catch (error) {
          console.error('Failed to load health indicators:', error);
        }
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload report',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSendMessage(message: string) {
    try {
      const enrollmentId = api.getEnrollmentId();
      
      // Add user message immediately
      const userMessage = {
        role: 'user' as const,
        content: message,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, userMessage]);
      
      // Call API
      const response = await api.chatWithAgent(enrollmentId, message, conversationId);
      
      // Add assistant response
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.response,
        timestamp: response.timestamp || new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      });
    }
  }

  function handleViewReport(reportId: string) {
    const report = reports.find(r => r.report_id === reportId);
    if (report) {
      setSelectedReport(report);
      setShowReportDetails(true);
    }
  }

  function handleDownloadReport(reportId: string) {
    const report = reports.find(r => r.report_id === reportId);
    if (!report) return;

    // Create a formatted text report
    const reportData = {
      report_info: {
        filename: report.original_filename || 'InBody Report',
        date: report.report_date,
        processed: report.processed,
        confidence: report.extraction_confidence ? `${Math.round(report.extraction_confidence * 100)}%` : 'N/A',
      },
      measurements: report.measurements?.map(m => ({
        type: m.measurement_type,
        value: `${m.value} ${m.unit}`,
        confidence: `${Math.round(m.confidence_score * 100)}%`,
      })) || [],
      health_indicators: report.health_indicators?.map(h => ({
        name: h.indicator_name,
        type: h.indicator_type,
        value: `${h.value} ${h.unit}`,
        abnormal: h.is_abnormal,
        normal_range: h.normal_range_min && h.normal_range_max 
          ? `${h.normal_range_min}-${h.normal_range_max} ${h.unit}`
          : 'N/A',
        analysis: h.analysis_explanation,
        recommendations: h.recommendations,
      })) || [],
    };

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inbody-report-${report.report_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Report downloaded',
      description: 'Report data has been saved as a JSON file.',
    });
  }

  // Transform reports into chart data format
  const chartData = reports.map(report => {
    const weightMeasurement = report.measurements?.find(m => 
      m.measurement_type.toLowerCase() === 'weight'
    );
    const bmiMeasurement = report.measurements?.find(m => 
      m.measurement_type.toLowerCase() === 'bmi'
    );
    const bodyFatMeasurement = report.measurements?.find(m => 
      m.measurement_type.toLowerCase().includes('body fat') || 
      m.measurement_type.toLowerCase().includes('bodyfat')
    );
    
    return {
      date: report.report_date || report.created_at,
      weight: weightMeasurement?.value,
      bmi: bmiMeasurement?.value,
      bodyFat: bodyFatMeasurement?.value,
    };
  }).reverse(); // Reverse to get chronological order (oldest to newest)

  // Calculate current metrics from latest report
  const latestReport = reports.length > 0 ? reports[0] : null;
  const previousReport = reports.length > 1 ? reports[1] : null;
  
  const currentWeightMeasurement = latestReport?.measurements?.find(m => 
    m.measurement_type.toLowerCase() === 'weight'
  );
  const previousWeightMeasurement = previousReport?.measurements?.find(m => 
    m.measurement_type.toLowerCase() === 'weight'
  );
  
  const currentBMIMeasurement = latestReport?.measurements?.find(m => 
    m.measurement_type.toLowerCase() === 'bmi'
  );
  const previousBMIMeasurement = previousReport?.measurements?.find(m => 
    m.measurement_type.toLowerCase() === 'bmi'
  );
  
  const currentBodyFatMeasurement = latestReport?.measurements?.find(m => 
    m.measurement_type.toLowerCase().includes('body fat') || 
    m.measurement_type.toLowerCase().includes('bodyfat')
  );
  
  const currentWeight = currentWeightMeasurement?.value || 
    (progressData.length > 0 ? progressData[progressData.length - 1].weight : 0) || 0;
  const previousWeight = previousWeightMeasurement?.value || currentWeight;
  
  const targetWeight = enrollmentData?.target_weight_kg || 70;
  const initialWeight = reports.length > 0 && reports[reports.length - 1]?.measurements?.find(m => 
    m.measurement_type.toLowerCase() === 'weight'
  )?.value || currentWeight;
  
  // Calculate weight change from previous report (not from initial)
  const weightChange = reports.length > 1 ? previousWeight - currentWeight : 0;
  const weightTrend = weightChange > 0 ? 'down' : weightChange < 0 ? 'up' : 'neutral';
  
  // Calculate total weight lost from initial
  const totalWeightLost = initialWeight > currentWeight ? initialWeight - currentWeight : 0;
  
  const progressPercentage = initialWeight > targetWeight ? 
    Math.min(100, Math.round((totalWeightLost / (initialWeight - targetWeight)) * 100)) : 0;
  
  const currentBMI = currentBMIMeasurement?.value || 
    (progressData.length > 0 ? progressData[progressData.length - 1].bmi : 0) || 0;
  const previousBMI = previousBMIMeasurement?.value || currentBMI;
  
  // Calculate BMI change from previous report
  const bmiChange = reports.length > 1 ? previousBMI - currentBMI : 0;
  const bmiTrend = bmiChange > 0 ? 'down' : bmiChange < 0 ? 'up' : 'neutral';
  
  const currentBodyFat = currentBodyFatMeasurement?.value ||
    (progressData.length > 0 ? progressData[progressData.length - 1].bodyFat : 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        patientName={enrollmentData?.patient_name || "Patient"}
        enrollmentDate={enrollmentData?.enrollment_date || new Date().toISOString()}
        isActive={enrollmentData?.is_active ?? true}
        onProfileClick={() => console.log('Profile clicked')}
        onSettingsClick={() => setShowLogoutDialog(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner for First Time Users */}
        {!hasReports && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="bg-gradient-to-r from-chart-1/10 via-chart-2/10 to-chart-3/10 border-chart-1/20">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex-shrink-0">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      👋 Welcome! Let's get started
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      To unlock your full dashboard experience, please upload your first InBody report. 
                      This will allow us to track your progress, provide AI-powered insights, and give you personalized recommendations.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-foreground">📄 Step 1:</span>
                      <span className="text-muted-foreground">Upload your InBody scan below</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Tabs value={selectedTab} onValueChange={(value) => {
          // Only allow switching tabs if user has reports OR switching to reports tab
          if (hasReports || value === 'reports') {
            setSelectedTab(value);
          } else {
            toast({
              title: 'Upload a report first',
              description: 'Please upload at least one InBody report to access other features.',
              variant: 'destructive',
            });
          }
        }} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-[450px]" data-testid="tabs-navigation">
            <TabsTrigger 
              value="overview" 
              data-testid="tab-overview"
              disabled={!hasReports}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              data-testid="tab-reports"
            >
              Reports
              {!hasReports && (
                <span className="ml-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="health" 
              data-testid="tab-health"
              disabled={!hasReports}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricsCard
                title="Current Weight"
                value={currentWeight ? currentWeight.toFixed(1) : '--'}
                unit="kg"
                icon={Weight}
                trend={weightTrend}
                trendValue={reports.length > 1 && Math.abs(weightChange) > 0 ? `${Math.abs(weightChange).toFixed(1)}kg` : undefined}
                subtitle={reports.length > 1 && Math.abs(weightChange) > 0 
                  ? (weightChange > 0 ? 'since last report' : 'gained since last report')
                  : `${totalWeightLost.toFixed(1)}kg total lost`}
                gradient="from-chart-1/10 to-chart-1/5"
              />
              <MetricsCard
                title="BMI"
                value={currentBMI ? currentBMI.toFixed(1) : '--'}
                icon={Activity}
                trend={bmiTrend}
                trendValue={reports.length > 1 && Math.abs(bmiChange) > 0 ? `${Math.abs(bmiChange).toFixed(1)}` : undefined}
                subtitle={reports.length > 1 && Math.abs(bmiChange) > 0 
                  ? (bmiChange > 0 ? 'since last report' : 'increased since last report')
                  : 'current'}
                gradient="from-chart-2/10 to-chart-2/5"
              />
              <MetricsCard
                title="Progress"
                value={progressPercentage ? Math.round(progressPercentage) : 0}
                unit="%"
                icon={TrendingDown}
                trend="up"
                trendValue={progressPercentage ? `${Math.round(progressPercentage)}%` : '0%'}
                subtitle="towards goal"
                gradient="from-chart-3/10 to-chart-3/5"
                trendIsPositive={true}
              />
              <MetricsCard
                title="Target Weight"
                value={targetWeight ? targetWeight.toFixed(0) : '--'}
                unit="kg"
                icon={Target}
                subtitle={`${(targetWeight - (currentWeight || 0)).toFixed(1)}kg to go`}
                gradient="from-chart-4/10 to-chart-4/5"
              />
            </div>

            <ProgressCharts
              data={chartData}
              onRangeChange={(range) => console.log('Range changed:', range)}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <InBodyReports
              reports={reports}
              onUpload={handleUploadReport}
              onView={handleViewReport}
              onDownload={handleDownloadReport}
              isUploading={isUploading}
            />
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <HealthIndicators indicators={indicators} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Chat Toggle Button - Only show if user has reports */}
      {hasReports && (
        <div className="fixed bottom-6 right-6 z-[9999]" style={{ position: 'fixed', zIndex: 9999 }}>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-xl hover:scale-110 transition-transform"
            onClick={() => setIsChatOpen(!isChatOpen)}
            data-testid="button-toggle-chat"
          >
            {isChatOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
          </Button>
        </div>
      )}
      
      {/* Helper tooltip for first-time users */}
      {!hasReports && (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none" style={{ position: 'fixed', zIndex: 9999 }}>
          <div className="relative">
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-xl opacity-50 cursor-not-allowed pointer-events-auto"
              disabled
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-popover border rounded-lg shadow-lg text-xs text-muted-foreground pointer-events-auto">
              💬 Chat will be available after you upload your first InBody report
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Panel */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-3rem)] z-[9998] animate-slide-in" style={{ position: 'fixed', zIndex: 9998 }}>
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        </div>
      )}

      {/* Report Details Dialog */}
      <ReportDetailsDialog
        report={selectedReport}
        open={showReportDetails}
        onClose={() => {
          setShowReportDetails(false);
          setSelectedReport(null);
        }}
      />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Enrollment ID?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your stored enrollment ID from this device. You'll need to enter it again to access your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <LogOut className="w-4 h-4 mr-2" />
              Clear & Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

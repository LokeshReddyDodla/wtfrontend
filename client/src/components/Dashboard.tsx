import { useState, useEffect } from 'react';
import Header from './Header';
import MetricsCard from './MetricsCard';
import ProgressCharts from './ProgressCharts';
import InBodyReports from './InBodyReports';
import HealthIndicators from './HealthIndicators';
import ChatInterface from './ChatInterface';
import EnrollmentSetup from './EnrollmentSetup';
import ReportDetailsDialog from './ReportDetailsDialog';
import CoachingCards from './CoachingCards';
import PlanViewer from './PlanViewer';
import IntakeForm from './IntakeForm';
import SymptomsTracker from './SymptomsTracker';
import OnboardingWizard from './OnboardingWizard';
import { Weight, Activity, TrendingDown, Target, MessageCircle, X, Loader2, LogOut, Sparkles, Brain, ClipboardList, ThermometerSun } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasEnrollment, setHasEnrollment] = useState(api.hasEnrollmentId());
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [progressData, setProgressData] = useState<api.ProgressDataPoint[]>([]);
  const [reports, setReports] = useState<api.InBodyReport[]>([]);
  const [indicators, setIndicators] = useState<api.HealthIndicator[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<api.WeightLossProgressReport | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [conversationId] = useState(`chat_${Date.now()}`);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Agentic features state
  const [currentPlan, setCurrentPlan] = useState<api.PlanSnapshot | null>(null);
  const [coachCards, setCoachCards] = useState<api.SuggestionCard[]>([]);
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [coachAbstained, setCoachAbstained] = useState(false);
  const [coachAbstainReason, setCoachAbstainReason] = useState<string | undefined>();
  
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: string, metadata?: any}>>([
    {
      role: 'assistant' as const,
      content: 'Hello! I\'m your AI health coach powered by the agentic orchestrator. I can help you with your personalized plan, exercise recommendations, and track your progress. How can I help you today?',
      timestamp: new Date().toISOString(),
      metadata: { agent: 'coach_messenger' },
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

  // Auto-refresh reports if any are still processing
  // NOTE: This hook must be before any conditional returns
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

  // Handle enrollment ID setup
  const handleEnrollmentSet = (enrollmentId: string) => {
    api.setEnrollmentId(enrollmentId);
    setHasEnrollment(true);
    setIsFirstTime(true);
    setShowOnboarding(true); // Show onboarding wizard for new users
    toast({
      title: 'Welcome!',
      description: 'Let\'s set up your personalized health experience...',
    });
  };

  // Handle logout (clear enrollment)
  const handleLogout = () => {
    api.clearEnrollmentId();
    setHasEnrollment(false);
    setShowLogoutDialog(false);
    setShowOnboarding(false);
    setProgressData([]);
    setReports([]);
    setIndicators([]);
    setEnrollmentData(null);
    setCurrentPlan(null);
    setCoachCards([]);
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsFirstTime(false);
    loadData();
    toast({
      title: 'Welcome to your dashboard!',
      description: 'Your personalized health journey starts now.',
    });
  };

  // Show enrollment setup if no enrollment ID
  if (!hasEnrollment) {
    return <EnrollmentSetup onEnrollmentSet={handleEnrollmentSet} />;
  }

  // Show onboarding wizard for first-time users (after data is loaded)
  if (showOnboarding && !isLoading && enrollmentData?.patient_id) {
    return (
      <OnboardingWizard
        patientId={enrollmentData.patient_id}
        patientName={enrollmentData.patient_name || 'Patient'}
        onComplete={handleOnboardingComplete}
        existingReports={reports}
        hasCompletedIntake={!!currentPlan}
      />
    );
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

      // Try to fetch current plan (if intake is completed)
      let hasPlan = false;
      if (progress.patient_id) {
        try {
          const plan = await api.getCurrentPlan(progress.patient_id);
          setCurrentPlan(plan);
          hasPlan = true;
          
          // Fetch coach cards
          await loadCoachCards(progress.patient_id, plan.plan_id);
        } catch (error) {
          console.log('No current plan found, may need to complete intake');
        }
      }

      // Check if user needs onboarding (no reports AND no plan = new user)
      const needsOnboarding = (!reportsData || reportsData.length === 0) && !hasPlan;
      if (needsOnboarding && isFirstTime) {
        setShowOnboarding(true);
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

  async function loadCoachCards(userId: string, planId?: string) {
    setIsCoachLoading(true);
    try {
      const response = await api.getCoachAction({
        user_id: userId,
        context_tags: ['dashboard', 'morning'],
        trigger: 'dashboard_load',
        plan_id: planId,
      });
      setCoachCards(response.cards);
      setCoachAbstained(response.abstained);
      setCoachAbstainReason(response.reason || undefined);
    } catch (error) {
      console.error('Failed to load coach cards:', error);
    } finally {
      setIsCoachLoading(false);
    }
  }

  async function handleGeneratePlan() {
    if (!enrollmentData?.patient_id) return;
    
    try {
      const response = await api.generatePlan({
        user_id: enrollmentData.patient_id,
        include_context: true,
      });
      
      if (response.abstained) {
        toast({
          title: 'Plan generation paused',
          description: response.reason || 'Complete your intake forms to generate a plan.',
          variant: 'destructive',
        });
        setShowIntakeForm(true);
      } else if (response.plan_snapshot) {
        setCurrentPlan(response.plan_snapshot);
        toast({
          title: '🎉 Plan generated!',
          description: 'Your personalized 4-week plan is ready.',
        });
        await loadCoachCards(enrollmentData.patient_id, response.plan_snapshot.plan_id);
      }
    } catch (error: any) {
      toast({
        title: 'Error generating plan',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  async function handleIntakeComplete() {
    setShowIntakeForm(false);
    if (enrollmentData?.patient_id) {
      await handleGeneratePlan();
    }
    loadData();
  }

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
      setIsChatLoading(true);
      
      // Add user message immediately
      const userMessage = {
        role: 'user' as const,
        content: message,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, userMessage]);
      
      // Call API
      const response = await api.chatWithAgent(enrollmentId, message, conversationId);
      
      // Add assistant response with metadata
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.response,
        timestamp: response.timestamp || new Date().toISOString(),
        metadata: {
          agent: 'weight_loss_agent',
          sources: currentPlan?.sources,
        },
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat error',
        description: error.message || 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setIsChatLoading(false);
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header
        patientName={enrollmentData?.patient_name || "Patient"}
        enrollmentDate={enrollmentData?.enrollment_date || new Date().toISOString()}
        isActive={enrollmentData?.is_active ?? true}
        onProfileClick={() => console.log('Profile clicked')}
        onSettingsClick={() => setShowLogoutDialog(true)}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Intake Form Modal */}
        {showIntakeForm && enrollmentData?.patient_id && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Complete Your Intake
              </h2>
              <Button variant="ghost" onClick={() => setShowIntakeForm(false)}>
                Skip for now
              </Button>
            </div>
            <IntakeForm 
              patientId={enrollmentData.patient_id} 
              onComplete={handleIntakeComplete}
            />
          </div>
        )}

        {/* Welcome Banner with Agentic Features */}
        {!showIntakeForm && !currentPlan && enrollmentData?.patient_id && (
          <div className="mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <Card className="bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 border-primary/20 overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-chart-2 flex-shrink-0">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <span className="truncate">Unlock Agentic AI Features</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                      Complete your intake assessment to unlock personalized 4-week plans, 
                      AI coaching cards, and safety-aware recommendations.
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <Badge variant="secondary" className="text-xs">📋 4-Week Plans</Badge>
                      <Badge variant="secondary" className="text-xs">🎯 Daily Targets</Badge>
                      <Badge variant="secondary" className="text-xs">💬 AI Coaching</Badge>
                      <Badge variant="secondary" className="text-xs">🛡️ Safety Rules</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => setShowOnboarding(true)} className="w-full sm:w-auto text-sm h-9 sm:h-10">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Start Guided Setup
                      </Button>
                      <Button variant="outline" onClick={() => setShowIntakeForm(true)} className="w-full sm:w-auto text-sm h-9 sm:h-10">
                        Quick Intake Only
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4 sm:space-y-8">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-5 lg:w-[600px] h-auto p-1" data-testid="tabs-navigation">
              <TabsTrigger value="overview" data-testid="tab-overview" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                Overview
              </TabsTrigger>
              <TabsTrigger value="plan" data-testid="tab-plan" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Plan
                {currentPlan && !currentPlan.abstained && (
                  <Badge variant="default" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-green-500">
                    ✓
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reports" data-testid="tab-reports" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                Reports
              </TabsTrigger>
              <TabsTrigger value="health" data-testid="tab-health" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                Health
              </TabsTrigger>
              <TabsTrigger value="symptoms" data-testid="tab-symptoms" className="text-xs sm:text-sm px-3 py-2 whitespace-nowrap">
                <ThermometerSun className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Symptoms
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {/* Coaching Cards */}
            {enrollmentData?.patient_id && (
              <CoachingCards
                cards={coachCards}
                isLoading={isCoachLoading}
                onRefresh={() => loadCoachCards(enrollmentData.patient_id, currentPlan?.plan_id)}
                abstained={coachAbstained}
                abstainReason={coachAbstainReason}
              />
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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

          <TabsContent value="plan" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Your Personalized Plan
              </h2>
              {enrollmentData?.patient_id && (
                <div className="flex gap-2">
                  {!currentPlan && (
                    <Button onClick={() => setShowIntakeForm(true)} variant="outline">
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Complete Intake
                    </Button>
                  )}
                  <Button onClick={handleGeneratePlan} variant={currentPlan ? 'outline' : 'default'}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {currentPlan ? 'Regenerate Plan' : 'Generate Plan'}
                  </Button>
                </div>
              )}
            </div>
            <PlanViewer plan={currentPlan} isLoading={isLoading} />
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

          <TabsContent value="symptoms" className="space-y-6">
            {enrollmentData?.patient_id ? (
              <SymptomsTracker 
                userId={enrollmentData.patient_id}
                onSubmit={() => {
                  toast({
                    title: 'Symptoms logged',
                    description: 'Your weekly symptom report has been recorded.',
                  });
                }}
              />
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ThermometerSun className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Symptom Tracking</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Track your GLP-1 medication symptoms weekly to monitor your health.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Chat Toggle Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999]" style={{ position: 'fixed', zIndex: 9999 }}>
        <Button
          size="icon"
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-xl hover:scale-110 transition-transform bg-gradient-to-br from-primary to-chart-2"
          onClick={() => setIsChatOpen(!isChatOpen)}
          data-testid="button-toggle-chat"
        >
          {isChatOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </Button>
      </div>

      {/* Floating Chat Panel */}
      {isChatOpen && (
        <div className="fixed inset-x-2 bottom-20 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[400px] sm:max-w-[calc(100vw-3rem)] z-[9998] animate-slide-in" style={{ position: 'fixed', zIndex: 9998 }}>
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            agentMode="agentic"
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
            <AlertDialogTitle>Sign Out?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out of your current session. You'll need to enter your Patient ID again to access your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

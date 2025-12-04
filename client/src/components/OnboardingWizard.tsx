import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import IntakeForm from './IntakeForm';
import InBodyReports from './InBodyReports';
import { 
  ClipboardList, 
  FileText, 
  LayoutDashboard, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Brain,
  Upload,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';

type OnboardingStep = 'welcome' | 'intake' | 'inbody' | 'complete';

interface OnboardingWizardProps {
  patientId: string;
  patientName: string;
  onComplete: () => void;
  existingReports?: api.InBodyReport[];
  hasCompletedIntake?: boolean;
}

const STEPS = [
  { id: 'intake', label: 'Health Assessment', icon: ClipboardList },
  { id: 'inbody', label: 'Body Composition', icon: FileText },
  { id: 'complete', label: 'Dashboard', icon: LayoutDashboard },
];

export default function OnboardingWizard({ 
  patientId, 
  patientName,
  onComplete,
  existingReports = [],
  hasCompletedIntake = false,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [intakeCompleted, setIntakeCompleted] = useState(hasCompletedIntake);
  const [reports, setReports] = useState<api.InBodyReport[]>(existingReports);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const { toast } = useToast();

  // If user already completed intake, start from inbody step
  useEffect(() => {
    if (hasCompletedIntake && existingReports.length === 0) {
      setCurrentStep('inbody');
    } else if (hasCompletedIntake && existingReports.length > 0) {
      // Already completed everything, go to complete
      setCurrentStep('complete');
    }
  }, [hasCompletedIntake, existingReports.length]);

  const getStepIndex = () => {
    switch (currentStep) {
      case 'welcome': return -1;
      case 'intake': return 0;
      case 'inbody': return 1;
      case 'complete': return 2;
      default: return 0;
    }
  };

  const progressPercentage = ((getStepIndex() + 1) / STEPS.length) * 100;

  const handleIntakeComplete = () => {
    setIntakeCompleted(true);
    toast({
      title: '✅ Intake Complete!',
      description: 'Now let\'s get your body composition data.',
    });
    setCurrentStep('inbody');
  };

  const handleUploadReport = async (file: File) => {
    try {
      setIsUploading(true);
      const enrollmentId = api.getEnrollmentId();
      await api.uploadInBodyReport(enrollmentId, file);
      
      toast({
        title: 'Report uploaded successfully',
        description: 'Your InBody report is being processed by AI...',
      });
      
      // Reload reports
      const reportsData = await api.getInBodyReports();
      setReports(reportsData || []);
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
  };

  // Poll for report processing
  useEffect(() => {
    const hasProcessingReports = reports.some(r => !r.processed);
    
    if (hasProcessingReports) {
      const intervalId = setInterval(async () => {
        try {
          const reportsData = await api.getInBodyReports();
          setReports(reportsData || []);
        } catch (error) {
          console.error('Failed to refresh reports:', error);
        }
      }, 3000);
      
      return () => clearInterval(intervalId);
    }
  }, [reports]);

  const handleGoToDashboard = async () => {
    setIsGeneratingPlan(true);
    try {
      // Try to generate the plan
      const response = await api.generatePlan({
        user_id: patientId,
        include_context: true,
      });
      
      if (response.plan_snapshot) {
        toast({
          title: '🎉 Your plan is ready!',
          description: 'Welcome to your personalized health dashboard.',
        });
      }
    } catch (error) {
      // Plan generation might fail if not enough data, that's okay
      console.log('Plan generation note:', error);
    } finally {
      setIsGeneratingPlan(false);
      onComplete();
    }
  };

  const canProceedToInBody = intakeCompleted;
  const canProceedToDashboard = reports.length > 0 && reports.some(r => r.processed);
  const hasUploadedReport = reports.length > 0;

  // Welcome Screen
  const renderWelcome = () => (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center mb-4">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Welcome, {patientName}! 👋
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Let's set up your personalized AI health coaching experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {STEPS.map((step, index) => (
              <div 
                key={step.id} 
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    {index === 0 && 'Tell us about your fitness preferences and goals'}
                    {index === 1 && 'Upload your InBody scan for precise tracking'}
                    {index === 2 && 'Access your AI-powered health dashboard'}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Step {index + 1}
                </Badge>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-chart-1/10 via-chart-2/10 to-chart-3/10 rounded-lg p-4 border border-chart-2/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-chart-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">AI-Powered Features</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  After setup, you'll get personalized 4-week plans, daily coaching cards, 
                  safety-aware recommendations, and real-time chat support.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          <Button size="lg" onClick={() => setCurrentStep('intake')} className="min-w-[200px]">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Intake Step
  const renderIntakeStep = () => (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-primary" />
                Health Assessment
              </h1>
              <p className="text-muted-foreground mt-1">Step 1 of 3</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  index <= getStepIndex() ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  index < getStepIndex() 
                    ? 'bg-primary text-primary-foreground' 
                    : index === getStepIndex()
                    ? 'bg-primary/20 border-2 border-primary text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index < getStepIndex() ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                </div>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Intake Form */}
        <IntakeForm patientId={patientId} onComplete={handleIntakeComplete} />
      </div>
    </div>
  );

  // InBody Upload Step
  const renderInBodyStep = () => (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Body Composition Analysis
              </h1>
              <p className="text-muted-foreground mt-1">Step 2 of 3</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {Math.round(((getStepIndex() + 1) / STEPS.length) * 100)}% Complete
            </Badge>
          </div>
          <Progress value={((getStepIndex() + 1) / STEPS.length) * 100} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  index <= getStepIndex() ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  index < getStepIndex() 
                    ? 'bg-primary text-primary-foreground' 
                    : index === getStepIndex()
                    ? 'bg-primary/20 border-2 border-primary text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index < getStepIndex() ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                </div>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* InBody Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Your InBody Report
            </CardTitle>
            <CardDescription>
              Your InBody scan helps us create accurate body composition tracking and personalized recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InBodyReports
              reports={reports}
              onUpload={handleUploadReport}
              isUploading={isUploading}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep('intake')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Assessment
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost"
              onClick={() => {
                toast({
                  title: 'Skipping InBody upload',
                  description: 'You can upload it later from the Reports tab.',
                });
                setCurrentStep('complete');
              }}
            >
              Skip for now
            </Button>
            
            <Button 
              onClick={() => setCurrentStep('complete')}
              disabled={!hasUploadedReport}
            >
              {hasUploadedReport ? (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                'Upload to continue'
              )}
            </Button>
          </div>
        </div>

        {/* Helpful tips */}
        {!hasUploadedReport && (
          <Card className="mt-6 bg-muted/50 border-dashed">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <FileText className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <h4 className="font-medium">Don't have an InBody report?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  No worries! You can skip this step and upload later. However, body composition data 
                  helps us provide more accurate tracking and recommendations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  // Complete Step
  const renderCompleteStep = () => (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background flex items-center justify-center p-4">
      <Card className="max-w-xl w-full border-green-500/30 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">
            You're All Set! 🎉
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Your personalized health journey begins now
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-sm">Health Assessment Complete</p>
                <p className="text-xs text-muted-foreground">Exercise preferences & fitness screen recorded</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              reports.length > 0 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-yellow-500/10 border border-yellow-500/20'
            }`}>
              {reports.length > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <FileText className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {reports.length > 0 
                    ? `${reports.length} InBody Report${reports.length > 1 ? 's' : ''} Uploaded` 
                    : 'InBody Report Skipped'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reports.length > 0 
                    ? 'Body composition data ready for tracking' 
                    : 'You can upload later from the Reports tab'}
                </p>
              </div>
            </div>
          </div>

          {/* What's next */}
          <div className="bg-gradient-to-r from-primary/10 via-chart-2/10 to-chart-3/10 rounded-lg p-4 border border-primary/20">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              What's waiting for you:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-1" />
                <span>AI-powered 4-week plans</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-2" />
                <span>Daily coaching cards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-3" />
                <span>Progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-chart-4" />
                <span>Real-time AI chat</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
          <Button 
            size="lg" 
            onClick={handleGoToDashboard} 
            className="min-w-[250px] bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
            disabled={isGeneratingPlan}
          >
            {isGeneratingPlan ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparing your dashboard...
              </>
            ) : (
              <>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Go to Dashboard
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Render current step
  switch (currentStep) {
    case 'welcome':
      return renderWelcome();
    case 'intake':
      return renderIntakeStep();
    case 'inbody':
      return renderInBodyStep();
    case 'complete':
      return renderCompleteStep();
    default:
      return renderWelcome();
  }
}

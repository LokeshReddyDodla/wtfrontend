import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { 
  ChevronRight, 
  ChevronLeft, 
  Dumbbell, 
  HeartPulse, 
  Brain,
  CheckCircle2,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';

interface IntakeFormProps {
  patientId: string;
  onComplete: () => void;
}

type IntakeStep = 'exercise' | 'fitness' | 'willingness' | 'complete';

const EXERCISE_MODALITIES = [
  'Walking', 'Running', 'Cycling', 'Swimming', 'Strength Training',
  'Yoga', 'Pilates', 'HIIT', 'Dancing', 'Sports'
];

const ENVIRONMENTS = ['Indoor', 'Outdoor', 'Gym', 'Home', 'Pool'];

const EQUIPMENT = [
  'Dumbbells', 'Resistance Bands', 'Treadmill', 'Stationary Bike',
  'Yoga Mat', 'Kettlebell', 'Pull-up Bar', 'None'
];

const BARRIERS = [
  'Time constraints', 'Fatigue', 'Joint pain', 'Lack of motivation',
  'Weather', 'Cost', 'Childcare', 'Work schedule'
];

const MOTIVATORS = [
  'Health improvement', 'Weight loss', 'Energy boost', 'Stress relief',
  'Social connection', 'Achievement', 'Better sleep', 'Appearance'
];

const READINESS_STAGES = [
  { value: 'precontemplation', label: 'Not ready yet', description: 'Not considering change' },
  { value: 'contemplation', label: 'Thinking about it', description: 'Considering change' },
  { value: 'preparation', label: 'Getting ready', description: 'Planning to start soon' },
  { value: 'action', label: 'Ready to go!', description: 'Ready to take action' },
];

export default function IntakeForm({ patientId, onComplete }: IntakeFormProps) {
  const [currentStep, setCurrentStep] = useState<IntakeStep>('exercise');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Exercise Preferences State
  const [preferredModalities, setPreferredModalities] = useState<string[]>([]);
  const [avoidModalities, setAvoidModalities] = useState<string[]>([]);
  const [weeklySessionTarget, setWeeklySessionTarget] = useState(3);
  const [sessionLengthMinutes, setSessionLengthMinutes] = useState(30);
  const [environments, setEnvironments] = useState<string[]>([]);
  const [equipmentAvailable, setEquipmentAvailable] = useState<string[]>([]);
  const [barriers, setBarriers] = useState<string[]>([]);
  const [motivators, setMotivators] = useState<string[]>([]);
  const [intensityFloor, setIntensityFloor] = useState(3);
  const [intensityCeiling, setIntensityCeiling] = useState(7);
  const [caregiverNotes, setCaregiverNotes] = useState('');

  // Fitness Screen State
  const [restingHr, setRestingHr] = useState<number | undefined>();
  const [systolicBp, setSystolicBp] = useState<number | undefined>();
  const [diastolicBp, setDiastolicBp] = useState<number | undefined>();
  const [waistCircumference, setWaistCircumference] = useState<number | undefined>();
  const [clearanceRequired, setClearanceRequired] = useState(false);
  const [riskCategory, setRiskCategory] = useState<string>('low');
  const [fitnessNotes, setFitnessNotes] = useState('');

  // Willingness State
  const [readinessStage, setReadinessStage] = useState('preparation');
  const [commitmentScore, setCommitmentScore] = useState(3);
  const [weeklyMinutesPromised, setWeeklyMinutesPromised] = useState(90);
  const [motivatorStatement, setMotivatorStatement] = useState('');
  const [limitingFactors, setLimitingFactors] = useState<string[]>([]);
  const [confidenceRating, setConfidenceRating] = useState(7);
  const [followUpDays, setFollowUpDays] = useState(7);

  const toggleArrayItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleSubmitExercise = async () => {
    setIsSubmitting(true);
    try {
      await api.submitExercisePreferences({
        patient_id: patientId,
        preferred_modalities: preferredModalities,
        avoid_modalities: avoidModalities,
        weekly_session_target: weeklySessionTarget,
        session_length_minutes: sessionLengthMinutes,
        availability: [],
        environments,
        equipment_available: equipmentAvailable,
        intensity_preference: {
          floor_rpe: intensityFloor,
          ceiling_rpe: intensityCeiling,
        },
        barriers,
        motivators,
        caregiver_notes: caregiverNotes || undefined,
      });
      toast({
        title: 'Exercise preferences saved',
        description: 'Moving to fitness screening...',
      });
      setCurrentStep('fitness');
    } catch (error: any) {
      toast({
        title: 'Error saving exercise preferences',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFitness = async () => {
    setIsSubmitting(true);
    try {
      await api.submitFitnessScreen({
        patient_id: patientId,
        resting_hr: restingHr,
        systolic_bp: systolicBp,
        diastolic_bp: diastolicBp,
        waist_circumference_cm: waistCircumference,
        orthopedic_flags: [],
        cardiometabolic_flags: [],
        clearance_required: clearanceRequired,
        risk_category: riskCategory,
        notes: fitnessNotes || undefined,
      });
      toast({
        title: 'Fitness screen saved',
        description: 'Moving to commitment assessment...',
      });
      setCurrentStep('willingness');
    } catch (error: any) {
      toast({
        title: 'Error saving fitness screen',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWillingness = async () => {
    setIsSubmitting(true);
    try {
      await api.submitWillingnessCommitment({
        patient_id: patientId,
        readiness_stage: readinessStage,
        commitment_score: commitmentScore,
        weekly_minutes_promised: weeklyMinutesPromised,
        motivator_statement: motivatorStatement || undefined,
        limiting_factors: limitingFactors,
        accountability_preferences: [],
        confidence_rating: confidenceRating,
        support_contacts: [],
        follow_up_interval_days: followUpDays,
      });
      toast({
        title: '🎉 Intake Complete!',
        description: 'Your personalized plan is being generated...',
      });
      setCurrentStep('complete');
      setTimeout(onComplete, 1500);
    } catch (error: any) {
      toast({
        title: 'Error saving commitment',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderExerciseStep = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Exercise Preferences</CardTitle>
            <CardDescription>Tell us about your exercise habits and preferences</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preferred Modalities */}
        <div className="space-y-2">
          <Label>Preferred Exercise Types</Label>
          <div className="flex flex-wrap gap-2">
            {EXERCISE_MODALITIES.map((modality) => (
              <Badge
                key={modality}
                variant={preferredModalities.includes(modality) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleArrayItem(preferredModalities, setPreferredModalities, modality)}
              >
                {modality}
              </Badge>
            ))}
          </div>
        </div>

        {/* Session Targets */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sessions per Week: {weeklySessionTarget}</Label>
            <Slider
              value={[weeklySessionTarget]}
              onValueChange={([v]) => setWeeklySessionTarget(v)}
              min={1}
              max={7}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Minutes per Session: {sessionLengthMinutes}</Label>
            <Slider
              value={[sessionLengthMinutes]}
              onValueChange={([v]) => setSessionLengthMinutes(v)}
              min={15}
              max={90}
              step={5}
            />
          </div>
        </div>

        {/* Environments */}
        <div className="space-y-2">
          <Label>Preferred Environments</Label>
          <div className="flex flex-wrap gap-2">
            {ENVIRONMENTS.map((env) => (
              <Badge
                key={env}
                variant={environments.includes(env) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleArrayItem(environments, setEnvironments, env)}
              >
                {env}
              </Badge>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className="space-y-2">
          <Label>Available Equipment</Label>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((eq) => (
              <Badge
                key={eq}
                variant={equipmentAvailable.includes(eq) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleArrayItem(equipmentAvailable, setEquipmentAvailable, eq)}
              >
                {eq}
              </Badge>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div className="space-y-2">
          <Label>Preferred Intensity Range (RPE 1-10)</Label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Min: {intensityFloor}</span>
            <Slider
              value={[intensityFloor, intensityCeiling]}
              onValueChange={([min, max]) => {
                setIntensityFloor(min);
                setIntensityCeiling(max);
              }}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">Max: {intensityCeiling}</span>
          </div>
        </div>

        {/* Barriers & Motivators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Barriers</Label>
            <div className="flex flex-wrap gap-1">
              {BARRIERS.map((barrier) => (
                <Badge
                  key={barrier}
                  variant={barriers.includes(barrier) ? 'destructive' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleArrayItem(barriers, setBarriers, barrier)}
                >
                  {barrier}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Motivators</Label>
            <div className="flex flex-wrap gap-1">
              {MOTIVATORS.map((motivator) => (
                <Badge
                  key={motivator}
                  variant={motivators.includes(motivator) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleArrayItem(motivators, setMotivators, motivator)}
                >
                  {motivator}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Additional Notes (Optional)</Label>
          <Textarea
            value={caregiverNotes}
            onChange={(e) => setCaregiverNotes(e.target.value)}
            placeholder="Any other preferences or considerations..."
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleSubmitExercise} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          Continue to Fitness Screen
        </Button>
      </CardFooter>
    </Card>
  );

  const renderFitnessStep = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/10">
            <HeartPulse className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <CardTitle>Fitness Screen</CardTitle>
            <CardDescription>Help us understand your current health status</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vitals */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Resting Heart Rate (bpm)</Label>
            <Input
              type="number"
              value={restingHr || ''}
              onChange={(e) => setRestingHr(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 72"
            />
          </div>
          <div className="space-y-2">
            <Label>Waist Circumference (cm)</Label>
            <Input
              type="number"
              value={waistCircumference || ''}
              onChange={(e) => setWaistCircumference(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="e.g., 85"
            />
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="space-y-2">
          <Label>Blood Pressure (optional)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={systolicBp || ''}
              onChange={(e) => setSystolicBp(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Systolic"
              className="w-24"
            />
            <span>/</span>
            <Input
              type="number"
              value={diastolicBp || ''}
              onChange={(e) => setDiastolicBp(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Diastolic"
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">mmHg</span>
          </div>
        </div>

        {/* Risk Category */}
        <div className="space-y-2">
          <Label>Risk Category</Label>
          <RadioGroup value={riskCategory} onValueChange={setRiskCategory}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="risk-low" />
              <Label htmlFor="risk-low" className="text-green-600">Low Risk</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="risk-moderate" />
              <Label htmlFor="risk-moderate" className="text-yellow-600">Moderate Risk</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="risk-high" />
              <Label htmlFor="risk-high" className="text-red-600">High Risk</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Medical Clearance */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="clearance"
            checked={clearanceRequired}
            onCheckedChange={(checked) => setClearanceRequired(checked === true)}
          />
          <Label htmlFor="clearance">Medical clearance required before exercise</Label>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Medical Notes (Optional)</Label>
          <Textarea
            value={fitnessNotes}
            onChange={(e) => setFitnessNotes(e.target.value)}
            placeholder="Any medical conditions, injuries, or concerns..."
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('exercise')}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSubmitFitness} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2" />
          )}
          Continue to Commitment
        </Button>
      </CardFooter>
    </Card>
  );

  const renderWillingnessStep = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Brain className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <CardTitle>Commitment Assessment</CardTitle>
            <CardDescription>Help us understand your readiness and commitment</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Readiness Stage */}
        <div className="space-y-2">
          <Label>How ready are you to make changes?</Label>
          <RadioGroup value={readinessStage} onValueChange={setReadinessStage}>
            {READINESS_STAGES.map((stage) => (
              <div key={stage.value} className="flex items-center space-x-2">
                <RadioGroupItem value={stage.value} id={`stage-${stage.value}`} />
                <Label htmlFor={`stage-${stage.value}`} className="flex-1">
                  <span className="font-medium">{stage.label}</span>
                  <span className="text-sm text-muted-foreground ml-2">- {stage.description}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Commitment Score */}
        <div className="space-y-2">
          <Label>Commitment Level: {commitmentScore}/5</Label>
          <Slider
            value={[commitmentScore]}
            onValueChange={([v]) => setCommitmentScore(v)}
            min={1}
            max={5}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low commitment</span>
            <span>High commitment</span>
          </div>
        </div>

        {/* Weekly Minutes */}
        <div className="space-y-2">
          <Label>Weekly Minutes You Can Commit: {weeklyMinutesPromised} mins</Label>
          <Slider
            value={[weeklyMinutesPromised]}
            onValueChange={([v]) => setWeeklyMinutesPromised(v)}
            min={30}
            max={300}
            step={15}
          />
        </div>

        {/* Confidence Rating */}
        <div className="space-y-2">
          <Label>Confidence You'll Stick With It: {confidenceRating}/10</Label>
          <Slider
            value={[confidenceRating]}
            onValueChange={([v]) => setConfidenceRating(v)}
            min={0}
            max={10}
            step={1}
          />
        </div>

        {/* Motivator Statement */}
        <div className="space-y-2">
          <Label>Your "Why" - What motivates you?</Label>
          <Textarea
            value={motivatorStatement}
            onChange={(e) => setMotivatorStatement(e.target.value)}
            placeholder="What's your main motivation for this journey?"
          />
        </div>

        {/* Limiting Factors */}
        <div className="space-y-2">
          <Label>Potential Limiting Factors</Label>
          <div className="flex flex-wrap gap-2">
            {BARRIERS.map((factor) => (
              <Badge
                key={factor}
                variant={limitingFactors.includes(factor) ? 'destructive' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleArrayItem(limitingFactors, setLimitingFactors, factor)}
              >
                {factor}
              </Badge>
            ))}
          </div>
        </div>

        {/* Follow-up */}
        <div className="space-y-2">
          <Label>Check-in Frequency: Every {followUpDays} days</Label>
          <Slider
            value={[followUpDays]}
            onValueChange={([v]) => setFollowUpDays(v)}
            min={3}
            max={14}
            step={1}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('fitness')}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSubmitWillingness} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Complete & Generate Plan
        </Button>
      </CardFooter>
    </Card>
  );

  const renderCompleteStep = () => (
    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Intake Complete!</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Your personalized 4-week plan is being generated. You'll be redirected shortly...
        </p>
        <Loader2 className="w-6 h-6 animate-spin text-primary mt-4" />
      </CardContent>
    </Card>
  );

  // Progress Indicator
  const steps = ['exercise', 'fitness', 'willingness', 'complete'];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {steps.slice(0, -1).map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : index === currentIndex
                  ? 'bg-primary/20 text-primary border-2 border-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < currentIndex ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 2 && (
              <div className={`w-12 h-1 mx-1 ${index < currentIndex ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step */}
      {currentStep === 'exercise' && renderExerciseStep()}
      {currentStep === 'fitness' && renderFitnessStep()}
      {currentStep === 'willingness' && renderWillingnessStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </div>
  );
}

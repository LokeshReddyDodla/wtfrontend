import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Calendar,
  ThermometerSun
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';

interface SymptomsTrackerProps {
  userId: string;
  onSubmit?: () => void;
}

const COMMON_SYMPTOMS = [
  { name: 'Nausea', description: 'Feeling sick to your stomach' },
  { name: 'Vomiting', description: 'Actually being sick' },
  { name: 'Diarrhea', description: 'Loose or watery stools' },
  { name: 'Constipation', description: 'Difficulty passing stools' },
  { name: 'Abdominal Pain', description: 'Stomach or belly pain' },
  { name: 'Headache', description: 'Head pain or pressure' },
  { name: 'Fatigue', description: 'Feeling tired or weak' },
  { name: 'Dizziness', description: 'Feeling lightheaded' },
  { name: 'Decreased Appetite', description: 'Not feeling hungry' },
  { name: 'Heartburn', description: 'Burning sensation in chest' },
];

const SEVERITY_LABELS = ['None', 'Mild', 'Moderate', 'Severe'];
const SEVERITY_COLORS = [
  'bg-gray-100 text-gray-600',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-red-100 text-red-700',
];

export default function SymptomsTracker({ userId, onSubmit }: SymptomsTrackerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [medicationName, setMedicationName] = useState('');
  const [medicationDose, setMedicationDose] = useState<number | undefined>();
  const [symptoms, setSymptoms] = useState<Record<string, { severity: number; days: number; notes: string }>>({});
  const [fastingBgEvents, setFastingBgEvents] = useState(0);
  const [hypoglycemiaEvents, setHypoglycemiaEvents] = useState(0);
  const [insulinOrSulfonylurea, setInsulinOrSulfonylurea] = useState(false);
  const [notes, setNotes] = useState('');

  // Calculate week dates
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);

  const updateSymptom = (name: string, field: 'severity' | 'days' | 'notes', value: any) => {
    setSymptoms(prev => ({
      ...prev,
      [name]: {
        ...prev[name] || { severity: 0, days: 0, notes: '' },
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const symptomEntries: api.SymptomEntry[] = Object.entries(symptoms)
        .filter(([, data]) => data.severity > 0)
        .map(([name, data]) => ({
          name,
          severity_grade: data.severity,
          days_reported: data.days,
          notes: data.notes || undefined,
        }));

      await api.logWeeklySymptoms({
        user_id: userId,
        medication_name: medicationName || undefined,
        medication_dose_mg: medicationDose,
        week_start: weekStart.toISOString().split('T')[0],
        week_end: today.toISOString().split('T')[0],
        symptoms: symptomEntries,
        fasting_bg_events: fastingBgEvents,
        hypoglycemia_events: hypoglycemiaEvents,
        insulin_or_sulfonylurea: insulinOrSulfonylurea,
        notes: notes || undefined,
      });

      toast({
        title: 'Symptoms logged successfully',
        description: 'Your weekly symptom report has been saved.',
      });

      // Reset form
      setSymptoms({});
      setFastingBgEvents(0);
      setHypoglycemiaEvents(0);
      setNotes('');

      onSubmit?.();
    } catch (error: any) {
      toast({
        title: 'Error logging symptoms',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAnySevereSymptoms = Object.values(symptoms).some(s => s.severity >= 3);
  const totalSymptomsReported = Object.values(symptoms).filter(s => s.severity > 0).length;

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 rounded-lg bg-orange-500/10">
            <ThermometerSun className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Weekly Symptom Check-In</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Track your GLP-1 symptoms for the week of{' '}
              {weekStart.toLocaleDateString()} - {today.toLocaleDateString()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
        {/* Medication Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs sm:text-sm">
              <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              GLP-1 Medication
            </Label>
            <Input
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="e.g., Semaglutide"
              className="h-9 sm:h-10 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Current Dose (mg)</Label>
            <Input
              type="number"
              value={medicationDose || ''}
              onChange={(e) => setMedicationDose(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="e.g., 0.5, 1.0, 2.4"
              step="0.1"
              className="h-9 sm:h-10 text-sm"
            />
          </div>
        </div>

        {/* Symptoms Grid */}
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-sm sm:text-base font-semibold">Symptoms This Week</Label>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {COMMON_SYMPTOMS.map((symptom) => {
              const data = symptoms[symptom.name] || { severity: 0, days: 0, notes: '' };
              const isActive = data.severity > 0;

              return (
                <Card 
                  key={symptom.name}
                  className={`transition-all ${isActive ? 'border-primary/50 bg-primary/5' : 'border-dashed'}`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div>
                        <h4 className="text-sm sm:text-base font-medium">{symptom.name}</h4>
                        <p className="text-xs text-muted-foreground">{symptom.description}</p>
                      </div>
                      <Badge className={`text-xs ${SEVERITY_COLORS[data.severity]}`}>
                        {SEVERITY_LABELS[data.severity]}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <Label className="text-xs">Severity</Label>
                        <div className="flex gap-1 mt-1">
                          {SEVERITY_LABELS.map((label, index) => (
                            <Button
                              key={label}
                              size="sm"
                              variant={data.severity === index ? 'default' : 'outline'}
                              className="flex-1 text-xs h-7"
                              onClick={() => updateSymptom(symptom.name, 'severity', index)}
                            >
                              {index}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {isActive && (
                        <div>
                          <Label className="text-xs">Days affected: {data.days}</Label>
                          <Slider
                            value={[data.days]}
                            onValueChange={([v]) => updateSymptom(symptom.name, 'days', v)}
                            min={0}
                            max={7}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Blood Sugar Events */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-red-700 text-xs sm:text-sm">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Low Blood Sugar Events
            </Label>
            <Input
              type="number"
              value={hypoglycemiaEvents}
              onChange={(e) => setHypoglycemiaEvents(parseInt(e.target.value) || 0)}
              min={0}
              className="h-9 sm:h-10 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Times you felt shaky, sweaty, or confused
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">High Fasting BG Events</Label>
            <Input
              type="number"
              value={fastingBgEvents}
              onChange={(e) => setFastingBgEvents(parseInt(e.target.value) || 0)}
              min={0}
              className="h-9 sm:h-10 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Morning readings above target
            </p>
          </div>
        </div>

        {/* Other Medications */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="insulin-check"
            checked={insulinOrSulfonylurea}
            onCheckedChange={(checked) => setInsulinOrSulfonylurea(checked === true)}
          />
          <Label htmlFor="insulin-check" className="text-xs sm:text-sm">
            I'm also taking insulin or a sulfonylurea medication
          </Label>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Additional Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any other symptoms or concerns..."
            className="text-sm"
          />
        </div>

        {/* Warning Banner */}
        {hasAnySevereSymptoms && (
          <div className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-700">Severe Symptoms Detected</h4>
              <p className="text-xs sm:text-sm text-red-600">
                Please contact your healthcare provider if symptoms persist or worsen.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col sm:flex-row justify-between gap-3 p-4 sm:p-6">
        <div className="text-xs sm:text-sm text-muted-foreground">
          {totalSymptomsReported > 0 && (
            <span>{totalSymptomsReported} symptom(s) reported</span>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mr-2" />
          )}
          Submit Weekly Report
        </Button>
      </CardFooter>
    </Card>
  );
}

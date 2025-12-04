import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, ArrowRight, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnrollmentSetupProps {
  onEnrollmentSet: (enrollmentId: string) => void;
}

export default function EnrollmentSetup({ onEnrollmentSet }: EnrollmentSetupProps) {
  const [enrollmentId, setEnrollmentId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedId = enrollmentId.trim();
    
    if (!trimmedId) {
      setError('Please enter your Enrollment ID');
      return;
    }
    
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedId)) {
      setError('Please enter a valid Enrollment ID format');
      return;
    }
    
    // Just pass the enrollment ID directly - no API call needed
    onEnrollmentSet(trimmedId);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Mobile-optimized container */}
      <div className="flex-1 flex flex-col justify-center px-4 py-6 sm:px-6 sm:py-8 safe-area-inset">
        <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header - Compact on mobile */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-chart-1 to-chart-2 shadow-lg">
              <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Weight Loss Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Enter your Enrollment ID to get started
              </p>
            </div>
          </div>

          {/* Main Card - Touch-friendly inputs */}
          <Card className="p-5 sm:p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="enrollmentId" className="text-sm font-medium">
                  Enrollment ID
                </Label>
                <Input
                  id="enrollmentId"
                  type="text"
                  placeholder="Enter your enrollment ID"
                  value={enrollmentId}
                  onChange={(e) => {
                    setEnrollmentId(e.target.value);
                    setError('');
                  }}
                  className="font-mono text-base sm:text-sm h-12 sm:h-10 px-4"
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <p className="text-xs text-muted-foreground">
                  Your unique program enrollment ID
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="py-3">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 sm:h-11 text-base sm:text-sm font-medium"
                size="lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Card>

          {/* Info Card - Collapsible look on mobile */}
          <Card className="p-4 bg-muted/50 border-muted">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-medium text-foreground text-sm">
                  Where can I find my Enrollment ID?
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-xs leading-relaxed">
                  <li>Check your enrollment confirmation</li>
                  <li>Ask your healthcare provider</li>
                  <li>Look in your patient portal</li>
                </ul>
                <p className="text-xs italic pt-1 text-muted-foreground/80">
                  Your session will be saved for future visits.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Bottom safe area for mobile */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
}


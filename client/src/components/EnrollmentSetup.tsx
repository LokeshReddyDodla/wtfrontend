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
      setError('Please enter an enrollment ID');
      return;
    }
    
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedId)) {
      setError('Please enter a valid UUID format enrollment ID');
      return;
    }
    
    onEnrollmentSet(trimmedId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-chart-1 to-chart-2 mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Weight Loss Dashboard</h1>
          <p className="text-muted-foreground">Enter your enrollment ID to get started</p>
        </div>

        {/* Main Card */}
        <Card className="p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="enrollmentId">Enrollment ID</Label>
              <Input
                id="enrollmentId"
                type="text"
                placeholder="e.g., a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                value={enrollmentId}
                onChange={(e) => {
                  setEnrollmentId(e.target.value);
                  setError('');
                }}
                className="font-mono text-sm"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                This is your unique program enrollment ID
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" size="lg">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-muted/50 border-muted">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Don't have an enrollment ID?</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Open <code className="bg-background px-1 py-0.5 rounded">enroll.html</code> in your browser</li>
                <li>Fill in your patient and doctor information</li>
                <li>Click "Create Enrollment" to get your ID</li>
                <li>Come back here and enter it</li>
              </ol>
              <p className="text-xs italic mt-2">
                Your enrollment ID will be saved in your browser for future visits.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


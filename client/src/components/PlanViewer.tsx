import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Droplets, 
  Footprints, 
  Dumbbell,
  Apple,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Shield
} from 'lucide-react';
import type { PlanSnapshot, PlanMetricRange, SafetyRuleCap, HabitFocus } from '@/lib/api';

interface PlanViewerProps {
  plan: PlanSnapshot | null;
  isLoading?: boolean;
}

const metricIcons: Record<string, React.ElementType> = {
  daily_steps: Footprints,
  weekly_minutes_moderate: Dumbbell,
  protein_floor: Apple,
  calorie_band: TrendingUp,
  hydration_oz: Droplets,
};

const severityColors: Record<string, string> = {
  low: 'bg-green-500/20 text-green-700 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-700 border-red-500/30',
};

function MetricCard({ metric }: { metric: PlanMetricRange }) {
  const Icon = metricIcons[metric.metric_id] || Target;
  const hasRange = metric.min_value !== null && metric.max_value !== null;

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{metric.label}</h4>
            {hasRange ? (
              <p className="text-lg font-semibold text-foreground">
                {metric.min_value?.toLocaleString()} - {metric.max_value?.toLocaleString()} {metric.units}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Not set</p>
            )}
            <Badge variant="outline" className="text-xs mt-1 capitalize">
              {metric.cadence}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SafetyRuleCard({ rule }: { rule: SafetyRuleCap }) {
  const colorClass = severityColors[rule.severity] || severityColors.medium;

  return (
    <div className={`p-3 rounded-lg border ${colorClass}`}>
      <div className="flex items-start gap-2">
        <Shield className="w-4 h-4 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{rule.action}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {rule.severity}
            </Badge>
          </div>
          {rule.cap_value && (
            <p className="text-sm mt-1">
              Cap: {rule.cap_value} {rule.units}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Rule: {rule.rule_id}
          </p>
        </div>
      </div>
    </div>
  );
}

function HabitCard({ habit }: { habit: HabitFocus }) {
  return (
    <div className="p-3 rounded-lg border bg-gradient-to-br from-chart-2/10 to-chart-3/5">
      <div className="flex items-start gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
          {habit.priority}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{habit.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {habit.cue}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {habit.measurement}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanViewer({ plan, isLoading }: PlanViewerProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Active Plan</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Complete your intake forms to generate a personalized 4-week plan.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (plan.abstained) {
    return (
      <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <CardTitle className="text-lg">Plan Generation Paused</CardTitle>
          </div>
          <CardDescription>
            {plan.abstain_reason || 'Unable to generate plan at this time.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const validFrom = new Date(plan.valid_from);
  const validTo = new Date(plan.valid_to);
  const now = new Date();
  const totalDays = Math.ceil((validTo.getTime() - validFrom.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((now.getTime() - validFrom.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <CardTitle>Your 4-Week Plan</CardTitle>
            </div>
            <Badge variant="default" className="bg-primary">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          <CardDescription>
            Generated on {new Date(plan.generated_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{validFrom.toLocaleDateString()} - {validTo.toLocaleDateString()}</span>
              </div>
              <span className="font-medium">{daysRemaining} days remaining</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Week {Math.ceil(daysElapsed / 7)} of 4</span>
              <span>Review in {plan.review_after_days} days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Targets */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Daily & Weekly Targets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(plan.targets).map((target) => (
            <MetricCard key={target.metric_id} metric={target} />
          ))}
          <MetricCard metric={plan.hydration} />
        </div>
      </div>

      {/* Habits Focus */}
      {plan.habits_focus.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-chart-2" />
            Focus Habits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.habits_focus.map((habit) => (
              <HabitCard key={habit.habit_id} habit={habit} />
            ))}
          </div>
        </div>
      )}

      {/* Safety Rules */}
      {plan.safety_rules.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Safety Considerations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.safety_rules.map((rule) => (
              <SafetyRuleCard key={rule.rule_id} rule={rule} />
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {plan.sources.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">
              <strong>Evidence Sources:</strong> {plan.sources.join(', ')}
            </p>
            {plan.provenance.composer_version && (
              <p className="text-xs text-muted-foreground mt-1">
                Composer Version: {plan.provenance.composer_version}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

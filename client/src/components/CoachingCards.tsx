import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Timer, 
  Droplets,
  Footprints,
  ChefHat,
  Bell,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { SuggestionCard, CoachActionResponse } from '@/lib/api';

interface CoachingCardsProps {
  cards: SuggestionCard[];
  isLoading?: boolean;
  onRefresh?: () => void;
  abstained?: boolean;
  abstainReason?: string;
}

const cardTypeIcons: Record<string, React.ElementType> = {
  nudge: Lightbulb,
  timer: Timer,
  hydration: Droplets,
  steps: Footprints,
  meal: ChefHat,
  reminder: Bell,
};

const cardTypeColors: Record<string, string> = {
  nudge: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
  timer: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
  hydration: 'from-sky-500/20 to-blue-500/10 border-sky-500/30',
  steps: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
  meal: 'from-orange-500/20 to-red-500/10 border-orange-500/30',
  reminder: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
};

const confidenceColors = (confidence: number) => {
  if (confidence >= 0.8) return 'bg-green-500/20 text-green-700 border-green-500/30';
  if (confidence >= 0.6) return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
  return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
};

export default function CoachingCards({
  cards,
  isLoading = false,
  onRefresh,
  abstained = false,
  abstainReason,
}: CoachingCardsProps) {
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());

  const handleDismiss = (cardId: string) => {
    setDismissedCards(prev => new Set(prev).add(cardId));
  };

  const visibleCards = cards.filter(card => !dismissedCards.has(card.card_id));

  if (abstained) {
    return (
      <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <CardTitle className="text-lg">Coaching Unavailable</CardTitle>
          </div>
          <CardDescription>
            {abstainReason || 'Unable to generate coaching suggestions at this time.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete your intake forms to receive personalized coaching cards.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (visibleCards.length === 0 && !isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Active Coaching Cards</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            Your AI coach will provide personalized nudges and timers based on your plan.
          </p>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Get Suggestions
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h3 className="text-base sm:text-lg font-semibold">AI Coach Suggestions</h3>
          <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
            {visibleCards.length} Active
          </Badge>
        </div>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {visibleCards.map((card) => {
          const Icon = cardTypeIcons[card.card_type] || Lightbulb;
          const colorClass = cardTypeColors[card.card_type] || cardTypeColors.nudge;

          return (
            <Card 
              key={card.card_id} 
              className={`bg-gradient-to-br ${colorClass} transition-all hover:shadow-md`}
            >
              <CardHeader className="pb-2 p-3 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-background/50">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm sm:text-base">{card.title}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <p className="text-xs sm:text-sm text-foreground/80 mb-3 sm:mb-4">{card.body}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(card.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <div className="flex gap-1 sm:gap-2">
                    {card.cta && (
                      <Button size="sm" variant="default" className="text-xs h-8">
                        {card.cta}
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDismiss(card.card_id)}
                      className="text-xs h-8"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      Done
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

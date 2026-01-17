import { AISuggestion } from '@/types/sensor';
import { cn } from '@/lib/utils';
import { 
  LucideIcon, 
  Sparkles, 
  ChevronRight, 
  Lightbulb,
  FlaskConical,
  Leaf,
  Droplets,
  Sun
} from 'lucide-react';

interface AISuggestionPanelProps {
  suggestions: AISuggestion[];
}

const iconMap: Record<string, LucideIcon> = {
  FlaskConical,
  Leaf,
  Droplets,
  Sun,
  Lightbulb,
  Sparkles,
};

const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Lightbulb;
};

const priorityStyles = {
  high: {
    border: 'border-l-status-critical',
    bg: 'bg-[hsl(var(--status-critical)/0.05)]',
    badge: 'bg-status-critical text-white',
  },
  medium: {
    border: 'border-l-status-warning',
    bg: 'bg-[hsl(var(--status-warning)/0.05)]',
    badge: 'bg-status-warning text-foreground',
  },
  low: {
    border: 'border-l-status-optimal',
    bg: 'bg-[hsl(var(--status-optimal)/0.05)]',
    badge: 'bg-status-optimal text-white',
  },
};

export function AISuggestionPanel({ suggestions }: AISuggestionPanelProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">AI Soil Insights</h3>
            <p className="text-xs text-muted-foreground">
              Actionable recommendations based on your sensor data
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {suggestions.map((suggestion, index) => {
          const Icon = getIcon(suggestion.icon);
          const styles = priorityStyles[suggestion.priority];

          return (
            <div
              key={suggestion.id}
              className={cn(
                'p-4 border-l-4 transition-colors hover:bg-muted/50',
                styles.border,
                styles.bg,
                'animate-fade-in'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-card border border-border shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground text-sm">
                      {suggestion.title}
                    </h4>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium capitalize',
                      styles.badge
                    )}>
                      {suggestion.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground mb-2">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Why: </span>
                      {suggestion.reason}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

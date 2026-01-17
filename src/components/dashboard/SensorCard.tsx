import { SensorData } from '@/types/sensor';
import { cn } from '@/lib/utils';
import { 
  Droplets, 
  Thermometer, 
  FlaskConical, 
  Zap, 
  Leaf, 
  Sparkles, 
  Gem, 
  CloudRain, 
  Sun,
  Activity,
  LucideIcon
} from 'lucide-react';

interface SensorCardProps {
  sensor: SensorData;
  compact?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  Droplets,
  Thermometer,
  FlaskConical,
  Zap,
  Leaf,
  Sparkles,
  Gem,
  CloudRain,
  Sun,
  Activity,
};

const getIcon = (iconName: string): LucideIcon => {
  return iconMap[iconName] || Activity;
};

export function SensorCard({ sensor, compact = false }: SensorCardProps) {
  const Icon = getIcon(sensor.icon);
  
  const statusColors = {
    optimal: 'status-optimal',
    warning: 'status-warning',
    critical: 'status-critical',
  };

  const statusBgColors = {
    optimal: 'status-bg-optimal',
    warning: 'status-bg-warning',
    critical: 'status-bg-critical',
  };

  const statusLabels = {
    optimal: 'Optimal',
    warning: 'Warning',
    critical: 'Critical',
  };

  // Simple sparkline from history
  const maxHistory = Math.max(...sensor.history);
  const minHistory = Math.min(...sensor.history);
  const range = maxHistory - minHistory || 1;
  
  const sparklinePoints = sensor.history
    .map((val, i) => {
      const x = (i / (sensor.history.length - 1)) * 100;
      const y = 100 - ((val - minHistory) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={cn(
      "sensor-card animate-fade-in",
      compact && "p-3"
    )}>
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className={cn('p-1.5 sm:p-2 rounded-lg', statusBgColors[sensor.status])}>
          <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', statusColors[sensor.status])} />
        </div>
        <span className={cn(
          'text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full',
          statusBgColors[sensor.status],
          statusColors[sensor.status],
          sensor.status === 'critical' && 'animate-pulse-status'
        )}>
          {statusLabels[sensor.status]}
        </span>
      </div>

      <div className="mb-2 sm:mb-3">
        <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1 truncate">
          {sensor.name}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-display font-bold text-foreground">
            {sensor.value}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground">{sensor.unit}</span>
        </div>
      </div>

      {/* Mini sparkline */}
      <div className="h-8 sm:h-10 w-full">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points={sparklinePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={statusColors[sensor.status]}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
        Optimal: {sensor.optimal.min}–{sensor.optimal.max}{sensor.unit}
      </p>
    </div>
  );
}

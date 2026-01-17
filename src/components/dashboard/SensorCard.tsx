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

export function SensorCard({ sensor }: SensorCardProps) {
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
    <div className="sensor-card animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg', statusBgColors[sensor.status])}>
          <Icon className={cn('w-5 h-5', statusColors[sensor.status])} />
        </div>
        <span className={cn(
          'text-xs font-medium px-2 py-1 rounded-full',
          statusBgColors[sensor.status],
          statusColors[sensor.status],
          sensor.status === 'critical' && 'animate-pulse-status'
        )}>
          {statusLabels[sensor.status]}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-muted-foreground mb-1">{sensor.name}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-display font-bold text-foreground">
            {sensor.value}
          </span>
          <span className="text-sm text-muted-foreground">{sensor.unit}</span>
        </div>
      </div>

      {/* Mini sparkline */}
      <div className="h-10 w-full">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points={sparklinePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={statusColors[sensor.status]}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Optimal: {sensor.optimal.min}–{sensor.optimal.max}{sensor.unit}
      </p>
    </div>
  );
}

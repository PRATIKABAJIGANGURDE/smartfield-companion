export type SensorStatus = 'optimal' | 'warning' | 'critical';

export interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: SensorStatus;
  icon: string;
  min: number;
  max: number;
  optimal: { min: number; max: number };
  history: number[];
  lastUpdated: Date;
}

export interface AISuggestion {
  id: string;
  type: 'fertilizer' | 'irrigation' | 'ph' | 'general';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export interface RoverState {
  connected: boolean;
  battery: number;
  speed: number;
  position: { x: number; y: number };
}

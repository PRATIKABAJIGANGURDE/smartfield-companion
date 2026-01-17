export type SensorStatus = 'optimal' | 'warning' | 'critical';

export type CropType = 'rice' | 'wheat' | 'vegetables' | 'corn' | 'cotton';

export interface OptimalRange {
  min: number;
  max: number;
}

export interface CropPreset {
  id: CropType;
  name: string;
  icon: string;
  description: string;
  optimalRanges: Record<string, OptimalRange>;
}

export interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: SensorStatus;
  icon: string;
  min: number;
  max: number;
  optimal: OptimalRange;
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
export interface RoverState {
  connected: boolean;
  battery: number;
  speed: number;
  position: { x: number; y: number };
}

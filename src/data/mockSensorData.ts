import { SensorData, AISuggestion, RoverState, CropType, SensorStatus } from '@/types/sensor';
import { getOptimalRange, getCropPreset } from './cropPresets';

const generateHistory = (base: number, variance: number): number[] => {
  return Array.from({ length: 24 }, () => 
    Math.max(0, base + (Math.random() - 0.5) * variance * 2)
  );
};

const getStatus = (value: number, optimal: { min: number; max: number }): SensorStatus => {
  if (value >= optimal.min && value <= optimal.max) return 'optimal';
  
  const margin = (optimal.max - optimal.min) * 0.3;
  if (value >= optimal.min - margin && value <= optimal.max + margin) return 'warning';
  
  return 'critical';
};

// Base sensor values (simulated readings)
const baseSensorValues: Record<string, { value: number; unit: string; name: string; icon: string; min: number; max: number }> = {
  moisture: { value: 42, unit: '%', name: 'Soil Moisture', icon: 'Droplets', min: 0, max: 100 },
  'soil-temp': { value: 24, unit: '°C', name: 'Soil Temperature', icon: 'Thermometer', min: 0, max: 50 },
  ph: { value: 5.4, unit: '', name: 'Soil pH', icon: 'FlaskConical', min: 0, max: 14 },
  ec: { value: 1.8, unit: 'dS/m', name: 'Electrical Conductivity', icon: 'Zap', min: 0, max: 5 },
  nitrogen: { value: 28, unit: 'mg/kg', name: 'Nitrogen (N)', icon: 'Leaf', min: 0, max: 150 },
  phosphorus: { value: 32, unit: 'mg/kg', name: 'Phosphorus (P)', icon: 'Sparkles', min: 0, max: 100 },
  potassium: { value: 45, unit: 'mg/kg', name: 'Potassium (K)', icon: 'Gem', min: 0, max: 100 },
  humidity: { value: 68, unit: '%', name: 'Ambient Humidity', icon: 'CloudRain', min: 0, max: 100 },
  'ambient-temp': { value: 31, unit: '°C', name: 'Ambient Temperature', icon: 'Sun', min: 0, max: 50 },
};

export const getSensorData = (cropType: CropType): SensorData[] => {
  return Object.entries(baseSensorValues).map(([id, base]) => {
    const optimal = getOptimalRange(cropType, id);
    return {
      id,
      name: base.name,
      value: base.value,
      unit: base.unit,
      status: getStatus(base.value, optimal),
      icon: base.icon,
      min: base.min,
      max: base.max,
      optimal,
      history: generateHistory(base.value, base.value * 0.15),
      lastUpdated: new Date(),
    };
  });
};

export const getAISuggestions = (cropType: CropType, sensorData: SensorData[]): AISuggestion[] => {
  const suggestions: AISuggestion[] = [];
  const crop = getCropPreset(cropType);
  
  // Check each sensor and generate relevant suggestions
  const phSensor = sensorData.find(s => s.id === 'ph');
  if (phSensor && phSensor.status !== 'optimal') {
    const isAcidic = phSensor.value < phSensor.optimal.min;
    suggestions.push({
      id: 'ph-correction',
      type: 'ph',
      title: isAcidic ? 'Soil pH Too Acidic' : 'Soil pH Too Alkaline',
      description: isAcidic 
        ? `Add agricultural lime (CaCO₃) at 150-200 kg/acre to raise pH for optimal ${crop.name} growth.`
        : `Add sulfur or organic matter to lower pH. ${crop.name} prefers pH ${phSensor.optimal.min}-${phSensor.optimal.max}.`,
      reason: `Current pH is ${phSensor.value}. ${crop.name} thrives in pH ${phSensor.optimal.min}-${phSensor.optimal.max}. Incorrect pH reduces nutrient availability.`,
      priority: phSensor.status === 'critical' ? 'high' : 'medium',
      icon: 'FlaskConical',
    });
  }

  const nitrogenSensor = sensorData.find(s => s.id === 'nitrogen');
  if (nitrogenSensor && nitrogenSensor.status !== 'optimal') {
    const isLow = nitrogenSensor.value < nitrogenSensor.optimal.min;
    if (isLow) {
      suggestions.push({
        id: 'nitrogen-supplement',
        type: 'fertilizer',
        title: 'Nitrogen Supplementation Required',
        description: cropType === 'rice' 
          ? 'Apply Urea (46-0-0) in split doses during tillering and panicle stages.'
          : `Apply Urea or organic compost at 40-60 kg/acre for ${crop.name}.`,
        reason: `Nitrogen is ${nitrogenSensor.value} mg/kg (optimal: ${nitrogenSensor.optimal.min}-${nitrogenSensor.optimal.max}). Low nitrogen causes stunted growth and yellowing in ${crop.name}.`,
        priority: nitrogenSensor.status === 'critical' ? 'high' : 'medium',
        icon: 'Leaf',
      });
    }
  }

  const moistureSensor = sensorData.find(s => s.id === 'moisture');
  if (moistureSensor) {
    if (moistureSensor.status === 'optimal') {
      suggestions.push({
        id: 'irrigation-status',
        type: 'irrigation',
        title: 'Irrigation Status: Optimal',
        description: `No irrigation changes needed. Current moisture is ideal for ${crop.name}.`,
        reason: `Soil moisture at ${moistureSensor.value}% is within optimal ${moistureSensor.optimal.min}-${moistureSensor.optimal.max}% range for ${crop.name}.`,
        priority: 'low',
        icon: 'Droplets',
      });
    } else {
      const isLow = moistureSensor.value < moistureSensor.optimal.min;
      suggestions.push({
        id: 'irrigation-action',
        type: 'irrigation',
        title: isLow ? 'Irrigation Required' : 'Reduce Watering',
        description: isLow
          ? `Increase irrigation. ${crop.name} requires ${moistureSensor.optimal.min}-${moistureSensor.optimal.max}% moisture.`
          : `Reduce watering to prevent waterlogging. Allow soil to drain.`,
        reason: `Current moisture ${moistureSensor.value}% is ${isLow ? 'below' : 'above'} optimal range for ${crop.name}.`,
        priority: moistureSensor.status === 'critical' ? 'high' : 'medium',
        icon: 'Droplets',
      });
    }
  }

  const tempSensor = sensorData.find(s => s.id === 'ambient-temp');
  if (tempSensor && tempSensor.status !== 'optimal') {
    const isHot = tempSensor.value > tempSensor.optimal.max;
    suggestions.push({
      id: 'temp-advisory',
      type: 'general',
      title: isHot ? 'High Temperature Advisory' : 'Low Temperature Advisory',
      description: isHot
        ? `Consider shade nets or mulching. Increase irrigation frequency for ${crop.name} during peak hours.`
        : `Consider row covers or mulching to protect ${crop.name} from cold stress.`,
      reason: `Ambient temperature ${tempSensor.value}°C is ${isHot ? 'above' : 'below'} optimal ${tempSensor.optimal.min}-${tempSensor.optimal.max}°C for ${crop.name}.`,
      priority: tempSensor.status === 'critical' ? 'high' : 'medium',
      icon: 'Sun',
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

export const mockRoverState: RoverState = {
  connected: true,
  battery: 78,
  speed: 50,
  position: { x: 0, y: 0 },
};

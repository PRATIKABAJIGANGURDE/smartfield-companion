import { CropPreset, CropType, OptimalRange } from '@/types/sensor';

export const cropPresets: CropPreset[] = [
  {
    id: 'rice',
    name: 'Rice (Paddy)',
    icon: 'Wheat',
    description: 'Flooded field crop, high water needs',
    optimalRanges: {
      moisture: { min: 70, max: 90 },
      'soil-temp': { min: 20, max: 35 },
      ph: { min: 5.5, max: 6.5 },
      ec: { min: 0.5, max: 2.0 },
      nitrogen: { min: 40, max: 80 },
      phosphorus: { min: 15, max: 35 },
      potassium: { min: 40, max: 80 },
      humidity: { min: 60, max: 90 },
      'ambient-temp': { min: 22, max: 35 },
    },
  },
  {
    id: 'wheat',
    name: 'Wheat',
    icon: 'Wheat',
    description: 'Cool season grain crop',
    optimalRanges: {
      moisture: { min: 30, max: 50 },
      'soil-temp': { min: 12, max: 25 },
      ph: { min: 6.0, max: 7.5 },
      ec: { min: 1.0, max: 2.5 },
      nitrogen: { min: 30, max: 60 },
      phosphorus: { min: 20, max: 40 },
      potassium: { min: 25, max: 50 },
      humidity: { min: 40, max: 70 },
      'ambient-temp': { min: 15, max: 25 },
    },
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: 'Carrot',
    description: 'Mixed vegetable cultivation',
    optimalRanges: {
      moisture: { min: 40, max: 60 },
      'soil-temp': { min: 15, max: 28 },
      ph: { min: 6.0, max: 7.0 },
      ec: { min: 1.5, max: 3.0 },
      nitrogen: { min: 35, max: 70 },
      phosphorus: { min: 25, max: 50 },
      potassium: { min: 35, max: 70 },
      humidity: { min: 50, max: 75 },
      'ambient-temp': { min: 18, max: 30 },
    },
  },
  {
    id: 'corn',
    name: 'Corn (Maize)',
    icon: 'Wheat',
    description: 'High-yield grain crop',
    optimalRanges: {
      moisture: { min: 50, max: 70 },
      'soil-temp': { min: 16, max: 30 },
      ph: { min: 5.8, max: 7.0 },
      ec: { min: 1.0, max: 2.5 },
      nitrogen: { min: 50, max: 100 },
      phosphorus: { min: 20, max: 45 },
      potassium: { min: 30, max: 60 },
      humidity: { min: 50, max: 80 },
      'ambient-temp': { min: 20, max: 32 },
    },
  },
  {
    id: 'cotton',
    name: 'Cotton',
    icon: 'Flower2',
    description: 'Fiber crop, warm climate',
    optimalRanges: {
      moisture: { min: 35, max: 55 },
      'soil-temp': { min: 20, max: 35 },
      ph: { min: 5.8, max: 8.0 },
      ec: { min: 1.0, max: 3.0 },
      nitrogen: { min: 30, max: 60 },
      phosphorus: { min: 15, max: 35 },
      potassium: { min: 40, max: 80 },
      humidity: { min: 40, max: 70 },
      'ambient-temp': { min: 25, max: 38 },
    },
  },
];

export const getCropPreset = (cropType: CropType): CropPreset => {
  return cropPresets.find(c => c.id === cropType) || cropPresets[0];
};

export const getOptimalRange = (cropType: CropType, sensorId: string): OptimalRange => {
  const preset = getCropPreset(cropType);
  return preset.optimalRanges[sensorId] || { min: 0, max: 100 };
};

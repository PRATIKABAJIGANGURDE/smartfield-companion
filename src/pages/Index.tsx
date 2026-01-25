import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SensorCard } from '@/components/dashboard/SensorCard';
import { AISuggestionPanel } from '@/components/dashboard/AISuggestionPanel';
import { RoverControl } from '@/components/dashboard/RoverControl';
import { CropSelector } from '@/components/dashboard/CropSelector';
import { getOptimalRange, getCropPreset } from '@/data/cropPresets';
import { CropType, SensorData, SensorStatus, RoverState } from '@/types/sensor';
import { api } from '@/services/api';
import { Activity, Gamepad2 } from 'lucide-react';

// Helper to map backend data to frontend SensorData structure
// Reuses logic from mockSensorData but with real values
const mapBackendToSensorData = (backendData: any, cropType: CropType): SensorData[] => {
  if (!backendData) return [];

  const soil = backendData.soil || {};
  const env = backendData.environment || {};

  // Flattened map of available values
  const values: Record<string, number> = {
    moisture: soil.moisture,
    'soil-temp': soil.temperature, // Map backend 'temperature' to frontend 'soil-temp'
    ph: soil.ph,
    nitrogen: soil.nitrogen,
    phosphorus: soil.phosphorus,
    potassium: soil.potassium,
    'ambient-temp': env.temperature,
    humidity: env.humidity
  };

  // Base config for metadata (units, icons, ranges)
  const baseConfig: Record<string, any> = {
    moisture: { unit: '%', name: 'Soil Moisture', icon: 'Droplets', min: 0, max: 100 },
    'soil-temp': { unit: '°C', name: 'Soil Temperature', icon: 'Thermometer', min: 0, max: 50 },
    ph: { unit: '', name: 'Soil pH', icon: 'FlaskConical', min: 0, max: 14 },
    nitrogen: { unit: 'mg/kg', name: 'Nitrogen (N)', icon: 'Leaf', min: 0, max: 150 },
    phosphorus: { unit: 'mg/kg', name: 'Phosphorus (P)', icon: 'Sparkles', min: 0, max: 100 },
    potassium: { unit: 'mg/kg', name: 'Potassium (K)', icon: 'Gem', min: 0, max: 100 },
    humidity: { unit: '%', name: 'Ambient Humidity', icon: 'CloudRain', min: 0, max: 100 },
    'ambient-temp': { unit: '°C', name: 'Ambient Temperature', icon: 'Sun', min: 0, max: 50 },
  };

  return Object.entries(baseConfig).map(([id, config]) => {
    const val = values[id] ?? 0; // Default to 0 if missing
    const optimal = getOptimalRange(cropType, id);

    // Calculate status
    let status: SensorStatus = 'critical';
    if (val >= optimal.min && val <= optimal.max) status = 'optimal';
    else if (val >= optimal.min - (optimal.max - optimal.min) * 0.3 && val <= optimal.max + (optimal.max - optimal.min) * 0.3) status = 'warning';

    return {
      id,
      name: config.name,
      value: val,
      unit: config.unit,
      status,
      icon: config.icon,
      min: config.min,
      max: config.max,
      optimal,
      // Simulate history for sparkline based on current value until we have DB
      history: Array(24).fill(val).map(v => v + (Math.random() - 0.5) * (v * 0.1)),
      lastUpdated: new Date()
    };
  });
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedCrop, setSelectedCrop] = useState<CropType>('vegetables');

  // Query: Sensors
  const { data: rawSensorData } = useQuery({
    queryKey: ['sensors'],
    queryFn: api.getSensors,
    refetchInterval: 3000,
  });

  // Query: Suggestions
  const { data: rawSuggestions } = useQuery({
    queryKey: ['suggestions'],
    queryFn: api.getSuggestions,
    refetchInterval: 5000,
  });

  // Query: Status
  const { data: rawStatus } = useQuery({
    queryKey: ['status'],
    queryFn: api.getStatus,
    refetchInterval: 2000,
  });

  // Derived State
  const sensorData = useMemo(() =>
    mapBackendToSensorData(rawSensorData, selectedCrop),
    [rawSensorData, selectedCrop]
  );

  // Use backend suggestions if available, otherwise formatted list
  // The backend returns { summary: string, recommendations: [] }
  // We need to map recommendations to AISuggestion[]
  const aiSuggestions = useMemo(() => {
    if (!rawSuggestions?.recommendations) return [];

    return rawSuggestions.recommendations.map((rec: any, i: number) => ({
      id: `rec-${i}`,
      type: 'general', // Default, could infer from action text
      title: rec.action,
      description: rec.action, // Backend gives concise action
      reason: rec.reason,
      priority: 'high', // Default for now
      icon: 'Lightbulb'
    }));
  }, [rawSuggestions]);

  // Map status to RoverState
  const roverState: RoverState = useMemo(() => ({
    connected: rawStatus?.connection === 'online',
    battery: rawStatus?.battery ?? 0,
    speed: 50, // This is local control state mainly, but could come from backend if two-way
    position: { x: 0, y: 0 }
  }), [rawStatus]);

  // Count issues for badge
  const issueCount = sensorData.filter(s => s.status !== 'optimal').length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-11 sm:h-12">
            <TabsTrigger
              value="insights"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
            >
              <Activity className="w-4 h-4" />
              <span>Soil Insights</span>
              {issueCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-status-warning text-foreground">
                  {issueCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="control"
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Control</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Crop Selector */}
            <CropSelector
              selectedCrop={selectedCrop}
              onSelectCrop={setSelectedCrop}
            />

            {/* Sensor Grid */}
            <section>
              <h2 className="font-display font-semibold text-base sm:text-lg text-foreground mb-3 sm:mb-4">
                Sensor Readings
                <span className="ml-2 text-xs sm:text-sm font-normal text-muted-foreground">
                  for {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}
                </span>
              </h2>
              {/* Mobile: 2 columns, Tablet: 3 columns, Desktop: 4-5 columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                {sensorData.map((sensor) => (
                  <SensorCard key={sensor.id} sensor={sensor} />
                ))}
              </div>
            </section>

            {/* AI Suggestions */}
            <section>
              <AISuggestionPanel suggestions={aiSuggestions} />
            </section>

            {/* Legend - Compact on mobile */}
            <section className="bg-card rounded-xl border border-border p-3 sm:p-4">
              <h3 className="font-medium text-foreground mb-2 sm:mb-3 text-sm sm:text-base">Status Legend</h3>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-status-optimal" />
                  <span className="text-muted-foreground">Optimal</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-status-warning" />
                  <span className="text-muted-foreground">Warning</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-status-critical" />
                  <span className="text-muted-foreground">Critical</span>
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="control" className="animate-fade-in">
            <div className="max-w-md mx-auto">
              <RoverControl roverState={roverState} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-3 sm:py-4 mt-6 sm:mt-8">
        <div className="container mx-auto px-4 text-center text-[10px] sm:text-xs text-muted-foreground">
          SmartFarm Dashboard • IoT Soil Monitoring System
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SensorCard } from '@/components/dashboard/SensorCard';
import { AISuggestionPanel } from '@/components/dashboard/AISuggestionPanel';
import { RoverControl } from '@/components/dashboard/RoverControl';
import { CropSelector } from '@/components/dashboard/CropSelector';
import { getSensorData, getAISuggestions, mockRoverState } from '@/data/mockSensorData';
import { CropType } from '@/types/sensor';
import { Activity, Gamepad2 } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedCrop, setSelectedCrop] = useState<CropType>('vegetables');

  // Recalculate sensor data and suggestions when crop changes
  const sensorData = useMemo(() => getSensorData(selectedCrop), [selectedCrop]);
  const aiSuggestions = useMemo(() => getAISuggestions(selectedCrop, sensorData), [selectedCrop, sensorData]);

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
              <RoverControl roverState={mockRoverState} />
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

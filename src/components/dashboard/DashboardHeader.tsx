import { Leaf, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function DashboardHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastUpdate = new Date();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">
                SmartFarm
              </h1>
              <p className="text-xs text-muted-foreground">
                IoT Soil Monitoring Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Updated {lastUpdate.toLocaleTimeString()}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn(
                'w-4 h-4 mr-1.5',
                isRefreshing && 'animate-spin'
              )} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

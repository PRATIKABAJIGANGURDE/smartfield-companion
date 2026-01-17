import { useState } from 'react';
import { VirtualJoystick } from './VirtualJoystick';
import { RoverState } from '@/types/sensor';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Battery, 
  Wifi, 
  WifiOff, 
  StopCircle, 
  Gauge,
  Bot,
  CircleDot
} from 'lucide-react';

interface RoverControlProps {
  roverState: RoverState;
}

export function RoverControl({ roverState: initialState }: RoverControlProps) {
  const [roverState, setRoverState] = useState(initialState);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [isEmergencyStop, setIsEmergencyStop] = useState(false);

  const handleJoystickMove = (position: { x: number; y: number }) => {
    if (isEmergencyStop) return;
    setJoystickPosition(position);
    // In real implementation, this would send commands to the rover
  };

  const handleSpeedChange = (value: number[]) => {
    setRoverState(prev => ({ ...prev, speed: value[0] }));
  };

  const handleEmergencyStop = () => {
    setIsEmergencyStop(true);
    setJoystickPosition({ x: 0, y: 0 });
    // Reset after 2 seconds
    setTimeout(() => setIsEmergencyStop(false), 2000);
  };

  const getBatteryColor = () => {
    if (roverState.battery > 50) return 'text-status-optimal';
    if (roverState.battery > 20) return 'text-status-warning';
    return 'text-status-critical';
  };

  return (
    <div className="space-y-6">
      {/* Rover Status */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Rover Status</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            {roverState.connected ? (
              <Wifi className="w-5 h-5 text-status-optimal" />
            ) : (
              <WifiOff className="w-5 h-5 text-status-critical" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Connection</p>
              <p className={cn(
                'text-sm font-medium',
                roverState.connected ? 'text-status-optimal' : 'text-status-critical'
              )}>
                {roverState.connected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <Battery className={cn('w-5 h-5', getBatteryColor())} />
            <div>
              <p className="text-xs text-muted-foreground">Battery</p>
              <p className={cn('text-sm font-medium', getBatteryColor())}>
                {roverState.battery}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Joystick */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-center">
          <VirtualJoystick
            onMove={handleJoystickMove}
            disabled={!roverState.connected || isEmergencyStop}
          />
        </div>
      </div>

      {/* Speed Control */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Speed Control</h3>
          <span className="ml-auto text-sm font-medium text-primary">
            {roverState.speed}%
          </span>
        </div>

        <Slider
          value={[roverState.speed]}
          onValueChange={handleSpeedChange}
          max={100}
          step={10}
          disabled={!roverState.connected}
          className="mb-2"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Slow</span>
          <span>Fast</span>
        </div>
      </div>

      {/* Emergency Stop */}
      <Button
        variant="destructive"
        size="lg"
        className={cn(
          'w-full h-16 text-lg font-bold transition-all',
          isEmergencyStop && 'animate-pulse'
        )}
        onClick={handleEmergencyStop}
        disabled={!roverState.connected}
      >
        <StopCircle className="w-6 h-6 mr-2" />
        {isEmergencyStop ? 'STOPPED' : 'EMERGENCY STOP'}
      </Button>

      {/* Position Display */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <CircleDot className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">Movement Vector</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Forward/Back</p>
            <p className="text-lg font-mono font-bold text-foreground">
              {joystickPosition.y.toFixed(2)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Left/Right</p>
            <p className="text-lg font-mono font-bold text-foreground">
              {joystickPosition.x.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

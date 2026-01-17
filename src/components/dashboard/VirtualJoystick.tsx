import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface JoystickPosition {
  x: number;
  y: number;
}

interface VirtualJoystickProps {
  onMove: (position: JoystickPosition) => void;
  disabled?: boolean;
}

export function VirtualJoystick({ onMove, disabled = false }: VirtualJoystickProps) {
  const [position, setPosition] = useState<JoystickPosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  const maxDistance = 56; // Max distance knob can move from center

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current || disabled) return;

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    // Calculate distance from center
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Limit to max distance
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }

    // Normalize to -1 to 1 range
    const normalizedX = deltaX / maxDistance;
    const normalizedY = -deltaY / maxDistance; // Invert Y for intuitive control

    setPosition({ x: deltaX, y: deltaY });
    onMove({ x: normalizedX, y: normalizedY });
  }, [disabled, onMove]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    handleMove(clientX, clientY);
  }, [disabled, handleMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  }, [onMove]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={baseRef}
        className={cn(
          'joystick-base flex items-center justify-center',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Direction indicators */}
        <div className="absolute inset-4 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium">
            FWD
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-medium">
            REV
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
            L
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
            R
          </div>
        </div>

        {/* Cross lines */}
        <div className="absolute inset-8 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        </div>

        {/* Joystick knob */}
        <div
          ref={knobRef}
          className={cn(
            'joystick-knob',
            isDragging && 'scale-110'
          )}
          style={{
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
            left: '50%',
            top: '50%',
          }}
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          X: {(position.x / maxDistance).toFixed(2)} | Y: {(-position.y / maxDistance).toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {isDragging ? 'Controlling...' : 'Touch or drag to control'}
        </p>
      </div>
    </div>
  );
}

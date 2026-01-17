import { CropType } from '@/types/sensor';
import { cropPresets } from '@/data/cropPresets';
import { cn } from '@/lib/utils';
import { Wheat, Carrot, Flower2, Check } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface CropSelectorProps {
  selectedCrop: CropType;
  onSelectCrop: (crop: CropType) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Wheat,
  Carrot,
  Flower2,
};

export function CropSelector({ selectedCrop, onSelectCrop }: CropSelectorProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-foreground">Crop Type</h3>
          <p className="text-xs text-muted-foreground">
            Optimal ranges adjust based on selected crop
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {cropPresets.map((crop) => {
          const Icon = iconMap[crop.icon] || Wheat;
          const isSelected = selectedCrop === crop.id;

          return (
            <button
              key={crop.id}
              onClick={() => onSelectCrop(crop.id)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
                'hover:bg-secondary/50',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-secondary/30'
              )}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div className={cn(
                'p-2 rounded-lg transition-colors',
                isSelected ? 'bg-primary/10' : 'bg-muted'
              )}>
                <Icon className={cn(
                  'w-5 h-5',
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>
              
              <div className="text-center">
                <p className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                  {crop.name}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {crop.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

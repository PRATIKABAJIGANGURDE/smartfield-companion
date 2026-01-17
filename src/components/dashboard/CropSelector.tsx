import { CropType } from '@/types/sensor';
import { cropPresets, getCropPreset } from '@/data/cropPresets';
import { cn } from '@/lib/utils';
import { Wheat, Carrot, Flower2, Check, ChevronDown } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const currentCrop = getCropPreset(selectedCrop);
  const CurrentIcon = iconMap[currentCrop.icon] || Wheat;

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

      {/* Mobile: Dropdown */}
      <div className="block sm:hidden">
        <Select value={selectedCrop} onValueChange={(value) => onSelectCrop(value as CropType)}>
          <SelectTrigger className="w-full h-14 bg-secondary/50">
            <SelectValue>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CurrentIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{currentCrop.name}</p>
                  <p className="text-xs text-muted-foreground">{currentCrop.description}</p>
                </div>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-card border-border z-50">
            {cropPresets.map((crop) => {
              const Icon = iconMap[crop.icon] || Wheat;
              return (
                <SelectItem 
                  key={crop.id} 
                  value={crop.id}
                  className="py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-muted">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{crop.name}</p>
                      <p className="text-xs text-muted-foreground">{crop.description}</p>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Grid of options */}
      <div className="hidden sm:grid grid-cols-3 lg:grid-cols-5 gap-2">
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
                <p className="text-xs text-muted-foreground">
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

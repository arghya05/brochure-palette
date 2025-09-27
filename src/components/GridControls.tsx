import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Grid3X3, Settings } from 'lucide-react';

interface GridControlsProps {
  showGrid: boolean;
  onToggleGrid: (show: boolean) => void;
  snapToGrid: boolean;
  onToggleSnap: (snap: boolean) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}

export const GridControls: React.FC<GridControlsProps> = ({
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  gridSize,
  onGridSizeChange
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={showGrid ? 'default' : 'tool'}
        size="tool"
        onClick={() => onToggleGrid(!showGrid)}
        title="Toggle Grid (G)"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="tool" size="tool" title="Grid Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="snap-to-grid">Snap to Grid</Label>
              <Switch
                id="snap-to-grid"
                checked={snapToGrid}
                onCheckedChange={onToggleSnap}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Grid Size: {gridSize}px</Label>
              <Slider
                value={[gridSize]}
                onValueChange={(value) => onGridSizeChange(value[0])}
                min={10}
                max={50}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Share2,
  Play,
  Sparkles,
  Palette,
} from 'lucide-react';
import { Navigation } from './Navigation';

interface CanvaTopbarProps {
  selectedConfig?: string;
  selectedSku?: string;
  configName?: string;
}

export const CanvaTopbar: React.FC<CanvaTopbarProps> = ({
  selectedConfig,
  selectedSku,
  configName,
}) => {
  return (
    <header className="h-12 bg-background border-b border-border flex items-center justify-between px-4 shadow-soft">
      {/* Left Section - Logo & Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Palette className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Brochure Designer</span>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Navigation />
      </div>

      {/* Center Section - Canvas Tools */}
      <div className="flex items-center gap-1">
        <Button variant="tool" size="tool" title="Undo">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="tool" size="tool" title="Redo">
          <Redo2 className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        <Button variant="tool" size="tool" title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground px-2 min-w-[60px] text-center">
          100%
        </span>
        <Button variant="tool" size="tool" title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        <Button variant="tool" size="tool" title="Reset View">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section - Status */}
      <div className="flex items-center gap-2">
        {selectedConfig && (
          <Badge variant="secondary" className="text-xs">
            {configName || selectedConfig}
          </Badge>
        )}
        {selectedSku && (
          <Badge variant="outline" className="text-xs">
            SKU: {selectedSku}
          </Badge>
        )}
      </div>
    </header>
  );
};
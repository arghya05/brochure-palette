import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Move, 
  Square, 
  Circle, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  MousePointer,
  Pencil,
  Undo,
  Redo
} from 'lucide-react';
import type { CanvasToolType } from '@/hooks/useCanvasTools';

interface ToolPanelProps {
  activeTool: CanvasToolType;
  onToolChange: (tool: CanvasToolType) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  selectedComponent: string | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  activeTool,
  onToolChange,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  selectedComponent,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const tools = [
    { id: 'select' as CanvasToolType, icon: MousePointer, label: 'Select', shortcut: 'V' },
    { id: 'draw' as CanvasToolType, icon: Pencil, label: 'Draw', shortcut: 'P' },
    { id: 'rectangle' as CanvasToolType, icon: Square, label: 'Rectangle', shortcut: 'R' },
    { id: 'circle' as CanvasToolType, icon: Circle, label: 'Circle', shortcut: 'C' },
    { id: 'text' as CanvasToolType, icon: Type, label: 'Text', shortcut: 'T' },
  ];

  return (
    <div className="h-12 bg-panel-bg border-b border-panel-border flex items-center justify-between px-4">
      {/* Left Section - Tools */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <Button
              key={tool.id}
              variant={isActive ? 'default' : 'tool'}
              size="tool"
              onClick={() => onToolChange(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className={isActive ? 'bg-primary text-primary-foreground' : ''}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {/* Center Section - Selection Info */}
      <div className="flex items-center gap-2">
        {selectedComponent && (
          <Badge variant="secondary" className="text-xs">
            {selectedComponent.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Selected
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          Tool: {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
        </Badge>
      </div>

      {/* Right Section - History & Zoom Controls */}
      <div className="flex items-center gap-1">
        {/* History Controls */}
        <Button
          variant="tool"
          size="tool"
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="tool"
          size="tool"
          onClick={onRedo}
          title="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        {/* Zoom Controls */}
        <Button
          variant="tool"
          size="tool"
          onClick={onZoomOut}
          title="Zoom Out (-)"
          disabled={zoom <= 25}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="tool"
          size="tool"
          onClick={onFitToScreen}
          title="Fit to Screen (0)"
          className="min-w-[60px] text-xs"
        >
          {zoom}%
        </Button>
        
        <Button
          variant="tool"
          size="tool"
          onClick={onZoomIn}
          title="Zoom In (+)"
          disabled={zoom >= 200}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="tool"
          size="tool"
          onClick={onFitToScreen}
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Layers, 
  MoveUp, 
  MoveDown, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Group,
  Ungroup,
  FlipHorizontal
} from 'lucide-react';

interface AdvancedToolbarProps {
  selectedComponent: string | null;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onGroupComponents: () => void;
  onUngroupComponents: () => void;
  onFlipHorizontal: () => void;
  isComponentVisible: boolean;
  isComponentLocked: boolean;
}

export const AdvancedToolbar: React.FC<AdvancedToolbarProps> = ({
  selectedComponent,
  onBringToFront,
  onSendToBack,
  onToggleVisibility,
  onToggleLock,
  onGroupComponents,
  onUngroupComponents,
  onFlipHorizontal,
  isComponentVisible,
  isComponentLocked
}) => {
  const isDisabled = !selectedComponent;

  return (
    <div className="bg-panel-bg border-b border-panel-border p-2">
      <div className="flex items-center gap-1">
        {/* Layer Controls */}
        <Button
          variant="tool"
          size="tool"
          onClick={onBringToFront}
          disabled={isDisabled}
          title="Bring to Front"
        >
          <MoveUp className="h-4 w-4" />
        </Button>
        
        <Button
          variant="tool"
          size="tool"
          onClick={onSendToBack}
          disabled={isDisabled}
          title="Send to Back"
        >
          <MoveDown className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Visibility & Lock */}
        <Button
          variant="tool"
          size="tool"
          onClick={onToggleVisibility}
          disabled={isDisabled}
          title={isComponentVisible ? "Hide" : "Show"}
        >
          {isComponentVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="tool"
          size="tool"
          onClick={onToggleLock}
          disabled={isDisabled}
          title={isComponentLocked ? "Unlock" : "Lock"}
        >
          {isComponentLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Group Controls */}
        <Button
          variant="tool"
          size="tool"
          onClick={onGroupComponents}
          disabled={isDisabled}
          title="Group (Ctrl+G)"
        >
          <Group className="h-4 w-4" />
        </Button>
        
        <Button
          variant="tool"
          size="tool"
          onClick={onUngroupComponents}
          disabled={isDisabled}
          title="Ungroup (Ctrl+Shift+G)"
        >
          <Ungroup className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Transform */}
        <Button
          variant="tool"
          size="tool"
          onClick={onFlipHorizontal}
          disabled={isDisabled}
          title="Flip Horizontal"
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Layer Panel Indicator */}
        <Button
          variant="tool"
          size="tool"
          title="Layer Panel"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
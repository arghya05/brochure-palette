import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Move3D,
  Copy,
  RotateCw
} from 'lucide-react';
import type { BrochureComponents } from '@/types/api';

interface AlignmentPanelProps {
  selectedComponent: string | null;
  components: BrochureComponents | null;
  onAlignComponent: (alignment: string) => void;
  onCenterComponent: () => void;
  onCopyComponent: () => void;
  onPasteComponent: () => void;
  canPaste: boolean;
}

export const AlignmentPanel: React.FC<AlignmentPanelProps> = ({
  selectedComponent,
  components,
  onAlignComponent,
  onCenterComponent,
  onCopyComponent,
  onPasteComponent,
  canPaste
}) => {
  if (!selectedComponent) return null;

  const alignmentTools = [
    { id: 'left', icon: AlignLeft, label: 'Align Left', shortcut: 'Ctrl+L' },
    { id: 'center-h', icon: AlignCenter, label: 'Center Horizontally', shortcut: 'Ctrl+H' },
    { id: 'right', icon: AlignRight, label: 'Align Right', shortcut: 'Ctrl+R' },
    { id: 'top', icon: AlignStartVertical, label: 'Align Top', shortcut: 'Ctrl+T' },
    { id: 'center-v', icon: AlignCenterVertical, label: 'Center Vertically', shortcut: 'Ctrl+M' },
    { id: 'bottom', icon: AlignEndVertical, label: 'Align Bottom', shortcut: 'Ctrl+B' },
  ];

  return (
    <div className="bg-panel-bg border-b border-panel-border p-2">
      <div className="flex items-center gap-1">
        {/* Alignment Tools */}
        <div className="flex items-center gap-1">
          {alignmentTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Button
                key={tool.id}
                variant="tool"
                size="tool"
                onClick={() => onAlignComponent(tool.id)}
                title={`${tool.label} (${tool.shortcut})`}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Center in Canvas */}
        <Button
          variant="tool"
          size="tool"
          onClick={onCenterComponent}
          title="Center in Canvas (Ctrl+E)"
        >
          <Move3D className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Copy/Paste */}
        <Button
          variant="tool"
          size="tool"
          onClick={onCopyComponent}
          title="Copy (Ctrl+C)"
        >
          <Copy className="h-4 w-4" />
        </Button>
        
        <Button
          variant="tool"
          size="tool"
          onClick={onPasteComponent}
          disabled={!canPaste}
          title="Paste (Ctrl+V)"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
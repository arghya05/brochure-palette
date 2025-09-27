import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Keyboard } from 'lucide-react';

export const KeyboardShortcuts: React.FC = () => {
  const shortcuts = [
    {
      category: 'Tools',
      shortcuts: [
        { keys: ['V'], description: 'Select Tool' },
        { keys: ['P'], description: 'Draw Tool' },
        { keys: ['R'], description: 'Rectangle Tool' },
        { keys: ['C'], description: 'Circle Tool' },
        { keys: ['T'], description: 'Text Tool' },
        { keys: ['G'], description: 'Toggle Grid' },
      ]
    },
    {
      category: 'View',
      shortcuts: [
        { keys: ['+'], description: 'Zoom In' },
        { keys: ['-'], description: 'Zoom Out' },
        { keys: ['0'], description: 'Fit to Screen' },
      ]
    },
    {
      category: 'Edit',
      shortcuts: [
        { keys: ['Ctrl', 'Z'], description: 'Undo' },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
        { keys: ['Ctrl', 'C'], description: 'Copy' },
        { keys: ['Ctrl', 'V'], description: 'Paste' },
        { keys: ['Delete'], description: 'Delete Selected' },
        { keys: ['Escape'], description: 'Deselect' },
      ]
    },
    {
      category: 'Alignment',
      shortcuts: [
        { keys: ['Ctrl', 'L'], description: 'Align Left' },
        { keys: ['Ctrl', 'H'], description: 'Center Horizontally' },
        { keys: ['Ctrl', 'R'], description: 'Align Right' },
        { keys: ['Ctrl', 'T'], description: 'Align Top' },
        { keys: ['Ctrl', 'M'], description: 'Center Vertically' },
        { keys: ['Ctrl', 'B'], description: 'Align Bottom' },
        { keys: ['Ctrl', 'E'], description: 'Center in Canvas' },
      ]
    },
    {
      category: 'Grouping',
      shortcuts: [
        { keys: ['Ctrl', 'G'], description: 'Group' },
        { keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup' },
      ]
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="tool" size="tool" title="Keyboard Shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="font-semibold mb-3 text-accent">{category.category}</h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            {key}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-sm">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {category.category !== shortcuts[shortcuts.length - 1].category && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
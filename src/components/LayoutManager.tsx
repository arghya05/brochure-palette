import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  Trash2,
  Calendar,
  Settings
} from 'lucide-react';
import { useLayoutManager } from '@/hooks/useLayoutManager';
import type { ComponentProperties } from '@/hooks/useCanvasTools';

interface LayoutManagerProps {
  componentPositions: Record<string, [number, number]>;
  componentSizes: Record<string, [number, number]>;
  componentProperties: Record<string, ComponentProperties>;
  onLoadLayout: (data: { 
    componentPositions: Record<string, [number, number]>;
    componentSizes: Record<string, [number, number]>;
    componentProperties: Record<string, ComponentProperties>;
  }) => void;
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({
  componentPositions,
  componentSizes,
  componentProperties,
  onLoadLayout
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [configName, setConfigName] = useState('');
  const { saveLayout, loadLayout, getSavedLayouts, deleteLayout, exportLayout, importLayout, makeAsConfig } = useLayoutManager();

  const handleSave = () => {
    if (layoutName.trim()) {
      saveLayout(layoutName.trim(), componentPositions, componentSizes, componentProperties);
      setLayoutName('');
      setSaveDialogOpen(false);
    }
  };

  const handleLoad = (name: string) => {
    const data = loadLayout(name);
    if (data) {
      onLoadLayout(data);
      setLoadDialogOpen(false);
    }
  };

  const handleExport = () => {
    const name = layoutName.trim() || `Layout_${Date.now()}`;
    exportLayout(name, componentPositions, componentSizes, componentProperties);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importLayout(file).then(layout => {
        if (layout) {
          onLoadLayout({
            componentPositions: layout.componentPositions,
            componentSizes: layout.componentSizes,
            componentProperties: layout.componentProperties
          });
        }
      });
    }
    event.target.value = '';
  };

  const handleMakeAsConfig = () => {
    if (configName.trim()) {
      makeAsConfig(configName.trim(), componentPositions, componentSizes, componentProperties);
      setConfigName('');
      setConfigDialogOpen(false);
    }
  };

  const savedLayouts = getSavedLayouts();

  return (
    <div className="flex items-center gap-1">
      {/* Save Layout */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="tool" size="tool" title="Save Layout">
            <Save className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Layout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter layout name..."
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!layoutName.trim()}>
                Save Layout
              </Button>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Layout */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="tool" size="tool" title="Load Layout">
            <FolderOpen className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Load Layout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {savedLayouts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No saved layouts</p>
            ) : (
              savedLayouts.map((layout: any) => (
                <Card key={layout.name} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{layout.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(layout.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleLoad(layout.name)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteLayout(layout.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Make as Config */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="tool" size="tool" title="Make as Config">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make as Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter configuration name..."
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMakeAsConfig()}
            />
            <div className="flex gap-2">
              <Button onClick={handleMakeAsConfig} disabled={!configName.trim()}>
                Create Config
              </Button>
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Export Layout */}
      <Button
        variant="tool"
        size="tool"
        onClick={handleExport}
        title="Export Layout"
      >
        <Download className="h-4 w-4" />
      </Button>

      {/* Import Layout */}
      <Button
        variant="tool"
        size="tool"
        title="Import Layout"
        onClick={() => document.getElementById('layout-import')?.click()}
      >
        <Upload className="h-4 w-4" />
      </Button>
      <input
        id="layout-import"
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
};
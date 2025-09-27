import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy, Eye, EyeOff, RotateCw, Palette } from 'lucide-react';
import type { ComponentProperties } from '@/hooks/useCanvasTools';

interface PropertyPanelProps {
  selectedComponent: string | null;
  componentProperties: Record<string, ComponentProperties>;
  onUpdateProperty: (componentName: string, property: string, value: any) => void;
  onUpdateTextProperty: (componentName: string, property: string, value: any) => void;
  onDeleteComponent: (componentName: string) => void;
  onDuplicateComponent: (componentName: string) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedComponent,
  componentProperties,
  onUpdateProperty,
  onUpdateTextProperty,
  onDeleteComponent,
  onDuplicateComponent,
}) => {
  if (!selectedComponent) {
    return (
      <Card className="w-80 h-full border-l border-panel-border bg-panel-bg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">Properties Panel</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-sm text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
              <Palette className="h-6 w-6" />
            </div>
            Select a component to edit its properties
          </div>
        </CardContent>
      </Card>
    );
  }

  const properties = componentProperties[selectedComponent];
  if (!properties) return null;

  const isTextComponent = ['arabic_text', 'english_text'].includes(selectedComponent);
  const componentDisplayName = selectedComponent.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Card className="w-80 h-full border-l border-panel-border bg-panel-bg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{componentDisplayName}</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Properties
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicateComponent(selectedComponent)}
            className="flex-1"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteComponent(selectedComponent)}
            className="flex-1 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>

        <Separator />

        {/* Visibility */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-2">
            {properties.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            Visibility
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={properties.visible}
              onCheckedChange={(checked) => onUpdateProperty(selectedComponent, 'visible', checked)}
            />
            <span className="text-xs text-muted-foreground">
              {properties.visible ? 'Visible' : 'Hidden'}
            </span>
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Opacity</Label>
            <span className="text-xs text-muted-foreground">
              {Math.round(properties.opacity * 100)}%
            </span>
          </div>
          <Slider
            value={[properties.opacity * 100]}
            onValueChange={([value]) => onUpdateProperty(selectedComponent, 'opacity', value / 100)}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Rotation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium flex items-center gap-2">
              <RotateCw className="h-3 w-3" />
              Rotation
            </Label>
            <span className="text-xs text-muted-foreground">
              {properties.rotation}°
            </span>
          </div>
          <Slider
            value={[properties.rotation]}
            onValueChange={([value]) => onUpdateProperty(selectedComponent, 'rotation', value)}
            min={0}
            max={360}
            step={1}
            className="w-full"
          />
        </div>

        {/* Text Properties (only for text components) */}
        {isTextComponent && properties.textProperties && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label className="text-xs font-medium text-accent">Text Properties</Label>
              
              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Font Size</Label>
                  <span className="text-xs text-muted-foreground">
                    {properties.textProperties.fontSize}px
                  </span>
                </div>
                <Slider
                  value={[properties.textProperties.fontSize]}
                  onValueChange={([value]) => onUpdateTextProperty(selectedComponent, 'fontSize', value)}
                  min={8}
                  max={72}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Max Width */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Max Width</Label>
                  <span className="text-xs text-muted-foreground">
                    {properties.textProperties.maxWidth} chars
                  </span>
                </div>
                <Slider
                  value={[properties.textProperties.maxWidth]}
                  onValueChange={([value]) => onUpdateTextProperty(selectedComponent, 'maxWidth', value)}
                  min={5}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Text Color */}
              <div className="space-y-2">
                <Label className="text-xs">Text Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={properties.textProperties.color}
                    onChange={(e) => onUpdateTextProperty(selectedComponent, 'color', e.target.value)}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    value={properties.textProperties.color}
                    onChange={(e) => onUpdateTextProperty(selectedComponent, 'color', e.target.value)}
                    className="flex-1 text-xs"
                    placeholder="#231f20"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Component Info */}
        <Separator />
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Component Info</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Type: {componentDisplayName}</div>
            <div>Opacity: {Math.round(properties.opacity * 100)}%</div>
            <div>Rotation: {properties.rotation}°</div>
            <div>Status: {properties.visible ? 'Visible' : 'Hidden'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
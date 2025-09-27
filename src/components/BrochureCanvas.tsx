import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw, Move, Square, Circle, Type, Image as ImageIcon } from 'lucide-react';
import type { BrochureComponents, BrochureConfig } from '@/types/api';

interface BrochureCanvasProps {
  components: BrochureComponents | null;
  config: BrochureConfig | undefined;
}

export const BrochureCanvas: React.FC<BrochureCanvasProps> = ({ components, config }) => {
  if (!components || !config) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-muted/20 to-muted/40">
        <Card className="p-12 text-center shadow-panel border-panel-border bg-panel-bg">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">Canvas Ready</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Select a configuration and SKU from the sidebar, then click "Load Components" to start designing.
          </p>
          <Badge variant="secondary" className="text-xs">
            Professional Design Mode
          </Badge>
        </Card>
      </div>
    );
  }

  const canvasWidth = components.brochure_dimensions[0];
  const canvasHeight = components.brochure_dimensions[1];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Canvas Toolbar */}
      <div className="h-12 bg-panel-bg border-b border-panel-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {canvasWidth} × {canvasHeight}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {config.name}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="tool" size="tool" title="Select">
            <Move className="h-4 w-4" />
          </Button>
          <Button variant="tool" size="tool" title="Rectangle">
            <Square className="h-4 w-4" />
          </Button>
          <Button variant="tool" size="tool" title="Circle">
            <Circle className="h-4 w-4" />
          </Button>
          <Button variant="tool" size="tool" title="Text">
            <Type className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="tool" size="tool" title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2 min-w-[50px] text-center">
            100%
          </span>
          <Button variant="tool" size="tool" title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="tool" size="tool" title="Fit to Screen">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-muted/10 to-muted/30 overflow-auto">
        {/* Canvas Container */}
        <div className="relative">
          {/* Canvas Shadow/Frame */}
          <div 
            className="relative bg-canvas-bg border border-canvas-border shadow-strong rounded-lg overflow-hidden"
            style={{ 
              width: canvasWidth, 
              height: canvasHeight 
            }}
          >
            {/* Background */}
            {components.background && (
              <div
                className="absolute"
                style={{
                  left: components.background.position[0],
                  top: components.background.position[1],
                  width: components.background.size[0],
                  height: components.background.size[1],
                }}
              >
                <img
                  src={`data:image/${components.background.format};base64,${components.background.image_base64}`}
                  alt="Background"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Product Image */}
            {components.product_image && (
              <div
                className="absolute border-2 border-primary/20 hover:border-primary transition-all duration-200 cursor-move rounded group"
                style={{
                  left: components.product_image.position[0],
                  top: components.product_image.position[1],
                  width: components.product_image.size[0],
                  height: components.product_image.size[1],
                }}
              >
                <img
                  src={`data:image/${components.product_image.format};base64,${components.product_image.image_base64}`}
                  alt="Product"
                  className="w-full h-full object-cover rounded"
                />
                {/* Selection Handles */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Arabic Text */}
            {components.arabic_text && (
              <div
                className="absolute border-2 border-accent/20 hover:border-accent transition-all duration-200 cursor-move rounded group"
                style={{
                  left: components.arabic_text.position[0],
                  top: components.arabic_text.position[1],
                  width: components.arabic_text.size[0],
                  height: components.arabic_text.size[1],
                }}
              >
                <img
                  src={`data:image/${components.arabic_text.format};base64,${components.arabic_text.image_base64}`}
                  alt="Arabic Text"
                  className="w-full h-full object-cover"
                />
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* English Text */}
            {components.english_text && (
              <div
                className="absolute border-2 border-accent/20 hover:border-accent transition-all duration-200 cursor-move rounded group"
                style={{
                  left: components.english_text.position[0],
                  top: components.english_text.position[1],
                  width: components.english_text.size[0],
                  height: components.english_text.size[1],
                }}
              >
                <img
                  src={`data:image/${components.english_text.format};base64,${components.english_text.image_base64}`}
                  alt="English Text"
                  className="w-full h-full object-cover"
                />
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Price Tag */}
            {components.price_tag && (
              <div
                className="absolute border-2 border-success/20 hover:border-success transition-all duration-200 cursor-move rounded-full group"
                style={{
                  left: components.price_tag.position[0],
                  top: components.price_tag.position[1],
                  width: components.price_tag.size[0],
                  height: components.price_tag.size[1],
                }}
              >
                <img
                  src={`data:image/${components.price_tag.format};base64,${components.price_tag.image_base64}`}
                  alt="Price Tag"
                  className="w-full h-full object-cover rounded-full"
                />
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-success border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}

            {/* Icon */}
            {components.icon && (
              <div
                className="absolute border-2 border-secondary/40 hover:border-secondary transition-all duration-200 cursor-move rounded-full group"
                style={{
                  left: components.icon.position[0],
                  top: components.icon.position[1],
                  width: components.icon.size[0],
                  height: components.icon.size[1],
                }}
              >
                <img
                  src={`data:image/${components.icon.format};base64,${components.icon.image_base64}`}
                  alt="Icon"
                  className="w-full h-full object-cover rounded-full"
                />
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-secondary border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          {/* Canvas Info */}
          <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
              Brochure Canvas • {canvasWidth}×{canvasHeight}px
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
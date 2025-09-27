import React from 'react';
import { Card } from '@/components/ui/card';
import type { BrochureComponents, BrochureConfig } from '@/types/api';

interface BrochureCanvasProps {
  components: BrochureComponents | null;
  config: BrochureConfig | undefined;
}

export const BrochureCanvas: React.FC<BrochureCanvasProps> = ({ components, config }) => {
  if (!components || !config) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="p-12 text-center shadow-medium">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold mb-2">No Components Loaded</h3>
          <p className="text-muted-foreground">
            Select a configuration and SKU, then click "Load Components" to start designing.
          </p>
        </Card>
      </div>
    );
  }

  const canvasWidth = components.brochure_dimensions[0];
  const canvasHeight = components.brochure_dimensions[1];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="shadow-strong border-2 border-canvas-border">
        <div 
          className="relative bg-canvas-bg"
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
              className="absolute border-2 border-component-border/20 hover:border-component-border transition-smooth cursor-move"
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
            </div>
          )}

          {/* Arabic Text */}
          {components.arabic_text && (
            <div
              className="absolute border-2 border-component-border/20 hover:border-component-border transition-smooth cursor-move"
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
            </div>
          )}

          {/* English Text */}
          {components.english_text && (
            <div
              className="absolute border-2 border-component-border/20 hover:border-component-border transition-smooth cursor-move"
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
            </div>
          )}

          {/* Price Tag */}
          {components.price_tag && (
            <div
              className="absolute border-2 border-component-border/20 hover:border-component-border transition-smooth cursor-move"
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
            </div>
          )}

          {/* Icon */}
          {components.icon && (
            <div
              className="absolute border-2 border-component-border/20 hover:border-component-border transition-smooth cursor-move"
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
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Sparkles, Image as ImageIcon, Grid3X3, Loader2 } from 'lucide-react';
import type { BrochureData, ImageGenerationRequest } from '@/types/api';

interface ImageGenerationCanvasProps {
  generatedImage: string | null;
  imageSettings: Omit<ImageGenerationRequest, 'brochure_data'>;
  selectedProducts: BrochureData[];
  generationType: 'single' | 'combined';
  generating: boolean;
}

export const ImageGenerationCanvas: React.FC<ImageGenerationCanvasProps> = ({
  generatedImage,
  imageSettings,
  selectedProducts,
  generationType,
  generating,
}) => {
  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `ai-generated-${generationType}-${Date.now()}.jpg`;
      link.click();
    }
  };

  const getImageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'flyer': 'Flyer',
      'poster': 'Poster', 
      'banner': 'Banner',
      'social_media': 'Social Media',
    };
    return labels[type] || type;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {generationType === 'single' ? (
                <ImageIcon className="h-5 w-5 text-primary" />
              ) : (
                <Grid3X3 className="h-5 w-5 text-primary" />
              )}
              <h2 className="font-semibold">
                {generationType === 'single' ? 'Single Product Image' : 'Combined Products Image'}
              </h2>
            </div>
            {selectedProducts.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
              </Badge>
            )}
          </div>
          
          {generatedImage && (
            <Button variant="success" onClick={downloadImage}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>

        {/* Settings Summary */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            {getImageTypeLabel(imageSettings.image_type)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {imageSettings.dimensions.width} × {imageSettings.dimensions.height}
          </Badge>
          {imageSettings.brand_colors && imageSettings.brand_colors.length > 0 && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <div className="flex gap-0.5">
                {imageSettings.brand_colors.slice(0, 3).map((color, index) => (
                  <div 
                    key={index}
                    className="w-2 h-2 rounded-full border" 
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {imageSettings.brand_colors.length} color{imageSettings.brand_colors.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-6">
        <Card className="h-full flex items-center justify-center">
          {generating ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                  <Loader2 className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin text-primary-foreground" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Generating Your AI Image...</h3>
                <p className="text-muted-foreground mt-1">
                  This may take a few moments. Please wait while we create your {generationType} marketing material.
                </p>
              </div>
              <div className="w-64 mx-auto bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary-glow h-full rounded-full animate-pulse" />
              </div>
            </div>
          ) : generatedImage ? (
            <div className="max-w-4xl w-full">
              <div className="relative group">
                <img 
                  src={generatedImage} 
                  alt={`AI Generated ${generationType} Marketing Material`}
                  className="w-full rounded-lg shadow-elegant"
                  style={{ maxHeight: 'calc(100vh - 300px)', objectFit: 'contain' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                
                {/* Image Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{getImageTypeLabel(imageSettings.image_type)} - {generationType}</h4>
                      <p className="text-sm text-white/80 mt-1 line-clamp-2">
                        {imageSettings.style_prompt}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={downloadImage}
                      className="text-white hover:bg-white/20"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 max-w-md">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-xl mb-2">AI Image Generation Ready</h3>
                <p className="text-muted-foreground mb-4">
                  Select products, configure your style preferences, and generate stunning marketing materials with AI.
                </p>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Choose between single product or combined layouts</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Customize style prompts and brand colors</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>Generate professional marketing materials instantly</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              {selectedProducts.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Ready to Generate</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Products: {selectedProducts.length}</div>
                    <div>Type: {getImageTypeLabel(imageSettings.image_type)}</div>
                    <div>Size: {imageSettings.dimensions.width} × {imageSettings.dimensions.height}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
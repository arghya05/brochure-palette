import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Image, 
  Settings, 
  Palette,
  Grid3X3,
  Plus,
  X,
  Loader2,
  RefreshCw,
  Trash2,
  Download
} from 'lucide-react';
import type { BrochureData, ImageGenerationRequest } from '@/types/api';

interface ImageGenerationSidebarProps {
  productData: BrochureData[];
  selectedProducts: BrochureData[];
  generationType: 'single' | 'combined';
  imageSettings: Omit<ImageGenerationRequest, 'brochure_data'>;
  combinedSettings: {
    rows: number;
    cols: number;
    spacing: number;
  };
  loading: boolean;
  generating: boolean;
  onAddProduct: (product: BrochureData) => void;
  onRemoveProduct: (sku: string) => void;
  onClearProducts: () => void;
  onGenerationTypeChange: (type: 'single' | 'combined') => void;
  onImageSettingsChange: (settings: Omit<ImageGenerationRequest, 'brochure_data'>) => void;
  onCombinedSettingsChange: (settings: { rows: number; cols: number; spacing: number }) => void;
  onLoadProductData: () => void;
  onGenerateSingle: () => void;
  onGenerateCombined: () => void;
}

export const ImageGenerationSidebar: React.FC<ImageGenerationSidebarProps> = ({
  productData,
  selectedProducts,
  generationType,
  imageSettings,
  combinedSettings,
  loading,
  generating,
  onAddProduct,
  onRemoveProduct,
  onClearProducts,
  onGenerationTypeChange,
  onImageSettingsChange,
  onCombinedSettingsChange,
  onLoadProductData,
  onGenerateSingle,
  onGenerateCombined,
}) => {
  const [newBrandColor, setNewBrandColor] = useState('');

  const imageTypeOptions = [
    { value: 'flyer', label: 'Flyer', dimensions: { width: 1024, height: 1536 } },
    { value: 'poster', label: 'Poster', dimensions: { width: 768, height: 1024 } },
    { value: 'banner', label: 'Banner', dimensions: { width: 1536, height: 512 } },
    { value: 'social_media', label: 'Social Media', dimensions: { width: 1024, height: 1024 } },
  ];

  const handleImageTypeChange = (imageType: string) => {
    const option = imageTypeOptions.find(opt => opt.value === imageType);
    if (option) {
      onImageSettingsChange({
        ...imageSettings,
        image_type: imageType as any,
        dimensions: option.dimensions,
      });
    }
  };

  const addBrandColor = () => {
    if (newBrandColor && !imageSettings.brand_colors?.includes(newBrandColor)) {
      onImageSettingsChange({
        ...imageSettings,
        brand_colors: [...(imageSettings.brand_colors || []), newBrandColor]
      });
      setNewBrandColor('');
    }
  };

  const removeBrandColor = (color: string) => {
    onImageSettingsChange({
      ...imageSettings,
      brand_colors: imageSettings.brand_colors?.filter(c => c !== color) || []
    });
  };

  const maxProducts = generationType === 'combined' ? combinedSettings.rows * combinedSettings.cols : 1;
  const canGenerate = selectedProducts.length > 0 && imageSettings.style_prompt.trim();

  return (
    <Sidebar className="w-80 border-r border-border">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="p-4 space-y-6">
        {/* Generation Type Selector */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generation Mode
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Tabs value={generationType} onValueChange={(value) => onGenerationTypeChange(value as 'single' | 'combined')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single</TabsTrigger>
                <TabsTrigger value="combined">Combined</TabsTrigger>
              </TabsList>
            </Tabs>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Product Selection */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Products
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={onLoadProductData}
                disabled={loading}
                className="h-6 w-6 p-0"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              </Button>
              {selectedProducts.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClearProducts}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3">
            <div>
              <Label className="text-xs">Available Products ({productData.length})</Label>
              <Select onValueChange={(sku) => {
                const product = productData.find(p => p.sku === sku);
                if (product) onAddProduct(product);
              }}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Add products..." />
                </SelectTrigger>
                <SelectContent>
                  {productData.map(product => (
                    <SelectItem key={product.sku} value={product.sku}>
                      {product.sku} - {(product.english_description || '').slice(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProducts.length > 0 && (
              <div>
                <Label className="text-xs">
                  Selected ({selectedProducts.length}/{generationType === 'single' ? 1 : maxProducts})
                </Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProducts.slice(0, maxProducts).map(product => (
                    <Badge key={product.sku} variant="secondary" className="text-xs flex items-center gap-1">
                      {product.sku}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => onRemoveProduct(product.sku)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Combined Settings */}
        {generationType === 'combined' && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Grid Layout
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Rows</Label>
                  <Input
                    type="number"
                    min="1"
                    max="4"
                    value={combinedSettings.rows}
                    onChange={(e) => onCombinedSettingsChange({
                      ...combinedSettings,
                      rows: parseInt(e.target.value) || 1
                    })}
                    className="h-7"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cols</Label>
                  <Input
                    type="number"
                    min="1"
                    max="4"
                    value={combinedSettings.cols}
                    onChange={(e) => onCombinedSettingsChange({
                      ...combinedSettings,
                      cols: parseInt(e.target.value) || 1
                    })}
                    className="h-7"
                  />
                </div>
                <div>
                  <Label className="text-xs">Spacing</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={combinedSettings.spacing}
                    onChange={(e) => onCombinedSettingsChange({
                      ...combinedSettings,
                      spacing: parseInt(e.target.value) || 0
                    })}
                    className="h-7"
                  />
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Image Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Image Settings
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3">
            <div>
              <Label className="text-xs">Style Prompt *</Label>
              <Textarea
                placeholder="Modern minimalist design with vibrant colors..."
                value={imageSettings.style_prompt}
                onChange={(e) => onImageSettingsChange({ ...imageSettings, style_prompt: e.target.value })}
                className="h-16 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Image Type</Label>
              <Select value={imageSettings.image_type} onValueChange={handleImageTypeChange}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Width</Label>
                <Input
                  type="number"
                  min="512"
                  max="2048"
                  value={imageSettings.dimensions.width}
                  onChange={(e) => onImageSettingsChange({ 
                    ...imageSettings, 
                    dimensions: { ...imageSettings.dimensions, width: parseInt(e.target.value) || 1024 }
                  })}
                  className="h-7"
                />
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <Input
                  type="number"
                  min="512"
                  max="2048"
                  value={imageSettings.dimensions.height}
                  onChange={(e) => onImageSettingsChange({ 
                    ...imageSettings, 
                    dimensions: { ...imageSettings.dimensions, height: parseInt(e.target.value) || 1024 }
                  })}
                  className="h-7"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Additional Prompt</Label>
              <Textarea
                placeholder="Include logo, add contact info..."
                value={imageSettings.additional_prompt}
                onChange={(e) => onImageSettingsChange({ ...imageSettings, additional_prompt: e.target.value })}
                className="h-12 text-xs"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Brand Colors */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Brand Colors
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            <div className="flex gap-1">
              <Input
                placeholder="#FF5733"
                value={newBrandColor}
                onChange={(e) => setNewBrandColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addBrandColor()}
                className="h-7 text-xs"
              />
              <Button variant="outline" size="sm" onClick={addBrandColor} className="h-7 w-7 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {imageSettings.brand_colors && imageSettings.brand_colors.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {imageSettings.brand_colors.map(color => (
                  <Badge key={color} variant="outline" className="text-xs flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full border" 
                      style={{ backgroundColor: color }}
                    />
                    {color}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeBrandColor(color)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {/* Generate Button */}
        <Button 
          variant="gradient" 
          size="lg"
          onClick={generationType === 'single' ? onGenerateSingle : onGenerateCombined}
          disabled={generating || !canGenerate}
          className="w-full"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generate {generationType === 'single' ? 'Single' : 'Combined'} Image
        </Button>
      </SidebarContent>
    </Sidebar>
  );
};
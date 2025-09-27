import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Image, Download, Plus, X } from 'lucide-react';
import { apiService } from '@/services/api';
import type { BrochureData, ImageGenerationRequest } from '@/types/api';
import { Navigation } from './Navigation';

export const ImageGenerationAgent: React.FC = () => {
  const [productData, setProductData] = useState<BrochureData[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<BrochureData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<ImageGenerationRequest, 'brochure_data'>>({
    style_prompt: '',
    image_type: 'flyer',
    dimensions: { width: 1024, height: 1024 },
    additional_prompt: '',
    brand_colors: [],
  });

  const [newBrandColor, setNewBrandColor] = useState('');

  useEffect(() => {
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllData();
      setProductData(response.data);
    } catch (error) {
      console.error('Error loading product data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (product: BrochureData) => {
    if (!selectedProducts.find(p => p.sku === product.sku)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeProduct = (sku: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.sku !== sku));
  };

  const addBrandColor = () => {
    if (newBrandColor && !formData.brand_colors?.includes(newBrandColor)) {
      setFormData(prev => ({
        ...prev,
        brand_colors: [...(prev.brand_colors || []), newBrandColor]
      }));
      setNewBrandColor('');
    }
  };

  const removeBrandColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      brand_colors: prev.brand_colors?.filter(c => c !== color) || []
    }));
  };

  const generateImage = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: 'No Products Selected',
        description: 'Please select at least one product to generate an image',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.style_prompt.trim()) {
      toast({
        title: 'Missing Style Prompt',
        description: 'Please provide a style prompt for the image generation',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGenerating(true);
      const request: ImageGenerationRequest = {
        ...formData,
        brochure_data: selectedProducts,
      };

      const response = await apiService.generateImageWithAgent(request);
      
      if (response.success && response.image_url) {
        setGeneratedImage(response.image_url);
        toast({
          title: 'Success!',
          description: 'Image generated successfully',
          variant: 'default',
        });
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const imageTypeOptions = [
    { value: 'flyer', label: 'Flyer', dimensions: { width: 1024, height: 1536 } },
    { value: 'poster', label: 'Poster', dimensions: { width: 768, height: 1024 } },
    { value: 'banner', label: 'Banner', dimensions: { width: 1536, height: 512 } },
    { value: 'social_media', label: 'Social Media', dimensions: { width: 1024, height: 1024 } },
  ];

  const handleImageTypeChange = (imageType: string) => {
    const option = imageTypeOptions.find(opt => opt.value === imageType);
    if (option) {
      setFormData(prev => ({
        ...prev,
        image_type: imageType as any,
        dimensions: option.dimensions,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-accent shadow-soft border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
              <h1 className="text-2xl font-bold text-primary-foreground">AI Image Generation Agent</h1>
            </div>
            <Navigation />
          </div>
          <p className="text-primary-foreground/80 mt-1">
            Transform your brochure data into stunning marketing materials
          </p>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Product Selection */}
            <Card className="p-6 shadow-medium">
              <div className="flex items-center gap-2 mb-4">
                <Image className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Product Selection</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Available Products</Label>
                  <Select onValueChange={(sku) => {
                    const product = productData.find(p => p.sku === sku);
                    if (product) addProduct(product);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add products to generate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {productData.map(product => (
                        <SelectItem key={product.sku} value={product.sku}>
                          {product.sku} - {product.english_description.slice(0, 40)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedProducts.length > 0 && (
                  <div>
                    <Label>Selected Products ({selectedProducts.length})</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProducts.map(product => (
                        <Badge key={product.sku} variant="secondary" className="flex items-center gap-1">
                          {product.sku}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeProduct(product.sku)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Generation Settings */}
            <Card className="p-6 shadow-medium">
              <h3 className="font-semibold text-lg mb-4">Generation Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="style-prompt">Style Prompt *</Label>
                  <Textarea
                    id="style-prompt"
                    placeholder="Modern minimalist design with vibrant colors, professional layout..."
                    value={formData.style_prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, style_prompt: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="image-type">Image Type</Label>
                  <Select value={formData.image_type} onValueChange={handleImageTypeChange}>
                    <SelectTrigger id="image-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} ({option.dimensions.width}x{option.dimensions.height})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      min="512"
                      max="2048"
                      value={formData.dimensions.width}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, width: parseInt(e.target.value) || 1024 }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      min="512"
                      max="2048"
                      value={formData.dimensions.height}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, height: parseInt(e.target.value) || 1024 }
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="additional-prompt">Additional Prompt</Label>
                  <Textarea
                    id="additional-prompt"
                    placeholder="Include logo, add contact information, use specific fonts..."
                    value={formData.additional_prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, additional_prompt: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Brand Colors</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="#FF5733 or red"
                      value={newBrandColor}
                      onChange={(e) => setNewBrandColor(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addBrandColor()}
                    />
                    <Button variant="outline" size="sm" onClick={addBrandColor}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.brand_colors && formData.brand_colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.brand_colors.map(color => (
                        <Badge key={color} variant="outline" className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full border" 
                            style={{ backgroundColor: color }}
                          />
                          {color}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeBrandColor(color)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Generate Button */}
            <Button 
              variant="gradient" 
              size="xl"
              onClick={generateImage}
              disabled={generating || selectedProducts.length === 0 || !formData.style_prompt.trim()}
              className="w-full"
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              Generate AI Image
            </Button>
          </div>

          {/* Preview Panel */}
          <div>
            <Card className="p-6 shadow-medium h-full">
              <h3 className="font-semibold text-lg mb-4">Generated Image</h3>
              
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={generatedImage} 
                      alt="Generated marketing material"
                      className="w-full rounded-lg shadow-medium"
                    />
                  </div>
                  <Button variant="success" size="lg" className="w-full">
                    <Download className="h-5 w-5" />
                    Download Image
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🤖</div>
                    <h4 className="font-semibold mb-2">Ready to Generate</h4>
                    <p className="text-muted-foreground">
                      Select products, add a style prompt, and click generate to create your AI-powered marketing material.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Endpoint Schema for Image Generation Agent
export const ImageGenerationEndpointSchema = {
  endpoint: 'POST /generate-image-agent',
  description: 'Generate marketing images using AI based on brochure data',
  requestBody: {
    brochure_data: 'BrochureData[] - Array of product data to include',
    style_prompt: 'string - Style description for the generated image',
    image_type: '"flyer" | "poster" | "banner" | "social_media" - Type of marketing material',
    dimensions: '{ width: number, height: number } - Image dimensions in pixels',
    additional_prompt: 'string? - Additional instructions for generation',
    brand_colors: 'string[]? - Array of brand colors (hex codes or color names)',
  },
  response: {
    success: 'boolean - Whether generation was successful',
    image_url: 'string? - URL to the generated image (if successful)',
    error: 'string? - Error message (if failed)',
    generation_id: 'string - Unique identifier for this generation',
  },
  example: {
    request: {
      brochure_data: [
        {
          sku: 'SKU001',
          arabic_description: 'وصف المنتج',
          english_description: 'Product description',
          regular_price: '10.99',
          promo_price: '8.99',
          icon_name: 'product-icon'
        }
      ],
      style_prompt: 'Modern minimalist flyer with vibrant colors and clean typography',
      image_type: 'flyer',
      dimensions: { width: 1024, height: 1536 },
      additional_prompt: 'Include company logo in corner',
      brand_colors: ['#FF5733', '#3498DB']
    },
    response: {
      success: true,
      image_url: 'https://example.com/generated-image.jpg',
      generation_id: 'gen_12345678'
    }
  }
};
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { BrochureData, ImageGenerationRequest, ImageGenerationResponse } from '@/types/api';
import { ImageGenerationSidebar } from './ImageGenerationSidebar';
import { ImageGenerationCanvas } from './ImageGenerationCanvas';
import { CanvaTopbar } from './CanvaTopbar';

export const ImageGenerationLayout: React.FC = () => {
  const [productData, setProductData] = useState<BrochureData[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<BrochureData[]>([]);
  const [generationType, setGenerationType] = useState<'single' | 'combined'>('single');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Image generation settings
  const [imageSettings, setImageSettings] = useState<Omit<ImageGenerationRequest, 'brochure_data'>>({
    style_prompt: '',
    image_type: 'flyer',
    dimensions: { width: 1024, height: 1536 },
    additional_prompt: '',
    brand_colors: [],
  });

  // Combined generation settings
  const [combinedSettings, setCombinedSettings] = useState({
    rows: 2,
    cols: 2,
    spacing: 10,
  });

  useEffect(() => {
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      setLoading(true);
      console.log('Loading product data for image generation...');
      const response = await apiService.getAllData();
      console.log('Raw API response:', response);
      
      // Map raw data to BrochureData format (same logic as CanvaLayout)
      const mappedData: BrochureData[] = response.data.map((item: any) => ({
        sku: item['SKU']?.toString() || '',
        arabic_description: item['Items Description (Arabic)'] || '',
        english_description: item['Items Description (Englsih)'] || '',
        regular_price: item['Regular Retail Z1']?.toString() || '',
        promo_price: item['PROMO1 Retail Z1']?.toString() || '',
        icon_name: item['SELLA RICE ']?.toString() || ''
      }));
      
      console.log('Mapped product data for image generation:', mappedData);
      setProductData(mappedData);
      
      toast({
        title: 'Success',
        description: `Loaded ${mappedData.length} products successfully`,
        variant: 'default',
      });
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

  const clearProducts = () => {
    setSelectedProducts([]);
  };

  const generateSingleImage = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: 'No Product Selected',
        description: 'Please select a product to generate an image',
        variant: 'destructive',
      });
      return;
    }

    if (!imageSettings.style_prompt.trim()) {
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
        ...imageSettings,
        brochure_data: selectedProducts.slice(0, 1), // Only first product for single generation
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
      console.error('Error generating single image:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateCombinedImage = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: 'No Products Selected',
        description: 'Please select products to generate a combined image',
        variant: 'destructive',
      });
      return;
    }

    if (!imageSettings.style_prompt.trim()) {
      toast({
        title: 'Missing Style Prompt',
        description: 'Please provide a style prompt for the image generation',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGenerating(true);
      
      // Limit products based on grid size
      const maxProducts = combinedSettings.rows * combinedSettings.cols;
      const productsToUse = selectedProducts.slice(0, maxProducts);
      
      const request: ImageGenerationRequest = {
        ...imageSettings,
        brochure_data: productsToUse,
        additional_prompt: `${imageSettings.additional_prompt} Layout: ${combinedSettings.rows}x${combinedSettings.cols} grid with ${combinedSettings.spacing}px spacing between products`,
      };

      const response = await apiService.generateImageWithAgent(request);
      
      if (response.success && response.image_url) {
        setGeneratedImage(response.image_url);
        toast({
          title: 'Success!',
          description: `Combined image generated with ${productsToUse.length} products`,
          variant: 'default',
        });
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating combined image:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate combined image',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col bg-background">
        {/* Top Bar */}
        <CanvaTopbar 
          selectedConfig=""
          selectedSku={selectedProducts[0]?.sku || ''}
          configName="AI Image Generation"
        />

        {/* Main Layout */}
        <div className="flex flex-1 w-full">
          {/* Sidebar */}
          <ImageGenerationSidebar
            productData={productData}
            selectedProducts={selectedProducts}
            generationType={generationType}
            imageSettings={imageSettings}
            combinedSettings={combinedSettings}
            loading={loading}
            generating={generating}
            onAddProduct={addProduct}
            onRemoveProduct={removeProduct}
            onClearProducts={clearProducts}
            onGenerationTypeChange={setGenerationType}
            onImageSettingsChange={setImageSettings}
            onCombinedSettingsChange={setCombinedSettings}
            onLoadProductData={loadProductData}
            onGenerateSingle={generateSingleImage}
            onGenerateCombined={generateCombinedImage}
          />

          {/* Canvas Area */}
          <main className="flex-1 bg-muted/30 overflow-hidden">
            <ImageGenerationCanvas 
              generatedImage={generatedImage}
              imageSettings={imageSettings}
              selectedProducts={selectedProducts}
              generationType={generationType}
              generating={generating}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
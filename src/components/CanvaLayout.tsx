import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { toast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { BrochureConfig, BrochureData, BrochureComponents } from '@/types/api';
import { AppSidebar } from './AppSidebar';
import { CanvaTopbar } from './CanvaTopbar';
import { BrochureCanvas } from './BrochureCanvas';

export const CanvaLayout: React.FC = () => {
  const [configurations, setConfigurations] = useState<BrochureConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [productData, setProductData] = useState<BrochureData[]>([]);
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [components, setComponents] = useState<BrochureComponents | null>(null);
  const [modifiedComponents, setModifiedComponents] = useState<BrochureComponents | null>(null);
  const [componentProperties, setComponentProperties] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Combined brochure settings
  const [combinedSettings, setCombinedSettings] = useState({
    rows: 3,
    cols: 4,
    width: 400,
    height: 600,
    spacing: 2,
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadConfigurations(),
        loadProductData(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load initial data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConfigurations = async () => {
    try {
      const configs = await apiService.getConfigurations();
      setConfigurations(configs);
      if (configs.length > 0 && !selectedConfig) {
        setSelectedConfig(configs[0].id);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load configurations',
        variant: 'destructive',
      });
    }
  };

  const loadProductData = async () => {
    try {
      console.log('Loading product data...');
      const response = await apiService.getAllData();
      console.log('Raw API response:', response);
      
      // Map raw data to BrochureData format (like in script.js)
      const mappedData: BrochureData[] = response.data.map((item: any) => ({
        sku: item['SKU']?.toString() || '',
        arabic_description: item['Items Description (Arabic)'] || '',
        english_description: item['Items Description (Englsih)'] || '',
        regular_price: item['Regular Retail Z1']?.toString() || '',
        promo_price: item['PROMO1 Retail Z1']?.toString() || '',
        icon_name: item['SELLA RICE ']?.toString() || ''
      }));
      
      console.log('Mapped product data:', mappedData);
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
    }
  };

  const loadComponents = async () => {
    if (!selectedConfig || !selectedSku) {
      toast({
        title: 'Missing Selection',
        description: 'Please select both a configuration and SKU',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const selectedProduct = productData.find(p => p.sku === selectedSku);
      if (!selectedProduct) return;

      const componentsData = await apiService.extractComponents(selectedConfig, selectedProduct);
      setComponents(componentsData);
      setModifiedComponents(componentsData); // Initialize modified components
      
      toast({
        title: 'Success',
        description: 'Components loaded successfully!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error loading components:', error);
      toast({
        title: 'Error',
        description: 'Failed to load components',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Transform components to API layout format
  const transformComponentsToLayout = (components: BrochureComponents | null) => {
    if (!components) return undefined;
    
    const layout: Record<string, any> = {};
    
    Object.entries(components).forEach(([key, component]) => {
      if (key === 'brochure_dimensions') return; // Skip dimensions
      
      if (component && typeof component === 'object' && 'position' in component) {
        const props = componentProperties[key] || {};
        
        layout[key] = {
          x: component.position[0],
          y: component.position[1],
          width: component.size[0],
          height: component.size[1],
          opacity: props.opacity ?? 1,
          rotation: props.rotation ?? 0,
          visible: props.visible ?? true,
        };
        
        // Add text properties for text components using actual values
        if (key.includes('text') && props.textProperties) {
          layout[key].textProperties = {
            maxWidth: props.textProperties.maxWidth ?? 16,
            fontSize: props.textProperties.fontSize ?? 24,
            color: props.textProperties.color ?? "#231f20"
          };
        }
      }
    });
    
    return layout;
  };

  const generateSingleBrochure = async () => {
    if (!selectedConfig || !selectedSku) {
      toast({
        title: 'Missing Selection',
        description: 'Please select both a configuration and SKU',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGenerating(true);
      const selectedProduct = productData.find(p => p.sku === selectedSku);
      if (!selectedProduct) return;

      // Transform modified components to API layout format
      const componentsToUse = modifiedComponents || components;
      const layoutData = transformComponentsToLayout(componentsToUse);

      await apiService.generateBrochure({
        config_id: selectedConfig,
        data: [selectedProduct],
        output_format: 'png',
        return_components: false,
        layout: layoutData,
      });

      toast({
        title: 'Success',
        description: 'Brochure generated successfully!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating brochure:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate brochure',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateCombinedBrochure = async () => {
    if (!selectedConfig || productData.length === 0) {
      toast({
        title: 'Missing Data',
        description: 'Please select a configuration and ensure product data is loaded',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGenerating(true);
      
      // Transform modified components to API layout format
      const componentsToUse = modifiedComponents || components;
      const layoutData = transformComponentsToLayout(componentsToUse);
      
      await apiService.generateCombinedBrochure({
        config_id: selectedConfig,
        data: productData.slice(0, combinedSettings.rows * combinedSettings.cols),
        rows: combinedSettings.rows,
        cols: combinedSettings.cols,
        brochure_width: combinedSettings.width,
        brochure_height: combinedSettings.height,
        spacing: combinedSettings.spacing,
        output_format: 'png',
        layout: layoutData,
      });

      toast({
        title: 'Success',
        description: 'Combined brochure generated successfully!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating combined brochure:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate combined brochure',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const currentConfig = configurations.find(c => c.id === selectedConfig);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex flex-col bg-background">
        {/* Top Bar */}
        <CanvaTopbar 
          selectedConfig={selectedConfig}
          selectedSku={selectedSku}
          configName={currentConfig?.name}
        />

        {/* Main Layout */}
        <div className="flex flex-1 w-full">
          {/* Sidebar */}
          <AppSidebar
            configurations={configurations}
            selectedConfig={selectedConfig}
            setSelectedConfig={setSelectedConfig}
            currentConfig={currentConfig}
            onUpdateConfig={(updatedConfig) => {
              // Update the configurations array with the modified config
              setConfigurations(prev => 
                prev.map(config => 
                  config.id === updatedConfig.id ? updatedConfig : config
                )
              );
            }}
            productData={productData}
            selectedSku={selectedSku}
            setSelectedSku={setSelectedSku}
            combinedSettings={combinedSettings}
            setCombinedSettings={setCombinedSettings}
            loading={loading}
            generating={generating}
            onLoadConfigurations={loadConfigurations}
            onLoadProductData={loadProductData}
            onLoadComponents={loadComponents}
            onGenerateSingle={generateSingleBrochure}
            onGenerateCombined={generateCombinedBrochure}
          />

          {/* Canvas Area */}
          <main className="flex-1 bg-muted/30 overflow-hidden">
            <BrochureCanvas 
              components={components}
              config={currentConfig}
              onLayoutChange={(modifiedComponents, properties) => {
                setModifiedComponents(modifiedComponents);
                setComponentProperties(properties);
              }}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
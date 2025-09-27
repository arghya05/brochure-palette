import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Download, RefreshCw, Palette, Settings, Image, FileImage } from 'lucide-react';
import { apiService } from '@/services/api';
import type { BrochureConfig, BrochureData, BrochureComponents } from '@/types/api';
import { BrochureCanvas } from './BrochureCanvas';
import { Navigation } from './Navigation';

export const BrochureDesigner: React.FC = () => {
  const [configurations, setConfigurations] = useState<BrochureConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [productData, setProductData] = useState<BrochureData[]>([]);
  const [selectedSku, setSelectedSku] = useState<string>('');
  const [components, setComponents] = useState<BrochureComponents | null>(null);
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
      const response = await apiService.getAllData();
      setProductData(response.data);
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

      await apiService.generateBrochure({
        config_id: selectedConfig,
        data: [selectedProduct],
        output_format: 'png',
        return_components: false,
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
      await apiService.generateCombinedBrochure({
        config_id: selectedConfig,
        data: productData.slice(0, combinedSettings.rows * combinedSettings.cols),
        rows: combinedSettings.rows,
        cols: combinedSettings.cols,
        brochure_width: combinedSettings.width,
        brochure_height: combinedSettings.height,
        spacing: combinedSettings.spacing,
        output_format: 'png',
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-soft border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="h-8 w-8 text-primary-foreground" />
                <h1 className="text-2xl font-bold text-primary-foreground">Brochure Designer</h1>
              </div>
              <div className="flex items-center gap-4">
                <Navigation />
                <Button 
                  variant="canvas" 
                  size="sm"
                  onClick={loadInitialData}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refresh
                </Button>
              </div>
            </div>
          </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border shadow-soft overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Configuration Section */}
            <Card className="p-4 shadow-medium">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Configuration</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="config-select">Select Configuration</Label>
                  <Select value={selectedConfig} onValueChange={setSelectedConfig}>
                    <SelectTrigger id="config-select">
                      <SelectValue placeholder="Choose configuration..." />
                    </SelectTrigger>
                    <SelectContent>
                      {configurations.map(config => (
                        <SelectItem key={config.id} value={config.id}>
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="tool" size="sm" onClick={loadConfigurations} className="flex-1">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Button variant="gradient" size="sm" className="flex-1">
                    New Config
                  </Button>
                </div>
              </div>
            </Card>

            {/* Product Data Section */}
            <Card className="p-4 shadow-medium">
              <div className="flex items-center gap-2 mb-4">
                <FileImage className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Product Data</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="sku-select">Select SKU</Label>
                  <Select value={selectedSku} onValueChange={setSelectedSku}>
                    <SelectTrigger id="sku-select">
                      <SelectValue placeholder="Choose SKU..." />
                    </SelectTrigger>
                    <SelectContent>
                      {productData.map(product => (
                        <SelectItem key={product.sku} value={product.sku}>
                          {product.sku} - {product.english_description.slice(0, 30)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Button variant="tool" size="sm" onClick={loadProductData} className="w-full">
                    <RefreshCw className="h-4 w-4" />
                    Load Data
                  </Button>
                  <Button 
                    variant="gradient" 
                    size="sm" 
                    onClick={loadComponents}
                    disabled={loading || !selectedConfig || !selectedSku}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Image className="h-4 w-4" />
                    )}
                    <span className="truncate">Load Components</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Combined Brochure Section */}
            <Card className="p-4 shadow-medium">
              <h3 className="font-semibold text-lg mb-4">Combined Brochure</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="rows">Rows</Label>
                  <Input
                    id="rows"
                    type="number"
                    min="1"
                    max="10"
                    value={combinedSettings.rows}
                    onChange={(e) => setCombinedSettings(prev => ({ ...prev, rows: parseInt(e.target.value) || 3 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cols">Columns</Label>
                  <Input
                    id="cols"
                    type="number"
                    min="1"
                    max="10"
                    value={combinedSettings.cols}
                    onChange={(e) => setCombinedSettings(prev => ({ ...prev, cols: parseInt(e.target.value) || 4 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    min="100"
                    max="1000"
                    value={combinedSettings.width}
                    onChange={(e) => setCombinedSettings(prev => ({ ...prev, width: parseInt(e.target.value) || 400 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    min="100"
                    max="1000"
                    value={combinedSettings.height}
                    onChange={(e) => setCombinedSettings(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                  />
                </div>
              </div>
            </Card>

            {/* Generation Buttons */}
            <div className="space-y-3">
              <Button 
                variant="gradient" 
                size="lg" 
                onClick={generateSingleBrochure}
                disabled={generating || !selectedConfig || !selectedSku}
                className="w-full"
              >
                {generating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                Generate Single Brochure
              </Button>
              <Button 
                variant="success" 
                size="lg" 
                onClick={generateCombinedBrochure}
                disabled={generating || !selectedConfig}
                className="w-full"
              >
                {generating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                Generate Combined Brochure
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-muted/30">
          <BrochureCanvas 
            components={components}
            config={configurations.find(c => c.id === selectedConfig)}
          />
        </div>
      </div>
    </div>
  );
};
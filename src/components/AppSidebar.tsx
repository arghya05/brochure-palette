import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings2, FileImage, Grid3X3, Download, RefreshCw, Image, Loader2, ChevronDown, ChevronRight, Palette, Type, Square } from 'lucide-react';
import type { BrochureConfig, BrochureData } from '@/types/api';

interface AppSidebarProps {
  configurations: BrochureConfig[];
  selectedConfig: string;
  setSelectedConfig: (id: string) => void;
  currentConfig: BrochureConfig | null;
  onUpdateConfig: (config: BrochureConfig) => void;
  productData: BrochureData[];
  selectedSku: string;
  setSelectedSku: (sku: string) => void;
  combinedSettings: { rows: number; cols: number; width: number; height: number; spacing: number; };
  setCombinedSettings: (settings: any) => void;
  loading: boolean;
  generating: boolean;
  onLoadConfigurations: () => void;
  onLoadProductData: () => void;
  onLoadComponents: () => void;
  onGenerateSingle: () => void;
  onGenerateCombined: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = (props) => {
  console.log('AppSidebar productData:', props.productData);
  console.log('AppSidebar productData length:', props.productData?.length);
  
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    config: true,
    configParams: false,
    product: true,
    combined: false,
    generate: true,
  });

  const toggleGroup = (group: keyof typeof expandedGroups) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const updateConfigField = (field: string, value: any) => {
    if (!props.currentConfig) return;
    
    const keys = field.split('.');
    const updatedConfig = { ...props.currentConfig };
    
    if (keys.length === 2) {
      const section = keys[0] as keyof BrochureConfig;
      const key = keys[1];
      (updatedConfig[section] as any) = {
        ...(updatedConfig[section] as any),
        [key]: value
      };
    } else {
      (updatedConfig as any)[field] = value;
    }
    
    props.onUpdateConfig(updatedConfig);
  };

  const ColorInput = ({ value, onChange, label }: { value: [number, number, number]; onChange: (value: [number, number, number]) => void; label: string }) => {
    const hexColor = `#${value.map(c => c.toString(16).padStart(2, '0')).join('')}`;
    
    const handleChange = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);  
      const b = parseInt(hex.slice(5, 7), 16);
      onChange([r, g, b]);
    };

    return (
      <div>
        <Label className="text-xs">{label}</Label>
        <div className="flex gap-1">
          <Input
            type="color"
            value={hexColor}
            onChange={(e) => handleChange(e.target.value)}
            className="h-8 w-12 p-1 border"
          />
          <Input
            type="text"
            value={hexColor}
            onChange={(e) => handleChange(e.target.value)}
            className="h-8 flex-1 text-xs"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-80'} border-r border-sidebar-border bg-sidebar transition-all duration-300`}>
      <div className="p-3 border-b border-sidebar-border">
        <Button variant="ghost" size="tool" onClick={() => setCollapsed(!collapsed)} className="mb-2">
          <Settings2 className="h-4 w-4" />
        </Button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Settings2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="text-sm font-semibold text-sidebar-foreground">Design Tools</div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Configuration */}
        <div className="space-y-3">
          <Button onClick={() => toggleGroup('config')} variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              {!collapsed && <span className="font-medium">Configuration</span>}
            </div>
            {!collapsed && (expandedGroups.config ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </Button>
          
          {!collapsed && expandedGroups.config && (
            <div className="pl-2 space-y-3">
              <Select value={props.selectedConfig} onValueChange={props.setSelectedConfig}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {props.configurations.map(config => (
                    <SelectItem key={config.id} value={config.id}>{config.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-1">
                <Button variant="tool" size="sm" onClick={props.onLoadConfigurations}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button variant="primary" size="sm" onClick={() => {
                  // Create new configuration functionality
                  const newConfigName = prompt('Enter configuration name:');
                  if (newConfigName?.trim()) {
                    // This would integrate with API to create new config
                    console.log('Creating new config:', newConfigName.trim());
                  }
                }}>New</Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Configuration Parameters */}
        <div className="space-y-3">
          <Button onClick={() => toggleGroup('configParams')} variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              {!collapsed && <span className="font-medium">Config Parameters</span>}
            </div>
            {!collapsed && (expandedGroups.configParams ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </Button>
          
          {!collapsed && expandedGroups.configParams && props.currentConfig && (
            <div className="pl-2 space-y-4 max-h-96 overflow-y-auto">
              {/* Fonts */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Type className="h-3 w-3" />
                  Fonts
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Arabic Regular</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.fonts.arabic_regular_size}
                      onChange={(e) => updateConfigField('fonts.arabic_regular_size', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Arabic Bold</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.fonts.arabic_bold_size}
                      onChange={(e) => updateConfigField('fonts.arabic_bold_size', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">English Regular</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.fonts.english_regular_size}
                      onChange={(e) => updateConfigField('fonts.english_regular_size', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">English Bold</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.fonts.english_bold_size}
                      onChange={(e) => updateConfigField('fonts.english_bold_size', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Price Strike</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.fonts.english_bold_price_strike_size}
                      onChange={(e) => updateConfigField('fonts.english_bold_price_strike_size', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Price Size</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.fonts.english_bold_price_size}
                      onChange={(e) => updateConfigField('fonts.english_bold_price_size', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dimensions */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Square className="h-3 w-3" />
                  Dimensions
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.dimensions.width}
                      onChange={(e) => updateConfigField('dimensions.width', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.dimensions.height}
                      onChange={(e) => updateConfigField('dimensions.height', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Grid */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Grid3X3 className="h-3 w-3" />
                  Grid
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Cols</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.grid.cols}
                      onChange={(e) => updateConfigField('grid.cols', parseInt(e.target.value) || 1)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Rows</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.grid.rows}
                      onChange={(e) => updateConfigField('grid.rows', parseInt(e.target.value) || 1)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Spacing</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.grid.spacing}
                      onChange={(e) => updateConfigField('grid.spacing', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Text Config */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Text Config</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Arabic Text</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Input
                        type="number"
                        placeholder="X"
                        value={props.currentConfig.text.arabic_x}
                        onChange={(e) => updateConfigField('text.arabic_x', parseInt(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Y Offset"
                        value={props.currentConfig.text.arabic_y_offset}
                        onChange={(e) => updateConfigField('text.arabic_y_offset', parseInt(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Max Width"
                        value={props.currentConfig.text.arabic_max_width}
                        onChange={(e) => updateConfigField('text.arabic_max_width', parseInt(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <ColorInput 
                      label="Color" 
                      value={props.currentConfig.text.arabic_color}
                      onChange={(value) => updateConfigField('text.arabic_color', value)}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">English Text</Label>
                    <div className="grid grid-cols-3 gap-1">
                      <Input
                        type="number"
                        placeholder="X"
                        value={props.currentConfig.text.english_x}
                        onChange={(e) => updateConfigField('text.english_x', parseInt(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Y Offset"
                        value={props.currentConfig.text.english_y_offset}
                        onChange={(e) => updateConfigField('text.english_y_offset', parseInt(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Max Width"
                        value={props.currentConfig.text.english_max_width}
                        onChange={(e) => updateConfigField('text.english_max_width', parseInt(e.target.value) || 0)}
                        className="h-7 text-xs"
                      />
                    </div>
                    <ColorInput 
                      label="Color" 
                      value={props.currentConfig.text.english_color}
                      onChange={(value) => updateConfigField('text.english_color', value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Product Image */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  Product Image
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Max Width</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.product_image.max_width}
                      onChange={(e) => updateConfigField('product_image.max_width', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Height</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.product_image.max_height}
                      onChange={(e) => updateConfigField('product_image.max_height', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">X Offset</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.product_image.center_x_offset}
                      onChange={(e) => updateConfigField('product_image.center_x_offset', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y Offset</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.product_image.center_y_offset}
                      onChange={(e) => updateConfigField('product_image.center_y_offset', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Price Tag */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Price Tag</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.price_tag.width}
                      onChange={(e) => updateConfigField('price_tag.width', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.price_tag.height}
                      onChange={(e) => updateConfigField('price_tag.height', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">X Offset</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.price_tag.x_offset}
                      onChange={(e) => updateConfigField('price_tag.x_offset', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y Offset</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.price_tag.y_offset}
                      onChange={(e) => updateConfigField('price_tag.y_offset', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Corner Radius</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.price_tag.corner_radius}
                      onChange={(e) => updateConfigField('price_tag.corner_radius', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Strike Width</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.price_tag.strike_line_width}
                      onChange={(e) => updateConfigField('price_tag.strike_line_width', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <ColorInput 
                    label="Background" 
                    value={props.currentConfig.price_tag.background_color}
                    onChange={(value) => updateConfigField('price_tag.background_color', value)}
                  />
                  <ColorInput 
                    label="Regular Price" 
                    value={props.currentConfig.price_tag.regular_price_color}
                    onChange={(value) => updateConfigField('price_tag.regular_price_color', value)}
                  />
                  <ColorInput 
                    label="Strike Line" 
                    value={props.currentConfig.price_tag.strike_line_color}
                    onChange={(value) => updateConfigField('price_tag.strike_line_color', value)}
                  />
                  <ColorInput 
                    label="Promo Price" 
                    value={props.currentConfig.price_tag.promo_price_color}
                    onChange={(value) => updateConfigField('price_tag.promo_price_color', value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Icon */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Icon</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Size</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.icon.size}
                      onChange={(e) => updateConfigField('icon.size', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Border Width</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.icon.border_width}
                      onChange={(e) => updateConfigField('icon.border_width', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">X Offset</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.icon.x_offset}
                      onChange={(e) => updateConfigField('icon.x_offset', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y Offset</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.icon.y_offset}
                      onChange={(e) => updateConfigField('icon.y_offset', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Radius Offset</Label>
                    <Input
                      type="number"
                      value={props.currentConfig.icon.background_circle_radius_offset}
                      onChange={(e) => updateConfigField('icon.background_circle_radius_offset', parseInt(e.target.value) || 0)}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <ColorInput 
                    label="Background" 
                    value={props.currentConfig.icon.background_color}
                    onChange={(value) => updateConfigField('icon.background_color', value)}
                  />
                  <ColorInput 
                    label="Border" 
                    value={props.currentConfig.icon.border_color}
                    onChange={(value) => updateConfigField('icon.border_color', value)}
                  />
                </div>
              </div>

              <Separator />

              {/* Background Colors */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Background Colors</Label>
                <div className="space-y-2">
                  <ColorInput 
                    label="Background" 
                    value={props.currentConfig.background_color}
                    onChange={(value) => updateConfigField('background_color', value)}
                  />
                  <ColorInput 
                    label="Grid Background" 
                    value={props.currentConfig.grid_background_color}
                    onChange={(value) => updateConfigField('grid_background_color', value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Product Data */}
        <div className="space-y-3">
          <Button onClick={() => toggleGroup('product')} variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4 text-primary" />
              {!collapsed && <span className="font-medium">Product Data</span>}
            </div>
            {!collapsed && (expandedGroups.product ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </Button>
          
          {!collapsed && expandedGroups.product && (
            <div className="pl-2 space-y-3">
              <Select value={props.selectedSku} onValueChange={props.setSelectedSku}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Choose SKU..." />
                </SelectTrigger>
                <SelectContent>
                  {props.productData.map((product, index) => (
                    <SelectItem key={`${product.sku}-${index}`} value={product.sku}>{product.sku}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <Button variant="tool" size="sm" onClick={props.onLoadProductData} className="w-full">
                  <RefreshCw className="h-3 w-3" /> Load Data
                </Button>
                <Button variant="primary" size="sm" onClick={props.onLoadComponents} disabled={props.loading} className="w-full">
                  {props.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Image className="h-3 w-3" />}
                  Load Components
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Combined Brochure Settings */}
        <div className="space-y-3">
          <Button onClick={() => toggleGroup('combined')} variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-primary" />
              {!collapsed && <span className="font-medium">Combined Settings</span>}
            </div>
            {!collapsed && (expandedGroups.combined ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </Button>
          
          {!collapsed && expandedGroups.combined && (
            <div className="pl-2 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Rows</Label>
                  <Input
                    type="number"
                    value={props.combinedSettings.rows}
                    onChange={(e) => props.setCombinedSettings({
                      ...props.combinedSettings,
                      rows: parseInt(e.target.value) || 1
                    })}
                    className="h-8 text-xs"
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cols</Label>
                  <Input
                    type="number"
                    value={props.combinedSettings.cols}
                    onChange={(e) => props.setCombinedSettings({
                      ...props.combinedSettings,
                      cols: parseInt(e.target.value) || 1
                    })}
                    className="h-8 text-xs"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={props.combinedSettings.width}
                    onChange={(e) => props.setCombinedSettings({
                      ...props.combinedSettings,
                      width: parseInt(e.target.value) || 100
                    })}
                    className="h-8 text-xs"
                    min="100"
                    max="2000"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    value={props.combinedSettings.height}
                    onChange={(e) => props.setCombinedSettings({
                      ...props.combinedSettings,
                      height: parseInt(e.target.value) || 100
                    })}
                    className="h-8 text-xs"
                    min="100"
                    max="2000"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Spacing</Label>
                <Input
                  type="number"
                  value={props.combinedSettings.spacing}
                  onChange={(e) => props.setCombinedSettings({
                    ...props.combinedSettings,
                    spacing: parseInt(e.target.value) || 0
                  })}
                  className="h-8 text-xs"
                  min="0"
                  max="50"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Generation */}
        <div className="space-y-3">
          <Button onClick={() => toggleGroup('generate')} variant="ghost" className="w-full justify-between p-2">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              {!collapsed && <span className="font-medium">Generate</span>}
            </div>
            {!collapsed && (expandedGroups.generate ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </Button>
          
          {!collapsed && expandedGroups.generate && (
            <div className="pl-2 space-y-2">
              <Button variant="primary" size="sm" onClick={props.onGenerateSingle} disabled={props.generating} className="w-full">
                {props.generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                Single
              </Button>
              <Button variant="accent" size="sm" onClick={props.onGenerateCombined} disabled={props.generating} className="w-full">
                {props.generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Grid3X3 className="h-3 w-3" />}
                Combined
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
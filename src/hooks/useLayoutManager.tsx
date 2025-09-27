import { useCallback } from 'react';
import type { BrochureComponents, BrochureConfig } from '@/types/api';
import type { ComponentProperties } from './useCanvasTools';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { DEFAULT_CONFIG } from '@/constants/defaults';

interface LayoutData {
  name: string;
  componentPositions: Record<string, [number, number]>;
  componentSizes: Record<string, [number, number]>;
  componentProperties: Record<string, ComponentProperties>;
  timestamp: number;
}

export const useLayoutManager = () => {
  const saveLayout = useCallback((
    name: string,
    componentPositions: Record<string, [number, number]>,
    componentSizes: Record<string, [number, number]>,
    componentProperties: Record<string, ComponentProperties>
  ) => {
    const layout: LayoutData = {
      name,
      componentPositions: { ...componentPositions },
      componentSizes: { ...componentSizes },
      componentProperties: { ...componentProperties },
      timestamp: Date.now()
    };

    // Save both as layout and as config
    const saved = JSON.parse(localStorage.getItem('canvasLayouts') || '[]');
    const existing = saved.findIndex((l: LayoutData) => l.name === name);
    
    if (existing >= 0) {
      saved[existing] = layout;
    } else {
      saved.push(layout);
    }
    
    localStorage.setItem('canvasLayouts', JSON.stringify(saved));
    
    // Also save as configuration for brochure designer
    const configs = JSON.parse(localStorage.getItem('brochureConfigs') || '[]');
    const configLayout = {
      id: `config_${Date.now()}`,
      name: `Config: ${name}`,
      layout: layout,
      timestamp: Date.now()
    };
    configs.push(configLayout);
    localStorage.setItem('brochureConfigs', JSON.stringify(configs));
    
    toast.success(`Layout "${name}" saved as configuration`);
  }, []);

  const loadLayout = useCallback((name: string) => {
    const saved = JSON.parse(localStorage.getItem('canvasLayouts') || '[]');
    const layout = saved.find((l: LayoutData) => l.name === name);
    
    if (layout) {
      toast.success(`Layout "${name}" loaded`);
      return {
        componentPositions: layout.componentPositions,
        componentSizes: layout.componentSizes,
        componentProperties: layout.componentProperties
      };
    }
    
    toast.error(`Layout "${name}" not found`);
    return null;
  }, []);

  const getSavedLayouts = useCallback(() => {
    return JSON.parse(localStorage.getItem('canvasLayouts') || '[]');
  }, []);

  const deleteLayout = useCallback((name: string) => {
    const saved = JSON.parse(localStorage.getItem('canvasLayouts') || '[]');
    const filtered = saved.filter((l: LayoutData) => l.name !== name);
    localStorage.setItem('canvasLayouts', JSON.stringify(filtered));
    toast.success(`Layout "${name}" deleted`);
  }, []);

  const exportLayout = useCallback((
    name: string,
    componentPositions: Record<string, [number, number]>,
    componentSizes: Record<string, [number, number]>,
    componentProperties: Record<string, ComponentProperties>
  ) => {
    const layout: LayoutData = {
      name,
      componentPositions,
      componentSizes,
      componentProperties,
      timestamp: Date.now()
    };

    const dataStr = JSON.stringify(layout, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/[^a-z0-9]/gi, '_')}_layout.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success(`Layout "${name}" exported`);
  }, []);

  const importLayout = useCallback((file: File) => {
    return new Promise<LayoutData | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const layout = JSON.parse(e.target?.result as string) as LayoutData;
          if (layout.componentPositions && layout.componentSizes && layout.componentProperties) {
            toast.success(`Layout "${layout.name}" imported`);
            resolve(layout);
          } else {
            toast.error('Invalid layout file format');
            resolve(null);
          }
        } catch (error) {
          toast.error('Failed to parse layout file');
          resolve(null);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const updateConfig = useCallback(async (config: BrochureConfig) => {
    try {
      // Use the proper API service method instead of direct fetch
      await apiService.updateConfiguration(config);
      toast.success(`Configuration "${config.name}" updated successfully`);
      return true;
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error(`Failed to update configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, []);

  const createConfigFromLayout = useCallback(async (
    name: string,
    componentPositions: Record<string, [number, number]>,
    componentSizes: Record<string, [number, number]>,
    componentProperties: Record<string, ComponentProperties>,
    baseConfig?: BrochureConfig
  ) => {
    try {
      // Use base config values if provided, otherwise use centralized defaults
      const config = {
        name,
        fonts: {
          arabic_regular_size: baseConfig?.fonts.arabic_regular_size ?? 
            componentProperties.arabicText?.textProperties?.fontSize ?? DEFAULT_CONFIG.FONTS.ARABIC_REGULAR_SIZE,
          arabic_bold_size: baseConfig?.fonts.arabic_bold_size ?? 
            DEFAULT_CONFIG.FONTS.ARABIC_BOLD_SIZE,
          english_regular_size: baseConfig?.fonts.english_regular_size ?? 
            componentProperties.englishText?.textProperties?.fontSize ?? DEFAULT_CONFIG.FONTS.ENGLISH_REGULAR_SIZE,
          english_bold_size: baseConfig?.fonts.english_bold_size ?? 
            DEFAULT_CONFIG.FONTS.ENGLISH_BOLD_SIZE,
          english_bold_price_strike_size: baseConfig?.fonts.english_bold_price_strike_size ?? 
            componentProperties.priceText?.textProperties?.fontSize ?? DEFAULT_CONFIG.FONTS.ENGLISH_BOLD_PRICE_STRIKE_SIZE,
          english_bold_price_size: baseConfig?.fonts.english_bold_price_size ?? 
            DEFAULT_CONFIG.FONTS.ENGLISH_BOLD_PRICE_SIZE,
        },
        dimensions: { 
          width: baseConfig?.dimensions.width ?? componentSizes.canvas?.[0] ?? DEFAULT_CONFIG.DIMENSIONS.WIDTH, 
          height: baseConfig?.dimensions.height ?? componentSizes.canvas?.[1] ?? DEFAULT_CONFIG.DIMENSIONS.HEIGHT 
        },
        grid: { 
          cols: baseConfig?.grid.cols ?? DEFAULT_CONFIG.GRID.COLS, 
          rows: baseConfig?.grid.rows ?? DEFAULT_CONFIG.GRID.ROWS, 
          spacing: baseConfig?.grid.spacing ?? DEFAULT_CONFIG.GRID.SPACING 
        },
        text: {
          arabic_x: baseConfig?.text.arabic_x ?? componentPositions.arabicText?.[0] ?? DEFAULT_CONFIG.TEXT.ARABIC_X,
          arabic_y_offset: baseConfig?.text.arabic_y_offset ?? componentPositions.arabicText?.[1] ?? DEFAULT_CONFIG.TEXT.ARABIC_Y_OFFSET,
          arabic_max_width: baseConfig?.text.arabic_max_width ?? 
            componentProperties.arabicText?.textProperties?.maxWidth ?? DEFAULT_CONFIG.TEXT.ARABIC_MAX_WIDTH,
          arabic_color: baseConfig?.text.arabic_color ?? DEFAULT_CONFIG.TEXT.ARABIC_COLOR,
          english_x: baseConfig?.text.english_x ?? componentPositions.englishText?.[0] ?? DEFAULT_CONFIG.TEXT.ENGLISH_X,
          english_y_offset: baseConfig?.text.english_y_offset ?? componentPositions.englishText?.[1] ?? DEFAULT_CONFIG.TEXT.ENGLISH_Y_OFFSET,
          english_max_width: baseConfig?.text.english_max_width ?? 
            componentProperties.englishText?.textProperties?.maxWidth ?? DEFAULT_CONFIG.TEXT.ENGLISH_MAX_WIDTH,
          english_color: baseConfig?.text.english_color ?? DEFAULT_CONFIG.TEXT.ENGLISH_COLOR,
        },
        product_image: {
          max_width: baseConfig?.product_image.max_width ?? componentSizes.productImage?.[0] ?? DEFAULT_CONFIG.PRODUCT_IMAGE.MAX_WIDTH,
          max_height: baseConfig?.product_image.max_height ?? componentSizes.productImage?.[1] ?? DEFAULT_CONFIG.PRODUCT_IMAGE.MAX_HEIGHT,
          center_x_offset: baseConfig?.product_image.center_x_offset ?? componentPositions.productImage?.[0] ?? DEFAULT_CONFIG.PRODUCT_IMAGE.CENTER_X_OFFSET,
          center_y_offset: baseConfig?.product_image.center_y_offset ?? componentPositions.productImage?.[1] ?? DEFAULT_CONFIG.PRODUCT_IMAGE.CENTER_Y_OFFSET,
        },
        price_tag: {
          width: baseConfig?.price_tag.width ?? componentSizes.priceTag?.[0] ?? DEFAULT_CONFIG.PRICE_TAG.WIDTH,
          height: baseConfig?.price_tag.height ?? componentSizes.priceTag?.[1] ?? DEFAULT_CONFIG.PRICE_TAG.HEIGHT,
          x_offset: baseConfig?.price_tag.x_offset ?? componentPositions.priceTag?.[0] ?? DEFAULT_CONFIG.PRICE_TAG.X_OFFSET,
          y_offset: baseConfig?.price_tag.y_offset ?? componentPositions.priceTag?.[1] ?? DEFAULT_CONFIG.PRICE_TAG.Y_OFFSET,
          corner_radius: baseConfig?.price_tag.corner_radius ?? DEFAULT_CONFIG.PRICE_TAG.CORNER_RADIUS,
          background_color: baseConfig?.price_tag.background_color ?? DEFAULT_CONFIG.PRICE_TAG.BACKGROUND_COLOR,
          regular_price_x_offset: baseConfig?.price_tag.regular_price_x_offset ?? DEFAULT_CONFIG.PRICE_TAG.REGULAR_PRICE_X_OFFSET,
          regular_price_y_offset: baseConfig?.price_tag.regular_price_y_offset ?? DEFAULT_CONFIG.PRICE_TAG.REGULAR_PRICE_Y_OFFSET,
          regular_price_color: baseConfig?.price_tag.regular_price_color ?? DEFAULT_CONFIG.PRICE_TAG.REGULAR_PRICE_COLOR,
          strike_line_color: baseConfig?.price_tag.strike_line_color ?? DEFAULT_CONFIG.PRICE_TAG.STRIKE_LINE_COLOR,
          strike_line_width: baseConfig?.price_tag.strike_line_width ?? DEFAULT_CONFIG.PRICE_TAG.STRIKE_LINE_WIDTH,
          promo_price_x_offset: baseConfig?.price_tag.promo_price_x_offset ?? DEFAULT_CONFIG.PRICE_TAG.PROMO_PRICE_X_OFFSET,
          promo_price_y_offset: baseConfig?.price_tag.promo_price_y_offset ?? DEFAULT_CONFIG.PRICE_TAG.PROMO_PRICE_Y_OFFSET,
          promo_price_color: baseConfig?.price_tag.promo_price_color ?? DEFAULT_CONFIG.PRICE_TAG.PROMO_PRICE_COLOR,
        },
        icon: {
          size: baseConfig?.icon.size ?? componentSizes.icon?.[0] ?? DEFAULT_CONFIG.ICON.SIZE,
          x_offset: baseConfig?.icon.x_offset ?? componentPositions.icon?.[0] ?? DEFAULT_CONFIG.ICON.X_OFFSET,
          y_offset: baseConfig?.icon.y_offset ?? componentPositions.icon?.[1] ?? DEFAULT_CONFIG.ICON.Y_OFFSET,
          background_circle_radius_offset: baseConfig?.icon.background_circle_radius_offset ?? DEFAULT_CONFIG.ICON.BACKGROUND_CIRCLE_RADIUS_OFFSET,
          background_color: baseConfig?.icon.background_color ?? DEFAULT_CONFIG.ICON.BACKGROUND_COLOR,
          border_color: baseConfig?.icon.border_color ?? DEFAULT_CONFIG.ICON.BORDER_COLOR,
          border_width: baseConfig?.icon.border_width ?? DEFAULT_CONFIG.ICON.BORDER_WIDTH,
        },
        background_color: baseConfig?.background_color ?? DEFAULT_CONFIG.BACKGROUND_COLOR,
        grid_background_color: baseConfig?.grid_background_color ?? DEFAULT_CONFIG.GRID_BACKGROUND_COLOR,
      };

      // Use the proper API service method instead of direct fetch
      await apiService.createConfiguration(config);
      
      // Also save the layout data for reference
      const layout: LayoutData = {
        name,
        componentPositions: { ...componentPositions },
        componentSizes: { ...componentSizes },
        componentProperties: { ...componentProperties },
        timestamp: Date.now()
      };
      
      const configs = JSON.parse(localStorage.getItem('brochureConfigs') || '[]');
      const configLayout = {
        id: `config_${Date.now()}`,
        name,
        layout: layout,
        timestamp: Date.now()
      };
      configs.push(configLayout);
      localStorage.setItem('brochureConfigs', JSON.stringify(configs));
      
      toast.success(`Configuration "${name}" created successfully`);
      return true;
    } catch (error) {
      console.error('Error creating configuration:', error);
      toast.error(`Failed to create configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, []);

  // Legacy method for backward compatibility
  const makeAsConfig = useCallback(async (
    name: string,
    componentPositions: Record<string, [number, number]>,
    componentSizes: Record<string, [number, number]>,
    componentProperties: Record<string, ComponentProperties>
  ) => {
    return createConfigFromLayout(name, componentPositions, componentSizes, componentProperties);
  }, [createConfigFromLayout]);

  const syncLayoutToConfig = useCallback((
    config: BrochureConfig,
    componentPositions: Record<string, [number, number]>,
    componentSizes: Record<string, [number, number]>,
    componentProperties: Record<string, ComponentProperties>
  ): BrochureConfig => {
    // Sync layout data back to config format
    return {
      ...config,
      dimensions: {
        width: componentSizes.canvas?.[0] ?? config.dimensions.width,
        height: componentSizes.canvas?.[1] ?? config.dimensions.height,
      },
      text: {
        ...config.text,
        arabic_x: componentPositions.arabicText?.[0] ?? config.text.arabic_x,
        arabic_y_offset: componentPositions.arabicText?.[1] ?? config.text.arabic_y_offset,
        arabic_max_width: componentProperties.arabicText?.textProperties?.maxWidth ?? config.text.arabic_max_width,
        english_x: componentPositions.englishText?.[0] ?? config.text.english_x,
        english_y_offset: componentPositions.englishText?.[1] ?? config.text.english_y_offset,
        english_max_width: componentProperties.englishText?.textProperties?.maxWidth ?? config.text.english_max_width,
      },
      product_image: {
        ...config.product_image,
        max_width: componentSizes.productImage?.[0] ?? config.product_image.max_width,
        max_height: componentSizes.productImage?.[1] ?? config.product_image.max_height,
        center_x_offset: componentPositions.productImage?.[0] ?? config.product_image.center_x_offset,
        center_y_offset: componentPositions.productImage?.[1] ?? config.product_image.center_y_offset,
      },
      price_tag: {
        ...config.price_tag,
        width: componentSizes.priceTag?.[0] ?? config.price_tag.width,
        height: componentSizes.priceTag?.[1] ?? config.price_tag.height,
        x_offset: componentPositions.priceTag?.[0] ?? config.price_tag.x_offset,
        y_offset: componentPositions.priceTag?.[1] ?? config.price_tag.y_offset,
      },
      icon: {
        ...config.icon,
        size: componentSizes.icon?.[0] ?? config.icon.size,
        x_offset: componentPositions.icon?.[0] ?? config.icon.x_offset,
        y_offset: componentPositions.icon?.[1] ?? config.icon.y_offset,
      },
      fonts: {
        ...config.fonts,
        arabic_regular_size: componentProperties.arabicText?.textProperties?.fontSize ?? config.fonts.arabic_regular_size,
        english_regular_size: componentProperties.englishText?.textProperties?.fontSize ?? config.fonts.english_regular_size,
        english_bold_price_strike_size: componentProperties.priceText?.textProperties?.fontSize ?? config.fonts.english_bold_price_strike_size,
      }
    };
  }, []);

  return {
    saveLayout,
    loadLayout,
    getSavedLayouts,
    deleteLayout,
    exportLayout,
    importLayout,
    makeAsConfig,
    updateConfig,
    createConfigFromLayout,
    syncLayoutToConfig
  };
};
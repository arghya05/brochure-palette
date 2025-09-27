import { useCallback } from 'react';
import type { BrochureComponents } from '@/types/api';
import type { ComponentProperties } from './useCanvasTools';
import { toast } from 'sonner';

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

  const makeAsConfig = useCallback(async (
    name: string,
    componentPositions: Record<string, [number, number]>,
    componentSizes: Record<string, [number, number]>,
    componentProperties: Record<string, ComponentProperties>
  ) => {
    try {
      const API_BASE = 'http://localhost:8000';
      
      // Convert layout data to BrochureConfig format
      const newConfig = {
        name,
        fonts: {
          arabic_regular_size: 16,
          arabic_bold_size: 18,
          english_regular_size: 14,
          english_bold_size: 16,
          english_bold_price_strike_size: 12,
          english_bold_price_size: 14,
        },
        dimensions: { width: 400, height: 600 },
        grid: { cols: 1, rows: 1, spacing: 10 },
        text: {
          arabic_x: 50,
          arabic_y_offset: 100,
          arabic_max_width: 300,
          arabic_color: [0, 0, 0] as [number, number, number],
          english_x: 50,
          english_y_offset: 150,
          english_max_width: 300,
          english_color: [0, 0, 0] as [number, number, number],
        },
        product_image: {
          max_width: 200,
          max_height: 200,
          center_x_offset: 0,
          center_y_offset: 0,
        },
        price_tag: {
          width: 80,
          height: 30,
          x_offset: 10,
          y_offset: 10,
          corner_radius: 5,
          background_color: [255, 255, 255] as [number, number, number],
          regular_price_x_offset: 5,
          regular_price_y_offset: 5,
          regular_price_color: [128, 128, 128] as [number, number, number],
          strike_line_color: [255, 0, 0] as [number, number, number],
          strike_line_width: 2,
          promo_price_x_offset: 5,
          promo_price_y_offset: 15,
          promo_price_color: [255, 0, 0] as [number, number, number],
        },
        icon: {
          size: 40,
          x_offset: 20,
          y_offset: 20,
          background_circle_radius_offset: 5,
          background_color: [240, 240, 240] as [number, number, number],
          border_color: [200, 200, 200] as [number, number, number],
          border_width: 2,
        },
        background_color: [255, 255, 255] as [number, number, number],
        grid_background_color: [245, 245, 245] as [number, number, number],
      };

      // Use the exact fetch format provided by user
      const response = await fetch(`${API_BASE}/configurations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
    } catch (error) {
      console.error('Error creating configuration:', error);
      toast.error(`Failed to create configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  return {
    saveLayout,
    loadLayout,
    getSavedLayouts,
    deleteLayout,
    exportLayout,
    importLayout,
    makeAsConfig
  };
};
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

  return {
    saveLayout,
    loadLayout,
    getSavedLayouts,
    deleteLayout,
    exportLayout,
    importLayout
  };
};
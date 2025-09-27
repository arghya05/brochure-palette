import { useState, useCallback, useRef } from 'react';
import type { BrochureComponents } from '@/types/api';

export type CanvasToolType = 'select' | 'draw' | 'rectangle' | 'circle' | 'text';

export interface ComponentProperties {
  opacity: number;
  rotation: number;
  visible: boolean;
  textProperties?: {
    fontSize: number;
    color: string;
    maxWidth: number;
  };
}

export interface DragState {
  isDragging: boolean;
  dragComponent: string | null;
  startPos: { x: number; y: number };
  componentStartPos: { x: number; y: number };
}

export const useCanvasTools = () => {
  const [activeTool, setActiveTool] = useState<CanvasToolType>('select');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragComponent: null,
    startPos: { x: 0, y: 0 },
    componentStartPos: { x: 0, y: 0 }
  });

  const [componentPositions, setComponentPositions] = useState<Record<string, [number, number]>>({});
  const [componentProperties, setComponentProperties] = useState<Record<string, ComponentProperties>>({});

  const canvasRef = useRef<HTMLDivElement>(null);

  const initializeComponentProperties = useCallback((components: BrochureComponents) => {
    const initialProperties: Record<string, ComponentProperties> = {};
    
    Object.keys(components).forEach(key => {
      if (key !== 'brochure_dimensions') {
        initialProperties[key] = {
          opacity: 1,
          rotation: 0,
          visible: true,
          ...((['arabic_text', 'english_text'].includes(key)) && {
            textProperties: {
              fontSize: 24,
              color: '#231f20',
              maxWidth: 16
            }
          })
        };
      }
    });
    
    setComponentProperties(prev => ({
      ...initialProperties,
      ...prev
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, componentName: string, components: BrochureComponents) => {
    if (activeTool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedComponent(componentName);
    
    if (!components || !components[componentName as keyof BrochureComponents]) return;
    
    const component = components[componentName as keyof BrochureComponents];
    if (!component || !('position' in component)) return;

    const currentPos = componentPositions[componentName] || component.position;
    
    setDragState({
      isDragging: true,
      dragComponent: componentName,
      startPos: { x: e.clientX, y: e.clientY },
      componentStartPos: { x: currentPos[0], y: currentPos[1] }
    });
  }, [activeTool, componentPositions]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.dragComponent || activeTool !== 'select') return;
    
    const deltaX = e.clientX - dragState.startPos.x;
    const deltaY = e.clientY - dragState.startPos.y;
    
    const newX = dragState.componentStartPos.x + deltaX;
    const newY = dragState.componentStartPos.y + deltaY;
    
    setComponentPositions(prev => ({
      ...prev,
      [dragState.dragComponent!]: [newX, newY]
    }));
  }, [dragState, activeTool]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragComponent: null,
      startPos: { x: 0, y: 0 },
      componentStartPos: { x: 0, y: 0 }
    });
  }, []);

  const updateComponentProperty = useCallback((componentName: string, property: string, value: any) => {
    setComponentProperties(prev => ({
      ...prev,
      [componentName]: {
        ...prev[componentName],
        [property]: value
      }
    }));
  }, []);

  const updateTextProperty = useCallback((componentName: string, property: string, value: any) => {
    setComponentProperties(prev => ({
      ...prev,
      [componentName]: {
        ...prev[componentName],
        textProperties: {
          ...prev[componentName]?.textProperties,
          [property]: value
        }
      }
    }));
  }, []);

  const getComponentPosition = useCallback((componentName: string, components: BrochureComponents) => {
    if (!components) return [0, 0];
    const component = components[componentName as keyof BrochureComponents];
    if (!component || !('position' in component)) return [0, 0];
    return componentPositions[componentName] || component.position;
  }, [componentPositions]);

  const deleteComponent = useCallback((componentName: string) => {
    setComponentProperties(prev => {
      const newProps = { ...prev };
      if (newProps[componentName]) {
        newProps[componentName].visible = false;
      }
      return newProps;
    });
    if (selectedComponent === componentName) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  const duplicateComponent = useCallback((componentName: string) => {
    const currentPos = componentPositions[componentName];
    if (currentPos) {
      setComponentPositions(prev => ({
        ...prev,
        [`${componentName}_copy`]: [currentPos[0] + 20, currentPos[1] + 20]
      }));
    }
  }, [componentPositions]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 25));
  }, []);

  const handleFitToScreen = useCallback(() => {
    setZoom(100);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedComponent) return;
    
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        deleteComponent(selectedComponent);
        break;
      case 'Escape':
        setSelectedComponent(null);
        break;
    }
  }, [selectedComponent, deleteComponent]);

  return {
    // State
    activeTool,
    selectedComponent,
    zoom,
    dragState,
    componentPositions,
    componentProperties,
    canvasRef,
    
    // Actions
    setActiveTool,
    setSelectedComponent,
    initializeComponentProperties,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    updateComponentProperty,
    updateTextProperty,
    getComponentPosition,
    deleteComponent,
    duplicateComponent,
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen,
    handleKeyDown
  };
};
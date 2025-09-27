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

export interface ResizeState {
  isResizing: boolean;
  resizeComponent: string | null;
  resizeHandle: 'nw' | 'ne' | 'sw' | 'se' | null;
  startPos: { x: number; y: number };
  componentStartSize: { width: number; height: number };
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

  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    resizeComponent: null,
    resizeHandle: null,
    startPos: { x: 0, y: 0 },
    componentStartSize: { width: 0, height: 0 }
  });

  const [componentPositions, setComponentPositions] = useState<Record<string, [number, number]>>({});
  const [componentSizes, setComponentSizes] = useState<Record<string, [number, number]>>({});
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

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, componentName: string, handle: 'nw' | 'ne' | 'sw' | 'se', components: BrochureComponents) => {
    if (activeTool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!components || !components[componentName as keyof BrochureComponents]) return;
    
    const component = components[componentName as keyof BrochureComponents];
    if (!component || !('size' in component)) return;

    const currentSize = componentSizes[componentName] || component.size;
    
    setResizeState({
      isResizing: true,
      resizeComponent: componentName,
      resizeHandle: handle,
      startPos: { x: e.clientX, y: e.clientY },
      componentStartSize: { width: currentSize[0], height: currentSize[1] }
    });
  }, [activeTool, componentSizes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'select') return;
    
    // Handle dragging
    if (dragState.isDragging && dragState.dragComponent) {
      const deltaX = e.clientX - dragState.startPos.x;
      const deltaY = e.clientY - dragState.startPos.y;
      
      const newX = dragState.componentStartPos.x + deltaX;
      const newY = dragState.componentStartPos.y + deltaY;
      
      setComponentPositions(prev => ({
        ...prev,
        [dragState.dragComponent!]: [newX, newY]
      }));
    }
    
    // Handle resizing
    if (resizeState.isResizing && resizeState.resizeComponent && resizeState.resizeHandle) {
      const deltaX = e.clientX - resizeState.startPos.x;
      const deltaY = e.clientY - resizeState.startPos.y;
      
      let newWidth = resizeState.componentStartSize.width;
      let newHeight = resizeState.componentStartSize.height;
      
      switch (resizeState.resizeHandle) {
        case 'se': // Southeast handle
          newWidth = Math.max(50, resizeState.componentStartSize.width + deltaX);
          newHeight = Math.max(50, resizeState.componentStartSize.height + deltaY);
          break;
        case 'sw': // Southwest handle
          newWidth = Math.max(50, resizeState.componentStartSize.width - deltaX);
          newHeight = Math.max(50, resizeState.componentStartSize.height + deltaY);
          break;
        case 'ne': // Northeast handle
          newWidth = Math.max(50, resizeState.componentStartSize.width + deltaX);
          newHeight = Math.max(50, resizeState.componentStartSize.height - deltaY);
          break;
        case 'nw': // Northwest handle
          newWidth = Math.max(50, resizeState.componentStartSize.width - deltaX);
          newHeight = Math.max(50, resizeState.componentStartSize.height - deltaY);
          break;
      }
      
      setComponentSizes(prev => ({
        ...prev,
        [resizeState.resizeComponent!]: [newWidth, newHeight]
      }));
    }
  }, [dragState, resizeState, activeTool]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragComponent: null,
      startPos: { x: 0, y: 0 },
      componentStartPos: { x: 0, y: 0 }
    });
    setResizeState({
      isResizing: false,
      resizeComponent: null,
      resizeHandle: null,
      startPos: { x: 0, y: 0 },
      componentStartSize: { width: 0, height: 0 }
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

  const getComponentSize = useCallback((componentName: string, components: BrochureComponents) => {
    if (!components) return [0, 0];
    const component = components[componentName as keyof BrochureComponents];
    if (!component || !('size' in component)) return [0, 0];
    return componentSizes[componentName] || component.size;
  }, [componentSizes]);

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
    resizeState,
    componentPositions,
    componentSizes,
    componentProperties,
    canvasRef,
    
    // Actions
    setActiveTool,
    setSelectedComponent,
    initializeComponentProperties,
    handleMouseDown,
    handleResizeMouseDown,
    handleMouseMove,
    handleMouseUp,
    updateComponentProperty,
    updateTextProperty,
    getComponentPosition,
    getComponentSize,
    deleteComponent,
    duplicateComponent,
    handleZoomIn,
    handleZoomOut,
    handleFitToScreen,
    handleKeyDown
  };
};
import { useState, useCallback, useRef } from 'react';
import type { BrochureComponents } from '@/types/api';
import { useCanvasHistory } from './useCanvasHistory';
import { DEFAULT_CONFIG, COMPONENT_DEFAULTS } from '@/constants/defaults';

export type CanvasToolType = 'select' | 'draw' | 'rectangle' | 'circle' | 'text' | 'path';

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
  // Initialize all state at once to avoid React queue issues
  const [canvasState, setCanvasState] = useState({
    activeTool: 'select' as CanvasToolType,
    selectedComponent: null as string | null,
    zoom: 100,
  });

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
  const [copiedComponent, setCopiedComponent] = useState<{
    name: string;
    position: [number, number];
    size: [number, number];
    properties: ComponentProperties;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const history = useCanvasHistory();

  // Helper functions
  const setActiveTool = (tool: CanvasToolType) => setCanvasState(prev => ({ ...prev, activeTool: tool }));
  const setSelectedComponent = (component: string | null) => setCanvasState(prev => ({ ...prev, selectedComponent: component }));

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
              fontSize: COMPONENT_DEFAULTS.TEXT_PROPERTIES.FONT_SIZE,
              color: COMPONENT_DEFAULTS.TEXT_PROPERTIES.COLOR,
              maxWidth: COMPONENT_DEFAULTS.TEXT_PROPERTIES.MAX_WIDTH
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
    if (canvasState.activeTool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setCanvasState(prev => ({ ...prev, selectedComponent: componentName }));
    
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
  }, [canvasState.activeTool, componentPositions]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, componentName: string, handle: 'nw' | 'ne' | 'sw' | 'se', components: BrochureComponents) => {
    if (canvasState.activeTool !== 'select') return;
    
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
  }, [canvasState.activeTool, componentSizes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (canvasState.activeTool !== 'select') return;
    
    // Handle dragging
    if (dragState.isDragging && dragState.dragComponent) {
      const deltaX = e.clientX - dragState.startPos.x;
      const deltaY = e.clientY - dragState.startPos.y;
      
      const newX = Math.round(dragState.componentStartPos.x + deltaX);
      const newY = Math.round(dragState.componentStartPos.y + deltaY);
      
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
          newWidth = Math.max(50, Math.round(resizeState.componentStartSize.width + deltaX));
          newHeight = Math.max(50, Math.round(resizeState.componentStartSize.height + deltaY));
          break;
        case 'sw': // Southwest handle
          newWidth = Math.max(50, Math.round(resizeState.componentStartSize.width - deltaX));
          newHeight = Math.max(50, Math.round(resizeState.componentStartSize.height + deltaY));
          break;
        case 'ne': // Northeast handle
          newWidth = Math.max(50, Math.round(resizeState.componentStartSize.width + deltaX));
          newHeight = Math.max(50, Math.round(resizeState.componentStartSize.height - deltaY));
          break;
        case 'nw': // Northwest handle
          newWidth = Math.max(50, Math.round(resizeState.componentStartSize.width - deltaX));
          newHeight = Math.max(50, Math.round(resizeState.componentStartSize.height - deltaY));
          break;
      }
      
      setComponentSizes(prev => ({
        ...prev,
        [resizeState.resizeComponent!]: [Math.round(newWidth), Math.round(newHeight)]
      }));
    }
  }, [dragState, resizeState, canvasState.activeTool]);

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
    if (canvasState.selectedComponent === componentName) {
      setSelectedComponent(null);
    }
  }, [canvasState.selectedComponent]);

  const duplicateComponent = useCallback((componentName: string) => {
    const currentPos = componentPositions[componentName];
    if (currentPos) {
      setComponentPositions(prev => ({
        ...prev,
        [`${componentName}_copy`]: [currentPos[0] + 20, currentPos[1] + 20]
      }));
    }
  }, [componentPositions]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            const state = history.redo();
            if (state) {
              setComponentPositions(state.componentPositions);
              setComponentSizes(state.componentSizes);
              setComponentProperties(state.componentProperties);
            }
          } else {
            const state = history.undo();
            if (state) {
              setComponentPositions(state.componentPositions);
              setComponentSizes(state.componentSizes);
              setComponentProperties(state.componentProperties);
            }
          }
          break;
        case 'c':
          if (canvasState.selectedComponent) {
            e.preventDefault();
            copyComponent();
          }
          break;
        case 'v':
          e.preventDefault();
          pasteComponent();
          break;
      }
      return;
    }

    if (!canvasState.selectedComponent) return;
    
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        deleteComponent(canvasState.selectedComponent);
        break;
      case 'Escape':
        setSelectedComponent(null);
        break;
    }
  }, [canvasState.selectedComponent, deleteComponent, history]);

  const alignComponent = useCallback((alignment: string, components: BrochureComponents) => {
    if (!canvasState.selectedComponent || !components) return;

    const canvasWidth = components.brochure_dimensions[0];
    const canvasHeight = components.brochure_dimensions[1];
    const currentPos = getComponentPosition(canvasState.selectedComponent, components);
    const currentSize = getComponentSize(canvasState.selectedComponent, components);

    let newPos = [...currentPos] as [number, number];

    switch (alignment) {
      case 'left':
        newPos[0] = 0;
        break;
      case 'center-h':
        newPos[0] = Math.round((canvasWidth - currentSize[0]) / 2);
        break;
      case 'right':
        newPos[0] = Math.round(canvasWidth - currentSize[0]);
        break;
      case 'top':
        newPos[1] = 0;
        break;
      case 'center-v':
        newPos[1] = Math.round((canvasHeight - currentSize[1]) / 2);
        break;
      case 'bottom':
        newPos[1] = Math.round(canvasHeight - currentSize[1]);
        break;
    }

    setComponentPositions(prev => ({
      ...prev,
      [canvasState.selectedComponent!]: newPos
    }));

    history.saveState(componentPositions, componentSizes, componentProperties);
  }, [canvasState.selectedComponent, getComponentPosition, getComponentSize, componentPositions, componentSizes, componentProperties, history]);

  const centerComponent = useCallback((components: BrochureComponents) => {
    if (!canvasState.selectedComponent || !components) return;

    const canvasWidth = components.brochure_dimensions[0];
    const canvasHeight = components.brochure_dimensions[1];
    const currentSize = getComponentSize(canvasState.selectedComponent, components);

    const newPos: [number, number] = [
      Math.round((canvasWidth - currentSize[0]) / 2),
      Math.round((canvasHeight - currentSize[1]) / 2)
    ];

    setComponentPositions(prev => ({
      ...prev,
      [canvasState.selectedComponent!]: newPos
    }));

    history.saveState(componentPositions, componentSizes, componentProperties);
  }, [canvasState.selectedComponent, getComponentSize, componentPositions, componentSizes, componentProperties, history]);

  const copyComponent = useCallback(() => {
    if (!canvasState.selectedComponent) return;

    const position = componentPositions[canvasState.selectedComponent] || [0, 0];
    const size = componentSizes[canvasState.selectedComponent] || [100, 100];
    const properties = componentProperties[canvasState.selectedComponent] || {
      opacity: 1,
      rotation: 0,
      visible: true
    };

    setCopiedComponent({
      name: canvasState.selectedComponent,
      position,
      size,
      properties
    });
  }, [canvasState.selectedComponent, componentPositions, componentSizes, componentProperties]);

  const pasteComponent = useCallback(() => {
    if (!copiedComponent) return;

    const newName = `${copiedComponent.name}_copy_${Date.now()}`;
    const offset = 20;

    setComponentPositions(prev => ({
      ...prev,
      [newName]: [Math.round(copiedComponent.position[0] + offset), Math.round(copiedComponent.position[1] + offset)]
    }));

    setComponentSizes(prev => ({
      ...prev,
      [newName]: copiedComponent.size
    }));

    setComponentProperties(prev => ({
      ...prev,
      [newName]: { ...copiedComponent.properties }
    }));

    setSelectedComponent(newName);
    history.saveState(componentPositions, componentSizes, componentProperties);
  }, [copiedComponent, componentPositions, componentSizes, componentProperties, history]);

  const createComponent = useCallback((type: string, position: [number, number], size: [number, number]) => {
    const newName = `${type}_${Date.now()}`;
    
    setComponentPositions(prev => ({
      ...prev,
      [newName]: [Math.round(position[0]), Math.round(position[1])]
    }));

    setComponentSizes(prev => ({
      ...prev,
      [newName]: [Math.round(size[0]), Math.round(size[1])]
    }));

    setComponentProperties(prev => ({
      ...prev,
      [newName]: {
        opacity: 1,
        rotation: 0,
        visible: true,
        ...(type === 'text' && {
          textProperties: {
            fontSize: 16,
            color: '#000000',
            maxWidth: size[0]
          }
        })
      }
    }));

    setSelectedComponent(newName);
    history.saveState(componentPositions, componentSizes, componentProperties);
  }, [componentPositions, componentSizes, componentProperties, history]);

  const loadLayoutData = useCallback((data: {
    componentPositions: Record<string, [number, number]>;
    componentSizes: Record<string, [number, number]>;
    componentProperties: Record<string, ComponentProperties>;
  }) => {
    setComponentPositions(data.componentPositions);
    setComponentSizes(data.componentSizes);
    setComponentProperties(data.componentProperties);
    setSelectedComponent(null);
    history.saveState(data.componentPositions, data.componentSizes, data.componentProperties);
  }, [history]);

  return {
    // State
    activeTool: canvasState.activeTool,
    selectedComponent: canvasState.selectedComponent,
    zoom: canvasState.zoom,
    dragState,
    resizeState,
    componentPositions,
    componentSizes,
    componentProperties,
    canvasRef,
    copiedComponent,
    
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
    handleZoomIn: () => setCanvasState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 25, 200) })),
    handleZoomOut: () => setCanvasState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 25, 25) })),
    handleFitToScreen: () => setCanvasState(prev => ({ ...prev, zoom: 100 })),
    handleKeyDown,
    
    // New features
    alignComponent,
    centerComponent,
    copyComponent,
    pasteComponent,
    loadLayoutData,
    
    // History
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undo: () => {
      const state = history.undo();
      if (state) {
        setComponentPositions(state.componentPositions);
        setComponentSizes(state.componentSizes);
        setComponentProperties(state.componentProperties);
      }
    },
    redo: () => {
      const state = history.redo();
      if (state) {
        setComponentPositions(state.componentPositions);
        setComponentSizes(state.componentSizes);
        setComponentProperties(state.componentProperties);
      }
    },
    saveHistoryState: () => history.saveState(componentPositions, componentSizes, componentProperties),
    
    // Drawing tools
    createComponent
  };
};
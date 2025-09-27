import React, { useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon } from 'lucide-react';
import type { BrochureComponents, BrochureConfig } from '@/types/api';
import { useCanvasTools } from '@/hooks/useCanvasTools';
import { useGridSystem } from '@/hooks/useGridSystem';
import { PropertyPanel } from './PropertyPanel';
import { ToolPanel } from './ToolPanel';
import { AlignmentPanel } from './AlignmentPanel';
import { LayoutManager } from './LayoutManager';
import { AdvancedToolbar } from './AdvancedToolbar';
import { GridControls } from './GridControls';
import { KeyboardShortcuts } from './KeyboardShortcuts';

interface BrochureCanvasProps {
  components: BrochureComponents | null;
  config: BrochureConfig | undefined;
  onLayoutChange?: (modifiedComponents: BrochureComponents, componentProperties: Record<string, any>) => void;
}

export const BrochureCanvas: React.FC<BrochureCanvasProps> = ({ components, config, onLayoutChange }) => {
  const canvasTools = useCanvasTools();
  const gridSystem = useGridSystem();
  
  // Initialize component properties when components change
  useEffect(() => {
    if (components) {
      canvasTools.initializeComponentProperties(components);
    }
  }, [components, canvasTools.initializeComponentProperties]);

  // Create modified components with current positions, sizes, and properties
  const getModifiedComponents = useCallback((): BrochureComponents | null => {
    if (!components) return null;

    const modifiedComponents = { ...components };
    
    // Apply position changes
    Object.keys(canvasTools.componentPositions).forEach(componentName => {
      if (modifiedComponents[componentName as keyof BrochureComponents] && 'position' in modifiedComponents[componentName as keyof BrochureComponents]) {
        (modifiedComponents[componentName as keyof BrochureComponents] as any).position = canvasTools.componentPositions[componentName];
      }
    });

    // Apply size changes
    Object.keys(canvasTools.componentSizes).forEach(componentName => {
      if (modifiedComponents[componentName as keyof BrochureComponents] && 'size' in modifiedComponents[componentName as keyof BrochureComponents]) {
        (modifiedComponents[componentName as keyof BrochureComponents] as any).size = canvasTools.componentSizes[componentName];
      }
    });

    return modifiedComponents;
  }, [components, canvasTools.componentPositions, canvasTools.componentSizes]);

  // Notify parent of layout changes
  useEffect(() => {
    const modifiedComponents = getModifiedComponents();
    if (modifiedComponents && onLayoutChange) {
      onLayoutChange(modifiedComponents, canvasTools.componentProperties);
    }
  }, [canvasTools.componentPositions, canvasTools.componentSizes, canvasTools.componentProperties, getModifiedComponents, onLayoutChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Grid shortcut
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
        gridSystem.setShowGrid(!gridSystem.showGrid);
        return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          canvasTools.setActiveTool('select');
          break;
        case 'p':
          canvasTools.setActiveTool('draw');
          break;
        case 'r':
          canvasTools.setActiveTool('rectangle');
          break;
        case 'c':
          canvasTools.setActiveTool('circle');
          break;
        case 't':
          canvasTools.setActiveTool('text');
          break;
        case '=':
        case '+':
          canvasTools.handleZoomIn();
          break;
        case '-':
          canvasTools.handleZoomOut();
          break;
        case '0':
          canvasTools.handleFitToScreen();
          break;
        default:
          canvasTools.handleKeyDown(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canvasTools, gridSystem]);

  const renderComponent = (componentName: string, component: any) => {
    if (!component || !('position' in component)) return null;
    
    const position = canvasTools.getComponentPosition(componentName, components!);
    const size = canvasTools.getComponentSize(componentName, components!);
    const properties = canvasTools.componentProperties[componentName] || {
      opacity: 1,
      rotation: 0,
      visible: true
    };
    
    if (!properties.visible) return null;
    
    const isSelected = canvasTools.selectedComponent === componentName;
    const isDragging = canvasTools.dragState.dragComponent === componentName;
    
    // Color coding for different component types
    const getBorderColor = () => {
      switch (componentName) {
        case 'product_image': return 'border-primary/20 hover:border-primary';
        case 'arabic_text':
        case 'english_text': return 'border-accent/20 hover:border-accent';
        case 'price_tag': return 'border-success/20 hover:border-success';
        case 'icon': return 'border-secondary/40 hover:border-secondary';
        default: return 'border-muted/20 hover:border-muted';
      }
    };
    
    const getSelectedBorderColor = () => {
      switch (componentName) {
        case 'product_image': return 'border-primary';
        case 'arabic_text':
        case 'english_text': return 'border-accent';
        case 'price_tag': return 'border-success';
        case 'icon': return 'border-secondary';
        default: return 'border-muted';
      }
    };
    
    return (
      <div
        key={componentName}
        className={`absolute border-2 transition-all duration-200 cursor-move group ${
          isSelected ? `${getSelectedBorderColor()} shadow-lg z-10` : getBorderColor()
        } ${componentName.includes('price_tag') || componentName.includes('icon') ? 'rounded-full' : 'rounded'}`}
        style={{
          left: position[0],
          top: position[1],
          width: size[0],
          height: size[1],
          opacity: properties.opacity,
          transform: `rotate(${properties.rotation}deg)`,
          zIndex: isDragging || canvasTools.resizeState.isResizing ? 20 : isSelected ? 10 : 1,
        }}
        onMouseDown={(e) => {
          e.stopPropagation(); // Prevent canvas deselection
          canvasTools.handleMouseDown(e, componentName, components!);
        }}
      >
        <img
          src={`data:image/${component.format};base64,${component.image_base64}`}
          alt={componentName}
          className={`w-full h-full object-cover ${
            componentName.includes('price_tag') || componentName.includes('icon') ? 'rounded-full' : 'rounded'
          }`}
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Selection Handles */}
        {isSelected && (
          <>
            <div className={`absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-full transition-opacity`} />
            <div className={`absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full transition-opacity`} />
            <div className={`absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-full transition-opacity`} />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full transition-opacity`} />
          </>
        )}
        
        {/* Resize Handles */}
        {isSelected && !['arabic_text', 'english_text'].includes(componentName) && (
          <>
            <div 
              className="absolute -top-2 -left-2 w-4 h-4 bg-accent border-2 border-white rounded cursor-nw-resize hover:bg-accent/80"
              onMouseDown={(e) => canvasTools.handleResizeMouseDown(e, componentName, 'nw', components!)}
            />
            <div 
              className="absolute -top-2 -right-2 w-4 h-4 bg-accent border-2 border-white rounded cursor-ne-resize hover:bg-accent/80"
              onMouseDown={(e) => canvasTools.handleResizeMouseDown(e, componentName, 'ne', components!)}
            />
            <div 
              className="absolute -bottom-2 -left-2 w-4 h-4 bg-accent border-2 border-white rounded cursor-sw-resize hover:bg-accent/80"
              onMouseDown={(e) => canvasTools.handleResizeMouseDown(e, componentName, 'sw', components!)}
            />
            <div 
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-accent border-2 border-white rounded cursor-se-resize hover:bg-accent/80"
              onMouseDown={(e) => canvasTools.handleResizeMouseDown(e, componentName, 'se', components!)}
            />
          </>
        )}
        
        {/* Hover Handles */}
        {!isSelected && (
          <>
            <div className={`absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
          </>
        )}
      </div>
    );
  };
  if (!components || !config) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-muted/20 to-muted/40">
        <Card className="p-12 text-center shadow-panel border-panel-border bg-panel-bg">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">Canvas Ready</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Select a configuration and SKU from the sidebar, then click "Load Components" to start designing.
          </p>
          <Badge variant="secondary" className="text-xs">
            Professional Design Mode
          </Badge>
        </Card>
      </div>
    );
  }

  const canvasWidth = components.brochure_dimensions[0];
  const canvasHeight = components.brochure_dimensions[1];

  return (
    <div className="flex-1 flex h-full">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Tool Panel */}
        <ToolPanel
          activeTool={canvasTools.activeTool}
          onToolChange={canvasTools.setActiveTool}
          zoom={canvasTools.zoom}
          onZoomIn={canvasTools.handleZoomIn}
          onZoomOut={canvasTools.handleZoomOut}
          onFitToScreen={canvasTools.handleFitToScreen}
          selectedComponent={canvasTools.selectedComponent}
          canUndo={canvasTools.canUndo}
          canRedo={canvasTools.canRedo}
          onUndo={canvasTools.undo}
          onRedo={canvasTools.redo}
        />

        {/* Alignment Panel */}
        <AlignmentPanel
          selectedComponent={canvasTools.selectedComponent}
          components={components}
          onAlignComponent={(alignment) => canvasTools.alignComponent(alignment, components!)}
          onCenterComponent={() => canvasTools.centerComponent(components!)}
          onCopyComponent={canvasTools.copyComponent}
          onPasteComponent={canvasTools.pasteComponent}
          canPaste={!!canvasTools.copiedComponent}
        />

        {/* Layout Manager */}
        <div className="bg-panel-bg border-b border-panel-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutManager
              componentPositions={canvasTools.componentPositions}
              componentSizes={canvasTools.componentSizes}
              componentProperties={canvasTools.componentProperties}
              onLoadLayout={canvasTools.loadLayoutData}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <GridControls
              showGrid={gridSystem.showGrid}
              onToggleGrid={gridSystem.setShowGrid}
              snapToGrid={gridSystem.snapToGrid}
              onToggleSnap={gridSystem.setSnapToGrid}
              gridSize={gridSystem.gridSize}
              onGridSizeChange={gridSystem.setGridSize}
            />
            <KeyboardShortcuts />
          </div>
        </div>

        {/* Advanced Toolbar */}
        <AdvancedToolbar
          selectedComponent={canvasTools.selectedComponent}
          onBringToFront={() => {
            // Placeholder for layer management
            console.log('Bring to front');
          }}
          onSendToBack={() => {
            // Placeholder for layer management
            console.log('Send to back');
          }}
          onToggleVisibility={() => {
            if (canvasTools.selectedComponent) {
              const currentProps = canvasTools.componentProperties[canvasTools.selectedComponent];
              canvasTools.updateComponentProperty(
                canvasTools.selectedComponent,
                'visible',
                !currentProps?.visible
              );
            }
          }}
          onToggleLock={() => {
            // Placeholder for lock functionality
            console.log('Toggle lock');
          }}
          onGroupComponents={() => {
            // Placeholder for grouping
            console.log('Group components');
          }}
          onUngroupComponents={() => {
            // Placeholder for ungrouping
            console.log('Ungroup components');
          }}
          onFlipHorizontal={() => {
            // Placeholder for flip
            console.log('Flip horizontal');
          }}
          isComponentVisible={
            canvasTools.selectedComponent
              ? canvasTools.componentProperties[canvasTools.selectedComponent]?.visible ?? true
              : true
          }
          isComponentLocked={false} // Placeholder
        />

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-muted/10 to-muted/30 overflow-auto">
            {/* Canvas Container */}
          <div className="relative" style={{ transform: `scale(${canvasTools.zoom / 100})` }}>
            {/* Canvas Shadow/Frame */}
            <div 
              ref={canvasTools.canvasRef}
              className="relative bg-canvas-bg border border-canvas-border shadow-strong rounded-lg overflow-hidden select-none"
              style={{ 
                width: canvasWidth, 
                height: canvasHeight 
              }}
              onMouseMove={canvasTools.handleMouseMove}
              onMouseUp={canvasTools.handleMouseUp}
              onMouseLeave={canvasTools.handleMouseUp}
              onClick={(e) => {
                // Only deselect if clicking on empty canvas area
                if (e.target === e.currentTarget) {
                  canvasTools.setSelectedComponent(null);
                }
              }}
            >
              {/* Grid */}
              {gridSystem.renderGrid(canvasWidth, canvasHeight)}
              
              {/* Background */}
              {components.background && renderComponent('background', components.background)}
              
              {/* All other components */}
              {Object.entries(components).map(([key, component]) => {
                if (key === 'brochure_dimensions' || key === 'background') return null;
                return renderComponent(key, component);
              })}
            </div>

            {/* Canvas Info */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                Brochure Canvas • {canvasWidth}×{canvasHeight}px • {canvasTools.zoom}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Property Panel */}
      <PropertyPanel
        selectedComponent={canvasTools.selectedComponent}
        componentProperties={canvasTools.componentProperties}
        onUpdateProperty={canvasTools.updateComponentProperty}
        onUpdateTextProperty={canvasTools.updateTextProperty}
        onDeleteComponent={canvasTools.deleteComponent}
        onDuplicateComponent={canvasTools.duplicateComponent}
      />
    </div>
  );
};
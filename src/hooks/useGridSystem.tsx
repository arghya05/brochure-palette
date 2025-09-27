import { useState, useCallback } from 'react';

export const useGridSystem = () => {
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);

  const snapToGridPosition = useCallback((x: number, y: number): [number, number] => {
    if (!snapToGrid) return [Math.round(x), Math.round(y)];
    
    const snappedX = Math.round(Math.round(x) / gridSize) * gridSize;
    const snappedY = Math.round(Math.round(y) / gridSize) * gridSize;
    
    return [snappedX, snappedY];
  }, [snapToGrid, gridSize]);

  const renderGrid = useCallback((canvasWidth: number, canvasHeight: number) => {
    if (!showGrid) return null;

    const lines = [];
    
    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasHeight}
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.3"
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasWidth}
          y2={y}
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.3"
        />
      );
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none text-muted-foreground"
        width={canvasWidth}
        height={canvasHeight}
        style={{ zIndex: 1 }}
      >
        {lines}
      </svg>
    );
  }, [showGrid, gridSize]);

  return {
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    gridSize,
    setGridSize,
    snapToGridPosition,
    renderGrid
  };
};
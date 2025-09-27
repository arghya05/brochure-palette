import React, { useState, useCallback } from 'react';
import type { CanvasToolType } from '@/hooks/useCanvasTools';

interface DrawingToolsProps {
  activeTool: CanvasToolType;
  canvasRef: React.RefObject<HTMLDivElement>;
  onCreateComponent: (type: string, position: [number, number], size: [number, number]) => void;
}

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  activeTool,
  canvasRef,
  onCreateComponent
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!['draw', 'rectangle', 'circle'].includes(activeTool)) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
  }, [activeTool, canvasRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !startPos) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPos({ x, y });
  }, [isDrawing, startPos]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !startPos || !currentPos) return;

    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    
    // Only create if the shape is big enough
    if (width > 10 && height > 10) {
      const position: [number, number] = [
        Math.min(startPos.x, currentPos.x),
        Math.min(startPos.y, currentPos.y)
      ];
      const size: [number, number] = [width, height];
      
      let componentType = activeTool;
      if (activeTool === 'draw') componentType = 'path';
      
      onCreateComponent(componentType, position, size);
    }
    
    setIsDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
  }, [isDrawing, startPos, currentPos, activeTool, onCreateComponent]);

  const renderPreview = () => {
    if (!isDrawing || !startPos || !currentPos) return null;

    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);

    const style = {
      position: 'absolute' as const,
      left: x,
      top: y,
      width,
      height,
      border: '2px dashed hsl(var(--primary))',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      pointerEvents: 'none' as const,
      zIndex: 1000,
    };

    if (activeTool === 'circle') {
      return (
        <div
          style={{
            ...style,
            borderRadius: '50%',
          }}
        />
      );
    }

    if (activeTool === 'rectangle') {
      return <div style={style} />;
    }

    if (activeTool === 'draw') {
      return (
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <path
            d={`M ${startPos.x} ${startPos.y} L ${currentPos.x} ${currentPos.y}`}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
          />
        </svg>
      );
    }

    return null;
  };

  return (
    <>
      {(['draw', 'rectangle', 'circle'].includes(activeTool)) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            cursor: activeTool === 'draw' ? 'crosshair' : 'crosshair',
            zIndex: 999,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      )}
      {renderPreview()}
    </>
  );
};
import { useState, useCallback } from 'react';
import type { BrochureComponents } from '@/types/api';
import type { ComponentProperties } from './useCanvasTools';

interface CanvasState {
  componentPositions: Record<string, [number, number]>;
  componentSizes: Record<string, [number, number]>;
  componentProperties: Record<string, ComponentProperties>;
}

export const useCanvasHistory = () => {
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const saveState = useCallback((
    componentPositions: Record<string, [number, number]>,
    componentSizes: Record<string, [number, number]>,
    componentProperties: Record<string, ComponentProperties>
  ) => {
    const newState: CanvasState = {
      componentPositions: { ...componentPositions },
      componentSizes: { ...componentSizes },
      componentProperties: { ...componentProperties }
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
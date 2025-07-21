
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVirtualizerOptions {
  count: number;
  getScrollElement: () => HTMLElement | null;
  estimateSize: (index: number) => number;
  overscan?: number;
}

interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

/**
 * A custom hook for row virtualization.
 * It calculates which items should be rendered based on the scroll position.
 */
export function useVirtualizer({
  count,
  getScrollElement,
  estimateSize,
  overscan = 5,
}: UseVirtualizerOptions) {
  const [virtualItems, setVirtualItems] = useState<VirtualItem[]>([]);
  const [totalSize, setTotalSize] = useState(0);

  const measuredSizes = useRef<Record<number, number>>({}).current;
  
  const calculateVirtualItems = useCallback(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement) {
        setVirtualItems([]);
        return;
    };

    const { scrollTop, clientHeight } = scrollElement;
    
    let runningHeight = 0;
    let startIndex = -1;
    let endIndex = -1;

    // First, calculate the total size and find the start/end indices
    for (let i = 0; i < count; i++) {
        const itemSize = measuredSizes[i] ?? estimateSize(i);
        
        if (startIndex === -1 && runningHeight + itemSize >= scrollTop) {
            startIndex = Math.max(0, i - overscan);
        }
        
        if (endIndex === -1 && runningHeight >= scrollTop + clientHeight) {
            endIndex = Math.min(count - 1, i + overscan);
        }

        runningHeight += itemSize;
    }
    
    // Fallback if scroll is at the end or container is empty
    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = count - 1;

    setTotalSize(runningHeight);
    
    const newVirtualItems: VirtualItem[] = [];
    let currentPosition = 0;
    
    // Calculate positions for items before the visible range
    for(let i = 0; i < startIndex; i++) {
        currentPosition += measuredSizes[i] ?? estimateSize(i);
    }

    // Calculate positions for the visible items
    for (let i = startIndex; i <= endIndex; i++) {
        const size = measuredSizes[i] ?? estimateSize(i);
        newVirtualItems.push({ index: i, start: currentPosition, size });
        currentPosition += size;
    }

    setVirtualItems(newVirtualItems);
  }, [count, estimateSize, getScrollElement, overscan, measuredSizes]);


  useEffect(() => {
    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    // Run calculation on mount and when dependencies change
    calculateVirtualItems(); 

    scrollElement.addEventListener('scroll', calculateVirtualItems, { passive: true });
    window.addEventListener('resize', calculateVirtualItems);
    
    return () => {
      scrollElement.removeEventListener('scroll', calculateVirtualItems);
      window.removeEventListener('resize', calculateVirtualItems);
    };
  }, [calculateVirtualItems, getScrollElement]);

  return {
    getVirtualItems: () => virtualItems,
    getTotalSize: () => totalSize,
  };
}
